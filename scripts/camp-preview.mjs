import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const mode = process.argv[2] ?? 'dev';
if (!['dev', 'build', 'serve'].includes(mode))
  throw Error('Use dev, build ou serve.');
const output = resolve(
  process.env.LMU_CAMP_PREVIEW_ROOT ?? join(root, '.camp-preview'),
);
const env = {
  ...process.env,
  VITE_CAMP_PREVIEW: 'true',
  LMU_CAMP_OUTPUT: join(output, 'build'),
  LMU_BUILD_DIR: join(output, 'build'),
  LMU_INSTALLATION_PROJECT: output,
  LMU_PREVIEW_PORT: process.env.LMU_PREVIEW_PORT ?? '5308',
};
function run(file, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file, ...args], {
      cwd: root,
      env,
      stdio: 'inherit',
      windowsHide: true,
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0
        ? resolve()
        : reject(Error('Demonstração encerrou com código ' + code)),
    );
  });
}
if (mode === 'build') {
  await run('node_modules/vite/bin/vite.js', ['build']);
  await run('scripts/build-pwa.mjs');
} else if (mode === 'serve') await run('scripts/serve-static.mjs');
else
  await run('node_modules/vite/bin/vite.js', [
    '--host',
    '127.0.0.1',
    '--port',
    '5307',
    '--strictPort',
  ]);
