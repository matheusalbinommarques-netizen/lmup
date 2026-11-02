import { expect, type Page } from '@playwright/test';
export async function worldData(page: Page) {
  return page.evaluate(
    () =>
      new Promise<any>((resolve, reject) => {
        const r = indexedDB.open('LevelMeUpDB');
        r.onsuccess = () => {
          const d = r.result,
            t = d.transaction(['profile', 'activityEvents'], 'readonly'),
            p = t.objectStore('profile').get(1),
            e = t.objectStore('activityEvents').getAll();
          t.oncomplete = () => {
            resolve({ profile: p.result, events: e.result });
            d.close();
          };
          t.onerror = () => reject(t.error);
        };
      }),
  );
}
export async function interact(page: Page, name: string) {
  const stage = page.getByRole('dialog', {
    name: 'Exploração do Oásis',
    exact: true,
  });
  if (await stage.isVisible()) {
    const back = stage.getByRole('button', {
      name: 'Voltar à exploração',
      exact: false,
    });
    if (await back.isVisible()) await back.click();
    if (
      !(await stage
        .getByRole('navigation', { name: 'Interações da cena', exact: true })
        .isVisible())
    )
      await stage
        .getByRole('button', { name: 'Pontos interativos', exact: false })
        .click();
  }

  await page
    .getByRole('navigation', { name: 'Interações da cena', exact: true })
    .getByRole('button', { name: new RegExp(name) })
    .click();
  if (name === 'Voltar ao assentamento') await expect(stage).toBeVisible();
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
export async function resolveInvestigation(page: Page) {
  await interact(page, 'Voltar ao assentamento');
  await interact(page, 'Conversar com Lucan');
  await page
    .getByRole('button', {
      name: 'Rever as pistas antes de decidir.',
      exact: true,
    })
    .click();
  await expect(
    page.getByText('O relato dos carregadores confirma os três sinais.', {
      exact: false,
    }),
  ).toBeVisible();
  await page
    .getByRole('button', {
      name: 'Registrar a rota e avisar o entreposto.',
      exact: true,
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
