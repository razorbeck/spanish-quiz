'use strict';

/**
 * readings.js — Server-side ONLY. Never transmitted to client.
 * 10 reading passages (one per version), each with:
 *   - passage: string (Spanish text, SP2 level, preterite + imperfect)
 *   - mc: array of 3 MC comprehension questions
 *   - openQ: string (open-response prompt for admin to grade)
 */

const r = (passage, mc, openQ) => ({ passage, mc, openQ });
const q = (question, options, correct, explanation) => ({ question, options, correct, explanation });

const READINGS = [

  // ── Version 1 ──────────────────────────────────────────────────────────────
  r(
    `Julieta era una chica inteligente que vivía en la Ciudad de México. Todos los días ella caminaba al mercado con su madre. Un día, cuando caminaba por las escaleras del mercado, vio a un hombre misterioso. El hombre la miraba con ojos fríos. Julieta tenía miedo porque el hombre era miembro del cártel. Ella corrió rápidamente y llamó a su amigo Jorge. Jorge llegó en un taxi y los dos escaparon del mercado. Más tarde, Julieta habló con la policía y les explicó todo. La policía buscó al hombre pero no lo encontró. Julieta y Jorge estaban muy nerviosos por muchos días.`,
    [
      q('¿Dónde vivía Julieta?', ['En Guadalajara', 'En Buenos Aires', 'En la Ciudad de México', 'En Madrid'], 2, 'El texto dice que Julieta vivía en la Ciudad de México.'),
      q('¿Por qué tenía miedo Julieta?', ['Porque perdió su dinero', 'Porque vio a su maestra', 'Porque el hombre era del cártel', 'Porque Jorge no llegó'], 2, 'Julieta tenía miedo porque el hombre era miembro del cártel.'),
      q('¿Cómo escaparon Julieta y Jorge?', ['Corrieron a pie', 'Tomaron el metro', 'Escaparon en un taxi', 'Se escondieron en el mercado'], 2, 'Jorge llegó en un taxi y los dos escaparon del mercado.'),
    ],
    '¿Por qué crees que Julieta era valiente? Explica con detalles del texto.'
  ),

  // ── Version 2 ──────────────────────────────────────────────────────────────
  r(
    `Jorge era un chico simpático y humilde que trabajaba en un café cerca de su casa. Todos los días él preparaba café y hablaba con los clientes. Un día, una mujer llamada Vanesa entró al café. Vanesa buscaba información sobre una persona peligrosa. Jorge la escuchó con atención porque él conocía a esa persona. Esa noche, Jorge fue a hablar con su amiga Julieta. Los dos decidieron ayudar a Vanesa. Al día siguiente, los tres se reunieron en el café y formaron un plan. El plan era difícil y peligroso, pero Jorge y Julieta querían hacer lo correcto. Vanesa estaba muy agradecida por su ayuda.`,
    [
      q('¿Dónde trabajaba Jorge?', ['En el mercado', 'En un café', 'En una escuela', 'En una tienda'], 1, 'Jorge trabajaba en un café cerca de su casa.'),
      q('¿Qué buscaba Vanesa?', ['Un trabajo', 'Una casa nueva', 'Información sobre una persona peligrosa', 'A su familia'], 2, 'Vanesa buscaba información sobre una persona peligrosa.'),
      q('¿Cómo se sentía Vanesa al final?', ['Enojada', 'Triste', 'Asustada', 'Agradecida'], 3, 'El texto dice que Vanesa estaba muy agradecida por su ayuda.'),
    ],
    'Describe el carácter de Jorge usando ejemplos específicos del texto.'
  ),

  // ── Version 3 ──────────────────────────────────────────────────────────────
  r(
    `Riky era un joven que vivía en un barrio peligroso. Él tenía muchos problemas con el cártel porque sabía demasiado. Un día, dos hombres del cártel lo siguieron por la calle. Riky corrió hacia el mercado donde trabajaba su amiga Berta. Berta lo escondió detrás de su puesto de frutas. Los hombres buscaron a Riky por todo el mercado pero no lo encontraron. Después de una hora, los hombres se fueron. Berta le aconsejó a Riky que hablara con la señora Susana, quien conocía bien a la gente del barrio. Al día siguiente, Riky visitó a Susana y ella le dio consejos muy útiles. Riky siguió los consejos y evitó muchos peligros.`,
    [
      q('¿Por qué tenía problemas Riky con el cártel?', ['Porque robó dinero', 'Porque sabía demasiado', 'Porque no pagó sus deudas', 'Porque trabajaba para la policía'], 1, 'Riky tenía problemas porque sabía demasiado.'),
      q('¿Dónde se escondió Riky?', ['En la casa de Berta', 'En el taxi', 'Detrás del puesto de frutas de Berta', 'En el café de Jorge'], 2, 'Berta lo escondió detrás de su puesto de frutas.'),
      q('¿Qué le aconsejó Berta a Riky?', ['Que escapara del país', 'Que llamara a la policía', 'Que hablara con la señora Susana', 'Que se fuera al mercado'], 2, 'Berta le aconsejó que hablara con la señora Susana.'),
    ],
    'Explica cómo Berta ayudó a Riky. ¿Qué tipo de persona es Berta? Usa evidencia del texto.'
  ),

  // ── Version 4 ──────────────────────────────────────────────────────────────
  r(
    `La señora Susana era una mujer muy comprensiva que vivía cerca del mercado. Ella siempre ayudaba a las personas del barrio con sus problemas. Un día, un taxista llamado Marcos llegó a su casa muy asustado. Marcos le explicó que vio algo terrible mientras manejaba su taxi esa noche. Un carro negro chocó con otro carro en la avenida principal. Susana escuchó todo y tomó notas. Ella sabía que el carro negro era del cártel. Al día siguiente, Susana habló con el Sr. Sandoval, quien era un hombre importante en el barrio. Sandoval prometió investigar el accidente. Susana confiaba en Sandoval porque él siempre era honesto y directo.`,
    [
      q('¿Cómo era la señora Susana?', ['Peligrosa y fría', 'Tímida y callada', 'Comprensiva y amable', 'Nerviosa y confundida'], 2, 'El texto describe a Susana como una mujer muy comprensiva.'),
      q('¿Qué vio el taxista Marcos?', ['A una persona corriendo', 'A un hombre con un arma', 'Un accidente de carros en la avenida', 'A Julieta en el mercado'], 2, 'Marcos vio un carro negro que chocó con otro carro en la avenida principal.'),
      q('¿Por qué confiaba Susana en el Sr. Sandoval?', ['Porque era su esposo', 'Porque era policía', 'Porque era honesto y directo', 'Porque conocía al cártel'], 2, 'Susana confiaba en Sandoval porque él siempre era honesto y directo.'),
    ],
    '¿Qué papel importante tiene la señora Susana en el barrio? Explica con detalles del texto.'
  ),

  // ── Version 5 ──────────────────────────────────────────────────────────────
  r(
    `Mónica era una estudiante muy inteligente que asistía a la escuela secundaria. Ella estudiaba mucho y siempre sacaba buenas notas. Un día, su amiga Vanesa la llamó con urgencia. Vanesa necesitaba ayuda porque tenía un problema muy serio. Mónica fue corriendo a la casa de Vanesa. Cuando llegó, vio que Vanesa lloraba y tenía miedo. Vanesa le explicó que encontró una nota secreta en su mochila. La nota decía cosas amenazantes. Mónica leyó la nota con calma y pensó en una solución. Ella decidió llevar la nota a su maestro, el Sr. Sandoval. El Sr. Sandoval leyó la nota y llamó a la policía inmediatamente. La policía llegó y tomó el control de la situación.`,
    [
      q('¿Quién llamó a Mónica con urgencia?', ['Jorge', 'Julieta', 'Vanesa', 'Riky'], 2, 'Vanesa llamó a Mónica con urgencia.'),
      q('¿Qué encontró Vanesa en su mochila?', ['Dinero', 'Una foto', 'Una nota secreta', 'Un teléfono'], 2, 'Vanesa encontró una nota secreta en su mochila.'),
      q('¿Qué hizo Mónica con la nota?', ['La destruyó', 'La guardó', 'La llevó al Sr. Sandoval', 'Se la dio a Riky'], 2, 'Mónica decidió llevar la nota a su maestro, el Sr. Sandoval.'),
    ],
    'Compara el carácter de Mónica con el de Vanesa según el texto. ¿En qué son diferentes?'
  ),

  // ── Version 6 ──────────────────────────────────────────────────────────────
  r(
    `El Sr. Sandoval era un maestro respetado que enseñaba en la escuela del barrio. Todos los estudiantes lo adoraban porque era justo y amable. Pero Sandoval también tenía un secreto: él colaboraba con una organización que ayudaba a las víctimas del crimen. Un día, un estudiante llamado Edgar llegó tarde a la clase y parecía muy nervioso. Sandoval habló con Edgar después de la clase. Edgar le confió que su familia recibió amenazas del cártel. Sandoval escuchó con atención y prometió ayudar. Esa tarde, él hizo varias llamadas telefónicas para proteger a la familia de Edgar. A la mañana siguiente, Edgar llegó a la escuela con una sonrisa porque su familia estaba a salvo.`,
    [
      q('¿Por qué adoraban los estudiantes al Sr. Sandoval?', ['Porque era muy divertido', 'Porque era justo y amable', 'Porque no daba tarea', 'Porque era muy rico'], 1, 'Los estudiantes lo adoraban porque era justo y amable.'),
      q('¿Cuál era el secreto del Sr. Sandoval?', ['Tenía mucho dinero', 'Conocía al cártel', 'Colaboraba con una organización de víctimas', 'Era policía secreto'], 2, 'Sandoval colaboraba con una organización que ayudaba a las víctimas del crimen.'),
      q('¿Por qué llegó tarde Edgar a clase?', ['Porque se quedó dormido', 'Porque el texto no lo dice — llegó nervioso', 'Porque fue al mercado', 'Porque habló con la policía'], 1, 'El texto no explica por qué llegó tarde, solo dice que llegó tarde y parecía nervioso.'),
    ],
    'Describe cómo el Sr. Sandoval usa su posición para ayudar a otros. ¿Es un buen modelo a seguir? Explica.'
  ),

  // ── Version 7 ──────────────────────────────────────────────────────────────
  r(
    `Berta vendía frutas y verduras en el mercado desde hace muchos años. Ella conocía a todos los vecinos y siempre sabía lo que pasaba en el barrio. Un día, llegó al mercado un hombre que Berta nunca había visto antes. El hombre compraba mucha fruta pero hacía preguntas raras sobre la gente del barrio. Berta fingió no saber nada y lo observó con cuidado. Cuando el hombre se fue, ella llamó a Susana y le describió todo. Susana reconoció la descripción: era un espía del cártel. Las dos mujeres decidieron alertar a todos sus amigos. Esa noche, el barrio entero estaba en alerta. Gracias a Berta, evitaron un peligro muy grande.`,
    [
      q('¿Qué vendía Berta en el mercado?', ['Ropa y zapatos', 'Tacos y tamales', 'Frutas y verduras', 'Libros y revistas'], 2, 'Berta vendía frutas y verduras en el mercado.'),
      q('¿Qué hacía el hombre misterioso además de comprar fruta?', ['Tomaba fotos', 'Hacía preguntas raras sobre la gente', 'Amenazaba a los vendedores', 'Buscaba a Julieta'], 1, 'El hombre compraba mucha fruta pero hacía preguntas raras sobre la gente del barrio.'),
      q('¿Quién reconoció al hombre como espía del cártel?', ['Jorge', 'Sandoval', 'Riky', 'Susana'], 3, 'Susana reconoció la descripción y dijo que era un espía del cártel.'),
    ],
    'Explica por qué Berta es una persona importante para la comunidad. Usa ejemplos del texto.'
  ),

  // ── Version 8 ──────────────────────────────────────────────────────────────
  r(
    `Edgar era un joven callado que vivía con su abuela. Él no hablaba mucho en la escuela, pero siempre observaba todo con atención. Un día, mientras caminaba por el barrio, escuchó una conversación secreta entre dos hombres. Los hombres hablaban de un plan para atacar el mercado. Edgar los reconoció como miembros del cártel. Él tenía mucho miedo pero sabía que debía actuar. Corrió a la tienda del señor Riky y le contó todo. Riky no perdió tiempo: llamó al Sr. Sandoval y a la señora Susana. Los tres adultos contactaron a la policía. Gracias a Edgar, la policía llegó antes de que ocurriera el ataque. El barrio celebró a Edgar como un héroe.`,
    [
      q('¿Con quién vivía Edgar?', ['Con sus padres', 'Con su tío', 'Con su abuela', 'Solo'], 2, 'Edgar vivía con su abuela.'),
      q('¿Qué escuchó Edgar mientras caminaba?', ['Una canción del cártel', 'Una conversación secreta sobre atacar el mercado', 'A Jorge hablando por teléfono', 'Una pelea entre vecinos'], 1, 'Escuchó una conversación sobre un plan para atacar el mercado.'),
      q('¿A quién fue primero Edgar para reportar lo que escuchó?', ['A Susana', 'A la policía', 'Al Sr. Sandoval', 'A Riky'], 3, 'Edgar corrió a la tienda del señor Riky y le contó todo.'),
    ],
    '¿Por qué fue difícil para Edgar actuar en esta situación? ¿Qué dice eso sobre su carácter?'
  ),

  // ── Version 9 ──────────────────────────────────────────────────────────────
  r(
    `La quinceañera de Mónica era la fiesta más esperada del año en el barrio. Todos los vecinos se preparaban para celebrar. Julieta ayudó a decorar el salón. Jorge preparó la comida. Berta llevó frutas frescas del mercado. Pero esa noche, cuando la fiesta ya comenzaba, llegó un grupo de hombres que nadie conocía. Los hombres entraban al salón cuando el Sr. Sandoval los detuvo en la puerta. Les preguntó quiénes eran y por qué venían. Los hombres no pudieron responder bien. Sandoval llamó a la policía en secreto. La policía llegó rápido y se llevó a los hombres. La fiesta continuó sin problemas y Mónica pudo celebrar su quinceañera en paz.`,
    [
      q('¿De quién era la quinceañera?', ['De Vanesa', 'De Julieta', 'De Berta', 'De Mónica'], 3, 'La quinceañera era de Mónica.'),
      q('¿Qué hizo Jorge para ayudar con la fiesta?', ['Decoró el salón', 'Preparó la comida', 'Trajo frutas del mercado', 'Tocó música'], 1, 'Jorge preparó la comida para la fiesta.'),
      q('¿Cómo reaccionó el Sr. Sandoval ante los hombres desconocidos?', ['Los invitó a entrar', 'Los ignoró', 'Los detuvo en la puerta y llamó a la policía', 'Les pidió documentos'], 2, 'Sandoval los detuvo en la puerta y llamó a la policía en secreto.'),
    ],
    'Describe el papel de cada personaje en la fiesta de quinceañera. ¿Quién fue el más importante esa noche y por qué?'
  ),

  // ── Version 10 ──────────────────────────────────────────────────────────────
  r(
    `Después de muchas aventuras, el barrio por fin tenía paz. El cártel ya no molestaba a los vecinos. Un periodista llegó al barrio para escribir un artículo sobre lo que pasó. Él habló con Julieta, Jorge, Berta, Susana y Riky. Cada persona le contó su versión de los eventos. Julieta le explicó cómo empezó todo en el mercado. Jorge habló de su trabajo en el café y cómo ayudó a Vanesa. Berta describió cómo identificó al espía del cártel. Susana explicó la importancia de la comunidad. Riky dijo que la experiencia lo hizo más valiente. El periodista escribió un artículo largo y emocionante. El artículo apareció en el periódico nacional y el barrio se hizo famoso por su valentía.`,
    [
      q('¿Para qué llegó el periodista al barrio?', ['Para vivir allí', 'Para buscar al cártel', 'Para escribir un artículo sobre lo que pasó', 'Para hablar con la policía'], 2, 'El periodista llegó para escribir un artículo sobre los eventos.'),
      q('¿Qué dijo Riky sobre la experiencia?', ['Que fue terrible y peligrosa', 'Que quería olvidar todo', 'Que lo hizo más valiente', 'Que fue culpa de Sandoval'], 2, 'Riky dijo que la experiencia lo hizo más valiente.'),
      q('¿Dónde apareció el artículo del periodista?', ['En una revista local', 'En el internet', 'En el periódico nacional', 'En la radio'], 2, 'El artículo apareció en el periódico nacional.'),
    ],
    'Imagina que eres el periodista. Escribe un breve resumen del artículo usando la información del texto. ¿Cuál es el mensaje principal de la historia?'
  ),

  // ── Version 11 ──────────────────────────────────────────────────────────────
  r(
    `Vanesa trabajaba todos los días en el puesto de su madre en el mercado. Siempre llevaba ropa humilde porque su familia no tenía mucho dinero. Un día, mientras organizaba las frutas del puesto, vio a un hombre misterioso que la miraba con mucha atención. El hombre no compraba nada — solo observaba y hacía preguntas raras sobre la gente del barrio. Vanesa se puso nerviosa y llamó a su madre. Su madre salió del puesto y le preguntó al hombre qué quería. El hombre no respondió y se fue rápidamente por el mercado. Esa noche, Vanesa le contó todo a su amiga Mónica. Mónica era una chica muy comprensiva y escuchó a Vanesa con mucha atención. Las dos decidieron que era importante tener cuidado. Al día siguiente, Vanesa llegó al mercado con más precaución y vigiló todo.`,
    [
      q('¿Cómo era la ropa de Vanesa?', ['Elegante y cara', 'Humilde y sencilla', 'Del uniforme del cártel', 'Muy colorida'], 1, 'Vanesa siempre llevaba ropa humilde porque su familia no tenía mucho dinero.'),
      q('¿Qué hacía el hombre misterioso en el mercado?', ['Compraba mucha fruta', 'Hablaba con la policía', 'Solo observaba y hacía preguntas raras sobre la gente', 'Buscaba a Mónica'], 2, 'El hombre no compraba nada — solo observaba y hacía preguntas raras sobre la gente del barrio.'),
      q('¿Cómo ayudó Mónica a Vanesa?', ['Le dio dinero', 'La escuchó con atención y comprensión', 'Llamó a la policía', 'Habló con el hombre misterioso'], 1, 'Mónica era muy comprensiva y escuchó a Vanesa con mucha atención.'),
    ],
    '¿Cómo reaccionó Vanesa ante el peligro en el mercado? ¿Fue una reacción inteligente? Explica con detalles del texto.'
  ),

  // ── Version 12 ──────────────────────────────────────────────────────────────
  r(
    `Todo el barrio sabía que Riky era muy guapo y popular con las chicas. Él siempre sonreía y saludaba a todos cuando caminaba por el mercado. Pero Riky tenía un secreto peligroso que nadie conocía — no era honesto sobre su verdadera identidad. Una tarde, Julieta lo vio hablando en secreto con dos hombres que parecían muy peligrosos. Julieta se escondió detrás de un puesto y los observó. Los hombres le dieron a Riky un sobre con dinero. Riky tomó el sobre y lo guardó rápidamente en su chaqueta. Julieta no podía creer lo que veía. Cuando los hombres se fueron, ella confrontó a Riky directamente. Riky se puso muy nervioso y negó todo. Julieta no le creyó porque ella siempre supo que Riky guardaba secretos. Esa noche, Julieta lloró sola porque no sabía qué hacer.`,
    [
      q('¿Cómo era la reputación de Riky en el barrio?', ['Era conocido como honesto y serio', 'Era muy guapo y popular con las chicas', 'Era tímido y no hablaba con nadie', 'Era trabajador del mercado'], 1, 'Todo el barrio sabía que Riky era muy guapo y popular con las chicas.'),
      q('¿Qué vio Julieta que fue sospechoso?', ['A Riky robando del mercado', 'A Riky recibir un sobre de dinero de dos hombres peligrosos', 'A Riky hablar con la policía', 'A Riky entrar al apartamento de Jorge'], 1, 'Los hombres le dieron a Riky un sobre con dinero que él guardó en su chaqueta.'),
      q('¿Cómo reaccionó Riky cuando Julieta lo confrontó?', ['Admitió todo y pidió ayuda', 'Llamó a la policía', 'Se puso nervioso y negó todo', 'Se fue sin decir nada'], 2, 'Riky se puso muy nervioso y negó todo cuando Julieta lo confrontó.'),
    ],
    'Imagina que eres Julieta. Después de descubrir el secreto de Riky, ¿qué harías? Explica tu decisión.'
  ),

  // ── Version 13 ──────────────────────────────────────────────────────────────
  r(
    `El taxista era conocido en el barrio por tener el coche más rápido de la ciudad. Le gustaba conducir a alta velocidad por las calles y siempre llegaba a su destino muy rápido. Un viernes por la noche, el taxista llevaba a unos pasajeros al centro de la ciudad. Iba a una velocidad muy peligrosa y no miraba bien la calle. De repente, un perro cruzó la calle corriendo. El taxista giró el volante bruscamente para no golpear al perro, pero su coche chocó con otro coche en la avenida principal. El accidente fue muy fuerte y la gente del barrio salió a ver qué pasó. La señora del puesto, que siempre estaba nerviosa y no quería problemas, cerró su negocio inmediatamente. La policía llegó e investigó el accidente. El taxista tuvo que explicar todo lo que pasó esa noche.`,
    [
      q('¿Por qué era famoso el taxista en el barrio?', ['Por ser muy amable con la gente', 'Por tener el coche más rápido de la ciudad', 'Por conocer a todos los vecinos', 'Por trabajar para el cártel'], 1, 'El taxista era conocido por tener el coche más rápido de la ciudad.'),
      q('¿Qué causó el accidente del taxista?', ['Se quedó dormido manejando', 'Iba muy rápido y giró para no golpear un perro', 'El cártel dañó su coche', 'Chocó con el coche de Jorge'], 1, 'Iba a velocidad peligrosa y giró el volante para no golpear a un perro, chocando con otro coche.'),
      q('¿Cómo reaccionó la señora del puesto al escuchar el accidente?', ['Salió a ayudar a las víctimas', 'Llamó a la policía', 'Cerró su negocio inmediatamente', 'Continuó trabajando sin miedo'], 2, 'La señora, que siempre estaba nerviosa y no quería problemas, cerró su negocio inmediatamente.'),
    ],
    'Describe el accidente del taxista. ¿Quién fue responsable? Usa detalles del texto para apoyar tu respuesta.'
  ),

  // ── Version 14 ──────────────────────────────────────────────────────────────
  r(
    `Julieta adoraba a su papá Jorge con todo su corazón. Cuando cumplió quince años, Jorge quería darle la mejor quinceañera de su vida. Durante semanas, Jorge ahorró todo su dinero en efectivo porque nunca guardaba su dinero en el banco. Compró flores, decoraciones y comida para la fiesta. Julieta ayudó a organizar la lista de invitados con mucha emoción. Vanesa, Mónica y Berta prometieron venir a ayudar con los preparativos. El día de la fiesta, todos decoraron el salón juntos. Pero esa tarde, mientras Jorge ponía las últimas decoraciones, recibió una llamada misteriosa. La voz en el teléfono era del cártel — querían eliminar a Jorge y a su familia. Jorge no le dijo nada a Julieta porque no quería arruinar su celebración. Fue la noche más difícil y más hermosa de su vida al mismo tiempo.`,
    [
      q('¿Cómo guardaba Jorge el dinero para la quinceañera?', ['Lo guardaba en el banco', 'Lo guardaba con el Sr. Sandoval', 'Lo guardaba en efectivo porque no tenía cuenta bancaria', 'Lo guardaba con Susana'], 2, 'Jorge ahorró el dinero en efectivo porque nunca guardaba su dinero en el banco.'),
      q('¿Quiénes prometieron ayudar con los preparativos?', ['Riky, Edgar y el taxista', 'Vanesa, Mónica y Berta', 'Susana, Sandoval y Berta', 'Solo Vanesa y Mónica'], 1, 'Vanesa, Mónica y Berta prometieron venir a ayudar con los preparativos.'),
      q('¿Por qué Jorge no le contó a Julieta sobre la llamada del cártel?', ['Porque no le importaba', 'Porque no quería arruinar la celebración de su hija', 'Porque no creyó que era real', 'Porque ya llamó a la policía'], 1, 'Jorge no le dijo nada a Julieta porque no quería arruinar su celebración.'),
    ],
    '¿Por qué crees que Jorge no le dijo nada a Julieta sobre la llamada del cártel? ¿Fue una buena decisión de su parte?'
  ),

  // ── Version 15 ──────────────────────────────────────────────────────────────
  r(
    `Edgar era conocido en el barrio como un joven tranquilo y callado. Siempre caminaba con la cabeza baja y no hablaba mucho con nadie. Pero nadie sabía que Edgar trabajaba para el cártel. Era violento y peligroso, aunque no lo parecía por fuera. El cártel le ordenó a Edgar que vigilara el mercado donde trabajaba Vanesa. Edgar llegó al mercado y comenzó a observar todo con atención. Pero cuando vio a Vanesa ayudando a una señora mayor con sus bolsas pesadas, algo cambió dentro de él. Recordó a su propia madre y sintió vergüenza por lo que hacía. En ese momento, Edgar decidió no cumplir la orden del cártel. Esa noche, llamó a la señora Susana y le confesó todo lo que sabía. Susana lo escuchó sin juzgarlo y le prometió ayudar. Fue la primera vez que Edgar pidió ayuda.`,
    [
      q('¿Cómo era la imagen que Edgar daba a los demás?', ['Violento y agresivo con todos', 'Tranquilo y callado — nadie sabía la verdad', 'Popular y simpático como Riky', 'Trabajador y humilde como Vanesa'], 1, 'Edgar era conocido como tranquilo y callado, aunque en realidad trabajaba para el cártel.'),
      q('¿Qué cambió la decisión de Edgar de cumplir la orden?', ['Un mensaje del cártel', 'Ver a Vanesa ayudar a una señora mayor y recordar a su madre', 'Una llamada de Jorge', 'La llegada de la policía al mercado'], 1, 'Ver a Vanesa ayudar a una señora y recordar a su propia madre hizo que Edgar cambiara de decisión.'),
      q('¿Qué hizo Edgar después de cambiar de decisión?', ['Huyó del barrio', 'Llamó al cártel para negociar', 'Llamó a Susana y le confesó todo lo que sabía', 'Habló con Jorge directamente'], 2, 'Edgar llamó a la señora Susana esa noche y le confesó todo lo que sabía.'),
    ],
    '¿Crees que Edgar hizo lo correcto al confesar a Susana? ¿Por qué fue difícil tomar esa decisión? Explica con detalles.'
  ),

  // ── Version 16 ──────────────────────────────────────────────────────────────
  r(
    `Susana era una mujer muy trabajadora que tenía su propio restaurante en Ciudad Juárez. Todos los días abría el restaurante a las siete de la mañana y cerraba muy tarde. Sus clientes favoritos eran los vecinos del barrio. Un martes por la tarde, dos hombres que parecían muy peligrosos entraron al restaurante y pidieron una mesa. Susana los reconoció inmediatamente porque ya los había visto antes en el mercado. Los hombres hablaban en voz muy baja y miraban mucho a la calle. Susana les sirvió la comida sin mostrar miedo, pero por dentro estaba muy asustada. Escuchó todo lo que pudieron decir. Cuando los hombres se fueron, Susana llamó al Sr. Sandoval y le describió todo lo que oyó. Sandoval le agradeció mucho la información. Susana respiró profundo y volvió a trabajar como si nada hubiera pasado.`,
    [
      q('¿Dónde trabajaba Susana?', ['En el mercado con su familia', 'En la escuela con el Sr. Sandoval', 'En su propio restaurante en Ciudad Juárez', 'En la oficina de policía'], 2, 'Susana era una mujer trabajadora que tenía su propio restaurante en Ciudad Juárez.'),
      q('¿Cómo actuó Susana cuando los hombres del cártel llegaron al restaurante?', ['Llamó a la policía inmediatamente', 'Les sirvió la comida sin mostrar miedo aunque estaba asustada', 'Les pidió que se fueran', 'Cerró el restaurante y se fue'], 1, 'Susana les sirvió la comida sin mostrar miedo, pero por dentro estaba muy asustada.'),
      q('¿A quién llamó Susana después de que los hombres se fueron?', ['A la policía federal', 'A Jorge y Julieta', 'Al Sr. Sandoval', 'A Berta del mercado'], 2, 'Cuando los hombres se fueron, Susana llamó al Sr. Sandoval y le describió todo.'),
    ],
    'Describe cómo Susana manejó una situación muy peligrosa. ¿Qué características de su personalidad demostró ese día?'
  ),

  // ── Version 17 ──────────────────────────────────────────────────────────────
  r(
    `Berta y la señora del puesto trabajaban en el mercado desde hacía muchos años. Las dos mujeres se conocían bien y siempre se ayudaban. La señora siempre estaba nerviosa porque no quería problemas en su puesto. Berta, en cambio, era más valiente y observaba todo con mucha atención. Un miércoles por la mañana, Berta notó que alguien había movido los objetos de su puesto durante la noche. La señora del puesto también encontró una nota pegada en su caja registradora. Las dos mujeres leyeron la nota juntas. La nota decía que debían cerrar sus puestos o sufrir las consecuencias. La señora quería cerrar inmediatamente por miedo, pero Berta la convenció de no rendirse. Berta tomó la nota y fue directamente a hablar con Jorge. Jorge la escuchó con mucha seriedad. Supo inmediatamente que el cártel estaba detrás de todo.`,
    [
      q('¿Cómo eran diferentes Berta y la señora del puesto?', ['Las dos eran muy nerviosas y miedosas', 'Las dos eran valientes e ignoraban los peligros', 'Berta era valiente; la señora siempre estaba nerviosa', 'Berta era nerviosa; la señora era valiente'], 2, 'La señora siempre estaba nerviosa y no quería problemas; Berta era más valiente y observadora.'),
      q('¿Qué encontraron las dos mujeres en el mercado?', ['Dinero escondido en el suelo', 'Una nota amenazante y objetos movidos en sus puestos', 'Un miembro del cártel durmiendo', 'Una carta de la policía'], 1, 'Berta notó objetos movidos en su puesto; la señora encontró una nota amenazante en su caja.'),
      q('¿Qué hizo Berta con la nota amenazante?', ['La destruyó para no causar problemas', 'Se la dio al Sr. Sandoval', 'Fue directamente a hablar con Jorge', 'La reportó a la policía ella misma'], 2, 'Berta tomó la nota y fue directamente a hablar con Jorge, quien reconoció la amenaza del cártel.'),
    ],
    'Compara las reacciones de Berta y la señora del puesto ante la amenaza. ¿Cuál de las dos tomó la mejor decisión? Explica.'
  ),

  // ── Version 18 ──────────────────────────────────────────────────────────────
  r(
    `El Sr. Sandoval trabajaba en el mercado todos los días con su hija Carmen. Pero Sandoval no respetaba a su hija como debía — siempre le daba las tareas más difíciles y nunca le decía que hacía un buen trabajo. Carmen era una chica inteligente y muy trabajadora. Soñaba con ir a la universidad pero su padre no apoyaba sus sueños. Un día, Jorge pasó por el mercado y escuchó a Sandoval criticar a Carmen en frente de todos los clientes. Jorge se molestó mucho porque él adoraba a su hija Julieta y sabía la importancia del respeto familiar. Después del mercado, Jorge habló con Sandoval en privado. Le explicó con calma que Carmen era una persona valiosa y merecía respeto. Sandoval se puso a la defensiva al principio, pero esa noche reflexionó mucho. Al día siguiente, Sandoval le pidió disculpas a Carmen. Fue la primera vez en su vida que lo hizo.`,
    [
      q('¿Cómo trataba el Sr. Sandoval a su hija Carmen?', ['La respetaba y apoyaba siempre', 'Le daba las tareas fáciles y la elogiaba', 'No la respetaba y nunca reconocía su trabajo', 'No trabajaba con ella en el mercado'], 2, 'Sandoval no respetaba a su hija: le daba las tareas difíciles y nunca le decía buen trabajo.'),
      q('¿Por qué le importó tanto a Jorge lo que vio en el mercado?', ['Porque Jorge conocía a Carmen desde niña', 'Porque Jorge adoraba a su hija Julieta y valoraba el respeto familiar', 'Porque Jorge trabajaba con Sandoval todos los días', 'Porque el cártel amenazó a la familia de Sandoval'], 1, 'Jorge adoraba a su hija Julieta y sabía la importancia del respeto familiar, por eso le afectó ver esa situación.'),
      q('¿Qué hizo Sandoval al final de la historia?', ['Ignoró el consejo de Jorge completamente', 'Despidió a su hija del mercado', 'Le pidió disculpas a Carmen por primera vez', 'Fue a hablar con la policía sobre el cártel'], 2, 'Después de reflexionar, Sandoval le pidió disculpas a Carmen. Fue la primera vez en su vida.'),
    ],
    '¿Qué cambio importante ocurrió en la relación entre Sandoval y Carmen? ¿Qué papel tuvo Jorge en ese cambio?'
  ),

  // ── Version 19 ──────────────────────────────────────────────────────────────
  r(
    `Antes de escapar del cártel, Jorge era un policía muy honesto y dedicado. Vivía en México D.F. con su familia y trabajaba muy duro todos los días. Tenía un apartamento pequeño pero lo hacía sentir seguro. No guardaba su dinero en el banco — siempre lo guardaba en efectivo en su apartamento, debajo de las escaleras secretas que había construido debajo de su sofá. Un año, Jorge investigó un caso muy peligroso relacionado con el cártel. Descubrió información muy importante y la reportó a sus superiores. Pero uno de sus superiores trabajaba secretamente para el cártel y vendió la información. El cártel decidió eliminar a Jorge y a toda su familia. Jorge no tenía otra opción: tomó su dinero en efectivo, dejó su trabajo y corrió del cártel con su hija Julieta. Fue la decisión más difícil y más valiente de su vida.`,
    [
      q('¿Dónde vivía Jorge antes de escapar del cártel?', ['En Ciudad Juárez con Susana', 'En el barrio cerca del mercado', 'En México D.F. con su familia', 'En Guadalajara con su madre'], 2, 'Jorge vivía en México D.F. con su familia cuando trabajaba como policía.'),
      q('¿Por qué el cártel decidió eliminar a Jorge?', ['Porque Jorge robó dinero del cártel', 'Porque Jorge descubrió información sobre el cártel y la reportó', 'Porque Jorge era amigo de Riky', 'Porque Jorge no pagó sus deudas'], 1, 'Jorge investigó al cártel, descubrió información importante y la reportó, por eso el cártel lo quería eliminar.'),
      q('¿Qué había construido Jorge debajo de su sofá?', ['Una caja fuerte de metal', 'Un escondite con su dinero del banco', 'Escaleras secretas para guardar su dinero en efectivo', 'Un sistema de alarma'], 2, 'Jorge tenía escaleras secretas debajo de su sofá donde guardaba su dinero en efectivo.'),
    ],
    'Describe los sacrificios que hizo Jorge para proteger a su familia. ¿Por qué fue tan valiente su decisión de escapar?'
  ),

  // ── Version 20 ──────────────────────────────────────────────────────────────
  r(
    `Mónica era la persona más comprensiva del barrio y todo el mundo la quería. Siempre escuchaba los problemas de los demás y daba consejos útiles. Después de todos los problemas con el cártel, el barrio estaba muy afectado y necesitaba sanar. Mónica tuvo una idea: organizó una reunión en el mercado para que todos pudieran hablar y escucharse. Llegaron Vanesa, Berta, Susana, Jorge, Julieta y muchos vecinos más. Cada persona habló sobre sus experiencias con el cártel. Algunos lloraron, otros se enojaron, pero todos escucharon con respeto. Al final de la reunión, el grupo decidió crear un plan de seguridad para proteger el barrio. Jorge compartió sus conocimientos de cuando trabajaba como policía. Susana ofreció su restaurante como punto de reunión mensual. Berta prometió vigilar el mercado cada día. Gracias a Mónica y su iniciativa, la comunidad se unió como nunca antes.`,
    [
      q('¿Por qué organizó Mónica la reunión?', ['Para celebrar el fin del peligro del cártel', 'Para planear una fiesta de quinceañera', 'Porque el barrio necesitaba sanar y unirse después del peligro', 'Para hablar sobre los precios del mercado'], 2, 'Después de todos los problemas con el cártel, el barrio estaba afectado y Mónica organizó la reunión para sanar.'),
      q('¿Qué aportó Jorge al plan de seguridad del barrio?', ['Dinero de sus ahorros en efectivo', 'Sus conocimientos de cuando trabajaba como policía', 'Su apartamento como refugio', 'Una conexión directa con la policía federal'], 1, 'Jorge compartió sus conocimientos de cuando trabajaba como policía.'),
      q('¿Qué prometió ofrecer Susana para la comunidad?', ['Comida gratis en su restaurante', 'Su restaurante como punto de reunión mensual', 'Clases de defensa personal', 'Dinero para pagar a la policía'], 1, 'Susana ofreció su restaurante como punto de reunión mensual para el grupo.'),
    ],
    '¿Por qué es Mónica una figura tan importante para la comunidad? ¿Qué cualidades tiene? Usa ejemplos específicos del texto.'
  ),

];

/**
 * Returns the reading for the given version (1-based).
 * Version is clamped to [1, READINGS.length].
 */
function getReading(version) {
  const idx = Math.max(0, Math.min(version - 1, READINGS.length - 1));
  return READINGS[idx];
}

module.exports = { getReading, READINGS };
