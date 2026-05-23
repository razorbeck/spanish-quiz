'use strict';
require('dotenv').config();
const express      = require('express');
const helmet       = require('helmet');
const session      = require('express-session');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');
const path         = require('path');
const { initDb }   = require('./src/db');
const quizRoutes   = require('./src/quizRoutes');
const adminRoutes  = require('./src/adminRoutes');

const app  = express();
const PORT = process.env.PORT || 8080;

// ── Trust DigitalOcean's proxy (fixes express-rate-limit X-Forwarded-For error)
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:    ["'self'"],
      scriptSrc:     ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],           // allow onclick= handlers
      styleSrc:      ["'self'", "'unsafe-inline'"],
      imgSrc:        ["'self'", 'data:'],
    }
  }
}));

// ── Disable fingerprinting ────────────────────────────────────────────────────
app.disable('x-powered-by');

// ── Body + cookies ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ── Session (for admin auth) ──────────────────────────────────────────────────
app.use(session({
  secret:            process.env.SESSION_SECRET || 'change-this-in-production-!!',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   4 * 60 * 60 * 1000   // 4 hours
  }
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/quiz',  rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.use('/api/admin', rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));

// ── Static files (NO source maps) ────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.map')) res.status(404).end();
  }
}));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/quiz',  quizRoutes);
app.use('/api/admin', adminRoutes);

// ── Admin page ────────────────────────────────────────────────────────────────
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ── Catch-all → index ─────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Boot — wait for DB before accepting traffic ───────────────────────────────
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Spanish Quiz App running on port ${PORT}`);
      console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  });
