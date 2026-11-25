import { expect, type Page } from '@playwright/test';

/**
 * Perfil anterior ao lote 7: sem primeiro uso e sem camada gravada (=
 * Completa). Desde o lote 7, banco vazio vira perfil novo (Discreta, com o
 * painel opcional no Hoje). Só os testes que dependem da camada Completa
 * (cartão Jornada, Jornada na barra, recursos no Hoje, troca a partir da
 * Completa) chamam isto, no começo do teste; os demais rodam como perfil
 * novo, para não esconder regressões de quem chega agora. O teste navega de
 * novo em seguida, então o app relê o perfil já convertido.
 */
export async function existingUser({ page }: { page: Page }) {
  await page.goto('/');
  // Espera o app criar o banco e o perfil antes de mexer nele por fora
  // (abrir o banco cedo demais cria um v1 vazio e trava o upgrade do Dexie).
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            new Promise<boolean>((resolve) => {
              const request = indexedDB.open('LevelMeUpDB');
              request.onerror = () => resolve(false);
              request.onsuccess = () => {
                const database = request.result;
                if (!database.objectStoreNames.contains('profile')) {
                  database.close();
                  return resolve(false);
                }
                const get = database
                  .transaction('profile')
                  .objectStore('profile')
                  .get(1);
                get.onsuccess = () => {
                  database.close();
                  resolve(!!get.result);
                };
                get.onerror = () => {
                  database.close();
                  resolve(false);
                };
              };
            }),
        ),
      { timeout: 15_000 },
    )
    .toBe(true);
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('LevelMeUpDB');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction('profile', 'readwrite');
          const store = tx.objectStore('profile');
          const get = store.get(1);
          get.onsuccess = () => {
            const profile = get.result;
            delete profile.firstUse;
            delete profile.gameLayer;
            store.put(profile);
          };
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
  await page.goto('about:blank');
}
