/*
 * Contenido de la plataforma.
 * Fuentes:
 *   - "260915_Negociar_para_servir_V2.pptx" (Patricia Fuel): slides 8–27, incluidas las ocultas 13–16 y 21.
 *   - "Pruebas DISC.docx": instrucciones, 12 filas de palabras y regla de interpretación (escala 12–48, línea intermedia 30).
 * Los textos se transcriben tal cual aparecen en las fuentes.
 */

const ORDER = ["D", "I", "S", "C"];

const STYLES = {
  D: {
    letter: "D",
    name: "Dominancia",
    color: "#C0392B",
    img: "assets/lente-d.jpg",
    lema: "Quiero avanzar y ganar",
    desc: "Directo, rápido, pragmático y orientado al resultado.",
    valora: "Control, autonomía, resultados y velocidad. Opciones concretas y margen para decidir.",
    motiva: "Ganar, superar desafíos, decidir y sentir influencia sobre el resultado.",
    endurece: "Lentitud, rodeos, procesos sin decisión o sentir que pierde control.",
    comunicar: "Sé claro, focalizado y ofrece opciones.",
    tip: "No le vendas tranquilidad: muéstrale resultado, velocidad y capacidad de decisión.",
    sobreuso: "Su orientación al resultado puede convertirse en presión excesiva, confrontación o poca diplomacia.",
    sobreusoCorto: "Presión excesiva, confrontación y poca diplomacia.",
    ceder: [
      "Una alternativa que represente un mejor resultado.",
      "Opciones para elegir, en lugar de una única salida.",
      "Ver el costo de prolongar la negociación.",
    ],
    equipoLabel: "Dominancia alta",
    equipoRol: "Dirige, obtiene resultados",
  },
  I: {
    letter: "I",
    name: "Influencia",
    color: "#2A4D72",
    img: "assets/lente-i.jpg",
    lema: "Quiero conectar y entusiasmarme",
    desc: "Sociable, conversador, entusiasta y expresivo. Negocia a través de la relación.",
    valora: "Reconocimiento, relaciones, entusiasmo y participación. Sentirse escuchado y valorado.",
    motiva: "Las personas, las oportunidades, las ideas nuevas y el reconocimiento.",
    endurece: "Una interacción fría o técnica, sentirse ignorado, una conversación sin espacio para conversar.",
    comunicar: "Sé empático, entusiasta y flexible.",
    tip: "Primero conecta, después convence: una propuesta sin vínculo puede perder fuerza.",
    sobreuso: "El entusiasmo puede volverse exceso de confianza, dispersión, exageración o falta de seguimiento.",
    sobreusoCorto: "Ideas poco realistas, metas poco aterrizadas, celebrar antes de cerrar, minimizar riesgos.",
    ceder: [
      "Una propuesta que preserve la relación y lo haga sentir valorado.",
      "Beneficios visibles.",
      "Espacio para participar y aportar ideas.",
    ],
    equipoLabel: "Influencia alta",
    equipoRol: "Abre mercados, vende",
  },
  S: {
    letter: "S",
    name: "Solidez",
    color: "#1E8A63",
    img: "assets/lente-s.jpg",
    lema: "Quiero confianza y armonía",
    desc: "Paciente, conciliador, empático y buen escucha.",
    valora: "Armonía, estabilidad, confianza y relaciones. Acuerdos sostenibles y un proceso tranquilo.",
    motiva: "Colaborar, ayudar, sentir seguridad y llegar a soluciones que funcionen para las personas.",
    endurece: "Presión agresiva, cambios bruscos o sentir que el acuerdo deteriora la relación.",
    comunicar: "Sé paciente, cálido, estable y sincero.",
    tip: "La confianza abre la puerta al acuerdo; la presión puede cerrarla.",
    sobreuso: "Buscar armonía puede llevar a evitar conversaciones difíciles o ceder demasiado.",
    sobreusoCorto: "Evitar las conversaciones espinosas y los conflictos saludables.",
    ceder: [
      "Confianza construida antes de presionar el cierre.",
      "Ver que el acuerdo protege la relación.",
      "Tiempo para procesar el cambio.",
    ],
    equipoLabel: "Solidez alta",
    equipoRol: "Fideliza, presta servicio al cliente interno y externo",
  },
  C: {
    letter: "C",
    name: "Concienzudo",
    color: "#B8801A",
    img: "assets/lente-c.jpg",
    lema: "Necesito entender antes de comprometerme",
    desc: "Analítico, riguroso, formal y metódico.",
    valora: "Calidad, precisión, lógica y control de riesgos. Datos confiables y criterios claros.",
    motiva: "Resolver correctamente el problema y alcanzar una solución de calidad, no cerrar rápido.",
    endurece: "Información incompleta, promesas sin evidencia o presión para decidir sin análisis.",
    comunicar: "Sé específico, exacto y orientado al detalle.",
    tip: "No intentes acelerar su decisión: aumenta la calidad de la información que necesita para decidir.",
    sobreuso: "El análisis puede volverse exceso de cautela, incredulidad o parálisis.",
    sobreusoCorto: "Exceso de cautela, incredulidad y parálisis por análisis.",
    ceder: [
      "Evidencia sólida y criterios objetivos.",
      "Reducción clara de riesgos.",
      "Una propuesta estructurada que responda sus preguntas.",
    ],
    equipoLabel: "Control alto",
    equipoRol: "Administra, cuida el negocio",
  },
};

/* Slide 22 — "Cómo nos vemos entre lentes". SEES[quien_mira][a_quien] */
const SEES = {
  D: { D: "protegiendo su territorio", I: "demasiado políticos y dispersos", S: "muy sensibles a la presión", C: "demorados y cautelosos" },
  I: { D: "demasiado duros y directos", I: "ambos buscan protagonismo", S: "renuentes al cambio", C: "incrédulos y difíciles de complacer" },
  S: { D: "impositivos e intensos", I: "hacen demasiados cambios a la vez", S: "relación armoniosa", C: "fríos y distantes" },
  C: { D: "arriesgados, todo es para ya", I: "poco rigurosos y confiados", S: "demasiado democráticos", C: "argumentan con lógica" },
};

/* Word — 12 filas. Cada fila en orden de columna D, I, S, C. */
const ROWS = [
  ["Enérgico", "Vivaz", "Modesto", "Discreto"],
  ["Agresivo", "Emotivo", "Complaciente", "Constante"],
  ["Directo", "Animoso", "Agradable", "Acertado"],
  ["Tenaz", "Compasivo", "Dócil", "Perfeccionista"],
  ["Atrevido", "Impulsivo", "Amable", "Precavido"],
  ["Competitivo", "Expresivo", "Sustentador", "Preciso"],
  ["Arriesgado", "Hablador", "Relajado", "Objetivo"],
  ["Argumentador", "Divertido", "Paciente", "Lógico"],
  ["Audaz", "Espontáneo", "Estable", "Organizado"],
  ["Dirigente", "Optimista", "Apacible", "Concienzudo"],
  ["Decidido", "Alegre", "Leal", "Serio"],
  ["Independiente", "Entusiasta", "Buen oyente", "Altas normas"],
];

/* Orden de presentación de las 4 palabras en cada tarjeta (índices de columna).
   Se mezclan para que la persona no identifique la columna por la posición.
   No afecta el puntaje: cada palabra conserva su columna del documento. */
const DISPLAY_ORDER = [
  [1, 3, 0, 2], [2, 0, 3, 1], [3, 1, 2, 0], [0, 2, 1, 3],
  [1, 0, 3, 2], [3, 2, 0, 1], [2, 3, 1, 0], [0, 3, 2, 1],
  [1, 2, 3, 0], [3, 0, 1, 2], [2, 1, 0, 3], [0, 1, 3, 2],
];

/* Word — escala del gráfico "Perfil DISC" */
const SCALE = { min: 12, max: 48, mid: 30, total: 120 };
