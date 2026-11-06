import { expect, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
export async function campReady(page: Page) {
  await expect(page.getByTestId('point-caretaker')).toBeAttached();
}
export async function campData(page: Page) {
  return page.evaluate(
    () =>
      new Promise<any>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction(['profile', 'productivityAudit', 'companions']);
          const profile = tx.objectStore('profile').get(1),
            audit = tx.objectStore('productivityAudit').getAll(),
            pets = tx.objectStore('companions').getAll();
          tx.onerror = () => reject(tx.error);
          tx.oncomplete = () => {
            resolve({
              profile: profile.result,
              audit: audit.result,
              pets: pets.result,
            });
            db.close();
          };
        };
      }),
  );
}
export async function campSeed(page: Page, fields: Record<string, unknown>) {
  await page.evaluate(
    (fields) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction('profile', 'readwrite'),
            store = tx.objectStore('profile'),
            row = store.get(1);
          row.onsuccess = () => store.put({ ...row.result, ...fields });
          tx.onerror = () => reject(tx.error);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
        };
      }),
    fields,
  );
  // Native IndexedDB fixtures do not emit Dexie's live-query mutation events.
  await page.reload();
}
export async function campPoint(page: Page, id: string, label: string) {
  const mobile = page.getByRole('navigation', { name: 'Acessos da cena' });
  if ((page.viewportSize()?.width ?? 1024) <= 900)
    await mobile.getByRole('button', { name: label, exact: true }).click();
  else
    await page
      .getByTestId(id === 'tree' ? 'tree-hotspot' : 'point-' + id)
      .click();
}
export async function campBuy(page: Page) {
  await campPoint(page, 'caretaker', 'Caseiro');
  await page
    .getByRole('button', {
      name: 'Confirmar construção · 50 ouro',
      exact: true,
    })
    .click();
  await expect(page.getByTestId('point-interior')).toBeAttached();
}
export async function campBack(page: Page) {
  await page
    .getByRole('button', { name: 'Voltar ao Centro', exact: false })
    .click();
  await campReady(page);
}
export async function campCapture(page: Page, info: TestInfo, name: string) {
  const root =
    process.env.LMU_CAMP_INTEGRATION_CAPTURES ??
    join(process.cwd(), 'test-results', 'camp-captures');
  await mkdir(root, { recursive: true });
  await page.evaluate(async () => {
    window.scrollTo(0, 0);
    await document.fonts.ready;
  });
  await page.screenshot({
    path: root + '/' + info.project.name + '-' + name + '.png',
    fullPage: true,
  });
}

/** Abre "Registros do ambiente" pelo Acampamento, com o acampamento já construído e sem mexer em saldos. */
export async function openMilestones(page: Page) {
  await seedBuiltCamp(page);
  await page.goto('/acampamento?scene=garden');
  await expect(page.getByTestId('layered-scene')).toHaveAttribute(
    'data-scene',
    /garden/,
  );
  await campPoint(page, 'tree', 'Árvore de Evolução');
  await page
    .getByRole('button', {
      name: 'Consultar registros do ambiente',
      exact: true,
    })
    .click();
  await expect(page.getByRole('dialog')).toContainText(
    'Transformações do ambiente',
  );
}

/** Abre "Companheiros descobertos" pelo Acampamento já construído, sem mexer em saldos. */
export async function openCompanions(page: Page) {
  await seedBuiltCamp(page);
  await page.goto('/acampamento?scene=bestiary');
  await expect(page.getByTestId('layered-scene')).toHaveAttribute(
    'data-scene',
    /bestiary/,
  );
  await campPoint(page, 'companions', 'Companheiros descobertos');
  await expect(page.getByRole('dialog')).toBeVisible();
}

async function seedBuiltCamp(page: Page) {
  await page.goto('/acampamento');
  await expect(page.getByTestId('layered-scene')).toBeVisible();
  // Estado legítimo de acampamento herdado: recibo `legacy` sem custo, compatível com backup.
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction(['profile', 'productivityAudit'], 'readwrite'),
            profiles = tx.objectStore('profile'),
            row = profiles.get(1);
          row.onsuccess = () => {
            const state = row.result.campSettlement;
            if (!state) {
              reject(new Error('Acampamento ainda não inicializado.'));
              return;
            }
            if (state.residenceBuilt) return;
            profiles.put({
              ...row.result,
              campSettlement: {
                ...state,
                caretakerMet: true,
                residenceBuilt: true,
                revision: state.revision + 1,
              },
            });
            tx.objectStore('productivityAudit').put({
              id: 'camp-settlement:built',
              entityId: 'camp-settlement:built',
              action: 'camp-settlement:inherit',
              recordedAt: new Date().toISOString(),
              before: null,
              after: { source: 'legacy', cost: 0 },
            });
          };
          tx.onerror = () => reject(tx.error);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
        };
      }),
  );
  // Native IndexedDB fixtures do not emit Dexie's live-query mutation events.
  await page.reload();
}
