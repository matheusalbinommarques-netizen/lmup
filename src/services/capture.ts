import { addCalendarDays, calendarDate } from './calendar';

/**
 * Captura em linguagem natural (lote 5a). Lê do texto o dia, a hora e a
 * duração e devolve o título limpo e o destino, que a tela mostra antes de
 * confirmar ("Vai para: …"). Nada aqui grava; só interpreta.
 */
export type CaptureDestination =
  | { kind: 'today'; date: string }
  | { kind: 'day'; date: string }
  | { kind: 'inbox' }
  | { kind: 'someday' };

export type CaptureToken = {
  kind: 'date' | 'time' | 'duration' | 'someday';
  start: number;
  end: number;
  text: string;
};

export type Capture = {
  title: string;
  destination: CaptureDestination;
  plannedDate: string | null;
  someday: boolean;
  plannedTime: string | null;
  estimatedMinutes: number | null;
  tokens: CaptureToken[];
};

/** Sem dia na frase: 'inbox' (aba Sem dia) ou 'today' (captura do Hoje). */
export type CaptureFallback = 'inbox' | 'today';

const L = '(?<![\\p{L}\\p{N}])';
const R = '(?![\\p{L}\\p{N}])';
const rx = (body: string) => new RegExp(`${L}(?:${body})${R}`, 'iu');

const WEEKDAYS: [string, number][] = [
  ['dom(?:ingo)?', 0],
  ['seg(?:unda)?(?:-feira)?', 1],
  // "ter" sozinho é verbo ("ter que ligar"): só "terça".
  ['ter[çc]a(?:-feira)?', 2],
  ['qua(?:rta)?(?:-feira)?', 3],
  ['qui(?:nta)?(?:-feira)?', 4],
  ['sex(?:ta)?(?:-feira)?', 5],
  ['s[áa]b(?:ado)?', 6],
];
const PREFIX = '(?:(?:na|no|nesta|neste|pr[óo]xima|pr[óo]ximo)\\s+)?';

function weekday(key: string) {
  return new Date(`${key}T12:00:00Z`).getUTCDay();
}

/** "sex" é a próxima sexta; no próprio dia da semana, é hoje. */
function nextWeekday(today: string, target: number) {
  return addCalendarDays(today, (target - weekday(today) + 7) % 7);
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function validTime(hours: number, minutes: number) {
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
    ? `${pad(hours)}:${pad(minutes)}`
    : null;
}

function safeDate(year: number, month: number, dayOfMonth: number) {
  try {
    return calendarDate(`${year}-${pad(month)}-${pad(dayOfMonth)}`);
  } catch {
    return null;
  }
}

type Rule = {
  kind: CaptureToken['kind'];
  pattern: RegExp;
  read: (match: RegExpExecArray, today: string) => string | number | null;
};

function rules(): Rule[] {
  return [
    { kind: 'someday', pattern: rx('algum\\s+dia'), read: () => 'someday' },
    {
      kind: 'date',
      pattern: rx('depois\\s+de\\s+amanh[ãa]'),
      read: (_, today) => addCalendarDays(today, 2),
    },
    {
      kind: 'date',
      pattern: rx('amanh[ãa]'),
      read: (_, today) => addCalendarDays(today, 1),
    },
    { kind: 'date', pattern: rx('hoje'), read: (_, today) => today },
    {
      kind: 'date',
      pattern: rx('(?:dia\\s+)?(\\d{1,2})/(\\d{1,2})(?:/(\\d{4}))?'),
      read: (match, today) => {
        const year = match[3] ? Number(match[3]) : Number(today.slice(0, 4));
        const date = safeDate(year, Number(match[2]), Number(match[1]));
        if (!date || match[3]) return date;
        return date < today
          ? safeDate(year + 1, Number(match[2]), Number(match[1]))
          : date;
      },
    },
    {
      kind: 'date',
      pattern: rx('dia\\s+(\\d{1,2})'),
      read: (match, today) => {
        const year = Number(today.slice(0, 4));
        const month = Number(today.slice(5, 7));
        const target = Number(match[1]);
        const date = safeDate(year, month, target);
        if (date && date >= today) return date;
        return month === 12
          ? safeDate(year + 1, 1, target)
          : safeDate(year, month + 1, target);
      },
    },
    ...WEEKDAYS.map(([body, target]): Rule => ({
      kind: 'date',
      pattern: rx(`${PREFIX}(?:${body})`),
      read: (_, today) => nextWeekday(today, target),
    })),
    {
      // Hora explícita: "às 14h", "as 9", "14:30".
      kind: 'time',
      pattern: rx(
        '(?:[àa]s\\s+(\\d{1,2})(?:(?:h|:)(\\d{2})?)?|(\\d{1,2}):(\\d{2}))',
      ),
      read: (match) =>
        match[1] !== undefined
          ? validTime(Number(match[1]), Number(match[2] ?? 0))
          : validTime(Number(match[3]), Number(match[4])),
    },
    {
      // Duração: "30min", "45 min", "1h", "1h30", "2 horas".
      kind: 'duration',
      pattern: rx(
        '(\\d{1,3})\\s*(?:min|mins|minutos?)|(\\d{1,2})\\s*(?:h|horas?)(?:\\s*(\\d{1,2})\\s*(?:min)?)?',
      ),
      read: (match) => {
        if (match[1] !== undefined) {
          const minutes = Number(match[1]);
          return minutes > 0 && minutes <= 1440 ? minutes : null;
        }
        const hours = Number(match[2]);
        const minutes = Number(match[3] ?? 0);
        // "14h" sozinho é hora do dia; durações em horas vão até 4h.
        if (hours >= 5) return null;
        const total = hours * 60 + minutes;
        return minutes < 60 && total > 0 ? total : null;
      },
    },
    {
      // "14h", "9h30" sem "às": hora do dia a partir das 5h.
      kind: 'time',
      pattern: rx('(\\d{1,2})h(\\d{2})?'),
      read: (match) =>
        Number(match[1]) >= 5
          ? validTime(Number(match[1]), Number(match[2] ?? 0))
          : null,
    },
  ];
}

function findFree(
  text: string,
  rule: Rule,
  today: string,
  taken: CaptureToken[],
): { match: RegExpExecArray; value: string | number } | null {
  const global = new RegExp(rule.pattern.source, rule.pattern.flags + 'g');
  let match: RegExpExecArray | null;
  while ((match = global.exec(text))) {
    const start = match.index;
    const end = start + match[0].length;
    if (!match[0].length) global.lastIndex++;
    if (taken.some((token) => start < token.end && end > token.start)) continue;
    const value = rule.read(match, today);
    if (value !== null) return { match, value };
  }
  return null;
}

/**
 * Interpreta a frase. Cada tipo é lido uma vez (a primeira ocorrência livre);
 * o resto do texto vira o título. `literal` desliga a leitura.
 */
export function parseCapture(
  text: string,
  today: string,
  fallback: CaptureFallback = 'inbox',
  literal = false,
): Capture {
  const tokens: CaptureToken[] = [];
  let plannedDate: string | null = null;
  let plannedTime: string | null = null;
  let estimatedMinutes: number | null = null;
  let someday = false;
  if (!literal) {
    for (const rule of rules()) {
      if (rule.kind === 'someday' && someday) continue;
      if (rule.kind === 'date' && (plannedDate || someday)) continue;
      if (rule.kind === 'time' && (plannedTime || someday)) continue;
      if (rule.kind === 'duration' && estimatedMinutes) continue;
      const found = findFree(text, rule, today, tokens);
      if (!found) continue;
      const { match, value } = found;
      tokens.push({
        kind: rule.kind,
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
      });
      if (rule.kind === 'someday') someday = true;
      else if (rule.kind === 'date') plannedDate = value as string;
      else if (rule.kind === 'time') plannedTime = value as string;
      else estimatedMinutes = value as number;
    }
  }
  tokens.sort((a, b) => a.start - b.start);
  let title = '';
  let cursor = 0;
  for (const token of tokens) {
    title += text.slice(cursor, token.start) + ' ';
    cursor = token.end;
  }
  title = (title + text.slice(cursor))
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/(?:^|\s)(?:às|as|na|no|em|para|pra|de|,|-)\s*$/iu, '')
    .replace(/^[\s,;:-]+|[\s,;:-]+$/g, '')
    .trim();
  // Hora sem dia: vale para hoje.
  if (!plannedDate && plannedTime && !someday) plannedDate = today;
  const destination: CaptureDestination = someday
    ? { kind: 'someday' }
    : plannedDate
      ? plannedDate === today
        ? { kind: 'today', date: today }
        : { kind: 'day', date: plannedDate }
      : fallback === 'today'
        ? { kind: 'today', date: today }
        : { kind: 'inbox' };
  return {
    title,
    destination,
    plannedDate: someday
      ? null
      : (plannedDate ?? (fallback === 'today' ? today : null)),
    someday,
    plannedTime: someday ? null : plannedTime,
    estimatedMinutes,
    tokens,
  };
}

const WEEKDAY_NAMES = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];
const MONTHS = [
  'jan.',
  'fev.',
  'mar.',
  'abr.',
  'mai.',
  'jun.',
  'jul.',
  'ago.',
  'set.',
  'out.',
  'nov.',
  'dez.',
];

/** "Hoje", "Amanhã", "Sexta, 20 nov." */
export function dayLabel(date: string, today: string): string {
  if (date === today) return 'Hoje';
  if (date === addCalendarDays(today, 1)) return 'Amanhã';
  const name = WEEKDAY_NAMES[weekday(date)];
  const label = `${name}, ${Number(date.slice(8, 10))} ${MONTHS[Number(date.slice(5, 7)) - 1]}`;
  return date.slice(0, 4) === today.slice(0, 4)
    ? label
    : `${label} ${date.slice(0, 4)}`;
}

export function destinationLabel(capture: Capture, today: string): string {
  const { destination } = capture;
  if (destination.kind === 'someday') return 'Algum dia';
  if (destination.kind === 'inbox') return 'Sem dia';
  const base = dayLabel(destination.date, today);
  return capture.plannedTime ? `${base}, ${capture.plannedTime}` : base;
}

export function minutesLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h${pad(rest)}` : `${hours} h`;
}
