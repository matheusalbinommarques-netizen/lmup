import { beforeEach, describe, it, expect, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { createJourneyBackup } from './backupDataService';
import { readCompanionsSnapshot } from './companionsQuery';
beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
  await initializeJourney();
});
describe('consulta dos companheiros', () => {
  it('consulta companhia e carteira sem carregar missões nem gravar a jornada', async () => {
    const before = await createJourneyBackup();
    const tasks = vi
      .spyOn(db.tasks, 'toArray')
      .mockRejectedValue(new Error('Não carregar missões'));
    const logs = vi
      .spyOn(db.xpLogs, 'toArray')
      .mockRejectedValue(new Error('Não carregar logs'));
    try {
      const view = await readCompanionsSnapshot();
      expect(view.companions).toHaveLength(4);
      expect(view.profile.activeCompanionId).toBe(1);
      expect(tasks).not.toHaveBeenCalled();
      expect(logs).not.toHaveBeenCalled();
    } finally {
      tasks.mockRestore();
      logs.mockRestore();
    }
    expect((await createJourneyBackup()).data).toEqual(before.data);
  });
  it('releitura reflete cuidado e seleção mesmo com carteira no limite', async () => {
    await db.profile.update(1, {
      food: Number.MAX_SAFE_INTEGER,
      gold: Number.MAX_SAFE_INTEGER,
      activeCompanionId: 3,
    });
    await db.companions.update(1, { foodInvested: 100, evolutionStage: 2 });
    const view = await readCompanionsSnapshot();
    expect(view.profile.food).toBe(Number.MAX_SAFE_INTEGER);
    expect(view.profile.activeCompanionId).toBe(3);
    expect(view.companions.find((pet) => pet.id === 1)?.foodInvested).toBe(100);
  });
  it('perfil ausente gera erro sem reinicializar o progresso', async () => {
    await db.profile.clear();
    await expect(readCompanionsSnapshot()).rejects.toThrow(
      'perfil não está disponível',
    );
    expect(await db.profile.count()).toBe(0);
  });
});
