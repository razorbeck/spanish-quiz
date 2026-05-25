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

  // ── Version 10 ─────────────────────────────────────────────────────────────
  r(
    `Después de muchas aventuras, el barrio por fin tenía paz. El cártel ya no molestaba a los vecinos. Un periodista llegó al barrio para escribir un artículo sobre lo que pasó. Él habló con Julieta, Jorge, Berta, Susana y Riky. Cada persona le contó su versión de los eventos. Julieta le explicó cómo empezó todo en el mercado. Jorge habló de su trabajo en el café y cómo ayudó a Vanesa. Berta describió cómo identificó al espía del cártel. Susana explicó la importancia de la comunidad. Riky dijo que la experiencia lo hizo más valiente. El periodista escribió un artículo largo y emocionante. El artículo apareció en el periódico nacional y el barrio se hizo famoso por su valentía.`,
    [
      q('¿Para qué llegó el periodista al barrio?', ['Para vivir allí', 'Para buscar al cártel', 'Para escribir un artículo sobre lo que pasó', 'Para hablar con la policía'], 2, 'El periodista llegó para escribir un artículo sobre los eventos.'),
      q('¿Qué dijo Riky sobre la experiencia?', ['Que fue terrible y peligrosa', 'Que quería olvidar todo', 'Que lo hizo más valiente', 'Que fue culpa de Sandoval'], 2, 'Riky dijo que la experiencia lo hizo más valiente.'),
      q('¿Dónde apareció el artículo del periodista?', ['En una revista local', 'En el internet', 'En el periódico nacional', 'En la radio'], 2, 'El artículo apareció en el periódico nacional.'),
    ],
    'Imagina que eres el periodista. Escribe un breve resumen del artículo usando la información del texto. ¿Cuál es el mensaje principal de la historia?'
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
