import { expect, type Page } from '@playwright/test';

export async function seedAuditText(page: Page) {
  await page.clock.install({ time: new Date('2026-11-09T12:00:00-03:00') });
  await page.goto('/');
  await expect(page.locator('.today-hero')).toBeVisible();
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('LevelMeUpDB');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(
        ['tasks', 'occurrences', 'activityEvents', 'routines'],
        'readwrite',
      );
      for (const [id, title, day, routineId] of [
        [901, 'Caminhada recorrente sem rotina', '2026-11-09', null],
        [902, 'Leitura de outubro', '2026-10-26', null],
        [903, 'Alongamento da rotina', '2026-11-09', 'audit-routine'],
      ] as const) {
        const occurrenceId = `mission:${id}:${day}`;
        const eventId = `audit-text:${id}`;
        tx.objectStore('tasks').put({
          id,
          title,
          xp: 0,
          rarity: 'common',
          completed: false,
          areaId: 0,
          source: 'personal',
          status: 'todo',
          productivityVersion: 1,
          tracking: { method: 'direct' },
          recurrence: { kind: 'daily', startDate: day },
          routineId,
          createdAt: `${day}T12:00:00Z`,
        });
        tx.objectStore('occurrences').put({
          id: occurrenceId,
          taskId: id,
          title,
          routineId,
          originDate: day,
          plannedDate: day,
          originalTime: null,
          areaId: 0,
          baseXp: 0,
          steps: [],
          checkedSteps: [],
          value: 1,
          tracking: { method: 'direct' },
          due: { xp: 0, gold: 0, food: 0 },
          status: 'completed',
          revision: 1,
          completedLocalDate: day,
          completedAt: `${day}T12:00:00Z`,
          completionEventId: eventId,
        });
        tx.objectStore('activityEvents').put({
          id: eventId,
          kind: 'task',
          sequence: id,
          taskId: id,
          taskTitle: title,
          date: day,
          occurrenceDate: day,
          occurrenceId,
          occurredAt: `${day}T12:00:00Z`,
          baseXp: 0,
          reward: { xp: 0, gold: 0, food: 0 },
          modifiers: { xpMultiplier: 1, goldMultiplier: 1, foodMultiplier: 1 },
          awardedStages: [],
          ecoClaimedBefore: 1,
          protectionDays: 0,
        });
      }
      tx.objectStore('routines').put({
        id: 'audit-routine',
        name: 'Rotina de mobilidade',
        status: 'active',
        days: [0, 1, 2, 3, 4, 5, 6],
        startDate: '2026-11-09',
        entries: [{ taskId: 903, time: '09:00', previousPlan: {} }],
        revision: 1,
        pauseQuota: 2,
        pausePeriodDays: 30,
        createdAt: '2026-11-09T12:00:00Z',
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  });
}
