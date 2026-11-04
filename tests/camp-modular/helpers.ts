import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
} from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Profile, Companion } from '../../src/services/db';
import type { ProductivityAudit } from '../../src/services/productivityTypes';
declare global {
  interface Window {
    __unexpectedPersonalOpens: string[];
    __testOpen: (name: string, version?: number) => IDBOpenDBRequest;
  }
}
export const DEMO = 'LevelMeUpCampCinematicPreview';
export const CAPTURES =
  process.env.LMU_CAMP_CAPTURES ??
  'D:/Codex-artifacts/camp-modular-20261103/captures';
export type Snapshot = {
  profile: Profile;
  audits: ProductivityAudit[];
  companions: Companion[];
  recoveries: number;
};
export async function watchDatabase(context: BrowserContext) {
  await context.addInitScript(() => {
    const original = IDBFactory.prototype.open;
    window.__unexpectedPersonalOpens = [];
    window.__testOpen = (name, version) =>
      version === undefined
        ? original.call(indexedDB, name)
        : original.call(indexedDB, name, version);
    IDBFactory.prototype.open = function (name, version) {
      if (name === 'LevelMeUpDB') window.__unexpectedPersonalOpens.push(name);
      return version === undefined
        ? original.call(this, name)
        : original.call(this, name, version);
    };
  });
}
export async function readState(page: Page): Promise<Snapshot> {
  return page.evaluate(
    (name) =>
      new Promise<Snapshot>((resolve, reject) => {
        const request = window.__testOpen(name);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction(
              [
                'profile',
                'productivityAudit',
                'companions',
                'recoverySnapshots',
              ],
              'readonly',
            );
          const profile = tx.objectStore('profile').get(1),
            audits = tx.objectStore('productivityAudit').getAll(),
            pets = tx.objectStore('companions').getAll(),
            recovery = tx.objectStore('recoverySnapshots').count();
          tx.onerror = () => reject(tx.error);
          tx.oncomplete = () => {
            resolve({
              profile: profile.result,
              audits: audits.result,
              companions: pets.result,
              recoveries: recovery.result,
            });
            db.close();
          };
        };
      }),
    DEMO,
  );
}
export async function seedLegacy(page: Page) {
  await page.evaluate(
    (name) =>
      new Promise<void>((resolve, reject) => {
        const request = window.__testOpen(name);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction(['profile', 'productivityAudit'], 'readwrite'),
            store = tx.objectStore('profile');
          const p = store.get(1);
          p.onsuccess = () => {
            store.put({
              ...p.result,
              gold: 37,
              food: 88,
              totalXpEarned: 0,
              campPreview: {
                version: 1,
                epoch: 'legacy-demo-epoch',
                revision: 7,
                caretakerMet: true,
                residenceBuilt: true,
              },
            });
            tx.objectStore('productivityAudit').put({
              id: 'camp-preview:residence:built',
              entityId: 'camp-preview:residence',
              action: 'camp-preview:build',
              recordedAt: '2026-11-01T12:00:00.000Z',
              before: { gold: 87 },
              after: { gold: 37, built: true, cost: 50, synthetic: true },
            });
          };
          tx.onerror = () => reject(tx.error);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
        };
      }),
    DEMO,
  );
}
export async function seedKnownWolf(page: Page) {
  await page.evaluate(
    (name) =>
      new Promise<void>((resolve, reject) => {
        const request = window.__testOpen(name);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction('profile', 'readwrite'),
            store = tx.objectStore('profile'),
            row = store.get(1);
          row.onsuccess = () =>
            store.put({
              ...row.result,
              campPreview: {
                ...row.result.campPreview,
                discoveredCompanionIds: [1],
              },
            });
          tx.onerror = () => reject(tx.error);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
        };
      }),
    DEMO,
  );
}
export async function personalSentinel(page: Page, write = false) {
  return page.evaluate(
    (write) =>
      new Promise<string>((resolve, reject) => {
        const request = window.__testOpen('LevelMeUpDB', 1);
        request.onupgradeneeded = () =>
          request.result.createObjectStore('sentinel');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction('sentinel', write ? 'readwrite' : 'readonly'),
            store = tx.objectStore('sentinel');
          if (write) store.put('synthetic-personal-sentinel', 'keep');
          const result = store.get('keep');
          tx.onerror = () => reject(tx.error);
          tx.oncomplete = () => {
            db.close();
            resolve(result.result);
          };
        };
      }),
    write,
  );
}
export async function ready(page: Page) {
  await expect(page.getByTestId('point-caretaker')).toBeAttached();
  await expect(page.getByTestId('camp-balance')).toBeVisible();
}
export async function point(
  page: Page,
  id: string,
  label: string,
  info: TestInfo,
) {
  if (info.project.name === 'mobile')
    await page
      .getByRole('navigation', { name: 'Acessos da cena' })
      .getByRole('button', { name: label, exact: true })
      .click();
  else await page.getByTestId('point-' + id).click();
}
export async function buy(page: Page, info: TestInfo) {
  await point(page, 'caretaker', 'Caseiro', info);
  await expect(page.getByRole('dialog')).toContainText('Após construir');
  await page
    .getByRole('button', {
      name: 'Confirmar construção · 50 ouro',
      exact: true,
    })
    .click();
  await expect(page.getByTestId('point-interior')).toBeAttached();
  await expect(page.getByTestId('camp-balance')).toHaveText(
    '0 ouro · 120 comida',
  );
}
export async function capture(
  page: Page,
  info: TestInfo,
  name: string,
  canvas = false,
) {
  await page.evaluate(async () => {
    window.scrollTo(0, 0);
    await document.fonts.ready;
  });
  await mkdir(CAPTURES, { recursive: true });
  const path = join(CAPTURES, info.project.name + '-' + name + '.png');
  if (canvas) await page.getByTestId('layered-scene').screenshot({ path });
  else await page.screenshot({ path, fullPage: true });
  await info.attach(name, { path, contentType: 'image/png' });
}
export async function back(page: Page) {
  await page
    .getByRole('button', { name: 'Voltar ao Centro', exact: false })
    .click();
  await expect(page.getByTestId('camp-scene')).toHaveAttribute(
    'data-scene',
    'center',
  );
}
