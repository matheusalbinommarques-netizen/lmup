import { expect, test, type Page } from '@playwright/test';
import { confirmBackupImport } from './backup-ui';

// A15. A "pasta" é um diretório do armazenamento privado do navegador (OPFS):
// mesmo tipo de handle e gravação do seletor real, sem tocar o disco do usuário.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'showDirectoryPicker', {
      configurable: true,
      value: async () =>
        (await navigator.storage.getDirectory()).getDirectoryHandle(
          'pasta-de-backup',
          { create: true },
        ),
    });
  });
});

const readCopy = (page: Page) =>
  page.evaluate(async () => {
    const dir = await (
      await navigator.storage.getDirectory()
    ).getDirectoryHandle('pasta-de-backup');
    const file = await (await dir.getFileHandle('lmup-backup.json')).getFile();
    return {
      text: await file.text(),
      names: await (async () => {
        const names: string[] = [];
        for await (const name of (
          dir as unknown as { keys(): AsyncIterable<string> }
        ).keys())
          names.push(name);
        return names;
      })(),
    };
  });

test('copia para a pasta, substitui o arquivo e a cópia restaura a jornada', async ({
  page,
}) => {
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
          tx.objectStore('tasks').put({
            id: 940,
            title: 'Missão guardada na pasta',
            xp: 50,
            effort: 'small',
            rarity: 'common',
            status: 'available',
            completed: false,
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

  await page.goto('/config');
  const section = page.getByRole('region', {
    name: 'Cópia automática em pasta',
  });
  await section.getByRole('button', { name: 'Escolher pasta' }).click();
  await expect(section).toContainText(
    'Pasta escolhida e primeira cópia gravada.',
  );
  await expect(section).toContainText('Pasta: pasta-de-backup');
  const first = await readCopy(page);
  expect(first.names).toEqual(['lmup-backup.json']);
  expect(first.text).toContain('Missão guardada na pasta');

  // Uma segunda cópia substitui a primeira: continua um arquivo só.
  await section.getByRole('button', { name: 'Copiar agora' }).click();
  await expect(section).toContainText('Cópia gravada na pasta.');
  expect((await readCopy(page)).names).toEqual(['lmup-backup.json']);

  // Restaurar a partir da cópia da pasta num perfil sintético.
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onsuccess = () => {
          const tx = request.result.transaction('tasks', 'readwrite');
          tx.objectStore('tasks').delete(940);
          tx.oncomplete = () => {
            request.result.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
  const copy = await readCopy(page);
  await page.getByLabel('Arquivo de backup JSON').setInputFiles({
    name: 'lmup-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(copy.text),
  });
  await confirmBackupImport(page);
  await page.goto('/missoes');
  await expect(
    page.getByText('Missão guardada na pasta').first(),
  ).toBeVisible();

  // Desligar esquece a pasta, mas não apaga o arquivo já gravado.
  await page.goto('/config');
  await section.getByRole('button', { name: 'Desligar' }).click();
  await expect(
    section.getByRole('button', { name: 'Escolher pasta' }),
  ).toBeVisible();
  expect((await readCopy(page)).names).toEqual(['lmup-backup.json']);
});
