import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

async function capture(page: Page, name: string) {
  if (!process.env.LMU_HOME_CAPTURE_DIR) return;
  await mkdir(process.env.LMU_HOME_CAPTURE_DIR, { recursive: true });
  await page.evaluate(() =>
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' }),
  );
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.screenshot({
    path: join(process.env.LMU_HOME_CAPTURE_DIR, name + '.png'),
    fullPage: page.viewportSize()?.width !== 390,
  });
}

async function awaitStoredMission(page: Page, title: string) {
  await expect.poll(() => page.evaluate(async (name) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('LevelMeUpDB');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<boolean>((resolve, reject) => {
        const request = db.transaction('tasks', 'readonly').objectStore('tasks').getAll();
        request.onsuccess = () => resolve(request.result.some((task) => task.title === name));
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  }, title), { timeout: 15000, message: 'Missão deve estar persistida antes de navegar' }).toBe(true);
}

async function createMission(page: Page, title: string) {
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Uma nova missão' });
  await dialog.getByLabel('O que você quer fazer?').fill(title);
  await dialog
    .getByRole('button', { name: 'Criar missão', exact: true })
    .click();
  await awaitStoredMission(page, title);
  await page.goto('/missoes');
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await page.getByRole('link', { name: title, exact: true }).click();
  await expect(page).toHaveURL(/\/missao\/\d+$/);
  await expect(
    page.getByRole('heading', { name: title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeEnabled();
}

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}

test('Home integra mundo real, personagem e conclusão sem inventar tarefas', async ({
  page,
}, info) => {
  await page.setViewportSize(
    info.project.name === 'desktop'
      ? { width: 1440, height: 900 }
      : { width: 390, height: 844 },
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: 'Seu personagem', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('progressbar', { name: 'Evolução do ambiente' }),
  ).toHaveAttribute('value', '0');
  await expect(
    page.getByRole('button', { name: 'Criar minha primeira missão' }),
  ).toBeVisible();
  await noOverflow(page);
  await capture(page, info.project.name + '-primeiro-acesso');

  await createMission(page, 'Preparar uma proposta de projeto');
  await page.goto('/');
  await createMission(page, 'Revisar minhas anotações');
  await page.goto('/');
  await expect(
    page.getByRole('heading', {
      name: 'Revisar minhas anotações',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Começar missão', exact: true }),
  ).toBeVisible();
  if (info.project.name === 'mobile') {
    const action = await page
      .getByRole('link', { name: 'Começar missão', exact: true })
      .boundingBox();
    const navigation = await page
      .getByRole('navigation', { name: 'Navegação móvel', exact: true })
      .boundingBox();
    expect(action!.y + action!.height).toBeLessThan(navigation!.y);
  }
  await capture(page, info.project.name + '-pendentes');
  await page
    .getByRole('link', { name: 'Começar missão', exact: true })
    .click();
  await page.getByRole('button', { name: 'Iniciar missão', exact: true }).click();
  await page
    .getByRole('button', { name: 'Pausar e voltar', exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp('/missoes$'));
  await page.goto('/');
  await expect(
    page.getByRole('link', { name: 'Continuar missão', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Continuar missão', exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp('/missao/[0-9]+$'));
  const resume = page.getByRole('button', { name: 'Retomar missão', exact: true });
  if (!(await resume.isVisible())) {
    console.log(
      'LMUP_HOME_PAUSE_DIAGNOSTIC',
      JSON.stringify({
        url: page.url(),
        body: (await page.locator('body').innerText()).slice(0, 800),
      }),
    );
  }
  await resume.click();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  await page.goto('/');
  await page
    .getByRole('link', { name: 'Começar missão', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Missão concluída!', exact: true }),
  ).toBeVisible();
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Você está em dia.', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Concluídas', exact: true }).click();
  await expect(
    page
      .getByRole('region', { name: 'Lista de missões', exact: true })
      .getByRole('link', {
        name: /Revisar minhas anotações Concluída/,
      }),
  ).toBeVisible();
  await noOverflow(page);
  await capture(page, info.project.name + '-concluidas');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Você está em dia.', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('Home mostra perfil, equipamento, ambiente e capítulo dos dados acumulados', async ({
  page,
}, info) => {
  await page.setViewportSize(
    info.project.name === 'desktop'
      ? { width: 1440, height: 900 }
      : { width: 390, height: 844 },
  );
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: 'Seu personagem' }),
  ).toBeVisible();
  // Only disposable test contexts are seeded; no runtime fixture or sample data.
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(
            ['profile', 'ownedShopItems', 'projects'],
            'readwrite',
          );
          const store = tx.objectStore('profile');
          const profile = store.get(1);
          profile.onsuccess = () =>
            store.put({
              ...profile.result,
              name: 'Helena da Aurora',
              title: 'Arquimago Grão-Mestre',
              level: 11,
              totalXpEarned: 8000,
              xpCurrent: 1484,
              xpNext: 1559,
              gold: 735,
              rpgPilot: {
                scene: 6,
                chapterOneEndXp: 7800,
                chapterTwoUnlocked: true,
                chapterTwoScene: 1,
              },
            });
          tx.objectStore('ownedShopItems').put({
            id: 91,
            itemId: 101,
            equipped: true,
            acquiredAt: '2026-10-01T12:00:00Z',
          });
          tx.objectStore('projects').put({
            id: 92,
            name: 'Preparar o portfólio',
            status: 'em_andamento',
            createdAt: '2026-10-01T12:00:00Z',
          });
          tx.oncomplete = () => {
            database.close();
            resolve();
          };
          tx.onerror = () => {
            database.close();
            reject(tx.error);
          };
        };
      }),
  );
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Helena da Aurora', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Árvore Jovem', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Faltam 4000 XP para Floresta Anciã.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('735 Gold', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Equipado: Cota da Rotina' }),
  ).toBeVisible();
  await expect(
    page.getByText('Capítulo 2 · cena 2 de 3', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('progressbar', { name: 'Experiência do personagem' }),
  ).toHaveAttribute('value', '1484');
  await expect(
    page.getByRole('link', {
      name: 'Preparar o portfólio Em andamento',
      exact: true,
    }),
  ).toBeVisible();
  await noOverflow(page);
  await capture(page, info.project.name + '-progresso');
});

test('Home em 320px, tablet, texto 200%, teclado e arte ausente mantém ações', async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/art/pilot/**', (route) => route.abort());
  await page.route('**/fonts/**', (route) => route.abort());
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Criar minha primeira missão' }),
  ).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Seu ambiente no estágio Semente' }),
  ).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await noOverflow(page);
  const titleLayout = await page
    .getByRole('heading', { name: 'Herói sem nome', exact: true })
    .evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight),
    }));
  // No horizontal overflow is insufficient if the name wraps letter by letter.
  expect(titleLayout.height).toBeLessThanOrEqual(titleLayout.lineHeight * 3.1);
  await page.getByRole('button', { name: 'Nova missão', exact: true }).focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Uma nova missão' });
  await expect(dialog.getByLabel('O que você quer fazer?')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('button', { name: 'Nova missão', exact: true }),
  ).toBeFocused();
  await capture(page, info.project.name + '-320-texto-200');
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '100%';
  });
  await noOverflow(page);
});
