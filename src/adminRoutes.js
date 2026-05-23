'use strict';
const express     = require('express');
const bcrypt      = require('bcryptjs');
const db          = require('./db');
const { getReading } = require('./readings');

const router = express.Router();

// ── Auth middleware ────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// ── POST /api/admin/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });

    const adminHash  = process.env.ADMIN_PASSWORD_HASH;
    const adminPlain = process.env.ADMIN_PASSWORD;

    let valid = false;
    if (adminHash) {
      valid = await bcrypt.compare(password, adminHash);
    } else if (adminPlain) {
      valid = password === adminPlain;
    } else {
      return res.status(503).json({ error: 'Admin credentials not configured' });
    }

    if (!valid) {
      await new Promise(r => setTimeout(r, 500)); // slow brute-force
      return res.status(403).json({ error: 'Invalid password' });
    }

    req.session.isAdmin = true;
    req.session.loginAt = Date.now();
    res.json({ ok: true });
  } catch (err) {
    console.error('admin/login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/admin/logout ────────────────────────────────────────────────────
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', requireAuth, async (req, res) => {
  try {
    res.json(await db.getStats());
  } catch (err) {
    console.error('admin/stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/admin/sessions ───────────────────────────────────────────────────
router.get('/sessions', requireAuth, async (req, res) => {
  try {
    res.json(await db.getAllSessions());
  } catch (err) {
    console.error('admin/sessions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/admin/session/:id ────────────────────────────────────────────────
router.get('/session/:id', requireAuth, async (req, res) => {
  try {
    const detail = await db.getSessionDetail(req.params.id);
    if (!detail) return res.status(404).json({ error: 'Not found' });

    // Attach the reading passage + open question so admin can see them while grading
    try {
      const reading = getReading(detail.version);
      detail.readingPassage = reading.passage;
      detail.openQuestion   = reading.openQ;
    } catch (_) {
      detail.readingPassage = null;
      detail.openQuestion   = null;
    }

    res.json(detail);
  } catch (err) {
    console.error('admin/session error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/admin/grade/:id ─────────────────────────────────────────────────
router.post('/grade/:id', requireAuth, async (req, res) => {
  try {
    const { score, notes } = req.body;
    const s = parseInt(score, 10);
    if (isNaN(s) || s < 0 || s > 3) {
      return res.status(400).json({ error: 'Score must be 0-3' });
    }
    await db.gradeOpenResponse(req.params.id, s, (notes || '').slice(0, 1000));
    res.json({ ok: true });
  } catch (err) {
    console.error('admin/grade error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/admin/regrade-all ───────────────────────────────────────────────
// Resets open_score and reviewed on all completed sessions so they can be
// re-graded with the updated rubric.
router.post('/regrade-all', requireAuth, async (req, res) => {
  try {
    const count = await db.resetAllOpenScores();
    res.json({ ok: true, count });
  } catch (err) {
    console.error('admin/regrade-all error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE /api/admin/session/:id ─────────────────────────────────────────────
router.delete('/session/:id', requireAuth, async (req, res) => {
  try {
    await db.deleteSession(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('admin/delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/admin/export.csv ─────────────────────────────────────────────────
router.get('/export.csv', requireAuth, async (req, res) => {
  try {
    const sessions = await db.getAllSessions();
    const rows = [
      ['ID', 'Student', 'Version', 'Started', 'Completed', 'MC Score', 'MC Total', 'MC %', 'Open Score', 'Reviewed', 'Time (s)'],
      ...sessions.map(s => [
        s.id,
        s.student_name,
        s.version,
        s.started_at,
        s.completed_at || '',
        s.mc_score,
        s.mc_total,
        s.mc_total > 0 ? Math.round((s.mc_score / s.mc_total) * 100) + '%' : '',
        s.open_score !== null && s.open_score !== undefined ? s.open_score : '',
        s.reviewed ? 'Yes' : 'No',
        s.time_ms ? Math.round(s.time_ms / 1000) : '',
      ])
    ];
    const csv = rows.map(r =>
      r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\r\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="quiz-results.csv"');
    res.send(csv);
  } catch (err) {
    console.error('admin/export error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/admin/check ──────────────────────────────────────────────────────
router.get('/check', (req, res) => {
  res.json({ loggedIn: !!(req.session && req.session.isAdmin) });
});

module.exports = router;
