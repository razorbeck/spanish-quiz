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
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function prepQ(q) {
  const idxs = shuffle([0,1,2,3]);
  return { q: q.question, opts: idxs.map(i => q.options[i]), ans: idxs.indexOf(q.correct), expl: q.explanation || '' };
}

/* ── Analyse performance across ALL completed sessions ───────────────────── */
function analyzePerformance(logs, sessions) {
  // Per-question accuracy (aggregate all attempts)
  const qMap = {};
  logs.forEach(row => {
    const key = row.question;
    if (!qMap[key]) {
      qMap[key] = { question: key, section: row.section, correct: 0, total: 0,
                    correct_ans: row.correct_ans, explanation: row.explanation };
    }
    qMap[key].total++;
    if (row.is_correct) qMap[key].correct++;
  });

  // Per-section accuracy
  const sMap = {};
  logs.forEach(row => {
    const s = row.section || 'Unknown';
    if (!sMap[s]) sMap[s] = { correct: 0, total: 0 };
    sMap[s].total++;
    if (row.is_correct) sMap[s].correct++;
  });

  // catScores sorted weakest-first so we can build a priority order
  const catScores = Object.entries(sMap).map(([name, v]) => ({
    name, correct: v.correct, total: v.total,
    pct: v.total > 0 ? Math.round(v.correct / v.total * 100) : 0,
  })).sort((a, b) => a.pct - b.pct);

  // All questions missed > 40% of the time, sorted worst-first, capped at 25
  const weakQuestions = Object.values(qMap)
    .filter(q => q.total > 0 && (q.correct / q.total) < 0.6)
    .sort((a, b) => (a.correct / a.total) - (b.correct / b.total))
    .slice(0, 25);

  // Weak sections = below 80% (raised from 75 to catch plateau range)
  const weakSections = new Set(catScores.filter(c => c.pct < 80).map(c => c.name));

  // Overall stats
  const totalAttempts = sessions.length;
  const scoredSessions = sessions.filter(s => s.mc_total > 0);
  const latestScore = scoredSessions.length > 0
    ? Math.round(scoredSessions[0].mc_score / scoredSessions[0].mc_total * 100) : 0;
  const bestScore = scoredSessions.length > 0
    ? Math.max(...scoredSessions.map(s => Math.round(s.mc_score / s.mc_total * 100))) : 0;
  const avgScore = scoredSessions.length > 0
    ? Math.round(scoredSessions.reduce((sum, s) => sum + (s.mc_score / s.mc_total * 100), 0) / scoredSessions.length) : 0;

  // Score history — ordered newest-first (sessions already ordered by completed_at DESC)
  const scoreHistory = scoredSessions.slice(0, 8).map(s => Math.round(s.mc_score / s.mc_total * 100));

  // Plateau detection: last 3 scores within 8 points of each other, stuck below 90%
  const recent = scoreHistory.slice(0, 3);
  const isPlateaued = recent.length >= 3
    && (Math.max(...recent) - Math.min(...recent)) <= 8
    && Math.max(...recent) < 90;

  return { catScores, weakSections, weakQuestions, totalAttempts, latestScore, bestScore, avgScore, scoreHistory, isPlateaued };
}

/* ── Static study content (character intel, grammar rules) ───────────────── */
const CHARACTERS = [
  { name: 'Jorge',        role: 'Ex-cop / Julieta\'s dad',
    facts: ['Worked for the police — then had to flee the cartel','Lived in Mexico City (México D.F.)','Lives in a small apartment','Has SECRET STAIRS hidden under his sofa','Keeps his money in CASH (not in a bank)','Runs from the cartel with Julieta to protect her'] },
  { name: 'Julieta',      role: 'Jorge\'s daughter',
    facts: ['Celebrating her QUINCEAÑERA (15th birthday party) with family','Adores her dad Jorge','Is at the center of the "Fiesta Fatal"'] },
  { name: 'Riky',         role: 'Julieta\'s boyfriend?',
    facts: ['Very handsome and popular with girls','NOT HONEST about his true identity','Has dangerous secrets he hides from everyone'] },
  { name: 'Edgar',        role: 'Cartel member',
    facts: ['VIOLENT and DANGEROUS — a serious threat','Works for the cartel','The main antagonist of the story'] },
  { name: 'Susana',       role: 'Works at a restaurant',
    facts: ['Works at a RESTAURANT in Ciudad Juárez (not a market stall)','Connected to the story through the cartel situation'] },
  { name: 'Vanesa',       role: 'Market worker',
    facts: ['Works at a market STALL (puesto) with her MOTHER','Wears HUMBLE (humilde) clothing','Is hardworking and simple — not rich'] },
  { name: 'Mónica',       role: 'Friend',
    facts: ['Described as COMPRENSIVA (understanding / compassionate)','Is kind and empathetic toward others'] },
  { name: 'Sr. Sandoval', role: 'Father / market worker',
    facts: ['Works at the market WITH his daughter','Does NOT respect his daughter','Contrasts with Jorge who is a loving, protective father'] },
  { name: 'El taxista',   role: 'The taxi driver',
    facts: ['Has a FAST car','DIDN\'T LOOK at the road → CRASHED into another car','His crash is a key event in the story'] },
  { name: 'Berta',        role: 'Character in the story',
    facts: ['Appears in the Fiesta Fatal story','Know her name and association with the other characters'] },
  { name: 'El cártel',    role: 'The criminal organization',
    facts: ['Wanted to ELIMINATE Jorge AND his entire family','The source of all danger in the story','Why Jorge had to flee and hide'] },
];

const KEY_EVENTS = [
  'The cartel wants to ELIMINATE Jorge and his entire family.',
  'Jorge was running from the cartel WITH his daughter Julieta.',
  'Jorge has SECRET STAIRS hidden beneath his sofa in his small apartment.',
  'Jorge keeps his money in CASH — he doesn\'t trust banks.',
  'The taxi driver crashed because he wasn\'t paying attention to the road.',
  'Julieta\'s quinceañera (15th birthday party) is where the story begins.',
  'Riky is NOT honest about who he really is — he has dangerous secrets.',
  'Vanesa works a humble market stall with her mom — she is NOT rich.',
  'Sr. Sandoval does not respect his daughter, unlike Jorge who protects Julieta.',
];

const VOCAB_LIST = [
  { es: 'peligroso/a',   en: 'dangerous',           ex: 'Edgar era violento y <b>peligroso</b>.' },
  { es: 'huir',          en: 'to flee / run away',   ex: 'Jorge tenía que <b>huir</b> del cártel.' },
  { es: 'comprensiva',   en: 'understanding',        ex: 'Mónica era muy <b>comprensiva</b>.' },
  { es: 'las escaleras', en: 'stairs',               ex: 'Había <b>escaleras</b> secretas debajo del sofá.' },
  { es: 'simpático/a',   en: 'nice / friendly',      ex: 'Julieta era muy <b>simpática</b>.' },
  { es: 'humilde',       en: 'humble / modest',      ex: 'Vanesa llevaba ropa <b>humilde</b>.' },
  { es: 'chocó',         en: 'crashed / collided',   ex: 'El taxista <b>chocó</b> con otro coche.' },
  { es: 'el puesto',     en: 'market stall',         ex: 'Vanesa trabajaba en un <b>puesto</b>.' },
  { es: 'eliminar',      en: 'to eliminate',         ex: 'El cártel quería <b>eliminar</b> a Jorge.' },
  { es: 'la quinceañera',en: 'girl\'s 15th birthday party', ex: 'Julieta celebraba su <b>quinceañera</b>.' },
  { es: 'el cártel',     en: 'cartel (criminal org)',ex: 'El <b>cártel</b> era muy peligroso.' },
  { es: 'adorar',        en: 'to adore / love deeply', ex: 'Julieta <b>adoraba</b> a su papá.' },
  { es: 'respetar',      en: 'to respect',           ex: 'Sr. Sandoval no <b>respetaba</b> a su hija.' },
  { es: 'escapar',       en: 'to escape',            ex: 'Jorge y Julieta lograron <b>escapar</b>.' },
  { es: 'gracioso/a',    en: 'funny / entertaining', ex: 'Era muy <b>gracioso</b> de niño.' },
  { es: 'nervioso/a',    en: 'nervous',              ex: 'La señora estaba <b>nerviosa</b>.' },
  { es: 'honesto/a',     en: 'honest',               ex: 'Riky no era <b>honesto</b> sobre su identidad.' },
  { es: 'el mercado',    en: 'the market',           ex: 'Vanesa trabajaba en el <b>mercado</b>.' },
  { es: 'el efectivo',   en: 'cash',                 ex: 'Jorge guardaba su dinero en <b>efectivo</b>.' },
  { es: 'secreto/a',     en: 'secret / hidden',      ex: 'Tenía <b>escaleras secretas</b> debajo del sofá.' },
];

/* ── Main export ─────────────────────────────────────────────────────────── */
function generateStudyGuide({ logs, sessions }) {
  if (!sessions.length) {
    return '<html><body style="background:#080810;color:#fff;font-family:system-ui;padding:60px;text-align:center">'
      + '<h1 style="color:#4f9eff">No completed tests yet.</h1>'
      + '<p>Dylan needs to finish at least one practice test before a study guide can be generated.</p></body></html>';
  }

  const perf = analyzePerformance(logs, sessions);

  // Build section order from weakest → strongest based on actual data
  const FALLBACK_ORDER = ['Fiesta Fatal — Characters & Events','Preterite Conjugation','Imperfect Conjugation','Vocabulary'];
  const sectionOrder = perf.catScores.length
    ? perf.catScores.map(c => c.name)  // catScores already sorted weakest-first
    : FALLBACK_ORDER;
  // Ensure all 4 sections appear even if some have no data yet
  FALLBACK_ORDER.forEach(s => { if (!sectionOrder.includes(s)) sectionOrder.push(s); });

  const showAll = perf.weakSections.size === 0;

  // Variable practice pool sizes: more drills for weak sections
  const SECTION_BANKS = {
    'Fiesta Fatal — Characters & Events': FIESTA_FATAL,
    'Preterite Conjugation':              PRETERITE,
    'Imperfect Conjugation':              IMPERFECT,
    'Vocabulary':                         VOCABULARY,
  };
  function poolSize(sectionName) {
    const cat = perf.catScores.find(c => c.name === sectionName);
    if (!cat || cat.total === 0) return 6;
    if (cat.pct < 65)  return 12; // seriously weak — max drills
    if (cat.pct < 80)  return 9;  // needs work — extra drills
    if (cat.pct < 90)  return 6;  // decent — standard
    return 4;                      // strong — keep sharp, minimal
  }
  const practicePools = {};
  Object.entries(SECTION_BANKS).forEach(([name, bank]) => {
    practicePools[name] = sample(bank, Math.min(poolSize(name), bank.length)).map(prepQ);
  });

  return buildHTML(perf, practicePools, showAll, sectionOrder);
}

/* ── HTML builder ────────────────────────────────────────────────────────── */
function buildHTML(perf, practicePools, showAll, sectionOrder) {

  /* ── CSS ── */
  const CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #080810;
      --surface: #0e0e1c;
      --card:    #12122a;
      --border:  #1c1c38;
      --border2: #2a2a50;
      --text:    #dde0f0;
      --muted:   #5a5a80;
      --blue:    #4f9eff;
      --red:     #ff3a5c;
      --green:   #00d97e;
      --yellow:  #ffc42e;
      --purple:  #8b5cf6;
      --cyan:    #22d3ee;
      --radius:  10px;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; min-height: 100vh; }

    /* ── Top Nav ── */
    #top-nav {
      position: sticky; top: 0; z-index: 100;
      background: rgba(8,8,16,0.95); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border2);
      display: flex; align-items: center; gap: 0; overflow-x: auto;
      padding: 0 8px;
    }
    #top-nav a {
      padding: 14px 18px; font-size: 0.78rem; font-weight: 700;
      letter-spacing: 0.8px; text-transform: uppercase; text-decoration: none;
      color: var(--muted); white-space: nowrap;
      border-bottom: 2px solid transparent; transition: all 0.15s;
    }
    #top-nav a:hover, #top-nav a.active { color: var(--blue); border-bottom-color: var(--blue); }
    #top-nav a.active { color: var(--blue); }

    /* ── Page sections ── */
    .page-section { max-width: 920px; margin: 0 auto; padding: 40px 20px 60px; }
    .section-divider { border: none; border-top: 1px solid var(--border); margin: 48px 0; }

    /* ── Header ── */
    .guide-header { padding: 36px 20px 0; max-width: 920px; margin: 0 auto; }
    .guide-header h1 { font-size: 2rem; font-weight: 900; letter-spacing: -1px; }
    .guide-header h1 span { color: var(--blue); }
    .guide-header .sub { color: var(--muted); font-size: 0.9rem; margin-top: 6px; }

    /* ── Stats row ── */
    .stats-row { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 24px; }
    .stat-chip {
      background: var(--card); border: 1px solid var(--border2);
      border-radius: 8px; padding: 14px 20px; text-align: center; min-width: 100px;
    }
    .stat-chip .val { font-size: 1.8rem; font-weight: 900; }
    .stat-chip .lbl { font-size: 0.68rem; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }

    /* ── Score bars ── */
    .score-bars { margin-top: 24px; }
    .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; font-size: 0.84rem; }
    .bar-name { width: 160px; flex-shrink: 0; }
    .bar-track { flex: 1; height: 8px; background: var(--border); border-radius: 99px; overflow: hidden; }
    .bar-fill  { height: 100%; border-radius: 99px; transition: width 1s ease; }
    .bar-pct   { width: 50px; text-align: right; font-size: 0.78rem; font-weight: 700; }

    /* ── Weak spots list ── */
    .weak-list { list-style: none; margin-top: 16px; }
    .weak-list li {
      background: var(--card); border: 1px solid var(--border2);
      border-left: 3px solid var(--red);
      border-radius: 0 var(--radius) var(--radius) 0;
      padding: 10px 16px; margin-bottom: 8px;
      font-size: 0.84rem; line-height: 1.5;
    }
    .weak-list li .wl-pct { color: var(--red); font-weight: 700; float: right; }
    .weak-list li .wl-ans { color: var(--green); font-size: 0.76rem; margin-top: 3px; display: block; }

    /* ── Section headings ── */
    .sec-title {
      font-size: 1.3rem; font-weight: 900; letter-spacing: -0.5px;
      margin-bottom: 6px; display: flex; align-items: center; gap: 10px;
    }
    .sec-label {
      font-size: 0.68rem; text-transform: uppercase; letter-spacing: 1.5px;
      color: var(--muted); margin-bottom: 20px;
    }
    .tag {
      display: inline-block; padding: 3px 10px; border-radius: 99px;
      font-size: 0.68rem; font-weight: 700; letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .tag-red    { background: rgba(255,58,92,0.15); color: var(--red); border: 1px solid rgba(255,58,92,0.3); }
    .tag-blue   { background: rgba(79,158,255,0.12); color: var(--blue); border: 1px solid rgba(79,158,255,0.3); }
    .tag-green  { background: rgba(0,217,126,0.12); color: var(--green); border: 1px solid rgba(0,217,126,0.3); }
    .tag-yellow { background: rgba(255,196,46,0.12); color: var(--yellow); border: 1px solid rgba(255,196,46,0.3); }

    /* ── Character Cards ── */
    .char-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; margin-top: 16px; }
    .char-card {
      background: var(--card); border: 1px solid var(--border2);
      border-radius: 12px; overflow: hidden;
      transition: transform 0.15s, border-color 0.15s;
    }
    .char-card:hover { transform: translateY(-2px); border-color: var(--blue); }
    .char-header { padding: 14px 16px 10px; border-bottom: 1px solid var(--border); }
    .char-name { font-size: 1.05rem; font-weight: 800; }
    .char-role { font-size: 0.76rem; color: var(--muted); margin-top: 2px; }
    .char-body  { padding: 12px 16px; }
    .char-facts { list-style: none; }
    .char-facts li { font-size: 0.82rem; line-height: 1.6; padding: 3px 0; }
    .char-facts li::before { content: "›  "; color: var(--blue); font-weight: 700; }

    /* ── Events timeline ── */
    .event-list { list-style: none; margin-top: 14px; }
    .event-list li {
      padding: 10px 16px 10px 20px; border-left: 2px solid var(--blue);
      margin-bottom: 8px; font-size: 0.86rem; line-height: 1.5;
      position: relative;
    }
    .event-list li::before {
      content: ''; position: absolute; left: -5px; top: 14px;
      width: 8px; height: 8px; border-radius: 50%; background: var(--blue);
    }

    /* ── Grammar tables ── */
    .gram-tables { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 16px; }
    .gram-table-wrap { background: var(--card); border: 1px solid var(--border2); border-radius: var(--radius); overflow: hidden; }
    .gram-table-title { padding: 10px 16px; font-size: 0.76rem; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); border-bottom: 1px solid var(--border); font-weight: 700; }
    .gram-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .gram-table th { padding: 8px 14px; text-align: left; color: var(--muted); font-size: 0.72rem; text-transform: uppercase; border-bottom: 1px solid var(--border); }
    .gram-table td { padding: 8px 14px; border-bottom: 1px solid var(--border); }
    .gram-table tr:last-child td { border-bottom: none; }
    .gram-table .subj { color: var(--muted); font-size: 0.8rem; }
    .gram-table .conj { font-weight: 700; }
    .gram-table .ending { color: var(--blue); }
    .gram-table .irr { color: var(--red); }
    .gram-table .key { color: var(--yellow); }

    /* ── Rule boxes ── */
    .rule-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; margin-top: 16px; }
    .rule-box { background: var(--card); border: 1px solid var(--border2); border-radius: var(--radius); padding: 16px 18px; }
    .rule-box .rule-title { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 10px; font-weight: 700; }
    .rule-box .rule-note { font-size: 0.82rem; line-height: 1.7; }
    .rule-box .rule-note b { color: var(--yellow); }
    .rule-box .rule-note code { background: rgba(79,158,255,0.12); color: var(--blue); padding: 1px 6px; border-radius: 4px; font-family: monospace; }
    .rule-box.highlight { border-color: var(--yellow); }
    .rule-box.highlight .rule-title { color: var(--yellow); }

    /* ── Fill-in practice ── */
    .fillin-wrap { margin-top: 20px; }
    .fillin-title { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 12px; font-weight: 700; }
    .fillin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
    .fillin-item { background: var(--card); border: 1px solid var(--border2); border-radius: 8px; padding: 12px 16px; }
    .fillin-prompt { font-size: 0.78rem; color: var(--muted); margin-bottom: 8px; }
    .fillin-prompt b { color: var(--text); }
    .fillin-input-wrap { display: flex; align-items: center; gap: 8px; }
    .fillin-input {
      flex: 1; background: var(--surface); border: 1.5px solid var(--border2);
      border-radius: 6px; padding: 7px 12px; color: var(--text);
      font-size: 0.9rem; outline: none; transition: border-color 0.15s;
    }
    .fillin-input:focus { border-color: var(--blue); }
    .fillin-input.correct { border-color: var(--green); color: var(--green); }
    .fillin-input.wrong   { border-color: var(--red); }
    .fillin-check { padding: 7px 12px; background: var(--border2); border: none; border-radius: 6px; color: var(--text); font-size: 0.8rem; cursor: pointer; }
    .fillin-check:hover { background: var(--blue); color: #fff; }
    .fillin-feedback { font-size: 0.75rem; margin-top: 4px; min-height: 16px; }

    /* ── Vocab grid ── */
    .vocab-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; margin-top: 16px; }
    .vocab-card { background: var(--card); border: 1.5px solid var(--border2); border-radius: var(--radius); overflow: hidden; cursor: pointer; transition: border-color 0.12s; }
    .vocab-card:hover { border-color: var(--blue); }
    .vocab-card.known { border-color: var(--green); opacity: 0.6; }
    .vocab-card.review-again { border-color: var(--red); }
    .vocab-front { padding: 14px 16px; }
    .vocab-es { font-size: 1rem; font-weight: 800; }
    .vocab-flip-hint { font-size: 0.7rem; color: var(--muted); margin-top: 4px; }
    .vocab-back { padding: 12px 16px; border-top: 1px solid var(--border); display: none; }
    .vocab-en { font-size: 0.9rem; font-weight: 700; color: var(--cyan); margin-bottom: 6px; }
    .vocab-ex { font-size: 0.78rem; color: var(--muted); line-height: 1.5; }
    .vocab-card.flipped .vocab-back { display: block; }
    .vocab-card.flipped .vocab-flip-hint { display: none; }
    .vocab-actions { display: flex; gap: 8px; margin-top: 10px; }
    .vocab-btn { flex: 1; padding: 6px; border: none; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
    .vocab-btn-know   { background: rgba(0,217,126,0.15); color: var(--green); }
    .vocab-btn-review { background: rgba(255,58,92,0.15); color: var(--red); }
    .vocab-progress { font-size: 0.8rem; color: var(--muted); margin-bottom: 12px; }
    .vocab-progress b { color: var(--green); }

    /* ── MC Practice ── */
    .practice-section { margin-top: 28px; }
    .practice-title { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 14px; font-weight: 700; }
    .mc-item { background: var(--card); border: 1px solid var(--border2); border-radius: var(--radius); padding: 16px; margin-bottom: 10px; }
    .mc-q { font-size: 0.9rem; font-weight: 600; margin-bottom: 12px; line-height: 1.5; }
    .mc-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
    .mc-opt { padding: 9px 14px; background: rgba(255,255,255,0.04); border: 1.5px solid var(--border2); border-radius: 8px; color: var(--text); font-size: 0.82rem; cursor: pointer; text-align: left; transition: all 0.12s; }
    .mc-opt:hover:not(:disabled) { border-color: var(--blue); background: rgba(79,158,255,0.08); }
    .mc-opt.correct { background: rgba(0,217,126,0.12); border-color: var(--green); color: var(--green); font-weight: 700; }
    .mc-opt.wrong   { background: rgba(255,58,92,0.1); border-color: var(--red); color: var(--red); }
    .mc-opt:disabled { cursor: default; }
    .mc-feedback { font-size: 0.78rem; margin-top: 6px; min-height: 16px; line-height: 1.5; }

    /* ── Imperfect vs Preterite comparison ── */
    .vs-table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 0.85rem; }
    .vs-table th { padding: 10px 16px; background: var(--surface); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; }
    .vs-table th:first-child { color: var(--blue); }
    .vs-table th:last-child  { color: var(--yellow); }
    .vs-table td { padding: 9px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
    .vs-table tr:last-child td { border-bottom: none; }
    .vs-label { font-weight: 700; margin-bottom: 4px; }
    .vs-ex    { color: var(--muted); font-style: italic; font-size: 0.8rem; }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .mc-opts { grid-template-columns: 1fr; }
      .gram-tables { grid-template-columns: 1fr; }
      .rule-grid { grid-template-columns: 1fr; }
      .char-grid { grid-template-columns: 1fr; }
      .fillin-grid { grid-template-columns: 1fr; }
      .stats-row { gap: 8px; }
      .stat-chip { min-width: 80px; padding: 10px 14px; }
      .stat-chip .val { font-size: 1.4rem; }
    }
  `;

  /* ── Shared: "You Keep Missing These" focus block for a section ── */
  function buildFocusBlock(sectionName) {
    const missed = weakBySection[sectionName];
    if (!missed || !missed.length) return '';
    return '<div style="background:rgba(255,58,92,0.07);border:1.5px solid rgba(255,58,92,0.4);border-radius:var(--radius);padding:16px 20px;margin-bottom:24px">'
      + '<div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--red);font-weight:800;margin-bottom:12px">🎯 You Keep Missing These — Study First</div>'
      + '<ul class="weak-list" style="margin-top:0">'
      + missed.map(q => {
          const pct = q.total > 0 ? Math.round(q.correct / q.total * 100) : 0;
          return '<li>'
            + esc(q.question)
            + '<span class="wl-pct">' + pct + '%</span>'
            + '<span class="wl-ans">✓ ' + esc(q.correct_ans) + '</span>'
            + (q.explanation ? '<span style="color:var(--muted);font-size:0.73rem;display:block;margin-top:2px">' + esc(q.explanation) + '</span>' : '')
            + '</li>';
        }).join('')
      + '</ul>'
      + '</div>';
  }

  /* ── Fiesta Fatal HTML ── */
  function buildFF(isWeak) {
    const charCards = CHARACTERS.map(c =>
      '<div class="char-card">'
      + '<div class="char-header">'
      + '<div class="char-name">' + esc(c.name) + '</div>'
      + '<div class="char-role">' + esc(c.role) + '</div>'
      + '</div>'
      + '<div class="char-body">'
      + '<ul class="char-facts">'
      + c.facts.map(f => '<li>' + esc(f) + '</li>').join('')
      + '</ul>'
      + '</div>'
      + '</div>'
    ).join('');

    const events = KEY_EVENTS.map(e => '<li>' + esc(e) + '</li>').join('');
    const pqs = practicePools['Fiesta Fatal — Characters & Events'];
    const practiceCount = pqs.length;

    return '<div class="page-section" id="sec-ff">'
      + '<div class="sec-label">Section 1</div>'
      + '<div class="sec-title">🎭 Fiesta Fatal' + (isWeak ? ' <span class="tag tag-red">Needs Work</span>' : ' <span class="tag tag-green">Review</span>') + '</div>'
      + '<p style="color:var(--muted);font-size:0.86rem;margin-bottom:20px">Character and event questions account for <b>10/30</b> of the MC score. Know these cold.</p>'
      + buildFocusBlock('Fiesta Fatal — Characters & Events')
      + '<div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px;font-weight:700">Character Intel</div>'
      + '<div class="char-grid">' + charCards + '</div>'
      + '<div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin:28px 0 10px;font-weight:700">Key Events — Know These</div>'
      + '<ul class="event-list">' + events + '</ul>'
      + buildMCPractice(pqs, 'ff', practiceCount)
      + '</div>';
  }

  /* ── Preterite HTML ── */
  function buildPret(isWeak) {
    const regularTable = makeConjTable('Regular Preterite', [
      ['yo',       'habl<span class="ending">é</span>',       'com<span class="ending">í</span>',       'escrib<span class="ending">í</span>'],
      ['tú',       'habl<span class="ending">aste</span>',    'com<span class="ending">iste</span>',    'escrib<span class="ending">iste</span>'],
      ['él/ella',  'habl<span class="ending">ó</span>',       'com<span class="ending">ió</span>',      'escrib<span class="ending">ió</span>'],
      ['nosotros', 'habl<span class="ending">amos</span>',    'com<span class="ending">imos</span>',    'escrib<span class="ending">imos</span>'],
      ['ellos',    'habl<span class="ending">aron</span>',    'com<span class="ending">ieron</span>',   'escrib<span class="ending">ieron</span>'],
    ], ['-AR (hablar)','-ER (comer)','-IR (escribir)']);

    const irregTable = makeConjTable('Must-Know Irregulars', [
      ['ser / ir', '<span class="irr">fui</span>', '<span class="irr">fuiste</span>', '<span class="irr">fue</span>', '<span class="irr">fuimos</span>', '<span class="irr">fueron</span>'],
      ['hacer',    '<span class="irr">hice</span>', '<span class="irr">hiciste</span>', '<span class="key">hizo</span>', '<span class="irr">hicimos</span>', '<span class="irr">hicieron</span>'],
      ['tener',    '<span class="irr">tuve</span>', '<span class="irr">tuviste</span>', '<span class="irr">tuvo</span>', '<span class="irr">tuvimos</span>', '<span class="irr">tuvieron</span>'],
      ['estar',    '<span class="irr">estuve</span>', '<span class="irr">estuviste</span>', '<span class="irr">estuvo</span>', '<span class="irr">estuvimos</span>', '<span class="irr">estuvieron</span>'],
      ['venir',    '<span class="irr">vine</span>', '<span class="irr">viniste</span>', '<span class="irr">vino</span>', '<span class="irr">vinimos</span>', '<span class="irr">vinieron</span>'],
      ['decir',    '<span class="irr">dije</span>', '<span class="irr">dijiste</span>', '<span class="irr">dijo</span>', '<span class="irr">dijimos</span>', '<span class="irr">dijeron</span>'],
      ['saber',    '<span class="irr">supe</span>', '<span class="irr">supiste</span>', '<span class="irr">supo</span>', '<span class="irr">supimos</span>', '<span class="irr">supieron</span>'],
      ['poder',    '<span class="irr">pude</span>', '<span class="irr">pudiste</span>', '<span class="irr">pudo</span>', '<span class="irr">pudimos</span>', '<span class="irr">pudieron</span>'],
      ['poner',    '<span class="irr">puse</span>', '<span class="irr">pusiste</span>', '<span class="irr">puso</span>', '<span class="irr">pusimos</span>', '<span class="irr">pusieron</span>'],
      ['querer',   '<span class="irr">quise</span>', '<span class="irr">quisiste</span>', '<span class="irr">quiso</span>', '<span class="irr">quisimos</span>', '<span class="irr">quisieron</span>'],
      ['traer',    '<span class="irr">traje</span>', '<span class="irr">trajiste</span>', '<span class="irr">trajo</span>', '<span class="irr">trajimos</span>', '<span class="key">trajeron</span>'],
      ['dar',      '<span class="irr">di</span>', '<span class="irr">diste</span>', '<span class="irr">dio</span>', '<span class="irr">dimos</span>', '<span class="irr">dieron</span>'],
      ['ver',      '<span class="irr">vi</span>', '<span class="irr">viste</span>', '<span class="irr">vio</span>', '<span class="irr">vimos</span>', '<span class="irr">vieron</span>'],
    ], ['yo','tú','él','nos.','ellos']);

    const rules = [
      { title: 'Spelling Changes — YO only', cls: 'highlight', content:
        '<b>-CAR</b> → qué: practicar → <code>practiqué</code>, tocar → <code>toqué</code><br>'
        + '<b>-GAR</b> → gué: jugar → <code>jugué</code>, llegar → <code>llegué</code><br>'
        + '<b>-ZAR</b> → cé: empezar → <code>empecé</code>, comenzar → <code>comencé</code><br>'
        + '<span style="font-size:0.76rem;color:var(--muted)">These ONLY change in the YO form. All other forms are normal.</span>' },
      { title: 'i → y Rule (leer, creer, oír)', cls: '', content:
        'When <b>i</b> falls between two vowels → write <b>y</b><br>'
        + 'leer: <code>leyó</code> / <code>leyeron</code> (NOT leió / leieron)<br>'
        + 'creer: <code>creyó</code> / <code>creyeron</code><br>'
        + 'oír: <code>oyó</code> / <code>oyeron</code><br>'
        + '<span style="font-size:0.76rem;color:var(--muted)">ONLY affects él/ella and ellos/ellas forms.</span>' },
      { title: 'Stem-changers — 3rd person only', cls: '', content:
        'In preterite, e→i and o→u changes happen ONLY in él and ellos:<br>'
        + '<b>o→u:</b> dormir → <code>durmió</code> / <code>durmieron</code><br>'
        + '<b>e→i:</b> servir → <code>sirvió</code> / <code>sirvieron</code><br>'
        + '<b>e→i:</b> repetir → <code>repitió</code> / <code>repitieron</code><br>'
        + '<b>e→i:</b> pedir → <code>pidió</code> / <code>pidieron</code><br>'
        + '<span style="font-size:0.76rem;color:var(--muted)">Yo/tú/nosotros forms are 100% regular for these verbs!</span>' },
    ];

    const ruleBoxes = rules.map(r =>
      '<div class="rule-box ' + r.cls + '"><div class="rule-title">' + r.title + '</div>'
      + '<div class="rule-note">' + r.content + '</div></div>'
    ).join('');

    const fillins = [
      { label: 'YO → HACER (preterite)', answer: 'hice' },
      { label: 'ÉL → SER (preterite)',   answer: 'fue' },
      { label: 'YO → JUGAR (preterite)', answer: 'jugué' },
      { label: 'ÉL → LEER (preterite)',  answer: 'leyó' },
      { label: 'YO → TENER (preterite)', answer: 'tuve' },
      { label: 'YO → EMPEZAR (pret.)',   answer: 'empecé' },
      { label: 'ÉL → PODER (pret.)',     answer: 'pudo' },
      { label: 'YO → PONER (pret.)',     answer: 'puse' },
      { label: 'ÉL → QUERER (pret.)',    answer: 'quiso' },
      { label: 'ÉL → TRAER (pret.)',     answer: 'trajo' },
      { label: 'ÉL → DAR (pret.)',       answer: 'dio' },
      { label: 'YO → VER (pret.)',       answer: 'vi' },
    ];

    const pqs = practicePools['Preterite Conjugation'];
    const practiceCount = pqs.length;

    return '<div class="page-section" id="sec-pret">'
      + '<div class="sec-label">Section 2a</div>'
      + '<div class="sec-title">⚔️ Preterite Conjugation' + (isWeak ? ' <span class="tag tag-red">Needs Work</span>' : ' <span class="tag tag-green">Review</span>') + '</div>'
      + '<p style="color:var(--muted);font-size:0.86rem;margin-bottom:20px">Used for actions that were completed at a specific moment in the past. "I did", "he went", "they arrived."</p>'
      + buildFocusBlock('Preterite Conjugation')
      + '<div class="gram-tables">' + regularTable + irregTable + '</div>'
      + '<div class="rule-grid" style="margin-top:20px">' + ruleBoxes + '</div>'
      + buildFillin(fillins, 'pret')
      + buildMCPractice(pqs, 'pret', practiceCount)
      + '</div>';
  }

  /* ── Imperfect HTML ── */
  function buildImp(isWeak) {
    const regularTable = makeConjTable('Regular Imperfect', [
      ['yo',       'habl<span class="ending">aba</span>',      'com<span class="ending">ía</span>',      'viv<span class="ending">ía</span>'],
      ['tú',       'habl<span class="ending">abas</span>',     'com<span class="ending">ías</span>',     'viv<span class="ending">ías</span>'],
      ['él/ella',  'habl<span class="ending">aba</span>',      'com<span class="ending">ía</span>',      'viv<span class="ending">ía</span>'],
      ['nosotros', 'habl<span class="ending">ábamos</span>',   'com<span class="ending">íamos</span>',   'viv<span class="ending">íamos</span>'],
      ['ellos',    'habl<span class="ending">aban</span>',     'com<span class="ending">ían</span>',     'viv<span class="ending">ían</span>'],
    ], ['-AR (hablar)','-ER (comer)','-IR (vivir)']);

    const irregTable = makeConjTable('Only 3 Irregulars', [
      ['ser', '<span class="irr">era</span>',  '<span class="irr">eras</span>',  '<span class="irr">era</span>',  '<span class="irr">éramos</span>', '<span class="irr">eran</span>'],
      ['ir',  '<span class="irr">iba</span>',  '<span class="irr">ibas</span>',  '<span class="irr">iba</span>',  '<span class="irr">íbamos</span>', '<span class="irr">iban</span>'],
      ['ver', '<span class="key">veía</span>', '<span class="key">veías</span>', '<span class="key">veía</span>', '<span class="key">veíamos</span>', '<span class="key">veían</span>'],
    ], ['yo','tú','él','nos.','ellos']);

    const vsRows = [
      ['Preterite (use when...)', 'Imperfect (use when...)'],
      ['<div class="vs-label">Single completed action</div><div class="vs-ex">Ayer fui al mercado. (I went to the market yesterday.)</div>',
       '<div class="vs-label">Repeated / habitual past</div><div class="vs-ex">Siempre iba al mercado. (I used to always go.)</div>'],
      ['<div class="vs-label">Specific time signal</div><div class="vs-ex">El lunes comí tacos. (Last Monday I ate tacos.)</div>',
       '<div class="vs-label">Ongoing background</div><div class="vs-ex">Comía cuando llegó. (I was eating when he arrived.)</div>'],
      ['<div class="vs-label">Sequence of events</div><div class="vs-ex">Llegó, vio, y salió. (He arrived, saw it, and left.)</div>',
       '<div class="vs-label">Age / descriptions in past</div><div class="vs-ex">De niño era travieso. (As a kid I was mischievous.)</div>'],
    ];

    const vsHtml = '<table class="vs-table">'
      + '<tr><th>' + vsRows[0][0] + '</th><th>' + vsRows[0][1] + '</th></tr>'
      + vsRows.slice(1).map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('')
      + '</table>';

    const triggers = [
      { title: 'Imperfect trigger words', cls: 'highlight', content:
        '<b>siempre</b> (always) · <b>todos los días</b> (every day)<br>'
        + '<b>de niño/a</b> (as a kid) · <b>generalmente</b> (usually)<br>'
        + '<b>mientras</b> (while) · <b>cada día/semana</b> (each day/week)<br>'
        + '<b>frecuentemente</b> (frequently) · <b>a veces</b> (sometimes)' },
    ];

    const fillins = [
      { label: 'YO → SER (imperfect)',       answer: 'era' },
      { label: 'ÉL → IR (imperfect)',        answer: 'iba' },
      { label: 'YO → VER (imperfect)',       answer: 'veía' },
      { label: 'ELLOS → HABLAR (imp.)',      answer: 'hablaban' },
      { label: 'NOSOTROS → IR (imp.)',       answer: 'íbamos' },
      { label: 'TÚ → COMER (imperfect)',     answer: 'comías' },
    ];

    const pqs = practicePools['Imperfect Conjugation'];
    const practiceCount = pqs.length;

    return '<div class="page-section" id="sec-imp">'
      + '<div class="sec-label">Section 2b</div>'
      + '<div class="sec-title">🌀 Imperfect Conjugation' + (isWeak ? ' <span class="tag tag-red">Needs Work</span>' : ' <span class="tag tag-green">Review</span>') + '</div>'
      + '<p style="color:var(--muted);font-size:0.86rem;margin-bottom:20px">Used for ongoing, repeated, or habitual past actions — and for descriptions. "I used to", "was doing", "every day."</p>'
      + buildFocusBlock('Imperfect Conjugation')
      + '<div class="gram-tables">' + regularTable + irregTable + '</div>'
      + '<div class="rule-grid" style="margin-top:20px">'
      + triggers.map(r => '<div class="rule-box ' + r.cls + '"><div class="rule-title">' + r.title + '</div><div class="rule-note">' + r.content + '</div></div>').join('')
      + '</div>'
      + '<div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin:24px 0 6px;font-weight:700">Preterite vs. Imperfect — Side by Side</div>'
      + vsHtml
      + buildFillin(fillins, 'imp')
      + buildMCPractice(pqs, 'imp', practiceCount)
      + '</div>';
  }

  /* ── Vocabulary HTML ── */
  function buildVocab(isWeak) {
    const cards = VOCAB_LIST.map((w, i) =>
      '<div class="vocab-card" id="vc' + i + '" onclick="flipVocab(' + i + ')">'
      + '<div class="vocab-front">'
      + '<div class="vocab-es">' + w.es + '</div>'
      + '<div class="vocab-flip-hint">tap for definition</div>'
      + '</div>'
      + '<div class="vocab-back">'
      + '<div class="vocab-en">' + esc(w.en) + '</div>'
      + '<div class="vocab-ex">' + w.ex + '</div>'
      + '<div class="vocab-actions">'
      + '<button class="vocab-btn vocab-btn-know" onclick="event.stopPropagation();markVocab(' + i + ',true)">Got it ✓</button>'
      + '<button class="vocab-btn vocab-btn-review" onclick="event.stopPropagation();markVocab(' + i + ',false)">Review again</button>'
      + '</div>'
      + '</div>'
      + '</div>'
    ).join('');

    const pqs = practicePools['Vocabulary'];
    const practiceCount = pqs.length;

    return '<div class="page-section" id="sec-vocab">'
      + '<div class="sec-label">Section 3</div>'
      + '<div class="sec-title">📖 Vocabulary' + (isWeak ? ' <span class="tag tag-red">Needs Work</span>' : ' <span class="tag tag-green">Review</span>') + '</div>'
      + '<p style="color:var(--muted);font-size:0.86rem;margin-bottom:16px">All 20 words from the story. Tap a card to see the definition and example, then mark it.</p>'
      + buildFocusBlock('Vocabulary')
      + '<div class="vocab-progress" id="vocab-progress">0 / ' + VOCAB_LIST.length + ' marked as known</div>'
      + '<div class="vocab-grid">' + cards + '</div>'
      + buildMCPractice(pqs, 'vocab', practiceCount)
      + '</div>';
  }

  /* ── Helpers for section builders ── */
  function makeConjTable(title, rows, colHeaders) {
    const ths = colHeaders.map(h => '<th>' + h + '</th>').join('');
    const trs = rows.map(r => '<tr><td class="subj">' + r[0] + '</td>' + r.slice(1).map(c => '<td class="conj">' + c + '</td>').join('') + '</tr>').join('');
    return '<div class="gram-table-wrap">'
      + '<div class="gram-table-title">' + title + '</div>'
      + '<table class="gram-table"><thead><tr><th>Form</th>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table>'
      + '</div>';
  }

  function buildFillin(items, prefix) {
    const cells = items.map((item, i) =>
      '<div class="fillin-item">'
      + '<div class="fillin-prompt">Conjugate: <b>' + esc(item.label) + '</b></div>'
      + '<div class="fillin-input-wrap">'
      + '<input class="fillin-input" id="fi_' + prefix + i + '" type="text" autocomplete="off" autocorrect="off" spellcheck="false"'
      + ' data-answer="' + esc(item.answer) + '"'
      + ' onkeydown="if(event.key===\'Enter\')checkFillin(\'' + prefix + '\', ' + i + ')"'
      + ' placeholder="type answer…" />'
      + '<button class="fillin-check" onclick="checkFillin(\'' + prefix + '\', ' + i + '\')">Check</button>'
      + '</div>'
      + '<div class="fillin-feedback" id="ff_' + prefix + i + '"></div>'
      + '</div>'
    ).join('');
    return '<div class="fillin-wrap"><div class="fillin-title">Fill-in Practice — Type the Conjugation</div>'
      + '<div class="fillin-grid">' + cells + '</div></div>';
  }

  function buildMCPractice(qs, prefix, count) {
    const label = count && count > 6
      ? 'Practice Questions — ' + count + ' (extra drills for weak section)'
      : 'Practice Questions';
    const items = qs.map((q, i) =>
      '<div class="mc-item" id="mc_' + prefix + '_' + i + '" data-ans="' + q.ans + '" data-done="0">'
      + '<div class="mc-q">' + esc(q.q) + '</div>'
      + '<div class="mc-opts">'
      + q.opts.map((opt, oi) =>
        '<button class="mc-opt" onclick="checkMC(\'' + prefix + '\',' + i + ',' + oi + ',this)">' + esc(opt) + '</button>'
      ).join('')
      + '</div>'
      + '<div class="mc-feedback" id="mc_' + prefix + '_' + i + '_fb"></div>'
      + '</div>'
    ).join('');
    return '<div class="practice-section"><div class="practice-title">' + label + '</div>' + items + '</div>';
  }

  /* ── Overview section ── */
  const { catScores, weakSections, weakQuestions, totalAttempts, latestScore, bestScore, avgScore, scoreHistory, isPlateaued } = perf;
  const latestColor = latestScore >= 80 ? 'var(--green)' : latestScore >= 65 ? 'var(--yellow)' : 'var(--red)';
  const bestColor   = bestScore   >= 80 ? 'var(--green)' : bestScore   >= 65 ? 'var(--yellow)' : 'var(--red)';

  const barRows = catScores.map(cat => {
    const c = cat.pct >= 80 ? 'var(--green)' : cat.pct >= 60 ? 'var(--yellow)' : 'var(--red)';
    const icons = { 'Fiesta Fatal — Characters & Events':'🎭','Preterite Conjugation':'⚔️','Imperfect Conjugation':'🌀','Vocabulary':'📖' };
    const short  = { 'Fiesta Fatal — Characters & Events':'Fiesta Fatal','Preterite Conjugation':'Preterite','Imperfect Conjugation':'Imperfect','Vocabulary':'Vocabulary' };
    const needsWork = cat.pct < 80 ? ' <span style="color:var(--red);font-size:0.7rem;font-weight:700"> ← FOCUS</span>' : '';
    return '<div class="bar-row">'
      + '<span class="bar-name">' + (icons[cat.name]||'') + ' ' + esc(short[cat.name] || cat.name) + needsWork + '</span>'
      + '<div class="bar-track"><div class="bar-fill" style="width:' + cat.pct + '%;background:' + c + '"></div></div>'
      + '<span class="bar-pct" style="color:' + c + '">' + cat.correct + '/' + cat.total + ' (' + cat.pct + '%)</span>'
      + '</div>';
  }).join('');

  // Score history visual — dots colored by performance
  const historyDots = scoreHistory.map((s, i) => {
    const col = s >= 80 ? 'var(--green)' : s >= 65 ? 'var(--yellow)' : 'var(--red)';
    const isLatest = i === 0;
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">'
      + '<span style="font-size:0.7rem;font-weight:' + (isLatest ? '900' : '400') + ';color:' + col + '">' + s + '%</span>'
      + '<div style="width:10px;height:10px;border-radius:50%;background:' + col + ';' + (isLatest ? 'box-shadow:0 0 8px ' + col : '') + '"></div>'
      + '<span style="font-size:0.6rem;color:var(--muted)">' + (i === 0 ? 'latest' : '#' + (i+1) + ' ago') + '</span>'
      + '</div>';
  }).join('<div style="flex:1;height:1px;background:var(--border);margin-bottom:14px;align-self:center"></div>');

  const historyHtml = scoreHistory.length > 1
    ? '<div style="margin-top:20px"><div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px;font-weight:700">Score History (newest → oldest)</div>'
      + '<div style="display:flex;align-items:flex-end;gap:6px;flex-wrap:wrap">' + historyDots + '</div>'
      + '</div>'
    : '';

  // Plateau warning banner
  const plateauBanner = isPlateaued
    ? '<div style="background:rgba(255,196,46,0.1);border:1.5px solid var(--yellow);border-radius:var(--radius);padding:14px 18px;margin-top:20px">'
      + '<div style="font-size:0.78rem;font-weight:800;color:var(--yellow);margin-bottom:4px">⚠️ You\'re Stuck — Time to Break Through</div>'
      + '<div style="font-size:0.82rem;color:var(--text);line-height:1.6">Your last ' + Math.min(scoreHistory.length, 3) + ' scores are all within a few points of each other. You\'re not improving because you\'re missing the same questions every time. Scroll down to the sections marked <span style="color:var(--red);font-weight:700">FOCUS</span> — those are the ones holding you back. Don\'t skip them.</div>'
      + '</div>'
    : '';

  // Weak questions list — all of them, grouped by section
  const weakBySection = {};
  weakQuestions.forEach(q => {
    const s = q.section || 'Unknown';
    if (!weakBySection[s]) weakBySection[s] = [];
    weakBySection[s].push(q);
  });

  const weakListHtml = weakQuestions.length
    ? '<ul class="weak-list">'
      + weakQuestions.slice(0, 15).map(q => {
          const pct = q.total > 0 ? Math.round(q.correct / q.total * 100) : 0;
          return '<li>'
            + esc(q.question)
            + '<span class="wl-pct">' + pct + '%</span>'
            + '<span class="wl-ans">✓ ' + esc(q.correct_ans) + '</span>'
            + (q.explanation ? '<span style="color:var(--muted);font-size:0.73rem;display:block;margin-top:2px">' + esc(q.explanation) + '</span>' : '')
            + '</li>';
        }).join('')
      + '</ul>'
    : '<p style="color:var(--muted);font-size:0.86rem">Keep taking practice tests — problem questions will show up here once patterns emerge.</p>';

  const overviewSection = '<div class="page-section" id="sec-overview">'
    + '<div class="sec-label">Overview</div>'
    + '<div class="sec-title">Dylan\'s Performance</div>'
    + plateauBanner
    + '<div class="stats-row" style="margin-top:20px">'
    + '<div class="stat-chip"><div class="val">' + totalAttempts + '</div><div class="lbl">Tests Taken</div></div>'
    + '<div class="stat-chip"><div class="val" style="color:' + latestColor + '">' + latestScore + '%</div><div class="lbl">Latest</div></div>'
    + '<div class="stat-chip"><div class="val" style="color:' + bestColor + '">' + bestScore + '%</div><div class="lbl">Best</div></div>'
    + '<div class="stat-chip"><div class="val">' + avgScore + '%</div><div class="lbl">Avg</div></div>'
    + '</div>'
    + historyHtml
    + (catScores.length ? '<div class="score-bars" style="margin-top:28px"><div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:12px;font-weight:700">Section Breakdown — Weakest First</div>' + barRows + '</div>' : '')
    + (weakQuestions.length ? '<div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin:28px 0 10px;font-weight:700">🎯 Questions You Keep Getting Wrong (' + weakQuestions.length + ' total)</div>' + weakListHtml : '')
    + '</div>';

  /* ── Nav tabs — ordered by section weakness ── */
  const SEC_ID    = { 'Fiesta Fatal — Characters & Events':'sec-ff','Preterite Conjugation':'sec-pret','Imperfect Conjugation':'sec-imp','Vocabulary':'sec-vocab' };
  const SEC_SHORT = { 'Fiesta Fatal — Characters & Events':'Fiesta Fatal','Preterite Conjugation':'Preterite','Imperfect Conjugation':'Imperfect','Vocabulary':'Vocab' };
  const sectionNavItems = sectionOrder
    .filter(s => SEC_ID[s])
    .map(s => {
      const isW = weakSections.has(s);
      return ['#' + SEC_ID[s], SEC_SHORT[s] + (isW ? ' 🔴' : '')];
    });
  const navLinks = [['#sec-overview','Overview'], ...sectionNavItems, ['/','Take Test →']]
    .map(([href, label]) =>
      '<a href="' + href + '"' + (href === '#sec-overview' ? ' class="active"' : '') + '>' + label + '</a>'
    ).join('');

  /* ── Content sections ── */
  const ffWeak   = weakSections.has('Fiesta Fatal — Characters & Events');
  const pretWeak = weakSections.has('Preterite Conjugation');
  const impWeak  = weakSections.has('Imperfect Conjugation');
  const vocWeak  = weakSections.has('Vocabulary');

  const SECTION_BUILDERS = {
    'Fiesta Fatal — Characters & Events': () => buildFF(ffWeak),
    'Preterite Conjugation':              () => buildPret(pretWeak),
    'Imperfect Conjugation':              () => buildImp(impWeak),
    'Vocabulary':                         () => buildVocab(vocWeak),
  };

  const divider = '<hr class="section-divider">';

  /* ── JavaScript ── */
  const JS = `
"use strict";
// ── Fillin checks ──────────────────────────────────────────────────────────
function checkFillin(prefix, i) {
  var inp = document.getElementById("fi_" + prefix + i);
  var fb  = document.getElementById("ff_" + prefix + i);
  if (!inp || inp.disabled) return;
  var answer = inp.dataset.answer.trim().toLowerCase();
  var val    = inp.value.trim().toLowerCase()
    .replace(/á/g,"a").replace(/é/g,"e").replace(/í/g,"i").replace(/ó/g,"o").replace(/ú/g,"u");
  var ansNorm = answer
    .replace(/á/g,"a").replace(/é/g,"e").replace(/í/g,"i").replace(/ó/g,"o").replace(/ú/g,"u");
  if (val === ansNorm) {
    inp.classList.add("correct");
    inp.disabled = true;
    fb.innerHTML = '<span style="color:var(--green)">✓ Correct: ' + inp.dataset.answer + '</span>';
  } else {
    inp.classList.add("wrong");
    fb.innerHTML = '<span style="color:var(--red)">✗ The answer is: <b>' + inp.dataset.answer + '</b></span>';
    setTimeout(function() { inp.classList.remove("wrong"); }, 1200);
  }
}

// ── MC checks ─────────────────────────────────────────────────────────────
function checkMC(prefix, qi, chosen, btn) {
  var item = document.getElementById("mc_" + prefix + "_" + qi);
  if (!item || item.dataset.done === "1") return;
  item.dataset.done = "1";
  var ans  = parseInt(item.dataset.ans, 10);
  var opts = item.querySelectorAll(".mc-opt");
  opts.forEach(function(b) { b.disabled = true; });
  opts[ans].classList.add("correct");
  var fb = document.getElementById("mc_" + prefix + "_" + qi + "_fb");
  if (chosen === ans) {
    if (fb) fb.innerHTML = '<span style="color:var(--green)">✓ Correct.</span>';
  } else {
    btn.classList.add("wrong");
    if (fb) fb.innerHTML = '<span style="color:var(--red)">✗ The correct answer is highlighted above.</span>';
  }
}

// ── Vocab flashcards ──────────────────────────────────────────────────────
var vocabKnown = 0;
function flipVocab(i) {
  var card = document.getElementById("vc" + i);
  if (card) card.classList.toggle("flipped");
}
function markVocab(i, known) {
  var card = document.getElementById("vc" + i);
  if (!card) return;
  card.classList.remove("known", "review-again");
  if (known) {
    card.classList.add("known");
  } else {
    card.classList.add("review-again");
  }
  updateVocabProgress();
}
function updateVocabProgress() {
  var known = document.querySelectorAll(".vocab-card.known").length;
  var el = document.getElementById("vocab-progress");
  if (el) el.innerHTML = "<b>" + known + "</b> / ${VOCAB_LIST.length} marked as known";
}

// ── Nav active state ──────────────────────────────────────────────────────
var navLinks = document.querySelectorAll("#top-nav a");
window.addEventListener("scroll", function() {
  var sections = document.querySelectorAll(".page-section");
  var scrollY = window.scrollY + 80;
  var current = "";
  sections.forEach(function(sec) {
    if (sec.offsetTop <= scrollY) current = "#" + sec.id;
  });
  navLinks.forEach(function(a) {
    a.classList.toggle("active", a.getAttribute("href") === current);
  });
}, { passive: true });
`;

  /* ── Assemble final page — sections in weakness-first order ── */
  const weakCount = weakSections.size;
  const headerSub = weakCount > 0
    ? 'Spanish II · Spring Final · ' + weakCount + ' section' + (weakCount > 1 ? 's' : '') + ' need focus — study those first'
    : 'Spanish II · Spring Final · Looking solid — keep it sharp';

  const sectionHTML = sectionOrder
    .filter(s => SECTION_BUILDERS[s])
    .map(s => SECTION_BUILDERS[s]())
    .join('\n' + divider + '\n');

  return '<!DOCTYPE html>\n<html lang="en">\n<head>'
    + '\n<meta charset="UTF-8" />'
    + '\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
    + '\n<title>Study Guide — Dylan</title>'
    + '\n<style>' + CSS + '</style>'
    + '\n</head>\n<body>'
    + '\n<nav id="top-nav">' + navLinks + '</nav>'
    + '\n<div class="guide-header">'
    + '\n<h1>DYLAN\'S <span>STUDY GUIDE</span></h1>'
    + '\n<div class="sub">' + esc(headerSub) + '</div>'
    + '\n</div>'
    + '\n' + overviewSection
    + '\n' + divider
    + '\n' + sectionHTML
    + '\n<script>' + JS + '\n</script>'
    + '\n</body>\n</html>';
}

module.exports = { generateStudyGuide };
