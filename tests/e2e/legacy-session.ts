import { expect, type Page } from '@playwright/test';

/**
 * Lote 5c: a selection opens the execution screen with its own queue and no
 * longer creates a saved session. Returns the occurrence ids of the queue.
 */
export async function selectToExecute(
  page: Page,
  titles: string[],
): Promise<string[]> {
  await page
    .getByRole('button', { name: 'Selecionar para executar', exact: true })
    .click();
  const selector = page.getByRole('dialog', {
    name: 'Executar uma seleção',
    exact: true,
  });
  for (const title of titles)
    await selector
      .getByRole('checkbox', {
        name: `Incluir ${title} na seleção`,
        exact: true,
      })
      .check();
  await selector
    .getByRole('button', { name: 'Executar seleção', exact: true })
    .click();
  await expect(page).toHaveURL(/\/executar\/[^?]+\?fila=selecao&ids=/);
  return (new URL(page.url()).searchParams.get('ids') ?? '')
    .split(',')
    .filter(Boolean)
    .map((id) => decodeURIComponent(id));
}

/**
 * Sessions saved before lote 5c keep working in /sessoes. This stores one
 * as they were stored: occurrences from the selection above, the record
 * written straight into IndexedDB (cursor on the first pending row, other
 * active sessions paused), then /sessoes opens it.
 */
export async function legacySession(
  page: Page,
  titles: string[],
  name = 'Sessão de Missões',
): Promise<string> {
  await page.goto('/missoes');
  const ids = await selectToExecute(page, titles);
  const id = await page.evaluate(
    async ({ ids, name }) => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const done = (tx: IDBTransaction) =>
        new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      const read = db.transaction(['occurrences', 'savedMissionSessions']);
      const rows = await Promise.all(
        ids.map(
          (key) =>
            new Promise<{ status: string } | undefined>((resolve) => {
              const request = read.objectStore('occurrences').get(key);
              request.onsuccess = () => resolve(request.result);
            }),
        ),
      );
      const sessions = await new Promise<
        { id: string; status: string; revision: number }[]
      >((resolve) => {
        const request = read.objectStore('savedMissionSessions').getAll();
        request.onsuccess = () => resolve(request.result);
      });
      await done(read);
      const id = crypto.randomUUID();
      const write = db.transaction('savedMissionSessions', 'readwrite');
      const store = write.objectStore('savedMissionSessions');
      for (const session of sessions)
        if (session.status === 'active')
          store.put({
            ...session,
            status: 'paused',
            revision: session.revision + 1,
          });
      store.put({
        id,
        name,
        occurrenceIds: ids,
        cursor: Math.max(
          0,
          rows.findIndex((row) => row?.status !== 'completed'),
        ),
        status: 'active',
        mode: 'focus',
        revision: 1,
        createdAt: new Date().toISOString(),
      });
      await done(write);
      db.close();
      return id;
    },
    { ids, name },
  );
  await page.goto('/sessoes');
  await expect(
    page.getByRole('heading', { level: 1, name, exact: true }),
  ).toBeVisible();
  return id;
}
