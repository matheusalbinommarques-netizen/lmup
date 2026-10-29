// @vitest-environment jsdom
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { get } from 'svelte/store';
import {
  COMFORT_KEY,
  defaultComfort,
  comfort,
  comfortWarning,
  parseComfort,
  setComfort,
  initializeComfort,
} from './comfortService';
beforeEach(() => {
  localStorage.clear();
  comfort.set({ ...defaultComfort });
  comfortWarning.set('');
});
afterEach(() => vi.restoreAllMocks());
describe('preferências globais de conforto', () => {
  it('lê preferências antigas e usa valores booleanos estritos', () => {
    expect(
      parseComfort('{"focusMode":true,"largeText":true,"lowStimulus":"false"}'),
    ).toEqual({ ...defaultComfort, focusMode: true, largeText: true });
    expect(parseComfort('invalid')).toEqual(defaultComfort);
    expect(parseComfort('[]')).toEqual(defaultComfort);
  });
  it('aplica ao documento no acesso direto sem visitar Configurações', () => {
    localStorage.setItem(
      COMFORT_KEY,
      JSON.stringify({ focusMode: true, largeText: true, reducedMotion: true }),
    );
    const cleanup = initializeComfort();
    expect(document.documentElement.dataset.neuroFocus).toBe('true');
    expect(document.documentElement.dataset.neuroLargeText).toBe('true');
    expect(document.documentElement.dataset.reducedMotion).toBe('true');
    cleanup();
  });
  it('persiste cada escolha e sincroniza mudanças de outra aba', () => {
    const cleanup = initializeComfort();
    setComfort('lowStimulus', true);
    expect(JSON.parse(localStorage.getItem(COMFORT_KEY)!).lowStimulus).toBe(
      true,
    );
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: COMFORT_KEY,
        newValue: JSON.stringify({ largeText: true }),
      }),
    );
    expect(get(comfort)).toEqual({ ...defaultComfort, largeText: true });
    expect(document.documentElement.dataset.neuroLowStimulus).toBe('false');
    cleanup();
  });
  it('continua aplicando preferências e informa quando a gravação local falha', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    setComfort('largeText', true);
    expect(document.documentElement.dataset.neuroLargeText).toBe('true');
    expect(get(comfortWarning)).toContain('não permitiu');
  });
  it('uma limpeza do armazenamento restaura valores padrão nas outras abas', () => {
    const cleanup = initializeComfort();
    setComfort('focusMode', true);
    window.dispatchEvent(
      new StorageEvent('storage', { key: null, newValue: null }),
    );
    expect(get(comfort)).toEqual(defaultComfort);
    cleanup();
  });
});
