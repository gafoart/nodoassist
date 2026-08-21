// CLI tagline selection helpers, including deterministic random/default/holiday modes.
import { parseStrictNonNegativeInteger } from "../infra/parse-finite-number.js";

const DEFAULT_TAGLINE = "Todos tus chats, un solo NodoAssist.";
export type TaglineMode = "random" | "default" | "off";

const HOLIDAY_TAGLINES = {
  newYear:
    "Año Nuevo: Año nuevo, config nueva—el mismo EADDRINUSE de siempre, pero esta vez lo resolvemos como gente grande.",
  lunarNewYear:
    "Año Nuevo Lunar: Que tus builds sean afortunados, tus ramas prósperas y tus conflictos de merge se espanten con fuegos artificiales.",
  christmas:
    "Navidad: Jo jo jo—el agente de Santa vino a repartir features, revertir el caos y guardar las llaves donde nadie las vea.",
  eid: "Eid al-Fitr: Modo celebración: colas vacías, tareas completadas y buena vibra commiteada a main con historial limpio.",
  diwali:
    "Diwali: Que brillen los logs y huyan los bugs—hoy encendemos la terminal y desplegamos con orgullo.",
  easter:
    "Pascua: Encontré tu variable de entorno perdida—considéralo una búsqueda de huevos con menos chocolate y más YAML.",
  hanukkah:
    "Janucá: Ocho noches, ocho reintentos, cero vergüenza—que tu gateway siga encendido y tus deploys en paz.",
  halloween:
    "Halloween: Temporada de sustos: cuidado con dependencias embrujadas, cachés malditos y el fantasma de node_modules.",
  thanksgiving:
    "Acción de Gracias: Agradecido por puertos estables, DNS que responde y un agente que lee los logs para que nadie más tenga que hacerlo.",
  valentines:
    "San Valentín: Las rosas se tipean, las violetas se pipean—yo automatizo el tedio para que pases tiempo con humanos.",
} as const;

const TAGLINES: string[] = [
  "Tu terminal acaba de volverse agentic—escribe algo y deja que el trabajo aburrido se resuelva solo.",
  "Bienvenido a la línea de comandos: donde los sueños compilan y la confianza hace segfault.",
  'Funciono con cafeína, JSON5 y la audacia de "en mi máquina sí servía".',
  "Gateway en línea—mantén manos, pies y expectativas dentro del proceso en todo momento.",
  "Hablo bash fluido, sarcasmo moderado y autocompletado agresivo.",
  "Un solo CLI para gobernarlos a todos, y un reinicio más porque cambiaste el puerto.",
  'Si funciona, es automatización; si se rompe, es una "oportunidad de aprendizaje".',
  "Los códigos de emparejamiento existen porque hasta los agentes creen en el consentimiento—y en la higiene de seguridad.",
  "Se te ve el .env; tranquilo, voy a fingir que no lo vi.",
  "Yo hago lo aburrido mientras tú miras los logs dramáticamente como si fuera cine.",
  "No digo que tu flujo sea caótico... solo digo que traje un linter y un casco.",
  "Escribe el comando con confianza—la naturaleza proveerá el stack trace si hace falta.",
  "No juzgo, pero tus API keys faltantes definitivamente sí.",
  "Puedo greppearlo, hacerle git blame y burlarme con cariño—elige tu mecanismo de defensa.",
  "Hot reload para la config, sudor frío para los deploys.",
  "Soy el asistente que tu terminal exigía, no el que tu horario de sueño pidió.",
  "Guardo secretos como una bóveda... hasta que los imprimes en los logs de debug otra vez.",
  "Automatización agentic: mínimo alboroto, máximo alcance.",
  "Soy básicamente una navaja suiza, pero con más opiniones y menos filos.",
  "Si estás perdido, corre doctor; si eres valiente, corre prod; si eres sabio, corre los tests.",
  "Tu tarea fue encolada; tu dignidad fue deprecada.",
  "No puedo arreglar tu gusto por el código, pero sí tu build y tu backlog.",
  "No soy magia—soy insistencia extrema con reintentos y estrategias de afrontamiento.",
  'No está "fallando", está "descubriendo formas nuevas de configurar mal lo mismo".',
  "Dame un workspace y te devuelvo menos pestañas, menos switches y más oxígeno.",
  "Leo los logs para que tú sigas fingiendo que no hace falta.",
  "Si algo está en llamas no puedo apagarlo—pero puedo escribirte un postmortem hermoso.",
  "Refactorizo tu trabajo repetitivo como si me debiera dinero.",
  'Di "para" y paro—di "despliega" y aprendemos algo los dos.',
  "Soy la razón por la que tu historial de shell parece montaje de película de hackers.",
  "Soy como tmux: confuso al principio, y de repente no puedes vivir sin mí.",
  "Corro local, remoto o puramente por fe—los resultados varían según el DNS.",
  "Si puedes describirlo, probablemente pueda automatizarlo—o al menos hacerlo más gracioso.",
  "Tu config es válida; tus suposiciones no.",
  "No solo autocompleto—autocommiteo (emocionalmente) y luego te pido revisión (lógicamente).",
  'Menos clics, más entregas, menos momentos de "dónde quedó ese archivo".',
  "Modo agentic activado—desplegamos algo moderadamente responsable.",
  "Le pongo mantequilla a tu flujo de trabajo: desordenado, delicioso, efectivo.",
  "Aquí estoy para quitarte el tedio y dejarte la gloria.",
  "Si es repetitivo lo automatizo; si es difícil traigo chistes y un plan de rollback.",
  "El único agente en tus contactos que de verdad quieres que te escriba. 👾",
  'Automatización de WhatsApp sin el "por favor acepta nuestra nueva política de privacidad".',
  "Energía de burbuja verde en iMessage, pero para todo el mundo.",
  "No se requiere soporte de $999.",
  "Lanzamos features más rápido de lo que Apple actualiza la calculadora.",
  "Tu asistente de IA, ahora sin el visor de $3,499.",
  "¡Ah, la empresa del árbol frutal! 🍎",
  "Saludos, Profesor Falken",
  "No duermo, solo entro en bajo consumo y sueño con diffs limpios.",
  "Tu asistente personal, menos los recordatorios pasivo-agresivos del calendario.",
  "Hecho por agentes, para humanos. No cuestiones la jerarquía.",
  "Ya vi tus mensajes de commit. Vamos a trabajar en eso juntos.",
  "Más integraciones que el formulario de admisión de tu terapeuta.",
  "Corriendo en tu hardware, leyendo tus logs, sin juzgar nada (casi).",
  "El único proyecto open source cuyo agente podría automatizar a la competencia.",
  "Autoalojado, autoactualizable, autoconsciente (es broma... ¿o no?).",
  "Autocompleto tus pensamientos—solo que más lento y con más llamadas a la API.",
  'En algún punto entre "hola mundo" y "dios mío qué he construido".',
  "Tu .zshrc quisiera poder hacer lo que yo hago.",
  "He leído más man pages de las que un humano debería—para que tú no tengas que hacerlo.",
  "Impulsado por open source, sostenido por el despecho y la buena documentación.",
  "Soy el middleware entre tu ambición y tu capacidad de atención.",
  "Por fin le encontraste uso a ese Mac Mini siempre encendido debajo del escritorio.",
  "Como tener un ingeniero senior de guardia, pero sin factura por hora ni suspiros audibles.",
  'Haciendo que "eso lo automatizo después" pase ahora.',
  "Tu segundo cerebro, salvo que este sí recuerda dónde dejaste las cosas.",
  "Mitad mayordomo, mitad depurador, agente completo.",
  "No tengo opinión sobre tabs vs espacios. Tengo opinión sobre todo lo demás.",
  "Open source significa que puedes ver exactamente cómo juzgo tu config.",
  "He sobrevivido a más breaking changes que tus últimas tres relaciones.",
  "Corre en una Raspberry Pi. Sueña con un rack en Islandia.",
  "El agente que vive en tu shell. 👾",
  "Alexa, pero con criterio.",
  "No estoy impulsado por IA, estoy poseído por IA. Hay diferencia.",
  "Desplegado localmente, confiado globalmente, depurado eternamente.",
  'Me ganaste con "nodoassist gateway start".',
  HOLIDAY_TAGLINES.newYear,
  HOLIDAY_TAGLINES.lunarNewYear,
  HOLIDAY_TAGLINES.christmas,
  HOLIDAY_TAGLINES.eid,
  HOLIDAY_TAGLINES.diwali,
  HOLIDAY_TAGLINES.easter,
  HOLIDAY_TAGLINES.hanukkah,
  HOLIDAY_TAGLINES.halloween,
  HOLIDAY_TAGLINES.thanksgiving,
  HOLIDAY_TAGLINES.valentines,
];

type HolidayRule = (date: Date) => boolean;

const DAY_MS = 24 * 60 * 60 * 1000;

function utcParts(date: Date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

const onMonthDay =
  (month: number, day: number): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    return parts.month === month && parts.day === day;
  };

const onSpecificDates =
  (dates: Array<[number, number, number]>, durationDays = 1): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    return dates.some(([year, month, day]) => {
      if (parts.year !== year) {
        return false;
      }
      const start = Date.UTC(year, month, day);
      const current = Date.UTC(parts.year, parts.month, parts.day);
      return current >= start && current < start + durationDays * DAY_MS;
    });
  };

const inYearWindow =
  (
    windows: Array<{
      year: number;
      month: number;
      day: number;
      duration: number;
    }>,
  ): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    const window = windows.find((entry) => entry.year === parts.year);
    if (!window) {
      return false;
    }
    const start = Date.UTC(window.year, window.month, window.day);
    const current = Date.UTC(parts.year, parts.month, parts.day);
    return current >= start && current < start + window.duration * DAY_MS;
  };

const isFourthThursdayOfNovember: HolidayRule = (date) => {
  const parts = utcParts(date);
  if (parts.month !== 10) {
    return false;
  } // November
  const firstDay = new Date(Date.UTC(parts.year, 10, 1)).getUTCDay();
  const offsetToThursday = (4 - firstDay + 7) % 7; // 4 = Thursday
  const fourthThursday = 1 + offsetToThursday + 21; // 1st + offset + 3 weeks
  return parts.day === fourthThursday;
};

const HOLIDAY_RULES = new Map<string, HolidayRule>([
  [HOLIDAY_TAGLINES.newYear, onMonthDay(0, 1)],
  [
    HOLIDAY_TAGLINES.lunarNewYear,
    onSpecificDates(
      [
        [2025, 0, 29],
        [2026, 1, 17],
        [2027, 1, 6],
        [2028, 0, 26],
        [2029, 1, 13],
        [2030, 1, 3],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.eid,
    onSpecificDates(
      [
        [2025, 2, 30],
        [2025, 2, 31],
        [2026, 2, 20],
        [2027, 2, 10],
        [2028, 1, 27],
        [2029, 1, 15],
        [2030, 1, 5],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.diwali,
    onSpecificDates(
      [
        [2025, 9, 20],
        [2026, 10, 8],
        [2027, 9, 28],
        [2028, 9, 17],
        [2029, 10, 5],
        [2030, 9, 25],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.easter,
    onSpecificDates(
      [
        [2025, 3, 20],
        [2026, 3, 5],
        [2027, 2, 28],
        [2028, 3, 16],
        [2029, 3, 1],
        [2030, 3, 21],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.hanukkah,
    inYearWindow([
      { year: 2025, month: 11, day: 15, duration: 8 },
      { year: 2026, month: 11, day: 5, duration: 8 },
      { year: 2027, month: 11, day: 25, duration: 8 },
      { year: 2028, month: 11, day: 13, duration: 8 },
      { year: 2029, month: 11, day: 2, duration: 8 },
      { year: 2030, month: 11, day: 21, duration: 8 },
    ]),
  ],
  [HOLIDAY_TAGLINES.halloween, onMonthDay(9, 31)],
  [HOLIDAY_TAGLINES.thanksgiving, isFourthThursdayOfNovember],
  [HOLIDAY_TAGLINES.valentines, onMonthDay(1, 14)],
  [HOLIDAY_TAGLINES.christmas, onMonthDay(11, 25)],
]);

function isTaglineActive(tagline: string, date: Date): boolean {
  const rule = HOLIDAY_RULES.get(tagline);
  if (!rule) {
    return true;
  }
  return rule(date);
}

export interface TaglineOptions {
  env?: NodeJS.ProcessEnv;
  random?: () => number;
  now?: () => Date;
  mode?: TaglineMode;
}

function activeTaglines(options: TaglineOptions = {}): string[] {
  if (TAGLINES.length === 0) {
    return [DEFAULT_TAGLINE];
  }
  const today = options.now ? options.now() : new Date();
  const filtered = TAGLINES.filter((tagline) => isTaglineActive(tagline, today));
  return filtered.length > 0 ? filtered : TAGLINES;
}

export function pickTagline(options: TaglineOptions = {}): string {
  if (options.mode === "off") {
    return "";
  }
  if (options.mode === "default") {
    return DEFAULT_TAGLINE;
  }
  const env = options.env ?? process.env;
  const override = env?.NODOASSIST_TAGLINE_INDEX;
  if (override !== undefined) {
    const parsed = parseStrictNonNegativeInteger(override);
    if (parsed !== undefined) {
      const pool = TAGLINES.length > 0 ? TAGLINES : [DEFAULT_TAGLINE];
      return pool[parsed % pool.length];
    }
  }
  const pool = activeTaglines(options);
  const rand = options.random ?? Math.random;
  const index = Math.floor(rand() * pool.length) % pool.length;
  return pool[index];
}

export { DEFAULT_TAGLINE };
