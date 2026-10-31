import { getLocalPrecacheManifest } from './local-precache.mjs';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
await stat('build/200.html');
const { manifestEntries, count, size } = await getLocalPrecacheManifest('build');
const source = await readFile('pwa/worker.js', 'utf8');
const version = createHash('sha256')
  .update(
    source +
      JSON.stringify(manifestEntries) +
      (process.env.LMU_RELEASE_SEED ?? ''),
  )
  .digest('hex')
  .slice(0, 16);
await writeFile(
  'build/sw.js',
  source
    .replace('__LMU_RELEASE__', version)
    .replace('self.__WB_MANIFEST', JSON.stringify(manifestEntries)),
);
await writeFile(
  'build/release.json',
  JSON.stringify(
    {
      version,
      protocol: 1,
      schema: 5,
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
