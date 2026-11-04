import { join } from 'node:path';
import { getLocalPrecacheManifest } from './local-precache.mjs';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const buildRoot = process.env.LMU_BUILD_DIR ?? 'build';
await stat(join(buildRoot, '200.html'));
const { manifestEntries, count, size } =
  await getLocalPrecacheManifest(buildRoot);
const source = await readFile('pwa/worker.js', 'utf8');
const client = await readFile('src/services/pwaService.ts', 'utf8');
const schema = Number(source.match(/const SCHEMA = (\d+)/)?.[1]);
if (
  !Number.isSafeInteger(schema) ||
  schema !== Number(client.match(/APP_SCHEMA = (\d+)/)?.[1])
)
  throw Error(
    'O aplicativo e o controlador offline anunciam esquemas diferentes.',
  );
const version = createHash('sha256')
  .update(
    source +
      JSON.stringify(manifestEntries) +
      (process.env.LMU_RELEASE_SEED ?? ''),
  )
  .digest('hex')
  .slice(0, 16);
await writeFile(
  join(buildRoot, 'sw.js'),
  source
    .replace('__LMU_RELEASE__', version)
    .replace('self.__WB_MANIFEST', JSON.stringify(manifestEntries)),
);
await writeFile(
  join(buildRoot, 'release.json'),
  JSON.stringify(
    {
      version,
      protocol: 1,
      schema,
      precacheFiles: count,
      precacheBytes: size,
    },
    null,
    2,
  ),
);
console.log(
  'PWA: ' +
    count +
    ' arquivos essenciais, ' +
    size +
    ' bytes, versão ' +
    version,
);
