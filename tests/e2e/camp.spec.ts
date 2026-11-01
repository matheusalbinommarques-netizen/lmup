import { expect, test } from '@playwright/test';

test('arraste não seleciona no soltar e o próximo clique ou toque seleciona a construção', async ({
  page,
  context,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/laboratorio/acampamento');
  await expect(
    page.getByRole('heading', { name: 'Acampamento navegável', exact: true }),
  ).toBeVisible();
  const viewport = page.getByRole('region', {
    name: 'Terreno do acampamento, arrastável',
    exact: true,
  });
  const world = page.locator('.world');
  const before = await world.getAttribute('style');
  const bounds = (await viewport.boundingBox())!;
  const hall = page.getByRole('button', {
    name: 'Selecionar Salão do acampamento',
    exact: true,
  });
  const hallBounds = (await hall.boundingBox())!;
  const start = { x: bounds.x + 25, y: bounds.y + 200 };
  const end = {
    x: hallBounds.x + hallBounds.width / 2,
    y: hallBounds.y + hallBounds.height / 2,
  };
  if (info.project.name === 'mobile') {
    const touch = await context.newCDPSession(page);
    await touch.send('Input.synthesizeScrollGesture', {
      x: start.x,
      y: start.y,
      xDistance: start.x - end.x,
      yDistance: start.y - end.y,
      gestureSourceType: 'touch',
      speed: 600,
    });
  } else {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 8 });
    await page.mouse.up();
  }
  await expect(world).not.toHaveAttribute('style', before!);
  await expect(page.locator('.building[aria-pressed="true"]')).toHaveCount(0);
  const reset = page.getByRole('button', {
    name: 'Centralizar mapa',
    exact: true,
  });
  if (info.project.name === 'mobile') await reset.tap();
  else await reset.click();
  if (info.project.name === 'mobile') await hall.tap();
  else await hall.click();
  await expect(hall).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('heading', { name: 'Salão do acampamento', exact: true }),
  ).toBeVisible();
  const forge = page.getByRole('button', {
    name: 'Selecionar Forja',
    exact: true,
  });
  await forge.focus();
  await page.keyboard.press('Enter');
  await expect(forge).toHaveAttribute('aria-pressed', 'true');
  await expect(hall).toHaveAttribute('aria-pressed', 'false');
  await expect(
    page.getByRole('heading', { name: 'Forja', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
