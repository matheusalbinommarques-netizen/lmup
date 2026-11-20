// Lançador da tarefa agendada (start-local-sync.ps1) no Windows PowerShell 5.1:
// espera só o processo do ciclo, mesmo que ele deixe um filho aberto (como o
// servidor da porta 5174), e repassa o código de saída do ciclo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('./', import.meta.url));
const windows = process.platform === 'win32';
const LIMIT_MS = 20_000;

// Ciclo sintético no lugar do sync-local.mjs: registra onde rodou, escreve nos
// dois logs, abre um filho persistente como o ensureServer abre o servidor
// (destacado, saída num log próprio) e sai conforme LMU_TEST_CYCLE.
const CYCLE = `
import { spawn } from 'node:child_process';
import { openSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const storage = join(process.cwd(), '.local-app');
writeFileSync(join(storage, 'cycle.json'), JSON.stringify({
  cwd: process.cwd(),
  project: process.env.LMU_INSTALLATION_PROJECT,
}));
console.log('ciclo concluido');
console.error('aviso do ciclo');
const log = openSync(join(storage, 'child.log'), 'a');
const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
  detached: true,
  windowsHide: true,
  stdio: ['ignore', log, log],
});
child.unref();
writeFileSync(join(storage, 'child.pid'), String(child.pid));
if (process.env.LMU_TEST_CYCLE === 'throw') throw Error('falha no ciclo');
process.exitCode = Number(process.env.LMU_TEST_CYCLE ?? 0);
`;

async function installation({ node = process.execPath } = {}) {
  const project = await mkdtemp(join(tmpdir(), 'lmup-launcher-'));
  await mkdir(join(project, 'scripts'));
  await mkdir(join(project, '.local-app', 'agent', 'scripts'), {
    recursive: true,
  });
  await copyFile(
    join(here, 'start-local-sync.ps1'),
    join(project, 'scripts', 'start-local-sync.ps1'),
  );
  await writeFile(
    join(project, '.local-app', 'sync-config.json'),
    JSON.stringify({ node }),
  );
  await writeFile(
    join(project, '.local-app', 'agent', 'scripts', 'sync-local.mjs'),
    CYCLE,
  );
  return project;
}

// Como a tarefa agendada chama o lançador. Sem pipes: um filho que os
// herdasse prenderia o teste, não o lançador.
function launch(project, cycle) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const shell = spawn(
      'powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-WindowStyle',
        'Hidden',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        join(project, 'scripts', 'start-local-sync.ps1'),
      ],
      {
        cwd: project,
        env: { ...process.env, LMU_TEST_CYCLE: cycle },
        stdio: 'ignore',
        windowsHide: true,
      },
    );
    const timer = setTimeout(() => {
      shell.kill();
      reject(Error(`O lançador não terminou em ${LIMIT_MS} ms.`));
    }, LIMIT_MS);
    shell.on('error', reject);
    shell.on('exit', (code) => {
      clearTimeout(timer);
      resolve({ code, elapsed: Date.now() - started });
    });
  });
}

const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

async function withInstallation(options, run) {
  const project = await installation(options);
  const childPid = async () =>
    Number(await readFile(join(project, '.local-app', 'child.pid'), 'utf8'));
  try {
    await run(project, childPid);
  } finally {
    // Encerra o filho sintético mesmo quando o teste falha antes de lê-lo.
    const pid = await childPid().catch(() => null);
    if (pid && alive(pid)) process.kill(pid);
    await rm(project, { recursive: true, force: true, maxRetries: 5 });
  }
}

const same = (a, b) => a.toLowerCase() === b.toLowerCase();

test(
  'o lançador termina com o ciclo e não espera o filho persistente',
  { skip: !windows && 'só no Windows (tarefa agendada e PowerShell 5.1)' },
  async () => {
    await withInstallation({}, async (project, childPid) => {
      const { code } = await launch(project, '0');
      assert.equal(code, 0);
      const pid = await childPid();
      assert.ok(alive(pid), 'o filho do ciclo continua aberto');
      const cycle = JSON.parse(
        await readFile(join(project, '.local-app', 'cycle.json'), 'utf8'),
      );
      assert.ok(same(cycle.cwd, project), `diretório: ${cycle.cwd}`);
      assert.ok(same(cycle.project, project), `projeto: ${cycle.project}`);
      const read = (name) =>
        readFile(join(project, '.local-app', name), 'utf8');
      assert.match(await read('sync-launch.log'), /ciclo concluido/);
      assert.match(await read('sync-launch-error.log'), /aviso do ciclo/);
    });
  },
);

test(
  'falha do ciclo chega à tarefa como falha, mesmo com o filho aberto',
  { skip: !windows && 'só no Windows (tarefa agendada e PowerShell 5.1)' },
  async () => {
    for (const [cycle, expected] of [
      ['7', 7],
      ['throw', 1],
    ])
      await withInstallation({}, async (project, childPid) => {
        const { code } = await launch(project, cycle);
        assert.equal(code, expected, `ciclo ${cycle}`);
        assert.ok(alive(await childPid()), 'o filho do ciclo continua aberto');
      });
  },
);

test(
  'sem conseguir iniciar o ciclo, o lançador falha',
  { skip: !windows && 'só no Windows (tarefa agendada e PowerShell 5.1)' },
  async () => {
    const project = await installation({
      node: join(tmpdir(), 'lmup-sem-node', 'node.exe'),
    });
    try {
      const { code } = await launch(project, '0');
      assert.notEqual(code, 0);
    } finally {
      await rm(project, { recursive: true, force: true, maxRetries: 5 });
    }
  },
);
