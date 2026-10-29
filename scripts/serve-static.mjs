// Verificação local: serve somente build/, sem runtime do SvelteKit.
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, relative, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../build/', import.meta.url));
const port = Number(process.env.LMU_PREVIEW_PORT ?? 4174);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('LMU_PREVIEW_PORT deve ser uma porta válida.');
}
await stat(resolve(root, '200.html'));

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
};

createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method ?? '')) {
      response.writeHead(405).end();
      return;
    }
    const pathname = decodeURIComponent(
      new URL(request.url ?? '/', 'http://localhost').pathname,
    );
    const requested = resolve(root, `.${pathname}`);
    const within = relative(root, requested);
    if (within.startsWith('..') || isAbsolute(within)) {
      response.writeHead(403).end();
      return;
    }
    const candidates = [
      requested,
      `${requested}.html`,
      resolve(requested, 'index.html'),
    ];
    let file;
    let metadata;
    for (const candidate of candidates) {
      const info = await stat(candidate).catch(() => null);
      if (info?.isFile()) {
        file = candidate;
        metadata = info;
        break;
      }
    }
    if (!file && request.headers.accept?.includes('text/html')) {
      file = resolve(root, '200.html');
      metadata = await stat(file);
    }
    if (!file) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      'Content-Type': types[extname(file)] ?? 'application/octet-stream',
      'Content-Length': metadata.size,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.method === 'HEAD') response.end();
    else await pipeline(createReadStream(file), response);
  } catch {
    if (!response.headersSent) response.writeHead(400);
    response.end();
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`LMU estático: http://127.0.0.1:${port}`);
});
