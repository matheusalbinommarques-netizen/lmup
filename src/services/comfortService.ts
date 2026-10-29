import { writable, get } from 'svelte/store';
export const COMFORT_KEY = 'lmup:neuro-prefs';
export const defaultComfort = {
  focusMode: false,
  largeText: false,
  lowStimulus: false,
  reducedMotion: false,
};
export type ComfortPrefs = typeof defaultComfort;
export const comfort = writable<ComfortPrefs>({ ...defaultComfort });
export const comfortWarning = writable('');
export function parseComfort(raw: string | null): ComfortPrefs {
  try {
    const value = JSON.parse(raw ?? 'null');
    if (!value || typeof value !== 'object' || Array.isArray(value))
      return { ...defaultComfort };
    return Object.fromEntries(
      Object.keys(defaultComfort).map((key) => [key, value[key] === true]),
    ) as ComfortPrefs;
  } catch {
    return { ...defaultComfort };
  }
}
function apply(value: ComfortPrefs) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.neuroFocus = String(value.focusMode);
  root.dataset.neuroLargeText = String(value.largeText);
  root.dataset.neuroLowStimulus = String(value.lowStimulus);
  root.dataset.reducedMotion = String(value.reducedMotion);
}
export function setComfort(key: keyof ComfortPrefs, value: boolean) {
  const next = { ...get(comfort), [key]: value };
  comfort.set(next);
  apply(next);
  try {
    localStorage.setItem(COMFORT_KEY, JSON.stringify(next));
    comfortWarning.set('');
  } catch {
    comfortWarning.set(
      'As preferências valem neste acesso, mas este navegador não permitiu guardá-las.',
    );
  }
}
export function initializeComfort(): () => void {
  try {
    const next = parseComfort(localStorage.getItem(COMFORT_KEY));
    comfort.set(next);
    apply(next);
  } catch {
    apply(get(comfort));
    comfortWarning.set(
      'Não foi possível ler as preferências guardadas neste navegador.',
    );
  }
  const sync = (event: StorageEvent) => {
    if (event.key === COMFORT_KEY || event.key === null) {
      const next = parseComfort(event.newValue);
      comfort.set(next);
      apply(next);
    }
  };
  window.addEventListener('storage', sync);
  return () => window.removeEventListener('storage', sync);
}
