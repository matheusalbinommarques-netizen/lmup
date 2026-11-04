import { expect, it, vi } from 'vitest';
vi.mock('$lib/camp/cinematic/previewMode', () => ({
  CAMP_PREVIEW: false,
  CAMP_PREVIEW_DB: 'LevelMeUpCampCinematicPreview',
}));
import { db } from './db';
import {
  ensureCampPreview,
  meetCaretaker,
  buildResidence,
  resetCampPreview,
  setCampSimulationXp,
} from './campPreviewService';
it('todos os comandos recusam o banco normal antes de abrir ou escrever nele', async () => {
  expect(db.name).toBe('LevelMeUpDB');
  const open = vi.spyOn(db, 'open');
  const state = { epoch: 'fake', revision: 0 };
  for (const invoke of [
    () => ensureCampPreview(),
    () => meetCaretaker(),
    () => buildResidence(state),
    () => resetCampPreview(state),
    () => setCampSimulationXp(12000, state),
  ])
    await expect(invoke()).rejects.toThrow('demonstração isolada');
  expect(open).not.toHaveBeenCalled();
});
