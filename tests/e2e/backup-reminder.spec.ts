import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import {
  OLD_EXPORT,
  REMINDER_NOW,
  expectBackupSnooze,
  seedBackupReminder,
} from './backup-reminder-fixture';

test('A14: instalação vazia não avisa; o primeiro conteúdo recebe 14 dias', async ({
  page,
}) => {
  await page.clock.install({ time: new Date(REMINDER_NOW) });
  await page.goto('/');
  await expect(page.locator('.today-hero')).toBeVisible();
  await page.clock.setFixedTime(new Date('2027-02-01T12:00:00Z'));
  await page.goto('/config');
  await expect(
    page.getByRole('heading', { name: 'Configurações', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('complementary', { name: 'Lembrete de backup' }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      localStorage.getItem('lmup:backup-reminder-started'),
    ),
  ).toBeNull();
  await page.goto('/');
  await page.getByRole('button', { name: 'Nova missão', exact: true }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Uma nova missão',
    exact: true,
  });
  await dialog.getByLabel('O que você quer fazer?').fill('Primeiro conteúdo');
  await dialog
    .getByRole('button', { name: 'Criar missão', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem('lmup:backup-reminder-started')),
    )
    .toBe('2027-02-01T12:00:00.000Z');
  await page.clock.setFixedTime(new Date('2027-02-15T11:59:59Z'));
  await page.reload();
  await expect(page.locator('.today-hero')).toBeVisible();
  await expect(
    page.getByRole('complementary', { name: 'Lembrete de backup' }),
  ).toHaveCount(0);
  await page.clock.setFixedTime(new Date('2027-02-15T12:00:00Z'));
  await page.reload();
  await expect(
    page.getByRole('complementary', { name: 'Lembrete de backup' }),
  ).toBeVisible();
});

test('A14: exportar pelo lembrete usa o backup existente e remove o aviso nas duas telas', async ({
  page,
}) => {
  await seedBackupReminder(page);
  const reminder = page.getByRole('complementary', {
    name: 'Lembrete de backup',
  });
  await expect(reminder).toBeVisible();
  await reminder.getByRole('link', { name: 'Fazer backup' }).click();
  await expect(page).toHaveURL(/\/config#backup$/);
  await expect(reminder).toBeVisible();
  const downloading = page.waitForEvent('download');
  await reminder
    .getByRole('button', { name: 'Exportar backup', exact: true })
    .click();
  const download = await downloading;
  const backup = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(backup.data.tasks).toHaveLength(1);
  expect(backup.data.tasks[0].title).toBe('Minha missão para proteger');
  expect(backup.data.profile.totalXpEarned).toBe(0);
  await expect(reminder).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem('lmup:last-export')),
  ).toBe(REMINDER_NOW.replace('Z', '.000Z'));
  await page.goto('/');
  await expect(page.locator('.today-hero')).toBeVisible();
  await expect(reminder).toHaveCount(0);
});

test('A14: adiar sincroniza entre abas, persiste ao recarregar e volta após 14 dias', async ({
  page,
  context,
}) => {
  await seedBackupReminder(page);
  await expectBackupSnooze(page, context);
});

test('A14: falha no download preserva o aviso e a data da exportação anterior', async ({
  page,
}) => {
  await seedBackupReminder(page);
  await page.goto('/config');
  await page.evaluate(() => {
    URL.createObjectURL = () => {
      throw new Error('Download indisponível neste teste');
    };
  });
  const reminder = page.getByRole('complementary', {
    name: 'Lembrete de backup',
  });
  await reminder
    .getByRole('button', { name: 'Exportar backup', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText('Download indisponível');
  await expect(reminder).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem('lmup:last-export')),
  ).toBe(OLD_EXPORT);
});
