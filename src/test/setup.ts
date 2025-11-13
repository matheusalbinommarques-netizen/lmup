// src/test/setup.ts

// 1) IndexedDB fake para Dexie nos testes
import 'fake-indexeddb/auto';

// 2) Polyfills comuns em JSDOM (sem @ts-expect-error)

// ResizeObserver
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  (globalThis as any).ResizeObserver = ResizeObserver;
}

// matchMedia
if (typeof (globalThis as any).matchMedia === 'undefined') {
  (globalThis as any).matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {}, // deprecated, mantido por compat
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    }) as MediaQueryList;
}

// 3) Mock de chart.js (evita quebrar componentes de gráfico em JSDOM)
import { vi } from 'vitest';

vi.mock('chart.js', () => {
  class FakeChart {
    constructor(...args: any[]) {
      // marca como "usado" para evitar no-unused-vars
      void args.length;
    }
    static register(...args: any[]): void {
      void args.length;
    }
    destroy(): void {}
    update(): void {}
  }

  // “controladores/elements” importados nos componentes
  class DoughnutController {}
  class ArcElement {}
  class Tooltip {}
  class Legend {}
  class Colors {}

  return {
    Chart: FakeChart,
    DoughnutController,
    ArcElement,
    Tooltip,
    Legend,
    Colors,
  };
});

// 4) (Opcional) jest-dom se você instalar:
// import '@testing-library/jest-dom';
