import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { AGENT_FILES, agentClosure } from './local-agent-files.mjs';
import { updateAgent } from './update-agent.mjs';
import { acquireLocalLock } from './local-process-lock.mjs';

const execute = promisify(execFile);
const here = fileURLToPath(new URL('./', import.meta.url));
const psList = async (file) => {
  const text = await readFile(join(here, file), 'utf8');
  const match = text.match(/@\(('sync-local\.mjs'[^)]*)\)/);
  assert.ok(match, `lista de scripts em ${file}`);
  return [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
};

test('a lista do agente cobre tudo o que a sincronização importa e bate com os instaladores', async () => {
  const closure = await agentClosure(here);
  assert.ok(closure.includes('audit-policy.mjs'));
  assert.ok(closure.includes('audit-upstream.mjs'));
  assert.deepEqual(
    closure.filter((name) => !AGENT_FILES.includes(name)),
    [],
  );
  for (const file of ['install-local-sync.ps1', 'migrate-local-sync.ps1'])
    assert.deepEqual(await psList(file), AGENT_FILES, file);
  // O carregador fixo não depende de nenhum arquivo da pasta.
  assert.deepEqual(await agentClosure(here, 'agent-bootstrap.mjs'), [
    'agent-bootstrap.mjs',
  ]);
});

// Agentes de teste: escrevem quem rodou em LMUP_TEST_MARK, nada mais.
const stub = (tag) =>
  `import { writeFileSync } from 'node:fs';\nimport { dep } from './dep.mjs';\nwriteFileSync(process.env.LMUP_TEST_MARK, ${JSON.stringify(tag)} + dep);\n`;
const FILES = ['sync-local.mjs', 'dep.mjs'];
async function source(root, tag) {
  const directory = join(root, `fonte-${tag}`);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'sync-local.mjs'), stub(tag));
  await writeFile(join(directory, 'dep.mjs'), "export const dep = '!';\n");
  return directory;
}
async function installation(work) {
  const root = await mkdtemp(join(tmpdir(), 'lmup-agent-'));
  const storage = join(root, '.local-app');
  try {
    const scripts = join(storage, 'agent', 'scripts');
    await mkdir(scripts, { recursive: true });
    // Formato antigo: os scripts direto em agent/scripts.
    await writeFile(
      join(scripts, 'sync-local.mjs'),
      `import { writeFileSync } from 'node:fs';\nwriteFileSync(process.env.LMUP_TEST_MARK, 'antigo');\n`,
    );
    await writeFile(join(storage, 'sync-config.json'), '{"enabled":false}');
    await mkdir(join(storage, 'publication-main'));
    await writeFile(join(storage, 'publication-main', 'marca.txt'), 'intacta');
    await work({ root, storage, scripts });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
/** O caminho normal: o que a tarefa agendada executa. */
async function runAgent(root, storage) {
  const mark = join(root, `marca-${Math.random()}.txt`);
  try {
    await execute(
      process.execPath,
      [join(storage, 'agent', 'scripts', 'sync-local.mjs')],
      { env: { ...process.env, LMUP_TEST_MARK: mark }, timeout: 30_000 },
    );
  } catch (error) {
    return { failed: true, stderr: error.stderr };
  }
  return { ran: await readFile(mark, 'utf8') };
}
/** Interrompe o update-agent num passo, como se o processo morresse ali. */
async function killedAt(step, options) {
  const script = `
    import { updateAgent } from ${JSON.stringify(pathToFileURL(join(here, 'update-agent.mjs')).href)};
    await updateAgent({ ...JSON.parse(process.env.OPTIONS), checkpoint: (s) => { if (s === process.env.STEP) process.exit(9); } });
    process.exit(0);`;
  await assert.rejects(
    execute(process.execPath, ['--input-type=module', '-e', script], {
      env: { ...process.env, STEP: step, OPTIONS: JSON.stringify(options) },
      timeout: 60_000,
    }),
    (error) => error.code === 9,
  );
}
const untouched = async (storage) => {
  assert.equal(
    await readFile(join(storage, 'sync-config.json'), 'utf8'),
    '{"enabled":false}',
  );
  assert.equal(
    await readFile(join(storage, 'publication-main', 'marca.txt'), 'utf8'),
    'intacta',
  );
  // Nada foi publicado.
  const names = await readdir(storage);
  assert.ok(!names.includes('active.json') && !names.includes('releases'));
};
const NOW = Date.UTC(2026, 10, 18, 1);

test('update-agent instala a versão nova com ponteiro e carregador, guardando a anterior', () =>
  installation(async ({ root, storage, scripts }) => {
    const first = await updateAgent({
      storage,
      source: await source(root, 'v1'),
      files: FILES,
      now: NOW,
    });
    assert.deepEqual(await runAgent(root, storage), { ran: 'v1!' });
    assert.equal(first.previous, undefined);
    assert.equal(
      await readFile(join(scripts, 'sync-local.legacy.mjs'), 'utf8'),
      `import { writeFileSync } from 'node:fs';\nwriteFileSync(process.env.LMUP_TEST_MARK, 'antigo');\n`,
    );
    const second = await updateAgent({
      storage,
      source: await source(root, 'v2'),
      files: FILES,
      now: NOW + 1000,
    });
    assert.equal(second.previous, first.version);
    assert.deepEqual(await runAgent(root, storage), { ran: 'v2!' });
    await untouched(storage);
    for (const lock of ['sync-daemon.lock', 'publish.lock'])
      await assert.rejects(readFile(join(storage, lock)));
    // O agente real inteiro também passa pela validação.
    const real = await updateAgent({ storage, now: NOW + 2000 });
    assert.deepEqual(
      (await readdir(join(storage, 'agent', 'versions', real.version))).sort(),
      [...AGENT_FILES].sort(),
    );
  }));

test('interrompido em qualquer passo, o caminho normal continua com um agente utilizável e nada é publicado', async () => {
  // Primeira atualização (formato antigo) e uma seguinte (já com ponteiro).
  const expected = {
    first: {
      locked: 'antigo',
      staged: 'antigo',
      version: 'antigo',
      pointer: 'antigo',
      loader: 'v1!',
    },
    next: {
      locked: 'v1!',
      staged: 'v1!',
      version: 'v1!',
      pointer: 'v2!',
      loader: 'v2!',
    },
  };
  for (const [phase, steps] of Object.entries(expected))
    for (const [step, ran] of Object.entries(steps))
      await installation(async ({ root, storage }) => {
        const v1 = await source(root, 'v1');
        const v2 = await source(root, 'v2');
        if (phase === 'next')
          await updateAgent({ storage, source: v1, files: FILES, now: NOW });
        const options = {
          storage,
          source: phase === 'first' ? v1 : v2,
          files: FILES,
          now: NOW + 5000,
        };
        await killedAt(step, options);
        assert.deepEqual(
          await runAgent(root, storage),
          { ran },
          `${phase} interrompida em ${step}`,
        );
        // A próxima atualização completa normalmente, mesmo com travas órfãs.
        await updateAgent({ ...options, now: NOW + 9000 });
        assert.deepEqual(await runAgent(root, storage), {
          ran: phase === 'first' ? 'v1!' : 'v2!',
        });
        await untouched(storage);
      });
});

test('duas atualizações simultâneas: a segunda é recusada sem perder a versão ativa nem a anterior', () =>
  installation(async ({ root, storage }) => {
    const v1 = await updateAgent({
      storage,
      source: await source(root, 'v1'),
      files: FILES,
      now: NOW,
    });
    const ready = join(root, 'pronto'),
      go = join(root, 'seguir');
    // A atualização A pega as travas e espera; B começa nesse intervalo.
    const script = `
      import { existsSync, writeFileSync } from 'node:fs';
      import { updateAgent } from ${JSON.stringify(pathToFileURL(join(here, 'update-agent.mjs')).href)};
      const wait = new Int32Array(new SharedArrayBuffer(4));
      await updateAgent({ ...JSON.parse(process.env.OPTIONS), checkpoint: (step) => {
        if (step !== 'locked') return;
        writeFileSync(process.env.READY, '1');
        for (let i = 0; i < 400 && !existsSync(process.env.GO); i++) Atomics.wait(wait, 0, 0, 50);
      } });`;
    const a = execute(process.execPath, ['--input-type=module', '-e', script], {
      env: {
        ...process.env,
        READY: ready,
        GO: go,
        OPTIONS: JSON.stringify({
          storage,
          source: await source(root, 'v2'),
          files: FILES,
          now: NOW + 5000,
        }),
      },
      timeout: 60_000,
    });
    for (let i = 0; i < 400; i++) {
      if (
        await readFile(ready).then(
          () => true,
          () => false,
        )
      )
        break;
      await new Promise((done) => setTimeout(done, 50));
    }
    await assert.rejects(
      updateAgent({
        storage,
        source: await source(root, 'v3'),
        files: FILES,
        now: NOW + 6000,
      }),
      /Outra publicação ou sincronização/,
    );
    // Enquanto A não ativa, segue a versão anterior.
    assert.deepEqual(await runAgent(root, storage), { ran: 'v1!' });
    await writeFile(go, '1');
    await a;
    assert.deepEqual(await runAgent(root, storage), { ran: 'v2!' });
    const pointer = JSON.parse(
      await readFile(join(storage, 'agent', 'current.json'), 'utf8'),
    );
    assert.equal(pointer.previous, v1.version);
    const versions = await readdir(join(storage, 'agent', 'versions'));
    assert.ok(
      versions.includes(v1.version) && versions.includes(pointer.version),
    );
    assert.deepEqual(
      versions.filter((name) => name.startsWith('.next-')),
      [],
    );
    // Depois, a outra atualização completa e guarda A como anterior.
    const c = await updateAgent({
      storage,
      source: await source(root, 'v3'),
      files: FILES,
      now: NOW + 7000,
    });
    assert.equal(c.previous, pointer.version);
    assert.deepEqual(await runAgent(root, storage), { ran: 'v3!' });
    await untouched(storage);
  }));

test('carregador usa a versão anterior se a atual sumir; sem nenhuma, sai sem rodar nada', () =>
  installation(async ({ root, storage }) => {
    const v1 = await updateAgent({
      storage,
      source: await source(root, 'v1'),
      files: FILES,
      now: NOW,
    });
    const v2 = await updateAgent({
      storage,
      source: await source(root, 'v2'),
      files: FILES,
      now: NOW + 1000,
    });
    const versions = join(storage, 'agent', 'versions');
    await rm(join(versions, v2.version), { recursive: true });
    assert.deepEqual(await runAgent(root, storage), { ran: 'v1!' });
    await rm(join(versions, v1.version), { recursive: true });
    const none = await runAgent(root, storage);
    assert.equal(none.failed, true);
    assert.match(none.stderr, /sem versão utilizável/);
    await untouched(storage);
  }));

test('com um ciclo ou publicação em andamento, nada é trocado', () =>
  installation(async ({ root, storage }) => {
    const v1 = await source(root, 'v1');
    for (const lock of ['sync-daemon.lock', 'publish.lock']) {
      const unlock = await acquireLocalLock(join(storage, lock));
      try {
        await assert.rejects(
          updateAgent({ storage, source: v1, files: FILES, now: NOW }),
          /Outra publicação ou sincronização/,
        );
      } finally {
        await unlock();
      }
      assert.deepEqual(await runAgent(root, storage), { ran: 'antigo' });
    }
  }));

test('cópia nova incompleta, com erro de sintaxe ou importação faltando não substitui o agente', () =>
  installation(async ({ root, storage }) => {
    const broken = join(root, 'quebrada');
    await mkdir(broken);
    await writeFile(join(broken, 'sync-local.mjs'), "import './falta.mjs';\n");
    await writeFile(join(broken, 'outro.mjs'), 'export const x = (;\n');
    for (const files of [
      ['sync-local.mjs', 'nao-existe.mjs'],
      ['sync-local.mjs', 'outro.mjs'],
      ['sync-local.mjs'],
    ])
      await assert.rejects(
        updateAgent({ storage, source: broken, files, now: NOW }),
      );
    assert.deepEqual(await runAgent(root, storage), { ran: 'antigo' });
    assert.deepEqual(await readdir(join(storage, 'agent', 'versions')), []);
  }));

test('sem agente instalado, recusa e orienta a instalação completa', async () => {
  const storage = await mkdtemp(join(tmpdir(), 'lmup-agent-'));
  try {
    await assert.rejects(updateAgent({ storage }), /instalação completa/);
  } finally {
    await rm(storage, { recursive: true, force: true });
  }
});
