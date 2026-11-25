import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { gameLayerOf, isGameLayer, setGameLayer } from './gameLayer';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-15T10:00:00'));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
  // Perfil anterior ao lote 7: sem camada gravada nem primeiro uso.
  await db.profile.update(1, { gameLayer: undefined, firstUse: undefined });
});
afterEach(() => vi.useRealTimers());

it('perfil sem preferência (usuário atual) fica na camada Completa', async () => {
  const profile = await db.profile.get(1);
  expect(profile?.gameLayer).toBeUndefined();
  expect(gameLayerOf(profile)).toBe('completa');
  expect(gameLayerOf(null)).toBe('completa');
  expect(gameLayerOf({ gameLayer: 'outra' as never })).toBe('completa');
});

it('trocar a camada grava só a preferência; saldos e XP não mudam', async () => {
  const before = await db.profile.get(1);
  for (const layer of ['discreta', 'desligada', 'completa'] as const) {
    await setGameLayer(layer);
    const after = await db.profile.get(1);
    expect(after?.gameLayer).toBe(layer);
    expect({ ...after, gameLayer: undefined }).toEqual({
      ...before,
      gameLayer: undefined,
    });
  }
});

it('repetir a mesma camada não regrava o perfil', async () => {
  await setGameLayer('discreta');
  const spy = vi.spyOn(db.profile, 'update');
  await setGameLayer('discreta');
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
});

it('recusa camada desconhecida sem gravar', async () => {
  await expect(setGameLayer('total' as never)).rejects.toThrow(
    'Camada de jogo inválida',
  );
  expect((await db.profile.get(1))?.gameLayer).toBeUndefined();
  expect(isGameLayer('discreta')).toBe(true);
  expect(isGameLayer('Discreta')).toBe(false);
});

it('o backup leva a camada e recusa valor inválido', async () => {
  await setGameLayer('desligada');
  const backup = await createJourneyBackup();
  await setGameLayer('completa');
  await restoreJourneyBackup(backup);
  expect((await db.profile.get(1))?.gameLayer).toBe('desligada');
  const broken = structuredClone(backup);
  (broken.data.profile as { gameLayer: string }).gameLayer = 'total';
  expect(() => validateBackup(broken)).toThrow('camada de jogo inválida');
});
