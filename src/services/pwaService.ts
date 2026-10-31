import { dev } from '$app/environment';
import { writable, get } from 'svelte/store';
import { unsafeToUpdate, updateLocked } from './updateSafety';
export const APP_SCHEMA = 5,
  UPDATE_PROTOCOL = 1;
export const pwaState = writable({
  supported: false,
  ready: false,
  offline: false,
  waiting: false,
  compatible: true,
  checking: false,
  installed: false,
  installable: false,
  message: '',
  version: '',
  activeVersion: '',
});
let registration: ServiceWorkerRegistration | undefined,
  installEvent: any,
  waitingWorker: ServiceWorker | null = null;
let lockedRequest: string | null = null;
function patch(value: Partial<ReturnType<typeof getState>>) {
  pwaState.update((state) => ({ ...state, ...value }));
}
function getState() {
  return get(pwaState);
}
function ask(
  worker: ServiceWorker,
  data: unknown,
  timeout = 7000,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => {
      channel.port1.close();
      reject(
        new Error(
          'Não foi possível confirmar a atualização. Feche outras abas do aplicativo e tente novamente.',
        ),
      );
    }, timeout);
    channel.port1.onmessage = (event) => {
      clearTimeout(timer);
      channel.port1.close();
      resolve(event.data);
    };
    worker.postMessage(data, [channel.port2]);
  });
}
async function inspectWaiting() {
  waitingWorker = registration?.waiting ?? null;
  const worker = waitingWorker;
  if (!worker || worker.state !== 'installed') {
    patch({ waiting: false });
    return;
  }
  try {
    const meta = await ask(worker, { type: 'LMU_META' });
    if (registration?.waiting !== worker || worker.state !== 'installed') {
      waitingWorker = null;
      patch({ waiting: false });
      return;
    }
    patch({
      waiting: true,
      compatible:
        meta.schema === APP_SCHEMA && meta.protocol === UPDATE_PROTOCOL,
      version: meta.version,
    });
  } catch {
    const stillWaiting =
      registration?.waiting === worker && worker.state === 'installed';
    patch({ waiting: stillWaiting, compatible: !stillWaiting });
    if (!stillWaiting) waitingWorker = null;
  }
}
export async function applyUpdate() {
  if (!waitingWorker || !getState().compatible) return;
  patch({ checking: true, message: '' });
  try {
    const result = await ask(waitingWorker, {
      type: 'LMU_APPLY_UPDATE',
      id: crypto.randomUUID(),
      schema: APP_SCHEMA,
      protocol: UPDATE_PROTOCOL,
    }, 16000);
    if (!result.ok)
      patch({
        message:
          'Há uma gravação, formulário ou aba sem resposta. Conclua o que está fazendo nas outras abas e tente novamente.',
      });
  } catch (cause) {
    patch({
      message:
        cause instanceof Error
          ? cause.message
          : 'Não foi possível atualizar agora.',
    });
  } finally {
    patch({ checking: false });
  }
}
export async function checkUpdate() {
  await refreshUpdate(false);
}
async function refreshUpdate(silent: boolean) {
  if (!registration || getState().checking) return;
  patch({ checking: true, ...(silent ? {} : { message: '' }) });
  try {
    await registration.update();
    await inspectWaiting();
  } catch {
    if (!silent)
      patch({
        message:
          'Não foi possível buscar uma atualização agora. Seus dados locais continuam disponíveis.',
      });
  } finally {
    patch({ checking: false });
  }
}
export async function installApp() {
  if (!installEvent) return;
  const event = installEvent;
  installEvent = null;
  try {
    await event.prompt();
    await event.userChoice;
  } catch {
    patch({
      message:
        'Não foi possível abrir a instalação. Confira as opções disponíveis no menu do navegador.',
    });
  } finally {
    patch({ installable: false });
  }
}
export function initializePwa() {
  patch({
    offline: !navigator.onLine,
    installed:
      matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true,
  });
  const connection = () => patch({ offline: !navigator.onLine });
  window.addEventListener('online', connection);
  window.addEventListener('offline', connection);
  const beforeInstall = (event: Event) => {
    event.preventDefault();
    installEvent = event;
    patch({ installable: true });
  };
  const installed = () => patch({ installed: true, installable: false });
  window.addEventListener('beforeinstallprompt', beforeInstall);
  window.addEventListener('appinstalled', installed);
  const message = (event: MessageEvent) => {
    const data = event.data;
    if (data?.protocol !== UPDATE_PROTOCOL) return;
    if (data.type === 'LMU_UPDATE_ABORT') {
      if (data.id === lockedRequest) {
        updateLocked.set(false);
        lockedRequest = null;
      }
      return;
    }
    if (data.type !== 'LMU_UPDATE_PREPARE') return;
    const ready =
      data.schema === APP_SCHEMA &&
      !unsafeToUpdate() &&
      !document.querySelector('dialog[open], [aria-modal="true"]');
    if (ready) {
      lockedRequest = data.id;
      updateLocked.set(true);
    }
    const source = event.source as ServiceWorker | null;
    source?.postMessage({
      type: 'LMU_UPDATE_ACK',
      id: data.id,
      ready,
      protocol: UPDATE_PROTOCOL,
    } as any);
  };
  const confirmActive = async () => {
    const controller = navigator.serviceWorker?.controller;
    if (!controller) {
      patch({ ready: false });
      return;
    }
    try {
      const meta = await ask(controller, { type: 'LMU_META' }, 2500);
      patch({
        ready: meta.protocol === UPDATE_PROTOCOL && meta.schema === APP_SCHEMA,
        activeVersion: meta.version,
      });
    } catch {
      patch({
        ready: false,
        message:
          'Não foi possível confirmar o cache desta versão. Atualize quando suas gravações estiverem concluídas ou feche as abas e reabra o aplicativo.',
      });
    }
  };
  const changed = () => {
    if (get(updateLocked)) location.reload();
    else {
      void confirmActive();
      void inspectWaiting();
    }
  };
  let lastAutomaticCheck = 0;
  const checkOnReturn = () => {
    if (
      document.visibilityState !== 'visible' ||
      Date.now() - lastAutomaticCheck < 60000
    )
      return;
    lastAutomaticCheck = Date.now();
    void refreshUpdate(true);
  };
  window.addEventListener('focus', checkOnReturn);
  window.addEventListener('online', checkOnReturn);
  document.addEventListener('visibilitychange', checkOnReturn);
  const updateClock = setInterval(checkOnReturn, 60000);
  navigator.serviceWorker?.addEventListener('message', message);
  navigator.serviceWorker?.addEventListener('controllerchange', changed);
  if (!dev && 'serviceWorker' in navigator && window.isSecureContext) {
    patch({ supported: true });
    void confirmActive();
    void navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then(async (reg) => {
        registration = reg;
        void confirmActive();
        const observe = (worker: ServiceWorker | null) => {
          if (!worker) return;
          const state = () => {
            if (worker.state === 'installed' || worker.state === 'activated')
              void inspectWaiting();
            if (worker.state === 'redundant')
              patch({
                message:
                  'Não foi possível preparar o uso offline neste navegador. Os dados da jornada não foram apagados.',
              });
          };
          worker.addEventListener('statechange', state);
          state();
        };
        reg.addEventListener('updatefound', () => observe(reg.installing));
        observe(reg.installing);
        await inspectWaiting();
      })
      .catch(() =>
        patch({
          message: navigator.serviceWorker.controller
            ? 'Não foi possível buscar novidades agora. A jornada continua usando os recursos já disponíveis neste navegador.'
            : 'Não foi possível preparar o uso offline neste navegador. Continue usando a jornada e mantenha um backup externo.',
        }),
      );
  }
  return () => {
    clearInterval(updateClock);
    window.removeEventListener('focus', checkOnReturn);
    window.removeEventListener('online', checkOnReturn);
    document.removeEventListener('visibilitychange', checkOnReturn);
    window.removeEventListener('online', connection);
    window.removeEventListener('offline', connection);
    window.removeEventListener('beforeinstallprompt', beforeInstall);
    window.removeEventListener('appinstalled', installed);
    navigator.serviceWorker?.removeEventListener('message', message);
    navigator.serviceWorker?.removeEventListener('controllerchange', changed);
  };
}
