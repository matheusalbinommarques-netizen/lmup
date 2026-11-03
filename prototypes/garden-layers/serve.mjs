import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, resolve, sep, extname } from 'node:path';
const root = fileURLToPath(new URL('./dist', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, 'http://127.0.0.1').pathname,
    );
    const path = resolve(root, '.' + pathname);
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    const file = (await stat(path)).isDirectory()
      ? join(path, 'index.html')
      : path;
    res.setHeader(
      'Content-Type',
      types[extname(file)] ?? 'application/octet-stream',
    );
    res.setHeader('Cache-Control', 'no-cache');
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end('Arquivo não encontrado');
  }
});
server.listen(5193, '127.0.0.1', () =>
  console.log('Jardim · prévia local: http://127.0.0.1:5193'),
);
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
