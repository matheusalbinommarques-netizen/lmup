// Read-only loopback preview. No database, profile, build or installed origin.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const files = new Map([
  ['/', ['prototypes/audit-c05/index.html', 'text/html; charset=utf-8']],
  [
    '/source.webp',
    ['static/art/approved/paintings/05_Cartao_Mapa.webp', 'image/webp'],
  ],
  ['/compressed.webp', ['prototypes/audit-c05/full.webp', 'image/webp']],
]);
const port = Number(process.env.LMU_C05_PREVIEW_PORT ?? 5208);
if (!Number.isInteger(port) || port < 1024 || port > 65535 || port === 5174)
  throw Error('Porta de prévia inválida.');
export const server = createServer(async (request, response) => {
  const file = files.get(new URL(request.url, 'http://127.0.0.1').pathname);
  if (!file || request.method !== 'GET') {
    response.writeHead(404).end();
    return;
  }
  try {
    const bytes = await readFile(new URL(`../../${file[0]}`, import.meta.url));
    response
      .writeHead(200, { 'content-type': file[1], 'cache-control': 'no-store' })
      .end(bytes);
  } catch {
    response.writeHead(500).end('Imagem de comparação indisponível.');
  }
}).listen(port, '127.0.0.1', () =>
  console.log(`Comparação C05: http://127.0.0.1:${port}`),
);
