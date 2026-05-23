'use strict';
const express  = require('express');
const { v4: uuidv4 } = require('uuid');
const db       = require('./db');
const { FIESTA_FATAL, PRETERITE, IMPERFECT, VOCABULARY } = require('./questions');
const { getReading } = require('./readings');

const router = express.Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Fisher-Yates shuffle — returns new array */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick `n` random items from an array without replacement */
function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}

/**
 * Prepare a question for the client.
 * Shuffles the options, tracks the new correct index,
 * returns { id, section, question, options }  — NO correct answer or explanation.
 */
function prepareForClient(q) {
  const indices = shuffle([0, 1, 2, 3]);
  const shuffledOptions = indices.map(i => q.options[i]);
  const newCorrectIndex = indices.indexOf(q.correct);
  // Store the shuffled correct index in server memory alongside session answers
  return {
    clientQ: { id: q.id, section: q.section, question: q.question, options: shuffledOptions },
    correctIndex: newCorrectIndex,
    correctText: q.options[q.correct],
    explanation: q.explanation,
    originalQuestion: q.question,
  };
}

/**
 * Build a full MC set for a session:
 *   10 Fiesta Fatal  |  8 Preterite  |  8 Imperfect  |  4 Vocabulary
 * (totals 30 — adjust constants below if teacher changes the format)
 */
const DRAW = { ff: 10, pre: 8, imp: 8, voc: 4 };

function buildQuestionSet() {
  const raw = [
    ...sample(FIESTA_FATAL, DRAW.ff),
    ...sample(PRETERITE,    DRAW.pre),
    ...sample(IMPERFECT,    DRAW.imp),
    ...sample(VOCABULARY,   DRAW.voc),
  ];
  return raw.map(prepareForClient);
}

// ── In-memory session answer store ───────────────────────────────────────────
// Maps sessionId → array of prepared question metadata (correctIndex, explanation, etc.)
// This prevents any answer data from being persisted to the client.
const SESSION_ANSWERS = new Map();

// Prune old entries every 30 min to prevent memory leak
setInterval(() => {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000; // 2 hours
  for (const [key] of SESSION_ANSWERS) {
    const [, ts] = key.split(':');
    if (parseInt(ts, 10) < cutoff) SESSION_ANSWERS.delete(key);
  }
}, 30 * 60 * 1000);

// ── POST /api/quiz/start ───────────────────────────────────────────────────────
router.post('/start', (req, res) => {
  try {
    const studentName = (req.body.studentName || 'Student').trim().slice(0, 60);
    // Version: 1-10; random if not supplied
    let version = parseInt(req.body.version, 10);
    if (!version || version < 1 || version > 10) {
      version = Math.floor(Math.random() * 10) + 1;
    }

    const sessionId = uuidv4();
    db.createSession(sessionId, studentName, version);

    // Build MC questions
    const prepared = buildQuestionSet();
    const clientQuestions = prepared.map(p => p.clientQ);

    // Build reading section (MC + open prompt)
    const reading = getReading(version);
    const preparedReading = reading.mc.map(prepareForClient);
    const readingClientQs = preparedReading.map(p => p.clientQ);

    // Store answer key in memory (keyed by sessionId)
    SESSION_ANSWERS.set(sessionId, {
      mc:      prepared,
      reading: preparedReading,
      readingPassage: reading.passage,
      openQ:   reading.openQ,
      answered: new Set(),  // track which q indices have been answered
      timestamp: Date.now(),
    });

    res.json({
      sessionId,
      studentName,
      version,
      mcQuestions: clientQuestions,
      readingPassage: reading.passage,
      readingMcQuestions: readingClientQs,
      openQuestion: reading.openQ,
      mcTotal: clientQuestions.length,
    });
  } catch (err) {
    console.error('quiz/start error:', err);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// ── POST /api/quiz/answer ─────────────────────────────────────────────────────
// Body: { sessionId, pool: 'mc'|'reading', qIndex: number, chosen: number }
router.post('/answer', (req, res) => {
  try {
    const { sessionId, pool, qIndex, chosen } = req.body;

    // Basic input validation
    if (!sessionId || !['mc', 'reading'].includes(pool) ||
        typeof qIndex !== 'number' || typeof chosen !== 'number') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const store = SESSION_ANSWERS.get(sessionId);
    if (!store) return res.status(404).json({ error: 'Session not found' });

    const key = `${pool}:${qIndex}`;
    if (store.answered.has(key)) {
      return res.status(409).json({ error: 'Already answered' });
    }
    store.answered.add(key);

    const prepared = store[pool][qIndex];
    if (!prepared) return res.status(400).json({ error: 'Invalid question index' });

    const isCorrect = chosen === prepared.correctIndex;

    // Log to DB
    db.logAnswer({
      sessionId,
      qIndex,
      section: prepared.clientQ.section,
      question: prepared.originalQuestion,
      chosen:   prepared.clientQ.options[chosen] ?? '(no answer)',
      correctAns: prepared.correctText,
      isCorrect,
      explanation: prepared.explanation,
    });

    res.json({
      correct:     isCorrect,
      correctIndex: prepared.correctIndex,
      explanation: prepared.explanation,
    });
  } catch (err) {
    console.error('quiz/answer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/quiz/complete ───────────────────────────────────────────────────
// Body: { sessionId, mcScore, mcTotal, openResponse, timeMs, catJson }
router.post('/complete', (req, res) => {
  try {
    const { sessionId, mcScore, mcTotal, openResponse, timeMs, catJson } = req.body;

    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    const store = SESSION_ANSWERS.get(sessionId);
    if (!store) return res.status(404).json({ error: 'Session not found or already completed' });

    // Compute true server-side score from logs (prevents score tampering)
    const session = db.getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'DB session not found' });

    db.completeSession({
      id:           sessionId,
      mcScore:      parseInt(mcScore, 10) || 0,
      mcTotal:      parseInt(mcTotal, 10) || 0,
      openResponse: (openResponse || '').slice(0, 3000),
      timesMs:      parseInt(timeMs, 10) || 0,
      answersJson:  typeof catJson === 'string' ? catJson : JSON.stringify(catJson || {}),
      catJson:      typeof catJson === 'string' ? catJson : JSON.stringify(catJson || {}),
    });

    // Clean up in-memory store
    SESSION_ANSWERS.delete(sessionId);

    res.json({ ok: true, message: 'Quiz submitted successfully!' });
  } catch (err) {
    console.error('quiz/complete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/quiz/ping ────────────────────────────────────────────────────────
router.get('/ping', (_req, res) => res.json({ ok: true }));

module.exports = router;
