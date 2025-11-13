// src/services/xpService.test.ts
import { describe, test, expect, vi } from 'vitest';

// Mock do DB com transaction “no-op”
vi.mock('$services/db', () => {
  const profile = {
    data: {
      id: 1,
      name: 'Seu herói',
      title: 'Aprendiz',
      level: 1,
      xpCurrent: 0,
      xpNext: 100,
      totalXpEarned: 0,
      currentStreak: 0,
      lastCompletionDate: '',
      activeCompanionId: 1,
      gold: 0,
    },
    async get() {
      return this.data;
    },
    async update(_id: number, changes: any) {
      Object.assign(this.data, changes);
      return 1;
    },
    async put(obj: any) {
      this.data = obj;
      return 1;
    },
  };

  const xpLogs = {
    rows: [] as any[],
    async add(row: any) {
      this.rows.push(row);
      return this.rows.length;
    },
  };

  const db = {
    profile,
    xpLogs,
    // Suporta as assinaturas do Dexie:
    // transaction(mode, ...tables, callback)  ou  transaction(mode, callback)
    async transaction(_mode: any, ...rest: any[]) {
      // pega o último argumento que for função
      let cb: any = rest.at(-1);
      if (typeof cb !== 'function') {
        for (let i = rest.length - 1; i >= 0; i--) {
          if (typeof rest[i] === 'function') {
            cb = rest[i];
            break;
          }
        }
      }
      if (typeof cb === 'function') {
        // executa o callback; não precisamos passar tx real
        return await cb({});
      }
    },
  };

  return { db } as any;
});

// Importa o serviço (funciona se exportar default, objeto xpService, ou funções soltas)
const mod: any = await import('./xpService');
const api: any = mod.xpService ?? mod.default ?? mod;

describe('xpService – smoke', () => {
  test('carrega e expõe ao menos uma função', () => {
    expect(api).toBeTruthy();
    expect(Object.values(api).some((v: any) => typeof v === 'function')).toBe(
      true,
    );
  });

  test('getXpForNextLevel (se existir) retorna número > 0', () => {
    if (typeof api.getXpForNextLevel === 'function') {
      expect(api.getXpForNextLevel(1)).toBeGreaterThan(0);
    }
  });

  test('add/remove XP (se existirem) não lançam erro', async () => {
    if (typeof api.addXp === 'function') {
      await expect(api.addXp(50)).resolves.toBeUndefined();
    }
    if (typeof api.removeXp === 'function') {
      await expect(api.removeXp(10)).resolves.toBeUndefined();
    }
  });
});
