import { expect, test } from '@playwright/test';

test('jornada da prévia mantém passos ao pausar, conclui e desfaz sem criar banco pessoal', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/laboratorio');
  const before = await page.evaluate(async () =>
    (await indexedDB.databases()).map((database) => database.name),
  );
  await page
    .getByRole('button', { name: 'Continuar missão', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeDisabled();
  await page
    .getByRole('checkbox', { name: /Desenhar três possibilidades/ })
    .check();
  await page
    .getByRole('button', { name: 'Pausar e voltar', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Continuar missão', exact: true })
    .click();
  await expect(
    page.getByRole('checkbox', { name: /Desenhar três possibilidades/ }),
  ).toBeChecked();
  await page.getByRole('checkbox', { name: /Comparar e anotar/ }).check();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Esse passo é seu.', exact: true }),
  ).toBeFocused();
  await page
    .getByRole('button', { name: 'Desfazer conclusão de exemplo' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Concluir missão', exact: true }),
  ).toBeEnabled();
  expect(
    await page.evaluate(async () =>
      (await indexedDB.databases()).map((database) => database.name),
    ),
  ).toEqual(before);
  expect(errors).toEqual([]);
});

test('diálogo valida campo, prende foco, fecha por Escape e devolve foco', async ({
  page,
}) => {
  await page.goto('/laboratorio');
  const trigger = page.getByRole('button', {
    name: 'Nova missão',
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Uma nova missão' });
  const field = dialog.getByLabel('O que você quer fazer?');
  await expect(field).toBeFocused();
  await dialog
    .getByRole('button', { name: 'Adicionar missão', exact: true })
    .click();
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(dialog.getByRole('alert')).toContainText('Dê um nome');
  await page.keyboard.press('Tab');
  expect(
    await page.evaluate(() => !!document.activeElement?.closest('dialog')),
  ).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await field.fill('Uma ideia própria');
  await dialog
    .getByRole('button', { name: 'Adicionar missão', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('Missão adicionada');
  await expect(
    page.getByRole('button', { name: /Uma ideia própria/ }),
  ).toBeVisible();
});

test('320px, altura reduzida e texto 200% não criam rolagem horizontal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/laboratorio');
  const action = await page
    .getByRole('button', { name: 'Continuar missão', exact: true })
    .boundingBox();
  const navigation = await page
    .getByRole('navigation', { name: 'Navegação móvel da prévia', exact: true })
    .boundingBox();
  expect(action!.y + action!.height).toBeLessThan(navigation!.y);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px';
  });
  const noOverflow = async () =>
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  await noOverflow();
  await page
    .getByRole('button', { name: 'Continuar missão', exact: true })
    .click();
  await noOverflow();
  await page
    .getByRole('checkbox', { name: /Desenhar três possibilidades/ })
    .check();
  await page.getByRole('checkbox', { name: /Comparar e anotar/ }).check();
  await page
    .getByRole('button', { name: 'Concluir missão', exact: true })
    .click();
  await noOverflow();
  await page
    .getByRole('button', { name: 'Voltar para hoje', exact: true })
    .click();
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByRole('button', { name: 'Adicionar missão' }),
  ).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds!.height).toBeLessThanOrEqual(568);
  await page.keyboard.press('Escape');
});

test('arte ausente tem alternativa e movimento reduzido mantém ícones e ações', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/art/pilot/**', (route) => route.abort());
  await page.goto('/laboratorio');
  await expect(
    page.getByRole('img', { name: /Terraço de pedra/ }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Continuar missão', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Pausar e voltar', exact: true }),
  ).toBeVisible();
  await page.goto('/laboratorio?view=componentes');
  await page
    .getByRole('checkbox', { name: 'Reduzir arte nesta prévia' })
    .check();
  await expect(
    page.getByRole('button', { name: 'Criar missão', exact: true }),
  ).toBeVisible();
  const animation = await page
    .locator('.lmu-button')
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(animation).toBe('0s');
});

test('quatro estágios carregam e todas as entradas da prévia são alcançáveis', async ({
  page,
  isMobile,
}) => {
  await page.goto('/laboratorio');
  const nav = page.getByRole('navigation', {
    name: isMobile ? 'Navegação móvel da prévia' : 'Navegação da prévia',
    exact: true,
  });
  await nav.getByRole('button', { name: 'Refúgio', exact: true }).click();
  for (const name of [
    'Semente',
    'Brotinho',
    'Árvore Jovem',
    'Floresta Anciã',
  ]) {
    await page.getByRole('radio', { name, exact: true }).check();
    const image = page.getByRole('img', {
      name: `Paisagem no estágio ${name}`,
      exact: true,
    });
    await expect(image).toBeVisible();
    await expect
      .poll(() =>
        image.evaluate(
          (element: HTMLImageElement) =>
            element.complete && element.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await nav.getByRole('button', { name: 'Projetos', exact: true }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Projetos', exact: true }),
  ).toBeVisible();
  await nav.getByRole('button', { name: 'Missões', exact: true }).click();
  await page.getByLabel('Buscar missão').fill('não existe');
  await expect(
    page.getByRole('heading', { name: 'Nenhuma missão por aqui.' }),
  ).toBeVisible();
});
