import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { gameLayerOf, setGameLayer } from './gameLayer';
import { saveArea } from './areaService';
import {
  createFirstUseAreas,
  dayHoursOf,
  dayHoursProblem,
  domainSuggestions,
  firstUsePending,
  nextFirstUseStep,
  postponeFirstUse,
  resumeFirstUse,
  saveDayHours,
  skipFirstUse,
  skipFirstUseStep,
} from './firstUse';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';

const profile = async () => (await db.profile.get(1))!;
const legacy = () =>
  db.profile.update(1, { gameLayer: undefined, firstUse: undefined });

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-25T10:00:00'));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());

describe('perfil novo e perfil antigo', () => {
  it('perfil novo nasce na camada Discreta com o primeiro uso pendente', async () => {
    const created = await profile();
    expect(created.gameLayer).toBe('discreta');
    expect(created.firstUse).toEqual({
      status: 'pending',
      steps: {},
      startedAt: '2026-11-25T13:00:00.000Z',
    });
    expect(nextFirstUseStep(created)).toBe('areas');
  });

  it('perfil antigo continua sem primeiro uso e na Completa', async () => {
    await legacy();
    const before = await profile();
    await initializeJourney();
    const after = await profile();
    expect(after).toEqual(before);
    expect(after.firstUse).toBeUndefined();
    expect(gameLayerOf(after)).toBe('completa');
    expect(nextFirstUseStep(after)).toBeNull();
  });

  it('perfil antigo com outra camada gravada continua nela', async () => {
    for (const layer of ['discreta', 'desligada', 'completa'] as const) {
      await legacy();
      await db.profile.update(1, { gameLayer: layer });
      await initializeJourney();
      const after = await profile();
      expect(after.gameLayer).toBe(layer);
      expect(after.firstUse).toBeUndefined();
      expect(nextFirstUseStep(after)).toBeNull();
    }
  });

  it('backup antigo com camada gravada restaura a mesma camada', async () => {
    await legacy();
    await db.profile.update(1, { gameLayer: 'desligada' });
    const backup = await createJourneyBackup();
    await setGameLayer('completa');
    await restoreJourneyBackup(backup);
    const after = await profile();
    expect(after.gameLayer).toBe('desligada');
    expect(after.firstUse).toBeUndefined();
  });

  it('ações do primeiro uso não criam nada num perfil antigo', async () => {
    await legacy();
    await postponeFirstUse();
    await skipFirstUseStep('areas');
    await skipFirstUse();
    await setGameLayer('discreta');
    await saveDayHours({ start: '07:00' });
    expect((await profile()).firstUse).toBeUndefined();
  });
});

describe('agora não, pular passo e pular tudo', () => {
  it('"Agora não" só recolhe; continuar volta ao mesmo passo', async () => {
    await skipFirstUseStep('areas');
    await postponeFirstUse();
    let state = (await profile()).firstUse!;
    expect(state).toMatchObject({
      status: 'pending',
      postponed: true,
      steps: { areas: 'skipped' },
    });
    expect(firstUsePending(await profile())).toBe(true);
    await postponeFirstUse();
    expect((await profile()).firstUse).toEqual(state);
    await resumeFirstUse();
    state = (await profile()).firstUse!;
    expect(state.postponed).toBeUndefined();
    expect(nextFirstUseStep(await profile())).toBe('day');
  });

  it('pular um passo avança sem preencher nada', async () => {
    const before = await profile();
    await skipFirstUseStep('day');
    const after = await profile();
    expect(after.firstUse!.steps).toEqual({ day: 'skipped' });
    expect(after.dayHours).toBeUndefined();
    expect(after.gameLayer).toBe(before.gameLayer);
    expect(nextFirstUseStep(after)).toBe('areas');
    await skipFirstUseStep('day');
    expect((await profile()).firstUse!.steps).toEqual({ day: 'skipped' });
  });

  it('"Pular tudo" encerra e mantém a Discreta', async () => {
    await postponeFirstUse();
    await skipFirstUse();
    const after = await profile();
    expect(after.firstUse).toEqual({
      status: 'skipped',
      steps: {},
      startedAt: '2026-11-25T13:00:00.000Z',
      finishedAt: '2026-11-25T13:00:00.000Z',
    });
    expect(after.gameLayer).toBe('discreta');
    expect(nextFirstUseStep(after)).toBeNull();
  });

  it('"Pular tudo" não desfaz uma camada escolhida em Configurações', async () => {
    await setGameLayer('completa');
    await skipFirstUse();
    expect((await profile()).gameLayer).toBe('completa');
  });

  it('resolver os três passos, pulando ou não, conclui', async () => {
    await createFirstUseAreas([]);
    await skipFirstUseStep('day');
    expect((await profile()).firstUse!.status).toBe('pending');
    await setGameLayer('completa');
    const after = await profile();
    expect(after.firstUse).toMatchObject({
      status: 'done',
      steps: { areas: 'done', day: 'skipped', layer: 'done' },
      finishedAt: '2026-11-25T13:00:00.000Z',
    });
    expect(after.gameLayer).toBe('completa');
  });

  it('escolher a mesma camada (Discreta) também resolve o passo', async () => {
    await setGameLayer('discreta');
    expect((await profile()).firstUse!.steps.layer).toBe('done');
  });

  it('depois de concluído, adiar ou pular não muda nada', async () => {
    await skipFirstUse();
    const state = (await profile()).firstUse;
    await postponeFirstUse();
    await resumeFirstUse();
    await skipFirstUseStep('areas');
    await setGameLayer('desligada');
    expect((await profile()).firstUse).toEqual(state);
  });
});

describe('áreas sugeridas', () => {
  it('cria as escolhidas com domínio e ícone existente', async () => {
    const result = await createFirstUseAreas([
      { name: 'Saúde', domain: 'health' },
      { name: 'Valores', domain: 'values' },
      { name: 'Violão' },
    ]);
    expect(result).toEqual({
      created: ['Saúde', 'Valores', 'Violão'],
      kept: [],
    });
    const areas = await db.areas.toArray();
    expect(
      areas.map((area) => [area.nome, area.domain ?? null, area.iconKey]),
    ).toEqual([
      ['Saúde', 'health', 'exercicio'],
      ['Valores', 'values', null],
      ['Violão', null, null],
    ]);
    expect((await profile()).firstUse!.steps.areas).toBe('done');
    expect(await db.productivityAudit.count()).toBe(3);
  });

  it('concluir sem nenhuma área só resolve o passo', async () => {
    expect(await createFirstUseAreas([])).toEqual({ created: [], kept: [] });
    expect(await db.areas.count()).toBe(0);
    expect((await profile()).firstUse!.steps.areas).toBe('done');
  });

  it('preserva áreas existentes e não duplica', async () => {
    const id = await saveArea('saúde', undefined, 'sono');
    await db.areas.update(id, { domain: 'emotional' });
    const before = await db.areas.get(id);
    const result = await createFirstUseAreas([
      { name: 'Saúde', domain: 'health' },
      { name: 'Geral', domain: 'values' },
      { name: 'Casa', domain: 'home' },
      { name: ' casa ', domain: 'home' },
    ]);
    expect(result).toEqual({ created: ['Casa'], kept: ['Saúde', 'Geral'] });
    expect(await db.areas.get(id)).toEqual(before);
    expect((await profile()).generalAreaDomain).toBeUndefined();
    expect(await db.areas.count()).toBe(2);
  });

  it('nome inválido não grava nada', async () => {
    await expect(
      createFirstUseAreas([{ name: 'Casa' }, { name: 'x'.repeat(81) }]),
    ).rejects.toThrow('até 80 caracteres');
    await expect(
      createFirstUseAreas([{ name: 'Casa', domain: 'outro' as never }]),
    ).rejects.toThrow('Área da vida inválida');
    expect(await db.areas.count()).toBe(0);
    expect((await profile()).firstUse!.steps.areas).toBeUndefined();
  });

  it('as sugestões cobrem os dez domínios', () => {
    expect(domainSuggestions).toHaveLength(10);
    expect(domainSuggestions[0]).toEqual({
      key: 'health',
      name: 'Saúde',
      label: 'Saúde Física',
      icon: 'exercicio',
    });
  });
});

describe('início e fim do dia', () => {
  it('grava, resolve o passo e limpa quando os dois ficam vazios', async () => {
    await saveDayHours({ start: '07:30', end: '22:00' });
    let after = await profile();
    expect(after.dayHours).toEqual({ start: '07:30', end: '22:00' });
    expect(after.firstUse!.steps.day).toBe('done');
    await saveDayHours({ start: '', end: '23:00' });
    expect((await profile()).dayHours).toEqual({ end: '23:00' });
    await saveDayHours({ start: '', end: '' });
    after = await profile();
    expect(after.dayHours).toBeUndefined();
    expect('dayHours' in after).toBe(false);
  });

  it('recusa fim antes ou igual ao início e formato errado, sem gravar', async () => {
    await expect(
      saveDayHours({ start: '22:00', end: '07:00' }),
    ).rejects.toThrow('O fim do dia precisa ser depois do início');
    await expect(
      saveDayHours({ start: '08:00', end: '08:00' }),
    ).rejects.toThrow('depois do início');
    await expect(saveDayHours({ start: '7:30' })).rejects.toThrow(
      'formato 07:30',
    );
    await expect(saveDayHours({ end: '24:00' })).rejects.toThrow(
      'formato 07:30',
    );
    const after = await profile();
    expect(after.dayHours).toBeUndefined();
    expect(after.firstUse!.steps.day).toBeUndefined();
    expect(dayHoursProblem({ start: '00:00', end: '23:59' })).toBe('');
  });

  it('valor gravado inválido conta como ausente', () => {
    expect(dayHoursOf({ dayHours: { start: '22:00', end: '07:00' } })).toEqual(
      {},
    );
    expect(dayHoursOf({ dayHours: { start: '06:00' } })).toEqual({
      start: '06:00',
    });
    expect(dayHoursOf(null)).toEqual({});
  });
});

describe('backup', () => {
  it('leva o primeiro uso parcial e adiado e os horários', async () => {
    await createFirstUseAreas([{ name: 'Casa', domain: 'home' }]);
    await saveDayHours({ start: '06:45' });
    await postponeFirstUse();
    const saved = await profile();
    const backup = await createJourneyBackup();
    await skipFirstUse();
    await saveDayHours({ start: '', end: '' });
    await restoreJourneyBackup(backup);
    const after = await profile();
    expect(after.firstUse).toEqual(saved.firstUse);
    expect(after.dayHours).toEqual({ start: '06:45' });
    expect(nextFirstUseStep(after)).toBe('layer');
  });

  it('backup sem os campos novos continua válido e não abre o primeiro uso', async () => {
    await legacy();
    const backup = await createJourneyBackup();
    expect('firstUse' in backup.data.profile!).toBe(false);
    expect('dayHours' in backup.data.profile!).toBe(false);
    await db.profile.update(1, {
      firstUse: {
        status: 'pending',
        steps: {},
        startedAt: '2026-11-25T13:00:00.000Z',
      },
    });
    await restoreJourneyBackup(validateBackup(backup));
    const after = await profile();
    expect(after.firstUse).toBeUndefined();
    expect(gameLayerOf(after)).toBe('completa');
  });

  it('recusa primeiro uso ou horários inválidos', async () => {
    const backup = await createJourneyBackup();
    const badState = structuredClone(backup);
    (badState.data.profile as { firstUse: unknown }).firstUse = {
      status: 'pending',
      steps: { areas: 'talvez' },
      startedAt: '2026-11-25T13:00:00.000Z',
    };
    expect(() => validateBackup(badState)).toThrow('primeiro uso inválido');
    const badHours = structuredClone(backup);
    (badHours.data.profile as { dayHours: unknown }).dayHours = {
      start: '22:00',
      end: '07:00',
    };
    expect(() => validateBackup(badHours)).toThrow('horários do dia inválidos');
    const extra = structuredClone(backup);
    (extra.data.profile as { dayHours: unknown }).dayHours = {
      start: '07:00',
      lunch: '12:00',
    };
    expect(() => validateBackup(extra)).toThrow('horários do dia inválidos');
  });
});
