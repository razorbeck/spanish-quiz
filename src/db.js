'use strict';
const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const DB_DIR  = process.env.DB_DIR || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'quiz.db');

let db;

function getDb() {
  if (!db) throw new Error('Database not initialised');
  return db;
}

function initDb() {
  fs.mkdirSync(DB_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id              TEXT PRIMARY KEY,
      student_name    TEXT NOT NULL DEFAULT 'Student',
      version         INTEGER NOT NULL,
      started_at      TEXT NOT NULL,
      completed_at    TEXT,
      mc_score        INTEGER DEFAULT 0,
      mc_total        INTEGER DEFAULT 0,
      open_response   TEXT,
      open_score      INTEGER,
      admin_notes     TEXT,
      reviewed        INTEGER DEFAULT 0,
      time_ms         INTEGER,
      answers_json    TEXT,
      cat_json        TEXT
    );

    CREATE TABLE IF NOT EXISTS question_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id  TEXT REFERENCES sessions(id),
      q_index     INTEGER,
      section     TEXT,
      question    TEXT,
      chosen      TEXT,
      correct_ans TEXT,
      is_correct  INTEGER,
      explanation TEXT
    );
  `);

  console.log(`✅  Database ready at ${DB_PATH}`);
}

// ── Sessions ─────────────────────────────────────────────────
function createSession(id, studentName, version) {
  getDb().prepare(`
    INSERT INTO sessions (id, student_name, version, started_at)
    VALUES (?, ?, ?, ?)
  `).run(id, studentName, version, new Date().toISOString());
}

function getSession(id) {
  return getDb().prepare('SELECT * FROM sessions WHERE id = ?').get(id);
}

function completeSession({ id, mcScore, mcTotal, openResponse, timesMs, answersJson, catJson }) {
  getDb().prepare(`
    UPDATE sessions SET
      completed_at = ?,
      mc_score     = ?,
      mc_total     = ?,
      open_response = ?,
      time_ms      = ?,
      answers_json = ?,
      cat_json     = ?
    WHERE id = ?
  `).run(new Date().toISOString(), mcScore, mcTotal, openResponse, timesMs, answersJson, catJson, id);
}

function logAnswer({ sessionId, qIndex, section, question, chosen, correctAns, isCorrect, explanation }) {
  getDb().prepare(`
    INSERT INTO question_log
      (session_id, q_index, section, question, chosen, correct_ans, is_correct, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(sessionId, qIndex, section, question, chosen, correctAns, isCorrect ? 1 : 0, explanation);
}

// ── Admin queries ────────────────────────────────────────────
function getAllSessions() {
  return getDb().prepare(`
    SELECT id, student_name, version, started_at, completed_at,
           mc_score, mc_total, open_score, reviewed, time_ms
    FROM sessions
    ORDER BY started_at DESC
  `).all();
}

function getSessionDetail(id) {
  const sess = getDb().prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  if (!sess) return null;
  const log  = getDb().prepare('SELECT * FROM question_log WHERE session_id = ? ORDER BY q_index').all(id);
  return { ...sess, log };
}

function gradeOpenResponse(id, score, notes) {
  getDb().prepare(`
    UPDATE sessions SET open_score = ?, admin_notes = ?, reviewed = 1 WHERE id = ?
  `).run(score, notes, id);
}

function deleteSession(id) {
  const d = getDb();
  d.prepare('DELETE FROM question_log WHERE session_id = ?').run(id);
  d.prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

function getStats() {
  const db2 = getDb();
  const total     = db2.prepare('SELECT COUNT(*) as n FROM sessions WHERE completed_at IS NOT NULL').get().n;
  const unreviewed = db2.prepare("SELECT COUNT(*) as n FROM sessions WHERE completed_at IS NOT NULL AND reviewed = 0").get().n;
  const rows      = db2.prepare(`
    SELECT mc_score, mc_total, open_score, cat_json
    FROM sessions WHERE completed_at IS NOT NULL
  `).all();

  if (!rows.length) return { total, unreviewed, avg: null, best: null, weakCat: null };

  const scored = rows.filter(r => r.mc_total > 0);
  const pcts   = scored.map(r => Math.round((r.mc_score / r.mc_total) * 100));
  const avg    = Math.round(pcts.reduce((a,b) => a+b, 0) / pcts.length);
  const best   = Math.max(...pcts);

  // Aggregate category performance
  const cats = {};
  scored.forEach(r => {
    try {
      const c = JSON.parse(r.cat_json || '{}');
      Object.entries(c).forEach(([k, v]) => {
        if (!cats[k]) cats[k] = { c: 0, t: 0 };
        cats[k].c += v.c;
        cats[k].t += v.t;
      });
    } catch (_) {}
  });
  let weakCat = null, weakPct = 101;
  Object.entries(cats).forEach(([k, v]) => {
    const p = Math.round((v.c / v.t) * 100);
    if (p < weakPct) { weakPct = p; weakCat = `${k} (${p}%)`; }
  });

  return { total, unreviewed, avg, best, weakCat };
}

module.exports = { initDb, createSession, getSession, completeSession, logAnswer,
                   getAllSessions, getSessionDetail, gradeOpenResponse, deleteSession, getStats };
