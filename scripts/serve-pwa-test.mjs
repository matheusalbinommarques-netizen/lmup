import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
const root = resolve('build');
const sw = await readFile(resolve(root, 'sw.js'), 'utf8');
const diagnostic = process.env.LMU_PWA_DIAGNOSTICS
  ? await readFile(resolve('tests/pwa/worker-diagnostics.js'), 'utf8')
  : '';
let release = 'a';
let network = true;
const mime = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
};
createServer(async (request, response) => {
  try {
    const path = new URL(request.url, 'http://localhost').pathname;
    if (path === '/__network' && request.method === 'POST') {
      let body = '';
      for await (const chunk of request) body += chunk;
      network = body === 'online';
      response.writeHead(200).end('ok');
      return;
    }
    if (path === '/__release' && request.method === 'POST') {
      let body = '';
      for await (const chunk of request) body += chunk;
      release = body;
      response.writeHead(200).end(release);
      return;
    }
    if (!network) {
      response.writeHead(503).end('Rede de teste desligada');
      return;
    }
    if (path === '/legacy-tab.html') {
      response
        .writeHead(200, {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store',
        })
        .end(
          '<!doctype html><html lang="pt-BR"><title>Aba antiga</title><body><h1>Aba antiga sem protocolo</h1></body></html>',
        );
      return;
    }
    if (path === '/sw.js') {
      if (release === 'legacy') {
        response
          .writeHead(200, {
            'Content-Type': 'text/javascript',
            'Cache-Control': 'no-store',
          })
          .end(
            "self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));",
          );
        return;
      }
      const version = sw.match(/const RELEASE = '([^']+)'/)[1];
      let code = sw.replace(version, version + '-' + release);
      if (diagnostic)
        code =
          diagnostic +
          code
            .replace(
              'version: RELEASE,',
              'version: RELEASE, diagnostics: protocolEvents,',
            )
            .replace(
              'barrier = null;\n  if (!ready',
              "recordProtocol({ phase: 'barrier', ready, unchanged, expected: [...barrier.expected], acknowledged: [...barrier.ready] }); barrier = null;\n  if (!ready",
            )
            .replace(
              'await self.skipWaiting();',
              "recordProtocol({ phase: 'skip-start' }); await self.skipWaiting(); recordProtocol({ phase: 'skip-end' });",
            );
      if (release === 'incompatible')
        code = code.replace('const SCHEMA = 6', 'const SCHEMA = 7');
      if (release === 'cache-failure')
        code = code.replace(
          'await cache.addAll(',
          "throw new DOMException('Falha simulada', 'QuotaExceededError'); await cache.addAll(",
        );
      response
        .writeHead(200, {
          'Content-Type': 'text/javascript',
          'Cache-Control': 'no-store',
        })
        .end(code);
      return;
    }
    const target = resolve(root, '.' + decodeURIComponent(path)),
      within = relative(root, target);
    if (within.startsWith('..')) {
      response.writeHead(403).end();
      return;
    }
    let file;
    for (const candidate of [
      target,
      target + '.html',
      resolve(target, 'index.html'),
    ])
      if ((await stat(candidate).catch(() => null))?.isFile()) {
        file = candidate;
        break;
      }
    if (!file && request.headers.accept?.includes('text/html'))
      file = resolve(root, '200.html');
    if (!file) {
      response.writeHead(404).end();
      return;
    }
    response
      .writeHead(200, {
        'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      })
      .end(await readFile(file));
  } catch (error) {
    response.writeHead(500).end(String(error));
  }
}).listen(4274, '127.0.0.1', () => console.log('PWA test 4274'));
