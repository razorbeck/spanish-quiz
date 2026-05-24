/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  QUESTION BANK — SERVER-SIDE ONLY                           ║
 * ║  This file is NEVER served to the client.                   ║
 * ║  Correct answers live only here.                            ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Each question: { id, question, options[4], correct (0-3), explanation, section }
 */

'use strict';

// ── Section Labels ───────────────────────────────────────────
const S = {
  FF:   'Fiesta Fatal — Characters & Events',
  PRET: 'Preterite Conjugation',
  IMP:  'Imperfect Conjugation',
  VOC:  'Vocabulary',
};

// ── Helper: build question object ────────────────────────────
const q = (id, section, question, options, correct, explanation) =>
  ({ id, section, question, options, correct, explanation });

// ════════════════════════════════════════════════════════════
//  SECTION 1 — FIESTA FATAL  (30 questions)
// ════════════════════════════════════════════════════════════
const FIESTA_FATAL = [

  q('ff01', S.FF,
    "¿Qué celebraba Julieta en 'Fiesta Fatal'?",
    ["Su boda con Riky","Su quinceañera (fiesta de 15)","Su cumpleaños número 18","Su graduación universitaria"],
    1, "Julieta celebraba su fiesta de quinceañera con mucha familia."),

  q('ff02', S.FF,
    "¿Cómo describía la historia a Jorge en relación con la policía?",
    ["Era jefe del cártel","Trabajaba para la policía","Era taxista en Ciudad Juárez","Era vendedor en el mercado"],
    1, "Jorge trabajaba para la policía antes de correr del cártel."),

  q('ff03', S.FF,
    "¿Qué había escondido debajo del sofá de Jorge?",
    ["Dinero del banco","Un pasaporte falso","Escaleras secretas","Armas del cártel"],
    2, "Jorge tenía escaleras secretas debajo de su sofá."),

  q('ff04', S.FF,
    "¿Cómo era Edgar en la historia?",
    ["Comprensivo y amable","Violento y peligroso","Tímido y trabajador","Guapo y popular con las chicas"],
    1, "Edgar era violento y peligroso — trabajaba para el cártel."),

  q('ff05', S.FF,
    "¿Dónde trabajaba Susana?",
    ["En el mercado con su hija","En un restaurante en Ciudad Juárez","En un puesto con su madre","Para la policía federal"],
    1, "Susana trabajaba en un restaurante en Ciudad Juárez."),

  q('ff06', S.FF,
    "¿Qué caracterizaba la identidad de Riky en la historia?",
    ["Era completamente honesto con todos","No era honesto sobre su identidad","Era muy conocido por su trabajo","Era famoso por su familia rica"],
    1, "Riky no era honesto sobre su identidad — tenía secretos peligrosos."),

  q('ff07', S.FF,
    "¿Quién trabajaba en un puesto del mercado con su madre?",
    ["Julieta","Mónica","Vanesa","Berta"],
    2, "Vanesa trabajaba en un puesto con su madre y llevaba ropa humilde."),

  q('ff08', S.FF,
    "¿Cuál de estas opciones describe bien a Riky?",
    ["Era tímido y no le gustaban las fiestas","Era muy guapo y popular con las chicas","Era trabajador y humilde","Adoraba a su familia y era honesto"],
    1, "Riky era muy guapo y popular — le gustaba pasar tiempo con diferentes chicas."),

  q('ff09', S.FF,
    "¿Quién adoraba a su papá Jorge en la historia?",
    ["Vanesa","Susana","Julieta","Mónica"],
    2, "Julieta adoraba a su papá Jorge."),

  q('ff10', S.FF,
    "¿Cuál personaje era 'comprensiva' (understanding)?",
    ["Susana","Berta","Vanesa","Mónica"],
    3, "Mónica era una chica comprensiva."),

  q('ff11', S.FF,
    "¿Qué tipo de ropa llevaba Vanesa?",
    ["Ropa elegante y cara","Ropa humilde","Ropa del cártel","Uniforme de trabajo"],
    1, "Vanesa llevaba ropa humilde — era trabajadora y sencilla."),

  q('ff12', S.FF,
    "¿Quién NO respetaba a su hija?",
    ["Jorge","El taxista","Sr. Sandoval","Riky"],
    2, "El Sr. Sandoval no respetaba a su hija."),

  q('ff13', S.FF,
    "¿Qué le pasó al taxista en la historia?",
    ["Llegó tarde a la fiesta","No miró la calle y chocó con otro coche","Fue capturado por el cártel","Perdió su trabajo en la ciudad"],
    1, "El taxista no miró la calle y chocó con otro coche."),

  q('ff14', S.FF,
    "¿Qué quería hacer el cártel con Jorge?",
    ["Pedirle dinero prestado","Eliminar a Jorge y a su familia","Invitarlo a la fiesta","Comprarle su apartamento"],
    1, "El cártel quería eliminar a Jorge y a su familia."),

  q('ff15', S.FF,
    "¿Con quién corría Jorge para escapar del cártel?",
    ["Con Riky","Con Susana","Con su hija Julieta","Con el taxista"],
    2, "Jorge corría del cártel con su hija Julieta."),

  q('ff16', S.FF,
    "¿Cómo guardaba Jorge su dinero?",
    ["En el banco central","En una caja fuerte","No lo guardaba en el banco (en efectivo)","Con el cártel para protegerlo"],
    2, "Jorge no tenía su dinero en el banco — lo guardaba en efectivo."),

  q('ff17', S.FF,
    "¿Quién tenía un coche rápido en la historia?",
    ["Jorge","Riky","El taxista","Edgar"],
    2, "El taxista tenía un coche rápido."),

  q('ff18', S.FF,
    "¿Cómo era el apartamento donde vivía Jorge?",
    ["Grande y lujoso con muchos cuartos","Pequeño (y tenía escaleras secretas debajo del sofá)","Una casa con jardín grande","Un penthouse en el centro de la ciudad"],
    1, "Jorge tenía un apartamento pequeño con escaleras secretas debajo del sofá."),

  q('ff19', S.FF,
    "¿Qué no quería Susana en la historia?",
    ["No quería trabajar en un restaurante","No quería vivir en un apartamento pequeño","No quería hablar con Jorge","No quería ir a la quinceañera"],
    1, "Susana no quería vivir en un apartamento pequeño."),

  q('ff20', S.FF,
    "¿Qué hacía Sr. Sandoval con su hija?",
    ["Era muy protector y cariñoso","No la respetaba y trabajaba con ella en el mercado","La llevaba a la escuela todos los días","La apoyaba en su trabajo con Vanesa"],
    1, "Sr. Sandoval no respetaba a su hija y trabajaba con ella en el mercado."),

  q('ff21', S.FF,
    "¿Qué característica tenía Julieta además de adorar a su papá?",
    ["Trabajaba para el cártel","Celebraba su fiesta de 15 con mucha familia","Llevaba ropa muy elegante","Tenía un coche rápido como el taxista"],
    1, "Julieta adoraba a su papá y celebraba su quinceañera con mucha familia."),

  q('ff22', S.FF,
    "¿Por qué era peligrosa la situación de Jorge?",
    ["Porque era malo en su trabajo","Porque el cártel quería eliminarle a él y a su familia","Porque no tenía dinero","Porque vivía muy lejos del mercado"],
    1, "El cártel quería eliminar a Jorge y a su familia — vivían con miedo."),

  q('ff23', S.FF,
    "¿Qué describía a la señora del puesto en el mercado?",
    ["Era muy valiente y agresiva","Estaba nerviosa y no quería problemas en su puesto","Era la dueña del restaurante de Susana","Era la madre de Riky"],
    1, "La señora del puesto estaba nerviosa y no quería problemas."),

  q('ff24', S.FF,
    "¿Cuál de estos NO es un detalle sobre Riky?",
    ["Era guapo y popular","Le gustaba pasar tiempo con diferentes chicas","No era honesto sobre su identidad","Trabajaba para la policía con Jorge"],
    3, "Riky era guapo, popular, y no honesto. NO trabajaba para la policía — tenía otros secretos."),

  q('ff25', S.FF,
    "¿Dónde trabajaba Sr. Sandoval?",
    ["En un restaurante en Ciudad Juárez","En el mercado con su hija","Para la policía con Jorge","En un puesto con su madre"],
    1, "Sr. Sandoval trabajaba en el mercado con su hija."),

  q('ff26', S.FF,
    "¿Cómo era Jorge como padre?",
    ["No le importaba su hija","Corría del cártel con su hija para protegerla","La dejó sola cuando llegó el cártel","Se fue sin su hija Julieta"],
    1, "Jorge corría del cártel con su hija — era un padre protector."),

  q('ff27', S.FF,
    "¿Qué tipo de trabajo hacía Vanesa?",
    ["Trabajaba como taxista","Trabajaba en el mercado en un puesto con su madre","Trabajaba en el restaurante de Susana","Trabajaba para la policía"],
    1, "Vanesa trabajaba en un puesto en el mercado con su madre."),

  q('ff28', S.FF,
    "¿Qué sabemos sobre la ropa de Vanesa y su estilo de vida?",
    ["Era rica y llevaba ropa de lujo","Llevaba ropa humilde y era trabajadora","Llevaba uniforme del cártel","Era famosa por su moda elegante"],
    1, "Vanesa llevaba ropa humilde — era trabajadora y sencilla."),

  q('ff29', S.FF,
    "¿Qué hizo el taxista que causó el accidente?",
    ["Condujo muy rápido por la autopista","No miró la calle y chocó con otro coche","Estaba dormido mientras conducía","El cártel le dañó el coche"],
    1, "El taxista no miró la calle y chocó con otro coche."),

  q('ff30', S.FF,
    "¿Cuál es la mejor descripción general de Edgar?",
    ["Un vendedor amable del mercado","Un personaje violento y peligroso del cártel","El taxista que chocó en la calle","El padre de Julieta que trabajaba para la policía"],
    1, "Edgar era un personaje violento y peligroso que trabajaba para el cártel."),
];

// ════════════════════════════════════════════════════════════
//  SECTION 2a — PRETERITE CONJUGATION  (30 questions)
//  Covers: regular -ar/-er/-ir, -car/-gar/-zar, i→y, irregular
// ════════════════════════════════════════════════════════════
const PRETERITE = [

  // Regular -AR
  q('p01', S.PRET,
    "Mis amigos ___ (HABLAR) con Jorge durante la fiesta.",
    ["hablaban","hablan","hablaron","hablarán"], 2,
    "-AR preterite ellos: hablaron (ending -aron)."),

  q('p02', S.PRET,
    "Yo ___ (TRABAJAR) en el mercado el verano pasado.",
    ["trabajaba","trabajo","trabajé","trabajaré"], 2,
    "-AR preterite yo: ending -é. trabajé ✓"),

  q('p03', S.PRET,
    "Ella ___ (BAILAR) toda la noche en la quinceañera.",
    ["bailaba","bailó","baila","bailará"], 1,
    "-AR preterite él/ella: ending -ó (no accent). bailó ✓"),

  q('p04', S.PRET,
    "Tú ___ (HABLAR) con el taxista después del accidente.",
    ["hablabas","hablas","hablarás","hablaste"], 3,
    "-AR preterite tú: ending -aste. hablaste ✓"),

  // Regular -ER/-IR
  q('p05', S.PRET,
    "Tú ___ (COMER) en el restaurante de Susana ayer.",
    ["comías","comes","comiste","comerás"], 2,
    "-ER preterite tú: ending -iste. comiste ✓"),

  q('p06', S.PRET,
    "Nosotros ___ (CORRER) por el parque el sábado pasado.",
    ["corríamos","corremos","correremos","corrimos"], 3,
    "-ER preterite nosotros: ending -imos. corrimos ✓"),

  q('p07', S.PRET,
    "Ellas ___ (VIVIR) en México por diez años.",
    ["vivían","viven","vivirán","vivieron"], 3,
    "-IR preterite ellas: ending -ieron. vivieron ✓"),

  q('p08', S.PRET,
    "Nosotros ___ (ESCRIBIR) una carta a la familia la semana pasada.",
    ["escribíamos","escribiremos","escribieron","escribimos"], 3,
    "-IR preterite nosotros: ending -imos. escribimos ✓"),

  // -CAR/-GAR/-ZAR  (YO form spelling changes)
  q('p09', S.PRET,
    "Yo ___ (PRACTICAR) el español cada noche la semana pasada.",
    ["practicé","practiqué","practicaba","practico"], 1,
    "-CAR verbs: c→QU in YO preterite only. practicar→practiqué ✓"),

  q('p10', S.PRET,
    "Yo ___ (JUGAR) al béisbol con mis primos el fin de semana.",
    ["jugé","jugué","jugaba","juego"], 1,
    "-GAR verbs: g→GU in YO preterite only. jugar→jugué ✓"),

  q('p11', S.PRET,
    "Yo ___ (LLEGAR) tarde a la clase de español esta mañana.",
    ["llegé","llegué","llegaba","llego"], 1,
    "-GAR verbs: g→GU in YO preterite only. llegar→llegué ✓"),

  q('p12', S.PRET,
    "Yo ___ (COMENZAR) a estudiar para el examen final ayer.",
    ["comenzé","comenzaba","comencé","comienzo"], 2,
    "-ZAR verbs: z→C in YO preterite only. comenzar→comencé ✓"),

  q('p13', S.PRET,
    "Yo ___ (SACAR) una buena nota en el examen de español.",
    ["sacé","saqué","sacaba","saco"], 1,
    "-CAR verbs: c→QU in YO form only. sacar→saqué ✓"),

  q('p14', S.PRET,
    "Yo ___ (TOCAR) la guitarra en la fiesta de quinceañera.",
    ["tocé","toqué","tocaba","toco"], 1,
    "-CAR verbs: c→QU in YO form only. tocar→toqué ✓"),

  q('p15', S.PRET,
    "Yo ___ (PAGAR) la cuenta en el restaurante de Susana.",
    ["pagé","pagué","pagaba","pago"], 1,
    "-GAR verbs: g→GU in YO form only. pagar→pagué ✓"),

  q('p16', S.PRET,
    "Yo ___ (EMPEZAR) a hablar español hace dos años.",
    ["empezé","empezaba","empecé","empiezo"], 2,
    "-ZAR verbs: z→C in YO form only. empezar→empecé ✓"),

  q('p17', S.PRET,
    "What spelling change happens in the YO form of -CAR verbs in the preterite?",
    ["z → c","g → gu","c → qu","No change is needed"], 2,
    "-CAR verbs: c→QU. Examples: buscar→busqué, sacar→saqué, practicar→practiqué"),

  q('p18', S.PRET,
    "What spelling change happens in the YO form of -ZAR verbs in the preterite?",
    ["z → c","g → gu","c → qu","z → s"], 0,
    "-ZAR verbs: z→C. Examples: comenzar→comencé, empezar→empecé, abrazar→abracé"),

  // i→y rule
  q('p19', S.PRET,
    "Él ___ (LEER) el periódico esta mañana. (i→y rule!)",
    ["leió","leó","leyí","leyó"], 3,
    "LEER él/ella: le+ió → leyó. When 'i' falls between two vowels, it becomes 'y'."),

  q('p20', S.PRET,
    "Ellos ___ (CREER) la historia de Jorge sobre el cártel.",
    ["creieron","creeron","creyieron","creyeron"], 3,
    "CREER ellos: cre+ieron → creyeron. Same i→y rule."),

  q('p21', S.PRET,
    "Yo ___ (LEER) tres capítulos del libro anoche.",
    ["leyí","leyó","leía","leí"], 3,
    "LEER yo = leí — no i→y change (the 'í' is accented and ends the syllable normally)."),

  q('p22', S.PRET,
    "Ella ___ (OÍR) una música bonita en la fiesta.",
    ["oió","oía","oyí","oyó"], 3,
    "OÍR ella: o+ió → oyó. Same i→y rule applies when 'i' is between two vowels."),

  q('p23', S.PRET,
    "The i→y spelling change in LEER applies to which subject pronoun(s)?",
    ["Yo and tú only","All six forms equally","Nosotros form only","Él/ella and ellos/ellas ONLY"], 3,
    "Only él (leyó) and ellos (leyeron) need i→y. Yo leí, tú leíste, nosotros leímos stay normal."),

  // Irregular preterite
  q('p24', S.PRET,
    "Jorge ___ (IR) al mercado con Julieta para comprar comida.",
    ["iba","va","irá","fue"], 3,
    "IR preterite: fui, fuiste, FUE, fuimos, fueron. (Same forms as SER — memorize both!)"),

  q('p25', S.PRET,
    "Yo ___ (HACER) mi tarea antes de salir a la fiesta.",
    ["hacía","hize","hacé","hice"], 3,
    "HACER: hice, hiciste, HIZO (not 'hizó'!), hicimos, hicieron."),

  q('p26', S.PRET,
    "Ellos ___ (TENER) que correr muy rápido para escapar del cártel.",
    ["tenían","tienen","teneron","tuvieron"], 3,
    "TENER: tuve, tuviste, tuvo, tuvimos, tuvieron."),

  q('p27', S.PRET,
    "Julieta ___ (DECIR) la verdad a su papá sobre Riky.",
    ["decía","dijó","decio","dijo"], 3,
    "DECIR: dije, dijiste, dijo (no accent!), dijimos, dijeron."),

  q('p28', S.PRET,
    "Nosotros ___ (ESTAR) en la fiesta de Julieta toda la noche.",
    ["estábamos","estuveimos","estamos","estuvimos"], 3,
    "ESTAR: estuve, estuviste, estuvo, estuvimos, estuvieron."),

  q('p29', S.PRET,
    "Riky ___ (VENIR) a la fiesta con sus amigos del barrio.",
    ["venía","vinó","venió","vino"], 3,
    "VENIR: vine, viniste, vino, vinimos, vinieron."),

  q('p30', S.PRET,
    "Ella ___ (SABER) la verdad sobre Riky y el cártel.",
    ["sabía","sabe","saberá","supo"], 3,
    "SABER: supe, supiste, supo, supimos, supieron."),

  // Missing irregular preterites — poder, poner, querer, traer, dar, ver
  q('p31', S.PRET,
    "Él no ___ (PODER) escapar del cártel a tiempo.",
    ["podía","puede","podría","pudo"], 3,
    "PODER: pude, pudiste, pudo, pudimos, pudieron. (Stem: PUD-)"),

  q('p32', S.PRET,
    "Yo ___ (PODER) terminar toda la tarea antes de la fiesta.",
    ["podía","puedo","podría","pude"], 3,
    "PODER yo = pude. (Stem: PUD- — no accent on the final vowel for irregular preterites!)"),

  q('p33', S.PRET,
    "Vanesa ___ (PONER) la comida en el puesto del mercado.",
    ["ponía","pone","pondrá","puso"], 3,
    "PONER: puse, pusiste, puso, pusimos, pusieron. (Stem: PUS-)"),

  q('p34', S.PRET,
    "Yo ___ (PONER) mis libros en la mochila antes de salir.",
    ["ponía","pongo","pondría","puse"], 3,
    "PONER yo = puse. (Stem: PUS-)"),

  q('p35', S.PRET,
    "Jorge ___ (QUERER) proteger a su hija del cártel.",
    ["quería","quiere","querría","quiso"], 3,
    "QUERER: quise, quisiste, quiso, quisimos, quisieron. (Stem: QUIS-)"),

  q('p36', S.PRET,
    "Riky ___ (TRAER) un regalo especial para la quinceañera.",
    ["traía","trae","traerá","trajo"], 3,
    "TRAER: traje, trajiste, trajo, trajimos, trajeron. (Stem: TRAJ- — no 'i' in ellos: trajeron)"),

  q('p37', S.PRET,
    "El taxista le ___ (DAR) un recibo al cliente después del viaje.",
    ["daba","da","dará","dio"], 3,
    "DAR: di, diste, dio, dimos, dieron. (No accent — single syllable forms)"),

  q('p38', S.PRET,
    "Yo ___ (VER) a Edgar en la calle la noche de la fiesta.",
    ["veía","veo","vería","vi"], 3,
    "VER yo preterite = vi. (VER preterite: vi, viste, vio, vimos, vieron — don't confuse with imperfect veía!)"),

  // -IR stem-changers (e→i, o→u — 3rd person ONLY)
  q('p39', S.PRET,
    "El bebé ___ (DORMIR) doce horas anoche. (o→u stem-changer)",
    ["dormía","duerme","dormió","durmió"], 3,
    "DORMIR -IR stem-changer: durmió (él/ella), durmieron (ellos). Only 3rd person changes o→u in preterite."),

  q('p40', S.PRET,
    "Los estudiantes ___ (REPETIR) las palabras del vocabulario. (e→i stem-changer)",
    ["repetían","repiten","repetieron","repitieron"], 3,
    "REPETIR -IR stem-changer: repitió (él), repitieron (ellos). Only 3rd person changes e→i in preterite."),
];

// ════════════════════════════════════════════════════════════
//  SECTION 2b — IMPERFECT CONJUGATION  (30 questions)
//  Covers: regular -ar/-er/-ir, ser/ir/ver irregulars
// ════════════════════════════════════════════════════════════
const IMPERFECT = [

  // Regular -AR
  q('i01', S.IMP,
    "De niño, yo siempre ___ (JUGAR) con mis amigos en el parque.",
    ["jugué","juego","jugaría","jugaba"], 3,
    "-AR imperfect yo: -aba ending. jugaba = 'I used to play / was playing'"),

  q('i02', S.IMP,
    "La madre de Jason le ___ (PEGAR) mucho con la chancla.",
    ["pegó","pega","pegaría","pegaba"], 3,
    "PEGAR imperfect él/ella = pegaba (habitual past action, -AR verb)."),

  q('i03', S.IMP,
    "Mis amigos y yo ___ (NADAR) en el lago todos los veranos.",
    ["nadamos","nadaron","nadaremos","nadábamos"], 3,
    "-AR imperfect nosotros: -ábamos ending. nadábamos ✓"),

  q('i04', S.IMP,
    "Ellos ___ (TRABAJAR) en el mercado de lunes a viernes.",
    ["trabajaron","trabajan","trabajarán","trabajaban"], 3,
    "-AR imperfect ellos: -aban ending. trabajaban ✓"),

  q('i05', S.IMP,
    "What is the correct -AR verb ending for imperfect TÚ form?",
    ["-aste","-abas","-ías","-aba"], 1,
    "-AR imperfect tú = -ABAS. Full: -aba, -abas, -aba, -ábamos, -abais, -aban"),

  q('i06', S.IMP,
    "¿___ (PORTARSE) tú bien o mal de niño?",
    ["Te portaste","Te portabas","Te portarías","Te portabais"], 1,
    "PORTARSE imperfect tú: te portabas (reflexive -AR verb, habitual past behavior)."),

  // Regular -ER/-IR
  q('i07', S.IMP,
    "Mi familia ___ (COMER) juntos todos los domingos.",
    ["comió","come","comieron","comía"], 3,
    "-ER imperfect él/ella: -ía ending. comía = 'used to eat / was eating'"),

  q('i08', S.IMP,
    "Nosotros ___ (VIVIR) en Guatemala cuando éramos pequeños.",
    ["vivimos","vivieron","viviamos","vivíamos"], 3,
    "-IR imperfect nosotros: -íamos ending (accent on the í is required!). vivíamos ✓"),

  q('i09', S.IMP,
    "Ella ___ (ESCRIBIR) cartas a su familia en México cada semana.",
    ["escribió","escribe","escribirá","escribía"], 3,
    "-IR imperfect ella: -ía ending. escribía (habitual past action) ✓"),

  q('i10', S.IMP,
    "Yo siempre ___ (LEER) antes de dormir cuando era niño.",
    ["leí","leo","leería","leía"], 3,
    "LEER imperfect yo = leía (regular -ER verb in imperfect: -ía ending)."),

  q('i11', S.IMP,
    "Mi hermana ___ (QUERER) ser profesora cuando era pequeña.",
    ["quiso","quiere","querría","quería"], 3,
    "QUERER imperfect ella = quería (regular -ER verb in imperfect: -ía)."),

  q('i12', S.IMP,
    "What is the correct -ER/-IR verb ending for imperfect YO form?",
    ["-aba","-ía","-í","-ías"], 1,
    "-ER/-IR imperfect yo = -ÍA. Full: -ía, -ías, -ía, -íamos, -íais, -ían (all have accent on í!)"),

  // SER (irregular)
  q('i13', S.IMP,
    "Julieta ___ (SER) una chica muy simpática y comprensiva.",
    ["fue","es","será","era"], 3,
    "SER imperfect: era, eras, era, éramos, erais, eran. For DESCRIPTIONS in the past!"),

  q('i14', S.IMP,
    "Nosotros ___ (SER) buenos amigos cuando éramos pequeños.",
    ["fuimos","somos","seríamos","éramos"], 3,
    "SER nosotros imperfect = ÉRAMOS (accent on the É — don't forget it!)."),

  q('i15', S.IMP,
    "Yo ___ (SER) muy travieso de niño, según mi mamá.",
    ["fui","soy","seré","era"], 3,
    "SER yo imperfect = ERA (same form as él/ella)."),

  q('i16', S.IMP,
    "Tú ___ (SER) muy inteligente cuando tenías diez años.",
    ["fuiste","eres","serías","eras"], 3,
    "SER tú imperfect = ERAS."),

  q('i17', S.IMP,
    "Ellos ___ (SER) buenos estudiantes en la escuela primaria.",
    ["fueron","son","serían","eran"], 3,
    "SER ellos imperfect = ERAN."),

  q('i18', S.IMP,
    "Ella ___ (SER) muy graciosa y divertida cuando era pequeña.",
    ["fue","es","sería","era"], 3,
    "SER ella imperfect = ERA."),

  // IR (irregular)
  q('i19', S.IMP,
    "Mi familia siempre ___ (IR) a la playa en Florida cada verano.",
    ["fue","va","iría","iba"], 3,
    "IR imperfect: iba, ibas, iba, íbamos, ibais, iban. For habitual past actions!"),

  q('i20', S.IMP,
    "Ellos ___ (IR) al parque después de la escuela todos los días.",
    ["fueron","van","irían","iban"], 3,
    "IR ellos imperfect = IBAN."),

  q('i21', S.IMP,
    "¿A dónde ___ (IR) tú con tus amigos los fines de semana?",
    ["fuiste","vas","irías","ibas"], 3,
    "IR tú imperfect = IBAS."),

  q('i22', S.IMP,
    "Nosotros ___ (IR) a la iglesia todos los domingos de pequeños.",
    ["fuimos","vamos","iríamos","íbamos"], 3,
    "IR nosotros imperfect = ÍBAMOS (accent on the first Í!)."),

  q('i23', S.IMP,
    "Yo ___ (IR) a la escuela a pie cuando vivía con mis abuelos.",
    ["fui","voy","iría","iba"], 3,
    "IR yo imperfect = IBA."),

  // VER (irregular)
  q('i24', S.IMP,
    "Mi hermano y yo ___ (VER) la tele cada noche antes de dormir.",
    ["vimos","vemos","viéramos","veíamos"], 3,
    "VER nosotros imperfect = VEÍAMOS (accent on the second í!)."),

  q('i25', S.IMP,
    "Jorge ___ (VER) muchas películas de acción cuando era joven.",
    ["vio","ve","vería","veía"], 3,
    "VER él/ella imperfect = VEÍA (accent on the í!)."),

  q('i26', S.IMP,
    "Tú ___ (VER) muchos dibujos animados de niño, ¿verdad?",
    ["viste","ves","verías","veías"], 3,
    "VER tú imperfect = VEÍAS (accent on the í!)."),

  q('i27', S.IMP,
    "Yo ___ (VER) ese programa de televisión todos los viernes.",
    ["vi","veo","vería","veía"], 3,
    "VER yo imperfect = VEÍA."),

  q('i28', S.IMP,
    "Ellos ___ (VER) las noticias cada mañana antes del trabajo.",
    ["vieron","ven","verían","veían"], 3,
    "VER ellos imperfect = VEÍAN."),

  q('i29', S.IMP,
    "Which THREE verbs are the ONLY irregulars in the imperfect tense?",
    ["tener, hacer, ir","estar, ser, dar","ir, ver, decir","ser, ir, ver"], 3,
    "Only SER, IR, and VER are irregular in the imperfect. All other verbs are 100% regular!"),

  q('i30', S.IMP,
    "¿Cuál es la forma del imperfecto de IR para 'ella'?",
    ["fue","va","iría","iba"], 3,
    "IR ella imperfect = IBA. Full conjugation: iba/ibas/iba/íbamos/ibais/iban"),
];

// ════════════════════════════════════════════════════════════
//  SECTION 3 — VOCABULARY  (20 questions)
// ════════════════════════════════════════════════════════════
const VOCABULARY = [
  q('v01', S.VOC, "¿Qué significa 'peligroso'?",
    ["Funny / gracioso","Dangerous / peligroso","Humble / humilde","Honest / honesto"], 1,
    "peligroso = dangerous. Edgar era violento y peligroso."),

  q('v02', S.VOC, "¿Qué significa 'huir'?",
    ["To celebrate","To hide something","To flee / run away","To fight back"], 2,
    "huir = to flee. Jorge huía del cártel con su hija."),

  q('v03', S.VOC, "¿Qué significa 'comprensiva'?",
    ["Dangerous","Understanding / compassionate","Nervous","Humble"], 1,
    "comprensiva = understanding. Mónica era comprensiva."),

  q('v04', S.VOC, "¿Qué significa 'escaleras'?",
    ["Windows","Stairs","Walls","Doors"], 1,
    "escaleras = stairs. Jorge tenía escaleras secretas debajo del sofá."),

  q('v05', S.VOC, "¿Qué significa 'simpático/a'?",
    ["Dangerous","Ugly / feo","Nice / friendly","Boring"], 2,
    "simpático/a = nice, friendly. Julieta era muy simpática."),

  q('v06', S.VOC, "¿Qué significa 'humilde'?",
    ["Rich / rico","Elegant","Humble / modest","Dangerous"], 2,
    "humilde = humble, modest. Vanesa llevaba ropa humilde."),

  q('v07', S.VOC, "¿Qué significa 'chocó' (pasado de 'chocar')?",
    ["Celebrated","Ran away","Crashed / collided","Worked hard"], 2,
    "chocó = he/she crashed. El taxista no miró la calle y chocó con otro coche."),

  q('v08', S.VOC, "¿Qué significa 'el puesto'?",
    ["The job title / rank","The apartment","The market stall","The car"], 2,
    "el puesto = market stall. Vanesa trabajaba en un puesto con su madre."),

  q('v09', S.VOC, "¿Qué significa 'eliminar'?",
    ["To celebrate","To dance","To eliminate / get rid of","To find"], 2,
    "eliminar = to eliminate. El cártel quería eliminar a Jorge y su familia."),

  q('v10', S.VOC, "¿Qué significa 'la quinceañera'?",
    ["A Christmas celebration","A girl's 15th birthday party","A Spanish word for party","A graduation ceremony"], 1,
    "la quinceañera = a girl's 15th birthday celebration, very important in Latin culture."),

  q('v11', S.VOC, "¿Qué significa 'el cártel'?",
    ["The market stall","The police department","The cartel (criminal organization)","The apartment building"], 2,
    "el cártel = the cartel (criminal drug organization). El cártel quería eliminar a Jorge."),

  q('v12', S.VOC, "¿Qué significa 'adorar'?",
    ["To hate","To fear","To adore / love deeply","To ignore"], 2,
    "adorar = to adore/love deeply. Julieta adoraba a su papá."),

  q('v13', S.VOC, "¿Qué significa 'respetar'?",
    ["To love","To respect","To hate","To ignore"], 1,
    "respetar = to respect. El Sr. Sandoval no respetaba a su hija."),

  q('v14', S.VOC, "¿Qué significa 'escapar'?",
    ["To celebrate","To work","To escape","To sleep"], 2,
    "escapar = to escape. Jorge y Julieta escaparon del cártel."),

  q('v15', S.VOC, "¿Qué significa 'gracioso/a'?",
    ["Scary","Funny / entertaining","Humble","Popular"], 1,
    "gracioso/a = funny, entertaining. Era muy gracioso de niño."),

  q('v16', S.VOC, "¿Qué significa 'nervioso/a'?",
    ["Dangerous","Nervous","Happy","Humble"], 1,
    "nervioso/a = nervous. La señora del puesto estaba nerviosa."),

  q('v17', S.VOC, "¿Qué significa 'honesto/a'?",
    ["Funny","Dangerous","Honest","Humble"], 2,
    "honesto/a = honest. Riky no era honesto sobre su identidad."),

  q('v18', S.VOC, "¿Qué significa 'el mercado'?",
    ["The restaurant","The apartment","The market","The school"], 2,
    "el mercado = the market (place where goods are sold)."),

  q('v19', S.VOC, "¿Qué significa 'el efectivo'?",
    ["The bank","Cash / physical money","The safe","The cartel's money"], 1,
    "el efectivo = cash. Jorge no tenía su dinero en el banco — lo guardaba en efectivo."),

  q('v20', S.VOC, "¿Qué significa 'secreto/a'?",
    ["Dangerous","Visible / obvious","Secret / hidden","Important"], 2,
    "secreto/a = secret. Jorge tenía escaleras secretas debajo del sofá."),
];

// ════════════════════════════════════════════════════════════
//  EXPORT
// ════════════════════════════════════════════════════════════
module.exports = { FIESTA_FATAL, PRETERITE, IMPERFECT, VOCABULARY };
