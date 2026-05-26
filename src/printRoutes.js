'use strict';
const express  = require('express');
const { v4: uuidv4 } = require('uuid');
const Anthropic = require('@anthropic-ai/sdk');
const db        = require('./db');
const { FIESTA_FATAL, PRETERITE, IMPERFECT, VOCABULARY } = require('./questions');
const { getReading, READINGS } = require('./readings');

const CONJUGATION = [...PRETERITE, ...IMPERFECT];
const router = express.Router();

// ── Auth middleware (same pattern as adminRoutes) ─────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample(arr, n) { return shuffle(arr).slice(0, n); }

/** Returns a random 6-char uppercase alphanumeric code */
function makeShortCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Shuffles options, returns { question, shuffledOptions, correctLetter, explanation } */
function shuffleQuestion(q) {
  const indices = shuffle([0, 1, 2, 3]);
  const options  = indices.map(i => q.options[i]);
  const correctIdx = indices.indexOf(q.correct);
  const letter  = ['A', 'B', 'C', 'D'][correctIdx];
  return { question: q.question, section: q.section, options, correctLetter: letter, explanation: q.explanation };
}

const SECTION_LABELS = {
  'Fiesta Fatal':          'Section 1 — Fiesta Fatal (20 pts)',
  'Preterite Conjugation': 'Section 2 — Conjugation (20 pts)',
  'Imperfect Conjugation': 'Section 2 — Conjugation (20 pts)',
  'Vocabulary':            'Section 3 — Vocabulary (10 pts)',
  'Reading':               'Section 4 — Reading (15 pts)',
};

// ── Build question set ────────────────────────────────────────────────────────
const DRAW = { ff: 15, conj: 15, voc: 15 };

function buildPrintSet(version) {
  const mc = [
    ...sample(FIESTA_FATAL, DRAW.ff),
    ...sample(CONJUGATION,  DRAW.conj),
    ...sample(VOCABULARY,   DRAW.voc),
  ].map(shuffleQuestion);

  const reading  = getReading(version);
  const readingQ = reading.mc.map(q => ({ ...shuffleQuestion(q), section: 'Reading' }));

  return { mc, readingQ, readingPassage: reading.passage, openQ: reading.openQ };
}

// ── Print HTML generator ──────────────────────────────────────────────────────
function generatePrintHtml({ shortCode, version, mc, readingQ, readingPassage, openQ }) {
  const LETTERS = ['A', 'B', 'C', 'D'];

  // Render MC questions for booklet
  function renderBookletSection(questions, startNum, sectionHeader) {
    let html = `<div class="section-header">${sectionHeader}</div>\n`;
    questions.forEach((q, i) => {
      const num = startNum + i;
      html += `<div class="question">
  <p class="q-text"><span class="q-num">${num}.</span> ${escHtml(q.question)}</p>
  <div class="options">
${LETTERS.map((l, li) => `    <div class="option"><span class="opt-letter">${l})</span> ${escHtml(q.options[li])}</div>`).join('\n')}
  </div>
</div>\n`;
    });
    return html;
  }

  // Answer sheet bubbles
  function renderAnswerRow(num, section) {
    return `<tr>
  <td class="q-cell">${num}</td>
  <td><label><input type="radio" name="q${num}" value="A"> A</label></td>
  <td><label><input type="radio" name="q${num}" value="B"> B</label></td>
  <td><label><input type="radio" name="q${num}" value="C"> C</label></td>
  <td><label><input type="radio" name="q${num}" value="D"> D</label></td>
  <td class="sec-cell">${escHtml(section)}</td>
</tr>`;
  }

  function escHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Build booklet HTML (questions 1-45 = MC, 46-48 = reading MC)
  const s1 = renderBookletSection(mc.slice(0, 15),  1,  'Section 1 — Fiesta Fatal &amp; Characters (20 pts) — Questions 1–15');
  const s2 = renderBookletSection(mc.slice(15, 30), 16, 'Section 2 — Conjugation: Preterite &amp; Imperfect (20 pts) — Questions 16–30');
  const s3 = renderBookletSection(mc.slice(30, 45), 31, 'Section 3 — Vocabulary (10 pts) — Questions 31–45');
  const s4Reading = `<div class="section-header">Section 4 — Reading Comprehension &amp; Open Response (15 pts)</div>
<div class="passage-box">${escHtml(readingPassage)}</div>\n`;
  const s4MC = renderBookletSection(readingQ, 46, 'Reading Questions — Questions 46–48');
  const s4Open = `<div class="open-q-label"><strong>Open Response (0/5/10/15 pts):</strong> ${escHtml(openQ)}</div>
<div class="open-lines">
  <div class="write-line"></div><div class="write-line"></div><div class="write-line"></div>
  <div class="write-line"></div><div class="write-line"></div><div class="write-line"></div>
</div>`;

  // Answer sheet rows
  const ansRows = [
    ...mc.slice(0, 15).map((_, i)  => renderAnswerRow(i + 1,  'Fiesta Fatal')),
    ...mc.slice(15, 30).map((_, i) => renderAnswerRow(i + 16, 'Conjugation')),
    ...mc.slice(30, 45).map((_, i) => renderAnswerRow(i + 31, 'Vocabulary')),
    ...readingQ.map((_, i)         => renderAnswerRow(i + 46, 'Reading MC')),
  ].join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Spanish II Practice Test — Code ${escHtml(shortCode)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Times New Roman", serif; font-size: 12pt; color: #000; background: #fff; }

  /* ── Print controls ── */
  .print-bar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 999;
    background: #1e3a5f; color: #fff; padding: 10px 20px;
    display: flex; align-items: center; gap: 16px;
    font-family: Arial, sans-serif; font-size: 13px;
  }
  .print-bar button {
    background: #fff; color: #1e3a5f; border: none; padding: 6px 16px;
    font-weight: bold; cursor: pointer; border-radius: 4px; font-size: 13px;
  }
  .print-bar .code-badge {
    background: #f0c040; color: #1e3a5f; font-weight: bold;
    padding: 4px 12px; border-radius: 4px; letter-spacing: 1px; font-size: 15px;
  }
  @media print { .print-bar { display: none; } }

  /* ── Page layout ── */
  .page { max-width: 750px; margin: 0 auto; padding: 72px 40px 60px; }
  @media print {
    .page { page-break-after: always; padding: 20px 30px; max-width: none; }
    .page:last-child { page-break-after: avoid; }
  }
  .no-print-margin { margin-top: 60px; }
  @media print { .no-print-margin { margin-top: 0; } }

  /* ── Cover / header ── */
  .test-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
  .test-header h1 { font-size: 18pt; margin-bottom: 4px; }
  .test-header .meta { font-size: 10pt; color: #333; }
  .test-code { display: inline-block; background: #f0c040; padding: 2px 10px;
               font-weight: bold; letter-spacing: 2px; font-size: 13pt; margin: 4px 0; }
  .student-line { margin: 16px 0 8px; font-size: 11pt; }
  .fill-line { display: inline-block; border-bottom: 1px solid #000; width: 260px; }

  /* ── Sections / questions ── */
  .section-header {
    background: #1e3a5f; color: #fff; padding: 6px 12px;
    font-size: 11pt; font-weight: bold; margin: 24px 0 12px;
    font-family: Arial, sans-serif;
  }
  .question { margin-bottom: 14px; }
  .q-text { font-size: 11pt; margin-bottom: 5px; }
  .q-num { font-weight: bold; margin-right: 4px; }
  .options { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 24px; padding-left: 20px; }
  .option { font-size: 10.5pt; }
  .opt-letter { font-weight: bold; margin-right: 4px; }

  /* ── Reading passage ── */
  .passage-box {
    border: 1px solid #999; padding: 12px 16px; margin: 12px 0 20px;
    background: #fafafa; font-size: 11pt; line-height: 1.6;
    font-family: Georgia, serif;
  }

  /* ── Open response ── */
  .open-q-label { margin: 16px 0 8px; font-size: 11pt; }
  .open-lines { margin-top: 8px; }
  .write-line { border-bottom: 1px solid #999; height: 28px; margin-bottom: 4px; }

  /* ── Answer sheet ── */
  .answer-sheet-header { text-align: center; margin-bottom: 16px; }
  .answer-sheet-header h2 { font-size: 15pt; }
  .answer-sheet-header .instructions { font-size: 10pt; color: #555; margin-top: 4px; font-family: Arial, sans-serif; }
  .answer-table { width: 100%; border-collapse: collapse; font-size: 11pt; }
  .answer-table th {
    background: #1e3a5f; color: #fff; padding: 6px 10px;
    font-family: Arial, sans-serif; font-size: 10pt;
  }
  .answer-table td { padding: 5px 10px; border-bottom: 1px solid #ddd; }
  .answer-table tr:nth-child(even) td { background: #f7f7f7; }
  .q-cell { font-weight: bold; width: 40px; text-align: center; }
  .sec-cell { font-size: 9pt; color: #555; font-family: Arial, sans-serif; }
  .answer-table input[type=radio] { width: 14px; height: 14px; }
  label { display: flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap; }

  /* ── Open response on answer sheet ── */
  .open-ans-box { margin-top: 24px; }
  .open-ans-box h3 { font-size: 12pt; margin-bottom: 6px; font-family: Arial, sans-serif; }
  .open-ans-lines .write-line { border-bottom: 1px solid #999; height: 32px; margin-bottom: 6px; }

  /* ── Scoring box ── */
  .score-table { margin-top: 24px; border-collapse: collapse; width: 100%; font-size: 11pt; }
  .score-table th, .score-table td { border: 1px solid #999; padding: 6px 12px; text-align: left; }
  .score-table th { background: #eee; font-family: Arial, sans-serif; }
  .score-total td { font-weight: bold; background: #f0c040; }
</style>
</head>
<body>

<div class="print-bar">
  <span>🖨️ Spanish II Practice Test</span>
  <span>Test Code: <span class="code-badge">${escHtml(shortCode)}</span></span>
  <button onclick="window.print()">Print Test</button>
  <span style="margin-left:auto;opacity:.8;font-size:11px">Print tip: use "Print to PDF" to save, or Ctrl+P / Cmd+P to send to printer. Print pages 1-4 for the question booklet, page 5 for the answer sheet only.</span>
</div>

<!-- ═══════════════════════════════════════════════════════════
     PAGE 1 — Cover + Section 1
════════════════════════════════════════════════════════════ -->
<div class="page no-print-margin">
  <div class="test-header">
    <h1>Spanish II — Practice Final Exam</h1>
    <div class="meta">Version ${escHtml(String(version))} &nbsp;|&nbsp; Test Code: <span class="test-code">${escHtml(shortCode)}</span></div>
    <div class="meta">Total: 65 points &nbsp;|&nbsp; Sections 1–4</div>
  </div>
  <div class="student-line">Name: <span class="fill-line"></span> &nbsp;&nbsp; Date: <span class="fill-line" style="width:120px"></span></div>
  <div class="student-line">Period: <span class="fill-line" style="width:80px"></span> &nbsp;&nbsp; Teacher: <span class="fill-line" style="width:160px"></span></div>

  ${s1}
</div>

<!-- ═══════════════════════════════════════════════════════════
     PAGE 2 — Section 2
════════════════════════════════════════════════════════════ -->
<div class="page">
  ${s2}
</div>

<!-- ═══════════════════════════════════════════════════════════
     PAGE 3 — Section 3
════════════════════════════════════════════════════════════ -->
<div class="page">
  ${s3}
</div>

<!-- ═══════════════════════════════════════════════════════════
     PAGE 4 — Section 4 Reading + Open Response
════════════════════════════════════════════════════════════ -->
<div class="page">
  ${s4Reading}
  ${s4MC}
  ${s4Open}
</div>

<!-- ═══════════════════════════════════════════════════════════
     PAGE 5 — ANSWER SHEET (student fills in / teacher scans)
════════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="answer-sheet-header">
    <h2>ANSWER SHEET &mdash; Spanish II Practice Test</h2>
    <div class="instructions">Test Code: <strong>${escHtml(shortCode)}</strong> &nbsp;|&nbsp; Fill in or clearly circle your answer for each question.</div>
  </div>
  <div class="student-line" style="margin-bottom:16px">
    Name: <span class="fill-line"></span> &nbsp;&nbsp; Date: <span class="fill-line" style="width:120px"></span>
  </div>

  <table class="answer-table">
    <thead>
      <tr>
        <th>#</th>
        <th>A</th>
        <th>B</th>
        <th>C</th>
        <th>D</th>
        <th>Section</th>
      </tr>
    </thead>
    <tbody>
      ${ansRows}
    </tbody>
  </table>

  <div class="open-ans-box">
    <h3>Open Response — Section 4 (0 / 5 / 10 / 15 pts)</h3>
    <p style="font-size:10pt;margin-bottom:8px;font-family:Arial,sans-serif">Write your answer in Spanish below:</p>
    <div class="open-ans-lines">
      <div class="write-line"></div><div class="write-line"></div>
      <div class="write-line"></div><div class="write-line"></div>
      <div class="write-line"></div><div class="write-line"></div>
      <div class="write-line"></div><div class="write-line"></div>
    </div>
  </div>

  <table class="score-table" style="margin-top:28px">
    <thead>
      <tr><th>Section</th><th>Points Possible</th><th>Points Earned</th></tr>
    </thead>
    <tbody>
      <tr><td>1 — Fiesta Fatal</td><td>20</td><td></td></tr>
      <tr><td>2 — Conjugation</td><td>20</td><td></td></tr>
      <tr><td>3 — Vocabulary</td><td>10</td><td></td></tr>
      <tr><td>4 — Reading MC (3 pts)</td><td>—</td><td></td></tr>
      <tr><td>4 — Open Response</td><td>15</td><td></td></tr>
      <tr class="score-total"><td><strong>TOTAL</strong></td><td><strong>65</strong></td><td></td></tr>
    </tbody>
  </table>
</div>

</body>
</html>`;
}

// ── POST /api/print/generate ───────────────────────────────────────────────
// Builds a print test and stores the answer key. Returns print HTML.
router.post('/generate', requireAuth, async (req, res) => {
  try {
    let version = parseInt(req.body.version, 10);
    const maxVersion = READINGS.length;
    if (!version || version < 1 || version > maxVersion) {
      version = Math.floor(Math.random() * maxVersion) + 1;
    }

    const id        = uuidv4();
    const shortCode = makeShortCode();

    const { mc, readingQ, readingPassage, openQ } = buildPrintSet(version);

    // Build answer key: array of { q: number, correct: 'A'|'B'|'C'|'D', question, section, explanation }
    const allQ = [
      ...mc.map((q, i)       => ({ q: i + 1,  correct: q.correctLetter, question: q.question, section: q.section, explanation: q.explanation })),
      ...readingQ.map((q, i) => ({ q: i + 46, correct: q.correctLetter, question: q.question, section: 'Reading', explanation: q.explanation })),
    ];
    const answersJson = JSON.stringify(allQ);

    await db.createPrintSession({ id, shortCode, version, answersJson, readingPassage, openQuestion: openQ });

    const html = generatePrintHtml({ shortCode, version, mc, readingQ, readingPassage, openQ });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(html);
  } catch (err) {
    console.error('print/generate error:', err);
    res.status(500).json({ error: 'Failed to generate print test: ' + err.message });
  }
});

// ── GET /api/print/list ────────────────────────────────────────────────────
router.get('/list', requireAuth, async (req, res) => {
  try {
    res.json(await db.listPrintSessions());
  } catch (err) {
    console.error('print/list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE /api/print/:id ──────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.deletePrintSession(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('print/delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/print/grade ──────────────────────────────────────────────────
// Body: { shortCode, imageData (base64), mimeType, studentName }
// Calls Claude Vision to read the answer sheet, compares with stored key.
router.post('/grade', requireAuth, async (req, res) => {
  try {
    const { shortCode, imageData, mimeType, studentName } = req.body;

    if (!shortCode || !imageData) {
      return res.status(400).json({ error: 'shortCode and imageData are required' });
    }

    const session = await db.getPrintSession(shortCode.toUpperCase().trim());
    if (!session) {
      return res.status(404).json({ error: `No test found with code "${shortCode}". Check the code on the answer sheet.` });
    }

    const answerKey = JSON.parse(session.answers_json || '[]');
    const keyStr = answerKey.map(k => `Q${k.q}: ${k.correct}`).join(', ');
    const openQuestion = session.open_question || '(open response)';

    // Build prompt for Claude Vision
    const gradingPrompt = `You are grading a Spanish II student's paper answer sheet.

ANSWER KEY (${answerKey.length} multiple choice questions):
${keyStr}

OPEN RESPONSE QUESTION: "${openQuestion}"

RUBRIC for open response (award exactly one of these scores):
- 0 pts: No attempt or completely off-topic
- 5 pts: Basic answer with only a few words, significant errors
- 10 pts: Correct answer using appropriate conjugation and tense
- 15 pts: Correct answer with proper conjugation, tense, AND extended details/elaboration

INSTRUCTIONS:
1. Read every multiple-choice answer (Q1–Q48, each marked A/B/C/D) from the answer sheet image.
2. Read the open response text the student wrote.
3. Compare MC answers to the answer key.
4. Score the open response per the rubric.
5. Return ONLY valid JSON — no markdown, no extra text — in exactly this shape:

{
  "studentName": "<name written on sheet, or empty string if not visible>",
  "mcAnswers": [
    { "q": 1, "marked": "A", "correct": "B", "isCorrect": false },
    ...all 48 questions...
  ],
  "mcScore": <number of correct MC answers>,
  "openResponse": "<student's written answer verbatim>",
  "openScore": <0, 5, 10, or 15>,
  "openEval": "<1-2 sentence teacher-style feedback on the open response>",
  "issues": "<any scanning issues, illegible marks, or concerns — empty string if none>"
}

If a bubble is blank or unclear for an MC question, mark it as "?" (not correct).
Be thorough — read every question row carefully.`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType || 'image/jpeg',
              data: imageData,
            },
          },
          { type: 'text', text: gradingPrompt },
        ],
      }],
    });

    let gradeResult;
    try {
      const raw = message.content[0].text.trim();
      // Strip markdown code fences if present
      const cleaned = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
      gradeResult = JSON.parse(cleaned);
    } catch (e) {
      return res.status(422).json({
        error: 'Could not parse grading response. The scan may be unclear.',
        raw: message.content[0].text.slice(0, 500),
      });
    }

    // Cross-verify mcScore from the answer key (don't trust Claude's count blindly)
    let verifiedMcScore = 0;
    const keyMap = {};
    answerKey.forEach(k => { keyMap[k.q] = k.correct; });

    const detail = (gradeResult.mcAnswers || []).map(a => {
      const expected = keyMap[a.q];
      const isCorrect = a.marked === expected;
      if (isCorrect) verifiedMcScore++;
      return { ...a, correct: expected, isCorrect };
    });

    // Save to DB
    const effectiveName = gradeResult.studentName || studentName || 'Unknown';
    await db.savePrintGrade({
      id:           session.id,
      studentName:  effectiveName,
      mcScore:      verifiedMcScore,
      mcTotal:      answerKey.length,
      openResponse: gradeResult.openResponse || '',
      openScore:    gradeResult.openScore,
      gradeDetail:  JSON.stringify(detail),
      adminNotes:   gradeResult.openEval || '',
    });

    res.json({
      ok:           true,
      sessionId:    session.id,
      studentName:  effectiveName,
      mcScore:      verifiedMcScore,
      mcTotal:      answerKey.length,
      openScore:    gradeResult.openScore,
      openResponse: gradeResult.openResponse || '',
      openEval:     gradeResult.openEval || '',
      issues:       gradeResult.issues || '',
      detail,
    });
  } catch (err) {
    console.error('print/grade error:', err);
    res.status(500).json({ error: 'Grading failed: ' + err.message });
  }
});

module.exports = router;
