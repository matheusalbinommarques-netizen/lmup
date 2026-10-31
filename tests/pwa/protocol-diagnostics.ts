import type { BrowserContext, TestInfo } from '@playwright/test';

// Called only after failure: do not change startup or message delivery timing.
export async function captureProtocolDiagnostics(
  context: BrowserContext,
  info: TestInfo,
) {
  const pages = await Promise.all(
    context.pages().map(async (page) => ({
      url: page.url(),
      state: await page
        .evaluate(async () => {
          const reg = await navigator.serviceWorker.getRegistration();
          const describe = (worker: ServiceWorker | null | undefined) =>
            worker
              ? { state: worker.state, scriptURL: worker.scriptURL }
              : null;
          const diagnostic = (worker: ServiceWorker | null | undefined) =>
            new Promise((resolve) => {
              if (!worker) return resolve(null);
              const channel = new MessageChannel();
              const timer = setTimeout(() => {
                channel.port1.close();
                resolve(null);
              }, 1000);
              channel.port1.onmessage = (event) => {
                clearTimeout(timer);
                channel.port1.close();
                resolve(event.data);
              };
              worker.postMessage({ type: 'LMU_META' }, [channel.port2]);
            });
          return {
            controller: describe(navigator.serviceWorker.controller),
            waiting: describe(reg?.waiting),
            active: describe(reg?.active),
            lock: document.querySelector('.pwa-lock')?.textContent,
            notice: document.querySelector('.pwa-update')?.textContent,
            notes: (
              document.querySelector('#execution-notes') as HTMLTextAreaElement
            )?.value,
            saveStatus: document.querySelector('.journey-save-status')
              ?.textContent,
            workerDiagnostics: await Promise.all([
              diagnostic(reg?.active),
              diagnostic(reg?.waiting),
            ]),
          };
        })
        .catch((error) => String(error)),
    })),
  );
  await info.attach('pwa-protocol', {
    body: JSON.stringify({ pages }, null, 2),
    contentType: 'application/json',
  });
  console.error('LMUP_PWA_PROTOCOL', JSON.stringify({ pages }));
}
