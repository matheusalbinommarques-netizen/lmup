import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  elapsedMs,
  formatElapsed,
  measurement,
  pauseTimer,
  readTimer,
  resumeTimer,
  saveTimer,
  startTimer,
} from './executionTimer';

const at = (time: string) => new Date(`2026-11-15T${time}`);

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    },
  });
});
afterEach(() => vi.unstubAllGlobals());

it('soma o tempo só enquanto está ligado', () => {
  let timer = startTimer(at('14:30:00'));
  timer = pauseTimer(timer, at('14:38:12'));
  expect(elapsedMs(timer, at('15:00:00'))).toBe(492_000);
  timer = resumeTimer(timer, at('15:00:00'));
  expect(formatElapsed(elapsedMs(timer, at('15:01:00')))).toBe('09:12');
  expect(formatElapsed(3_725_000)).toBe('1:02:05');
});

it('vira minutos com uma casa e início real', () => {
  const timer = startTimer(at('14:30:00'));
  expect(measurement(timer, at('14:42:30'))).toEqual({
    minutes: 12.5,
    startedAt: at('14:30:00').toISOString(),
  });
  expect(measurement(null, at('14:42:30'))).toEqual({ minutes: null });
});

it('omite o início real com mais de 24 h', () => {
  const timer = pauseTimer(startTimer(at('08:00:00')), at('08:10:00'));
  expect(measurement(timer, new Date('2026-11-17T09:00:00'))).toEqual({
    minutes: 10,
  });
});

it('sobrevive a recarregar e ignora estado adulterado', () => {
  const timer = startTimer(at('14:30:00'));
  saveTimer('occ-1', timer);
  expect(readTimer('occ-1')).toEqual(timer);
  window.localStorage.setItem(
    'lmup.timer.v1:occ-2',
    JSON.stringify({ startedAt: 'x', runningSince: null, elapsedMs: 1 }),
  );
  expect(readTimer('occ-2')).toBeNull();
  saveTimer('occ-1', null);
  expect(readTimer('occ-1')).toBeNull();
});
