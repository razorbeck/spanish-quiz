'use strict';
const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) throw new Error('Database not initialised');
  return pool;
}

async function initDb() {
  // DigitalOcean injects DATABASE_URL with sslmode=require.
  // We must pass ssl config separately and set rejectUnauthorized: false
  // because DO uses a self-signed CA that Node won't trust by default.
  const sslConfig = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode')
    ? { rejectUnauthorized: false }                        // DO managed DB — skip cert verify
    : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false);

  // Strip sslmode from the URL so pg doesn't double-configure SSL
  const connectionString = (process.env.DATABASE_URL || '')
    .replace(/[?&]sslmode=[^&]*/g, '')
    .replace(/[?&]ssl=[^&]*/g, '')
    .replace(/\?$/, '');

  pool = new Pool({
    connectionString: connectionString || process.env.DATABASE_URL,
    ssl: sslConfig,
  });

  // Verify connection
  await pool.query('SELECT 1');

  await pool.query(`
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
      id          SERIAL PRIMARY KEY,
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

  console.log('✅  PostgreSQL database ready');
}

// ── Sessions ──────────────────────────────────────────────────────────────────

async function createSession(id, studentName, version) {
  await getPool().query(
    `INSERT INTO sessions (id, student_name, version, started_at)
     VALUES ($1, $2, $3, $4)`,
    [id, studentName, version, new Date().toISOString()]
  );
}

async function getSession(id) {
  const r = await getPool().query('SELECT * FROM sessions WHERE id = $1', [id]);
  return r.rows[0] || null;
}

async function completeSession({ id, mcScore, mcTotal, openResponse, timesMs, answersJson, catJson }) {
  await getPool().query(
    `UPDATE sessions SET
       completed_at  = $1,
       mc_score      = $2,
       mc_total      = $3,
       open_response = $4,
       time_ms       = $5,
       answers_json  = $6,
       cat_json      = $7
     WHERE id = $8`,
    [new Date().toISOString(), mcScore, mcTotal, openResponse, timesMs, answersJson, catJson, id]
  );
}

async function logAnswer({ sessionId, qIndex, section, question, chosen, correctAns, isCorrect, explanation }) {
  await getPool().query(
    `INSERT INTO question_log
       (session_id, q_index, section, question, chosen, correct_ans, is_correct, explanation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [sessionId, qIndex, section, question, chosen, correctAns, isCorrect ? 1 : 0, explanation]
  );
}

// ── Admin queries ─────────────────────────────────────────────────────────────

async function getAllSessions() {
  const r = await getPool().query(
    `SELECT id, student_name, version, started_at, completed_at,
            mc_score, mc_total, open_score, reviewed, time_ms
     FROM sessions
     ORDER BY started_at DESC`
  );
  return r.rows;
}

async function getSessionDetail(id) {
  const sRes = await getPool().query('SELECT * FROM sessions WHERE id = $1', [id]);
  if (!sRes.rows.length) return null;
  const lRes = await getPool().query(
    'SELECT * FROM question_log WHERE session_id = $1 ORDER BY q_index',
    [id]
  );
  return { ...sRes.rows[0], log: lRes.rows };
}

async function gradeOpenResponse(id, score, notes) {
  await getPool().query(
    `UPDATE sessions SET open_score = $1, admin_notes = $2, reviewed = 1 WHERE id = $3`,
    [score, notes, id]
  );
}

async function getAllLogsAggregated() {
  const p = getPool();
  const [logsRes, sessRes] = await Promise.all([
    p.query(`
      SELECT ql.section, ql.question, ql.correct_ans, ql.chosen,
             ql.is_correct, ql.explanation
      FROM question_log ql
      JOIN sessions s ON ql.session_id = s.id
      WHERE s.completed_at IS NOT NULL
      ORDER BY ql.section, ql.question
    `),
    p.query(`
      SELECT id, mc_score, mc_total, cat_json, completed_at
      FROM sessions
      WHERE completed_at IS NOT NULL
      ORDER BY completed_at DESC
    `),
  ]);
  return { logs: logsRes.rows, sessions: sessRes.rows };
}

async function resetAllOpenScores() {
  const r = await getPool().query(
    `UPDATE sessions SET open_score = NULL, admin_notes = NULL, reviewed = 0
     WHERE completed_at IS NOT NULL`
  );
  return r.rowCount;
}

async function deleteSession(id) {
  const p = getPool();
  await p.query('DELETE FROM question_log WHERE session_id = $1', [id]);
  await p.query('DELETE FROM sessions WHERE id = $1', [id]);
}

async function countPartialSessions() {
  const r = await getPool().query(
    `SELECT COUNT(*) AS n FROM sessions WHERE completed_at IS NULL`
  );
  return parseInt(r.rows[0].n, 10);
}

async function deletePartialSessions() {
  const p = getPool();
  // Remove logs for partial sessions first (FK constraint)
  await p.query(
    `DELETE FROM question_log WHERE session_id IN
       (SELECT id FROM sessions WHERE completed_at IS NULL)`
  );
  const r = await p.query(
    `DELETE FROM sessions WHERE completed_at IS NULL`
  );
  return r.rowCount;
}

async function getStats() {
  const p = getPool();
  const [totRes, unrevRes, rowsRes] = await Promise.all([
    p.query("SELECT COUNT(*) AS n FROM sessions WHERE completed_at IS NOT NULL"),
    p.query("SELECT COUNT(*) AS n FROM sessions WHERE completed_at IS NOT NULL AND reviewed = 0"),
    p.query("SELECT mc_score, mc_total, open_score, cat_json FROM sessions WHERE completed_at IS NOT NULL"),
  ]);

  const total      = parseInt(totRes.rows[0].n, 10);
  const unreviewed = parseInt(unrevRes.rows[0].n, 10);
  const rows       = rowsRes.rows;

  if (!rows.length) return { total, unreviewed, avg: null, best: null, weakCat: null };

  const scored = rows.filter(r => r.mc_total > 0);
  const pcts   = scored.map(r => Math.round((r.mc_score / r.mc_total) * 100));
  const avg    = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;
  const best   = pcts.length ? Math.max(...pcts) : null;

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

module.exports = {
  initDb, createSession, getSession, completeSession, logAnswer,
  getAllSessions, getSessionDetail, gradeOpenResponse, resetAllOpenScores,
  getAllLogsAggregated, deleteSession, getStats,
  countPartialSessions, deletePartialSessions,
};
