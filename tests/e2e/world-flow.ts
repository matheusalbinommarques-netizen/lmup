import { expect, type Page } from '@playwright/test';
export async function worldData(page: Page) {
  return page.evaluate(
    () =>
      new Promise<any>((resolve, reject) => {
        // The app may not have created the database yet right after goto.
        // Opening it first would create an empty one (no stores) and block
        // the app's own upgrade, so never create it here and retry instead.
        const attempt = (left: number) => {
          const retry = () =>
            left > 0
              ? setTimeout(() => attempt(left - 1), 100)
              : reject(new Error('LevelMeUpDB não ficou pronto.'));
          const r = indexedDB.open('LevelMeUpDB');
          r.onupgradeneeded = () => r.transaction?.abort();
          r.onerror = (event) => {
            event.preventDefault();
            retry();
          };
          r.onsuccess = () => {
            const d = r.result;
            if (!d.objectStoreNames.contains('profile')) {
              d.close();
              retry();
              return;
            }
            const t = d.transaction(['profile', 'activityEvents'], 'readonly'),
              p = t.objectStore('profile').get(1),
              e = t.objectStore('activityEvents').getAll();
            t.oncomplete = () => {
              d.close();
              if (!p.result) retry();
              else resolve({ profile: p.result, events: e.result });
            };
            t.onerror = () => {
              d.close();
              reject(t.error);
            };
          };
        };
        attempt(100);
      }),
  );
}
export async function interact(page: Page, name: string) {
  const stage = page.getByRole('dialog', {
    name: 'Exploração do Oásis',
    exact: true,
  });
  await expect(stage).toBeVisible();
  await expect(
    stage.getByRole('button', { name: 'Voltar ao mapa', exact: true }),
  ).toBeEnabled();
  const back = stage.getByRole('button', {
    name: 'Voltar à exploração',
    exact: false,
  });
  if (await back.isVisible()) {
    await back.click();
    await expect(back).toHaveCount(0);
  }
  if (
    !(await stage
      .getByRole('navigation', { name: 'Interações da cena', exact: true })
      .isVisible())
  )
    await stage
      .getByRole('button', { name: 'Pontos interativos', exact: false })
      .click();

  await page
    .getByRole('navigation', { name: 'Interações da cena', exact: true })
    .getByRole('button', { name: new RegExp(name) })
    .click();
  if (name === 'Voltar ao Oásis')
    await expect(
      stage.getByRole('heading', { name: 'Oásis dos Fundadores', exact: true }),
    ).toBeVisible();
  if (name === 'Caminho dos arredores')
    await expect(
      page.getByRole('heading', { name: 'Arredores do Oásis', exact: true }),
    ).toBeVisible();
}
export async function investigate(page: Page) {
  await page
    .getByRole('button', { name: 'Entrar no assentamento', exact: true })
    .click();
  await interact(page, 'Conversar com Lucan');
  await page
    .getByRole('button', { name: 'Vou investigar os arredores.', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Vou continuar procurando.', exact: true })
    .click();
  await interact(page, 'Caminho dos arredores');
  for (const name of [
    'Examinar a carroça',
    'Examinar a carga',
    'Seguir as pegadas',
  ]) {
    await interact(page, name);
    await page
      .getByRole('button', { name: 'Registrar pista', exact: true })
      .click();
    await expect(
      page.getByText('✓ Pista registrada no diário', { exact: true }),
    ).toBeVisible();
  }
}
export async function resolveInvestigation(
  page: Page,
  resolution: 'route' | 'rescue' = 'route',
) {
  await interact(page, 'Voltar ao Oásis');
  await interact(page, 'Conversar com Lucan');
  await page
    .getByRole('button', {
      name: 'Rever as pistas antes de decidir.',
      exact: true,
    })
    .click();
  await expect(
    page.getByText(
      'parte dos mantimentos chegou, e o restante ficou onde você encontrou a carroça.',
      {
        exact: false,
      },
    ),
  ).toBeVisible();
  await page
    .getByRole('button', {
      name:
        resolution === 'route'
          ? 'Vou preparar uma rota mais segura.'
          : 'Vou ajudar a recuperar a carga restante.',
      exact: false,
    })
    .click();
  const confirm = page.getByRole('dialog', {
    name: 'Registrar sua decisão',
    exact: true,
  });
  await confirm
    .getByRole('button', { name: 'Confirmar decisão', exact: true })
    .click();
  await expect(confirm).not.toBeVisible();
  await expect(
    page.getByText('Investigação concluída', { exact: true }),
  ).toBeVisible();
}
