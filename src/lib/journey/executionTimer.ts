import { MAX_STARTED_BEFORE_MS } from '$services/productivityRules';

/**
 * Optional timer of the execution screen (lote 3). It starts off; while on,
 * its state lives in this browser (per occurrence), so a reload keeps it.
 * It only becomes data when the user concludes or records a part: the
 * measured minutes and the real start go to the execution record.
 */
export type TimerState = {
  /** First time the timer was turned on (real start). */
  startedAt: string;
  /** Running since this instant; null while paused. */
  runningSince: string | null;
  /** Time accumulated before `runningSince`. */
  elapsedMs: number;
};

const PREFIX = 'lmup.timer.v1:';

export function startTimer(now: Date): TimerState {
  const at = now.toISOString();
  return { startedAt: at, runningSince: at, elapsedMs: 0 };
}

export function elapsedMs(state: TimerState, now: Date): number {
  const running = state.runningSince
    ? Math.max(0, now.getTime() - Date.parse(state.runningSince))
    : 0;
  return state.elapsedMs + running;
}

export function pauseTimer(state: TimerState, now: Date): TimerState {
  if (!state.runningSince) return state;
  return { ...state, runningSince: null, elapsedMs: elapsedMs(state, now) };
}

export function resumeTimer(state: TimerState, now: Date): TimerState {
  return state.runningSince
    ? state
    : { ...state, runningSince: now.toISOString() };
}

/** mm:ss, or h:mm:ss after an hour. */
export function formatElapsed(ms: number): string {
  const total = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const two = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${two(m)}:${two(s)}` : `${two(m)}:${two(s)}`;
}

/**
 * What the execution record receives. Minutes keep one decimal; the real
 * start is left out when it is more than 24 h old (the record would refuse it).
 */
export function measurement(
  state: TimerState | null,
  now: Date,
): { minutes: number | null; startedAt?: string } {
  if (!state) return { minutes: null };
  const minutes = Math.round(elapsedMs(state, now) / 6000) / 10;
  const age = now.getTime() - Date.parse(state.startedAt);
  return age >= 0 && age <= MAX_STARTED_BEFORE_MS
    ? { minutes, startedAt: state.startedAt }
    : { minutes };
}

function normalize(value: unknown): TimerState | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Partial<TimerState>;
  if (
    typeof v.startedAt !== 'string' ||
    !Number.isFinite(Date.parse(v.startedAt)) ||
    !(
      v.runningSince === null ||
      (typeof v.runningSince === 'string' &&
        Number.isFinite(Date.parse(v.runningSince)))
    ) ||
    typeof v.elapsedMs !== 'number' ||
    !Number.isFinite(v.elapsedMs) ||
    v.elapsedMs < 0
  )
    return null;
  return {
    startedAt: v.startedAt,
    runningSince: v.runningSince,
    elapsedMs: v.elapsedMs,
  };
}

export function readTimer(id: string): TimerState | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + id);
    return raw ? normalize(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** Saves (or clears with null). Storage failures keep the timer in memory. */
export function saveTimer(id: string, state: TimerState | null): void {
  try {
    if (state) window.localStorage.setItem(PREFIX + id, JSON.stringify(state));
    else window.localStorage.removeItem(PREFIX + id);
  } catch {
    // A blocked storage only loses the timer after a reload.
  }
}
