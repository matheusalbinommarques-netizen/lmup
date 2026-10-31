// Static serving stays on the same origin as the installed application.
import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStaticServer } from './static-server.mjs';
const root = process.env.LMU_INSTALLATION_PROJECT
  ? resolve(process.env.LMU_INSTALLATION_PROJECT, 'build')
  : fileURLToPath(new URL('../build/', import.meta.url));
const port = Number(process.env.LMU_PREVIEW_PORT ?? 4174);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw Error('LMU_PREVIEW_PORT deve ser uma porta válida.');
if (!process.env.LMU_PUBLICATION_ROOT) await stat(resolve(root, '200.html'));
createStaticServer({
  root,
  publicationRoot: process.env.LMU_PUBLICATION_ROOT,
}).listen(port, '127.0.0.1', () =>
  console.log(`LMU estático: http://127.0.0.1:${port}`),
);
