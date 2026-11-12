import { expect, test } from '@playwright/test';

// D03: escala de botões em Hoje e Missões. Dados sintéticos.
test('botões migrados seguem a escala s/m/l, com a mesma família e toque de 44 px no celular', async ({
  page,
}, info) => {
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('tasks', 'readwrite');
          const today = new Date().toLocaleDateString('sv-SE');
          for (const id of [930, 931])
            tx.objectStore('tasks').put({
              id,
              title: 'Missão da escala ' + id,
              xp: 50,
              effort: 'small',
              rarity: 'common',
              status: 'available',
              completed: false,
              plannedDate: today,
              createdAt: new Date().toISOString(),
            });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
  const mobile = info.project.name === 'mobile';
  const expected = { s: mobile ? 44 : 36, m: 44, l: 48 };
  for (const path of ['/', '/missoes']) {
    await page.goto(path);
    await expect(page.locator('main .lmu-button--l').first()).toBeVisible();
    const sized = await page.evaluate(() =>
      [
        ...document.querySelectorAll<HTMLElement>(
          'main :is(.lmu-button--s, .lmu-button--m, .lmu-button--l)',
        ),
      ]
        .filter((node) => node.getClientRects().length)
        .map((node) => ({
          size: (node.className.match(/lmu-button--([sml])\b/) ?? [])[1],
          height: node.getBoundingClientRect().height,
          family: getComputedStyle(node).fontFamily,
        })),
    );
    expect(sized.length, path).toBeGreaterThanOrEqual(2);
    expect(new Set(sized.map((row) => row.family)).size, path).toBe(1);
    for (const row of sized)
      expect(row.height, `${path} ${row.size}`).toBeGreaterThanOrEqual(
        expected[row.size as keyof typeof expected] - 0.5,
      );
  }
});
