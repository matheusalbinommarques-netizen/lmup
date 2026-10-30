import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { createQuickTask } from './journeyService';
import { completeTask, undoTask } from './taskService';
import { advancePilot, qualifyingCompletions, readPilot } from './rpgPilotService';
import { createJourneyBackup, validateBackup, restoreJourneyBackup } from './backupDataService';
beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});
async function reachGate() {
  for (let i = 0; i < 3; i++) await advancePilot(i);
  expect((await readPilot()).scene).toBe(3);
}
describe('pilot narrative', () => {
  it('blocks continuing without a real active completion', async () => {
    await reachGate();
    await expect(advancePilot(3)).rejects.toThrow('missão real');
    const id=await createQuickTask({title:'Lavar a louça', requestId:crypto.randomUUID()});
    expect(await qualifyingCompletions()).toBe(0);
    await expect(advancePilot(3)).rejects.toThrow('missão real');
    await completeTask(id);
    expect(await qualifyingCompletions()).toBe(1);
    await advancePilot(3);
    expect((await readPilot()).scene).toBe(4);
  });
  it('reversed completion does not unlock the gate',async () => {
    await reachGate();
    const id=await createQuickTask({title:'Arrumar a casa',requestId:crypto.randomUUID()});
    await completeTask(id);
    await undoTask(id);
    expect(await qualifyingCompletions()).toBe(0);
    await expect(advancePilot(3)).rejects.toThrow('missão real');
  });
  it('choice persists through backup and repeated calls do not skip scenes',async () => {
    await reachGate();
    const id=await createQuickTask({title:'Estudar',requestId:crypto.randomUUID()});
    await completeTask(id);
    await advancePilot(3);
    await advancePilot(4);
    await expect(advancePilot(5)).rejects.toThrow('Escolha');
    await advancePilot(5,'help');
    await advancePilot(5,'follow');
    expect(await readPilot()).toEqual({scene:6,choice:'help'});
    const backup=await createJourneyBackup();
    expect(()=>validateBackup(backup)).not.toThrow();
    await restoreJourneyBackup(backup);
    expect(await readPilot()).toEqual({scene:6,choice:'help'});
  });
});
