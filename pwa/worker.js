/* Static files only. Personal journey data remains in IndexedDB. */
const RELEASE = '__LMU_RELEASE__';
const SCHEMA = 5,
  PROTOCOL = 1;
const MANIFEST = self.__WB_MANIFEST;
const SHELL = 'lmu-shell-' + RELEASE,
  ART = 'lmu-art-v1';
const urls = MANIFEST.map(
  (entry) => new URL(entry.url, self.location.origin).href,
);
const paths = new Set(urls.map((url) => new URL(url).pathname));
let barrier = null;
let applying = false;
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(SHELL);
        await cache.addAll(
          urls.map((url) => new Request(url, { cache: 'reload' })),
        );
      } catch (error) {
        await caches.delete(SHELL);
        throw error;
      }
    })(),
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith('lmu-shell-') && key !== SHELL)
          await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});
const route =
  /^\/(?:$|missoes\/?$|progresso\/?$|config\/?$|refugio\/?$|aventura\/?$|bestiario\/?$|inventario\/?$|loja\/?$|trofeus\/?$|perfil\/?$|santuario\/?$|revisoes\/?$|cla\/?$|arquivo\/missoes\/?$|laboratorio\/?$|(?:missao|projetos)\/\d+\/?$|projetos\/?$)/;
async function storeArt(request, response) {
  try {
    if (
      !response.ok ||
      !response.headers.get('content-type')?.startsWith('image/')
    )
      return;
    const blob = await response.clone().blob();
    if (blob.size > 1024 * 1024) return;
    const cache = await caches.open(ART);
    await cache.put(request, response);
    const keys = await cache.keys();
    for (const key of keys.slice(0, Math.max(0, keys.length - 60)))
      await cache.delete(key);
  } catch {
    /* Optional art never prevents the application from working. */
  }
}
self.addEventListener('fetch', (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate' && route.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const shell = await caches.open(SHELL);
        return (
          (await shell.match(
            new URL('/200.html', self.location.origin).href,
          )) || fetch(request)
        );
      })(),
    );
    return;
  }
  if (paths.has(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL);
        return (await cache.match(url.origin + url.pathname)) || fetch(request);
      })(),
    );
    return;
  }
  if (
    url.pathname.startsWith('/art/') &&
    /\.(?:webp|png|jpg|svg)$/.test(url.pathname)
  ) {
    const response = (async () => {
      const cache = await caches.open(ART),
        cached = await cache.match(request);
      const fresh = fetch(request).then((response) => {
        if (!response.ok) throw new Error('Artwork unavailable');
        event.waitUntil(storeArt(request, response.clone()));
        return response;
      });
      if (cached) {
        event.waitUntil(fresh.catch(() => {}));
        return cached;
      }
      try {
        return await fresh;
      } catch {
        if (
          /^\/art\/companions-v2\/(?:wolf|lich|dragon|aberration)-[1-3](?:-(?:160|320))?\.webp$/.test(
            url.pathname,
          )
        ) {
          const compact = url.pathname.replace(
            /(?:-(?:160|320))?\.webp$/,
            '-160.webp',
          );
          const fallback = await caches.match(url.origin + compact);
          if (fallback) return fallback;
        }
        if (/\/scene-\d\.webp$/.test(url.pathname)) {
          const small = await caches.match(
            url.origin + url.pathname.replace('.webp', '-small.webp'),
          );
          if (small) return small;
        }
        return Response.error();
      }
    })();
    event.waitUntil(
      response.then(
        () => {},
        () => {},
      ),
    );
    event.respondWith(response);
  }
});
async function unlock(clients, id) {
  await Promise.all(
    clients.map((client) =>
      client.postMessage({ type: 'LMU_UPDATE_ABORT', id, protocol: PROTOCOL }),
    ),
  );
}
async function update(event) {
  const port = event.ports[0];
  if (!port) return;
  if (barrier) {
    port.postMessage({ ok: false, reason: 'busy' });
    return;
  }
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });
  const id = event.data.id;
  let resolve;
  const pending = new Promise((done) => {
    resolve = done;
  });
  barrier = {
    id,
    expected: new Set(clients.map((client) => client.id)),
    ready: new Set(),
    resolve,
  };
  // Background tabs may delay acknowledgements under browser throttling.
  // Keep the safety barrier: never activate without every tab's ACK.
  const timer = setTimeout(() => resolve(false), 12000);
  for (const client of clients)
    client.postMessage({
      type: 'LMU_UPDATE_PREPARE',
      id,
      protocol: PROTOCOL,
      schema: SCHEMA,
    });
  if (!clients.length) resolve(true);
  const ready = await pending;
  clearTimeout(timer);
  const current = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });
  const unchanged =
    current.length === clients.length &&
    current.every((client) => barrier.expected.has(client.id));
  barrier = null;
  if (!ready || !unchanged) {
    await unlock(current.concat(clients), id);
    port.postMessage({ ok: false, reason: 'busy' });
    return;
  }
  port.postMessage({ ok: true });
  await self.skipWaiting();
}
self.addEventListener('message', (event) => {
  const data = event.data;
  if (data?.type === 'LMU_META') {
    event.ports[0]?.postMessage({
      version: RELEASE,
      schema: SCHEMA,
      protocol: PROTOCOL,
    });
    return;
  }
  if (
    data?.type === 'LMU_UPDATE_ACK' &&
    barrier &&
    data.id === barrier.id &&
    barrier.expected.has(event.source?.id)
  ) {
    if (!data.ready) {
      barrier.resolve(false);
      return;
    }
    barrier.ready.add(event.source.id);
    if (barrier.ready.size === barrier.expected.size) barrier.resolve(true);
    return;
  }
  if (
    data?.type === 'LMU_APPLY_UPDATE' &&
    data.protocol === PROTOCOL &&
    data.schema === SCHEMA
  ) {
    if (applying) {
      event.ports[0]?.postMessage({ ok: false, reason: 'busy' });
      return;
    }
    applying = true;
    event.waitUntil(
      update(event).finally(() => {
        applying = false;
      }),
    );
  }
});
