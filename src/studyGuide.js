'use strict';

const { FIESTA_FATAL, PRETERITE, IMPERFECT, VOCABULARY } = require('./questions');

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample(arr, n) { return shuffle(arr).slice(0, n); }

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Shuffle a question's options and note the new correct index */
function prepQ(q) {
  const idxs = shuffle([0, 1, 2, 3]);
  return {
    q:    q.question,
    opts: idxs.map(i => q.options[i]),
    ans:  idxs.indexOf(q.correct),
    expl: q.explanation || '',
  };
}

/* ── Category metadata ───────────────────────────────────────────────────── */
// Keys must match the exact section strings used in questions.js
const CAT_META = {
  'Fiesta Fatal — Characters & Events': {
    emoji: '🎭', color: '#e94560', xp: 150, shortName: 'Fiesta Fatal',
    tips: [
      'Focus on WHO the characters are and the role each one plays in the story.',
      'Remember the sequence of events — what caused each one to happen.',
      'Pay attention to characters’ emotional reactions and motivations.',
      'Key question words: ¿Quién? (Who?) · ¿Qué pasó? (What happened?) · ¿Por qué? (Why?)',
    ],
  },
  'Preterite Conjugation': {
    emoji: '⚔️', color: '#ffd32a', xp: 200, shortName: 'Preterite',
    tips: [
      'Use PRETERITE for completed actions at a specific moment in the past.',
      '-AR endings: -é · -aste · -ó · -amos · -asteis · -aron',
      '-ER/-IR endings: -í · -iste · -ió · -imos · -isteis · -ieron',
      'Irregulars (memorize!): ser/ir → fui, fuiste, fue, fuimos, fueron',
      'Irregulars: tener → tuve · estar → estuve · hacer → hice/hizo · venir → vine',
      'Spelling change (yo only): -car → qué · -gar → gué · -zar → cé',
      'Stem-changers (3rd person only): e→i (pidió, pidieron) · o→u (durmió, durmieron)',
    ],
  },
  'Imperfect Conjugation': {
    emoji: '🌀', color: '#4fc3f7', xp: 200, shortName: 'Imperfect',
    tips: [
      'Use IMPERFECT for ongoing/repeated past actions and descriptions.',
      '-AR endings: -aba · -abas · -aba · -ábamos · -abais · -aban',
      '-ER/-IR endings: -ía · -ías · -ía · -íamos · -íais · -ían',
      'ONLY 3 irregular verbs: ser (era) · ir (iba) · ver (veía)',
      'Trigger words: siempre · todos los días · de niño/a · mientras · generalmente · cada día',
    ],
  },
  'Vocabulary': {
    emoji: '📚', color: '#00c896', xp: 100, shortName: 'Vocabulary',
    tips: [
      'Group words by theme — related words are easier to remember together.',
      'Look for Spanish-English cognates (similar spellings = similar meaning).',
      'Practice using each word in a full sentence to build context.',
      'Flashcard tip: cover the Spanish side, read the English, then recall it.',
    ],
  },
};

const QUESTION_POOLS = {
  'Fiesta Fatal — Characters & Events': FIESTA_FATAL,
  'Preterite Conjugation': PRETERITE,
  'Imperfect Conjugation': IMPERFECT,
  'Vocabulary': VOCABULARY,
};

/* ── Main export ─────────────────────────────────────────────────────────── */
function generateStudyGuide(session, detail) {
  const studentName = session.student_name || 'Student';
  const overallPct  = session.mc_total > 0
    ? Math.round((session.mc_score / session.mc_total) * 100)
    : 0;

  // Parse per-category scores
  let cats = {};
  try { cats = JSON.parse(session.cat_json || '{}'); } catch (_) {}

  const allCats = Object.entries(cats)
    .map(([name, v]) => ({
      name,
      correct: v.c,
      total:   v.t,
      pct:     v.t > 0 ? Math.round((v.c / v.t) * 100) : 0,
    }))
    .sort((a, b) => a.pct - b.pct);

  const weakCats   = allCats.filter(c => c.pct < 75);
  const targetCats = weakCats.length ? weakCats : allCats.slice(0, 2);

  // Group wrong answers from the question log by section
  const wrongBySection = {};
  (detail.log || []).forEach(row => {
    if (!row.is_correct && row.section) {
      (wrongBySection[row.section] = wrongBySection[row.section] || []).push(row);
    }
  });

  // Build one level object per target category
  const levels = targetCats.map(cat => {
    const meta       = CAT_META[cat.name] || { emoji: '📝', color: '#7c4dff', xp: 100, shortName: cat.name, tips: [] };
    const pool       = QUESTION_POOLS[cat.name] || [];
    const wrong      = (wrongBySection[cat.name] || []).slice(0, 5);
    const wrongTexts = new Set(wrong.map(w => w.question));
    const fresh      = sample(pool.filter(q => !wrongTexts.has(q.question)), 5).map(prepQ);
    return { cat, meta, wrong, fresh };
  });

  const totalXP = levels.reduce((s, l) => s + l.meta.xp, 0);
  const isReady = overallPct >= 70 && weakCats.length <= 1;

  return renderPage({ studentName, overallPct, allCats, levels, isReady, totalXP });
}

/* ── HTML page renderer ─────────────────────────────────────────────────── */
function renderPage({ studentName, overallPct, allCats, levels, isReady, totalXP }) {
  const scoreColor = overallPct >= 80 ? '#00c896' : overallPct >= 65 ? '#ffd32a' : '#ff4757';
  const weakCount  = allCats.filter(c => c.pct < 75).length;

  /* ── CSS ── */
  const CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:#0d0d1a; --surface:#1a1a2e; --card:#16213e; --border:#2d2d5e;
      --text:#eaeaea; --muted:#778; --radius:10px;
    }
    body { background:var(--bg); color:var(--text); font-family:'Segoe UI',system-ui,sans-serif; min-height:100vh; padding-bottom:40px; }

    /* XP Bar */
    #xp-bar { position:sticky; top:0; z-index:100; background:#0d0d1a; border-bottom:2px solid #2d2d5e; padding:9px 20px; display:flex; align-items:center; gap:12px; }
    #xp-label { font-size:0.78rem; color:#aab; white-space:nowrap; font-weight:700; letter-spacing:0.5px; }
    #xp-track { flex:1; height:10px; background:var(--border); border-radius:99px; overflow:hidden; }
    #xp-fill  { height:100%; width:0%; background:linear-gradient(90deg,#7c4dff,#e94560); border-radius:99px; transition:width 0.7s cubic-bezier(.22,.61,.36,1); }
    #xp-val   { font-size:0.88rem; font-weight:900; color:#c4b5fd; white-space:nowrap; min-width:90px; text-align:right; }

    /* Hero Card */
    .hero-card  { max-width:860px; margin:28px auto 0; padding:0 16px; }
    .hero-inner { background:linear-gradient(135deg,#1a1a2e,#16213e); border:1px solid #e9456033; border-radius:16px; padding:28px 32px; display:flex; align-items:center; gap:24px; flex-wrap:wrap; }
    .hero-icon  { font-size:3.2rem; }
    .hero-text h1 { font-size:1.5rem; letter-spacing:-0.5px; }
    .hero-text h1 span { color:#e94560; }
    .hero-text .sub { color:var(--muted); font-size:0.83rem; margin-top:4px; }
    .hero-stats { margin-left:auto; text-align:right; }
    .hero-score-val { font-size:2.4rem; font-weight:900; }
    .hero-score-lbl { font-size:0.7rem; color:var(--muted); text-transform:uppercase; letter-spacing:1px; }
    .hero-status    { font-size:0.82rem; margin-top:6px; }

    /* Sections */
    .section-wrap { max-width:860px; margin:24px auto 0; padding:0 16px; }
    .section-lbl  { font-size:0.7rem; text-transform:uppercase; letter-spacing:1.5px; color:var(--muted); margin-bottom:10px; }

    /* Overview bars */
    .overview-row { display:flex; align-items:center; gap:10px; margin-bottom:9px; font-size:0.83rem; }
    .ov-name      { width:130px; flex-shrink:0; }
    .ov-bar-wrap  { flex:1; height:7px; background:var(--border); border-radius:99px; overflow:hidden; }
    .ov-bar       { height:100%; border-radius:99px; }
    .ov-pct       { width:90px; text-align:right; font-size:0.76rem; }

    /* Level Cards */
    .level-card  { max-width:860px; margin:20px auto 0; padding:0 16px; }
    .level-inner { background:var(--surface); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
    .level-header { display:flex; align-items:center; gap:12px; padding:14px 18px; cursor:pointer; user-select:none; }
    .level-header:hover { background:rgba(255,255,255,0.03); }
    .level-badge { padding:4px 12px; border-radius:99px; font-size:0.73rem; font-weight:800; letter-spacing:0.5px; flex-shrink:0; }
    .level-title  { font-weight:700; font-size:0.97rem; flex:1; }
    .level-score  { font-size:0.8rem; font-weight:700; flex-shrink:0; }
    .level-xp     { font-size:0.76rem; font-weight:700; flex-shrink:0; }
    .level-check  { font-size:1.15rem; flex-shrink:0; }
    .level-body   { padding:0 18px 20px; border-top:1px solid var(--border); display:none; }
    .level-body.open { display:block; }

    /* Tips */
    .tips-box   { background:rgba(255,255,255,0.04); border-radius:var(--radius); padding:14px 18px; margin:14px 0; }
    .tips-title { font-size:0.7rem; text-transform:uppercase; letter-spacing:1px; color:#aab; margin-bottom:8px; }
    .tip-item   { font-size:0.83rem; color:var(--text); line-height:1.75; }

    /* Sub-section label */
    .sub-lbl { font-size:0.7rem; text-transform:uppercase; letter-spacing:1.5px; color:var(--muted); margin:18px 0 10px; }

    /* Flashcards */
    .fc-grid    { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:10px; }
    .flashcard  { background:var(--card); border:1.5px solid var(--border); border-radius:var(--radius); padding:14px; cursor:pointer; min-height:90px; transition:transform 0.12s; }
    .flashcard:hover { transform:translateY(-2px); border-color:#7c4dff55; }
    .flashcard .fc-back { display:none; }
    .flashcard.flipped  .fc-front { display:none; }
    .flashcard.flipped  .fc-back  { display:block; }
    .flashcard.flipped  { border-color:#00c89644; }
    .fc-q       { font-size:0.86rem; line-height:1.5; margin-bottom:6px; }
    .fc-hint    { font-size:0.7rem; color:var(--muted); font-style:italic; }
    .fc-correct { font-size:0.88rem; font-weight:700; color:#00c896; margin-bottom:6px; }
    .fc-expl    { font-size:0.76rem; color:var(--muted); line-height:1.5; }

    /* MC Practice */
    .mc-item   { background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:14px; margin-bottom:10px; }
    .mc-q      { font-size:0.88rem; font-weight:600; margin-bottom:10px; line-height:1.5; }
    .mc-opts   { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
    .mc-opt    { padding:9px 13px; background:rgba(255,255,255,0.05); border:1.5px solid var(--border); border-radius:8px; color:var(--text); font-size:0.81rem; cursor:pointer; text-align:left; transition:all 0.12s; }
    .mc-opt:hover:not(:disabled) { border-color:#7c4dff; background:rgba(124,77,255,0.1); }
    .mc-opt.correct  { background:rgba(0,200,150,0.15); border-color:#00c896; color:#00c896; font-weight:700; }
    .mc-opt.wrong    { background:rgba(255,71,87,0.12); border-color:#ff4757; color:#ff4757; }
    .mc-opt:disabled { cursor:default; }
    .mc-feedback     { font-size:0.78rem; margin-top:7px; min-height:16px; line-height:1.5; }

    /* Level Complete Button */
    .complete-btn { width:100%; padding:12px; border:none; border-radius:var(--radius); font-size:0.9rem; font-weight:800; cursor:pointer; margin-top:14px; letter-spacing:0.3px; transition:opacity 0.15s, transform 0.1s; display:none; }
    .complete-btn:hover  { opacity:0.85; }
    .complete-btn:active { transform:scale(0.98); }
    .complete-btn:disabled { opacity:0.5; cursor:default; }

    /* Boss Battle */
    .boss-card  { max-width:860px; margin:32px auto 0; padding:0 16px; }
    .boss-inner { border-radius:16px; padding:36px; text-align:center; position:relative; overflow:hidden; }
    .boss-inner.locked   { background:var(--surface); border:2px dashed var(--border); }
    .boss-inner.unlocked { background:linear-gradient(135deg,#1a0a2e,#2e0a1a); border:2px solid #e94560; animation:bossPulse 3s ease-in-out infinite; }
    @keyframes bossPulse { 0%,100% { box-shadow:0 0 20px #e9456033; } 50% { box-shadow:0 0 50px #e9456077; } }
    .boss-lock  { font-size:2.5rem; margin-bottom:10px; }
    .boss-icon  { font-size:3.5rem; margin-bottom:10px; display:none; }
    .boss-title { font-size:1.5rem; font-weight:900; letter-spacing:1px; margin-bottom:8px; }
    .boss-sub   { color:var(--muted); font-size:0.86rem; margin-bottom:18px; }
    .boss-xp    { font-size:0.95rem; margin-bottom:20px; color:#c4b5fd; }
    .boss-btn   { display:inline-block; padding:14px 44px; background:#e94560; color:#fff; border:none; border-radius:var(--radius); font-size:1rem; font-weight:800; cursor:pointer; text-decoration:none; letter-spacing:0.5px; transition:transform 0.15s, opacity 0.15s; }
    .boss-btn:hover:not(.disabled) { opacity:0.85; transform:scale(1.04); }
    .boss-btn.disabled { background:#333; color:#666; cursor:not-allowed; pointer-events:none; }

    /* XP float pop */
    .xp-pop { position:fixed; pointer-events:none; font-size:1rem; font-weight:900; color:#c4b5fd; z-index:9999; animation:xpFloat 1.3s ease-out forwards; white-space:nowrap; }
    @keyframes xpFloat { 0% { opacity:1; transform:translateY(0) scale(1); } 100% { opacity:0; transform:translateY(-70px) scale(1.3); } }

    /* Briefing */
    .briefing { background:rgba(124,77,255,0.1); border:1px solid rgba(124,77,255,0.3); border-radius:var(--radius); padding:14px 18px; font-size:0.86rem; line-height:1.75; color:#c4b5fd; }

    @media (max-width:600px) {
      .mc-opts { grid-template-columns:1fr; }
      .hero-stats { margin-left:0; text-align:left; }
      .fc-grid { grid-template-columns:1fr; }
    }
  `;

  /* ── Level HTML blocks ── */
  const levelsHtml = levels.map((level, li) => {
    const { cat, meta, wrong, fresh } = level;
    const pctColor = cat.pct < 50 ? '#ff4757' : cat.pct < 75 ? '#ffd32a' : '#00c896';
    const btnTextColor = meta.color === '#ffd32a' ? '#000' : '#fff';

    // Flashcard rows (missed questions)
    const flashHtml = wrong.length
      ? '<div class="sub-lbl">&#x1F0CF; Review Flashcards &mdash; Questions You Missed</div>'
        + '<div class="fc-grid">'
        + wrong.map(row =>
          '<div class="flashcard" onclick="flipCard(this)">'
          + '<div class="fc-front">'
          + '<div class="fc-q">' + esc(row.question) + '</div>'
          + '<div class="fc-hint">&#x1F446; tap to reveal answer</div>'
          + '</div>'
          + '<div class="fc-back">'
          + '<div class="fc-correct">&#x2705; ' + esc(row.correct_ans) + '</div>'
          + (row.explanation ? '<div class="fc-expl">' + esc(row.explanation) + '</div>' : '')
          + '</div>'
          + '</div>'
        ).join('')
        + '</div>'
      : '';

    // MC practice (fresh questions)
    const mcHtml = fresh.length
      ? '<div class="sub-lbl">&#x26A1; Practice Challenges</div>'
        + fresh.map((fq, qi) =>
          '<div class="mc-item" id="l' + li + 'q' + qi + '" data-ans="' + fq.ans + '" data-done="0">'
          + '<div class="mc-q">' + esc(fq.q) + '</div>'
          + '<div class="mc-opts">'
          + fq.opts.map((opt, oi) =>
            '<button class="mc-opt" onclick="ansQ(' + li + ',' + qi + ',' + oi + ',this)">'
            + esc(opt) + '</button>'
          ).join('')
          + '</div>'
          + '<div class="mc-feedback" id="l' + li + 'q' + qi + 'fb"></div>'
          + '</div>'
        ).join('')
      : '';

    // Tips
    const tipsHtml = meta.tips.length
      ? '<div class="tips-box"><div class="tips-title">&#x1F4A1; Quick Reference</div>'
        + meta.tips.map(t => '<div class="tip-item">&#9658; ' + esc(t) + '</div>').join('')
        + '</div>'
      : '';

    return '<div class="level-card">'
      + '<div class="level-inner">'
      + '<div class="level-header" onclick="toggleLevel(' + li + ')">'
      + '<div class="level-badge" style="background:' + meta.color + '22;border:2px solid ' + meta.color + ';color:' + meta.color + '">'
      + meta.emoji + ' LEVEL ' + (li + 1)
      + '</div>'
      + '<div class="level-title">' + esc(meta.shortName) + '</div>'
      + '<div class="level-score" style="color:' + pctColor + '">' + cat.correct + '/' + cat.total + ' (' + cat.pct + '%)</div>'
      + '<div class="level-xp" style="color:' + meta.color + '">+' + meta.xp + ' XP</div>'
      + '<div class="level-check" id="lcheck' + li + '">&#x2B1C;</div>'
      + '</div>'
      + '<div class="level-body" id="lbody' + li + '">'
      + tipsHtml
      + flashHtml
      + mcHtml
      + '<button class="complete-btn" id="lcbtn' + li + '"'
      + ' onclick="completeLevel(' + li + ')"'
      + ' style="background:' + meta.color + ';color:' + btnTextColor + '">'
      + '&#x2713; Mark Level ' + (li + 1) + ' Complete &rarr; +' + meta.xp + ' XP'
      + '</button>'
      + '</div>'
      + '</div></div>';
  }).join('\n');

  /* ── Performance overview bars ── */
  const overviewHtml = allCats.map(cat => {
    const c = cat.pct >= 75 ? '#00c896' : cat.pct >= 50 ? '#ffd32a' : '#ff4757';
    const m = CAT_META[cat.name] || { emoji: '&#x1F4DD;', shortName: cat.name };
    return '<div class="overview-row">'
      + '<span class="ov-name">' + m.emoji + ' ' + esc(m.shortName) + '</span>'
      + '<div class="ov-bar-wrap"><div class="ov-bar" style="width:' + cat.pct + '%;background:' + c + '"></div></div>'
      + '<span class="ov-pct" style="color:' + c + '">' + cat.correct + '/' + cat.total + ' (' + cat.pct + '%)</span>'
      + '</div>';
  }).join('');

  /* ── Inline JavaScript (use double-quoted strings throughout to avoid escaping issues) ── */
  const freshCounts = JSON.stringify(levels.map(l => l.fresh.length));
  const JS = `
"use strict";
var TOTAL_XP    = ${totalXP};
var NUM_LEVELS  = ${levels.length};
var earnedXP    = 0;
var doneCount   = 0;
var levelDone   = new Array(NUM_LEVELS).fill(false);
var mcAnswers   = {};
for (var i = 0; i < NUM_LEVELS; i++) mcAnswers[i] = {};
var freshCounts = ${freshCounts};

function toggleLevel(li) {
  var body = document.getElementById("lbody" + li);
  if (body) body.classList.toggle("open");
}

function flipCard(el) {
  el.classList.toggle("flipped");
}

function ansQ(li, qi, chosen, btn) {
  var item = document.getElementById("l" + li + "q" + qi);
  if (!item || item.dataset.done === "1") return;
  item.dataset.done = "1";
  var ans  = parseInt(item.dataset.ans, 10);
  var opts = item.querySelectorAll(".mc-opt");
  opts.forEach(function(b) { b.disabled = true; });
  var fb = document.getElementById("l" + li + "q" + qi + "fb");
  opts[ans].classList.add("correct");
  if (chosen === ans) {
    if (fb) fb.innerHTML = "<span style=\\"color:#00c896\\">&#x2713; Correct! Great work.</span>";
    xpPop(btn, "+10 XP");
    earnedXP += 10;
    updateBar();
  } else {
    btn.classList.add("wrong");
    if (fb) fb.innerHTML = "<span style=\\"color:#ff4757\\">&#x2717; Not quite &mdash; review the tips and try to remember!</span>";
  }
  mcAnswers[li][qi] = (chosen === ans);
  checkShowComplete(li);
}

function checkShowComplete(li) {
  if (Object.keys(mcAnswers[li]).length >= freshCounts[li]) {
    var btn = document.getElementById("lcbtn" + li);
    if (btn) btn.style.display = "block";
  }
}

function completeLevel(li) {
  if (levelDone[li]) return;
  levelDone[li] = true;
  doneCount++;
  var check = document.getElementById("lcheck" + li);
  if (check) check.textContent = "\\u2705";
  var body = document.getElementById("lbody" + li);
  if (body) body.classList.remove("open");
  var btn = document.getElementById("lcbtn" + li);
  if (btn) btn.disabled = true;
  earnedXP += 50;
  updateBar();
  xpPop(check || document.body, "LEVEL COMPLETE! +50 XP");
  if (doneCount >= NUM_LEVELS) unlockBoss();
}

function updateBar() {
  var pct = TOTAL_XP > 0 ? Math.min(100, Math.round(earnedXP / TOTAL_XP * 100)) : 0;
  var fill = document.getElementById("xp-fill");
  var val  = document.getElementById("xp-val");
  if (fill) fill.style.width = pct + "%";
  if (val)  val.textContent  = earnedXP + " / " + TOTAL_XP + " XP";
}

function unlockBoss() {
  var card = document.getElementById("boss-card");
  if (card) { card.classList.remove("locked"); card.classList.add("unlocked"); }
  var lock = document.getElementById("boss-lock");
  var icon = document.getElementById("boss-icon");
  if (lock) lock.style.display = "none";
  if (icon) icon.style.display = "block";
  var title = document.getElementById("boss-title");
  var sub   = document.getElementById("boss-sub");
  var xpEl  = document.getElementById("boss-xp");
  if (title) title.textContent = "BOSS BATTLE UNLOCKED!";
  if (sub)   sub.textContent   = "All levels complete. Go fight the Final Boss!";
  if (xpEl)  xpEl.textContent  = "Total XP Earned: " + earnedXP + " \\u2B50";
  var bossBtn = document.getElementById("boss-btn");
  if (bossBtn) { bossBtn.classList.remove("disabled"); bossBtn.style.pointerEvents = ""; }
  setTimeout(function() {
    var el = document.getElementById("boss-card");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 300);
}

function xpPop(anchor, text) {
  var rect = anchor && anchor.getBoundingClientRect
    ? anchor.getBoundingClientRect()
    : { top: 200, left: 200, width: 60 };
  var pop = document.createElement("div");
  pop.className = "xp-pop";
  pop.textContent = text;
  pop.style.top  = (rect.top + window.scrollY - 8) + "px";
  pop.style.left = (rect.left + rect.width / 2 - 40) + "px";
  document.body.appendChild(pop);
  setTimeout(function() { if (pop.parentNode) pop.parentNode.removeChild(pop); }, 1400);
}

window.addEventListener("DOMContentLoaded", function() {
  if (NUM_LEVELS > 0) toggleLevel(0);
  for (var i = 0; i < NUM_LEVELS; i++) {
    if (freshCounts[i] === 0) {
      var btn = document.getElementById("lcbtn" + i);
      if (btn) btn.style.display = "block";
    }
  }
});
`;

  /* ── Assemble page ── */
  const lines = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '<title>Spanish Quest &mdash; Study Guide for ' + esc(studentName) + '</title>',
    '<style>' + CSS + '</style>',
    '</head>',
    '<body>',

    // XP bar
    '<div id="xp-bar">',
    '<div id="xp-label">&#x2B50; XP PROGRESS</div>',
    '<div id="xp-track"><div id="xp-fill"></div></div>',
    '<div id="xp-val">0 / ' + totalXP + ' XP</div>',
    '</div>',

    // Hero card
    '<div class="hero-card">',
    '<div class="hero-inner">',
    '<div class="hero-icon">&#x1F9B8;</div>',
    '<div class="hero-text">',
    '<h1>SPANISH QUEST: <span>Boss Prep</span></h1>',
    '<div class="sub">Personalized Study Guide for ' + esc(studentName) + '</div>',
    '</div>',
    '<div class="hero-stats">',
    '<div class="hero-score-val" style="color:' + scoreColor + '">' + overallPct + '%</div>',
    '<div class="hero-score-lbl">Last Practice Score</div>',
    '<div class="hero-status">'
      + (weakCount > 0
          ? '&#x26A0;&#xFE0F; ' + weakCount + ' area' + (weakCount > 1 ? 's' : '') + ' to level up'
          : '&#x1F3C6; All areas above 75%!')
      + '</div>',
    '</div>',
    '</div>',
    '</div>',

    // Mission briefing
    '<div class="section-wrap">',
    '<div class="briefing">',
    '&#x1F4DC; <strong>MISSION BRIEFING:</strong> The Final Boss (tu examen de espa&ntilde;ol) is coming. '
    + 'Complete each level to power up your skills. Review the flashcards, crush the practice challenges, '
    + 'and mark each level complete to earn XP. Unlock the Boss Battle when you\'re ready to take the full practice test!',
    '</div>',
    '</div>',

    // Overview
    '<div class="section-wrap">',
    '<div class="section-lbl">Performance Overview</div>',
    overviewHtml,
    '</div>',

    // Levels
    levelsHtml,

    // Boss Battle
    '<div class="boss-card">',
    '<div class="boss-inner locked" id="boss-card">',
    '<div class="boss-lock" id="boss-lock">&#x1F512;</div>',
    '<div class="boss-icon" id="boss-icon">&#x1F409;</div>',
    '<div class="boss-title" id="boss-title">BOSS BATTLE</div>',
    '<div class="boss-sub" id="boss-sub">Complete all levels above to unlock the Final Boss Battle</div>',
    '<div class="boss-xp" id="boss-xp"></div>',
    '<a href="/" class="boss-btn disabled" id="boss-btn">&#x2694;&#xFE0F; TAKE THE FULL PRACTICE TEST</a>',
    '</div>',
    '</div>',

    '<script>' + JS + '</script>',
    '</body>',
    '</html>',
  ];

  return lines.join('\n');
}

module.exports = { generateStudyGuide };
