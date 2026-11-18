import { test } from 'node:test';
import assert from 'node:assert/strict';
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
import { fileURLToPath } from 'node:url';
import { AGENT_FILES, agentClosure } from './local-agent-files.mjs';
import { updateAgent } from './update-agent.mjs';
import { acquireLocalLock } from './local-process-lock.mjs';

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
});

async function installation(work) {
  const storage = await mkdtemp(join(tmpdir(), 'lmup-agent-'));
  try {
    const agent = join(storage, 'agent', 'scripts');
    await mkdir(agent, { recursive: true });
    await writeFile(join(agent, 'sync-local.mjs'), '// agente antigo\n');
    await writeFile(join(storage, 'sync-config.json'), '{"enabled":false}');
    await mkdir(join(storage, 'publication-main'));
    await writeFile(join(storage, 'publication-main', 'marca.txt'), 'intacta');
    await work({ storage, agent });
  } finally {
    await rm(storage, { recursive: true, force: true });
  }
}
const leftovers = async (storage) =>
  (await readdir(join(storage, 'agent'))).filter((name) =>
    name.startsWith('scripts.next-'),
  );

test('update-agent troca a cópia inteira e guarda a anterior, sem tocar no resto', () =>
  installation(async ({ storage, agent }) => {
    const result = await updateAgent({ storage, now: Date.UTC(2026, 10, 18) });
    for (const name of AGENT_FILES)
      assert.equal(
        await readFile(join(agent, name), 'utf8'),
        await readFile(join(here, name), 'utf8'),
        name,
      );
    assert.equal(
      await readFile(join(result.previous, 'sync-local.mjs'), 'utf8'),
      '// agente antigo\n',
    );
    assert.equal(
      await readFile(join(storage, 'sync-config.json'), 'utf8'),
      '{"enabled":false}',
    );
    assert.equal(
      await readFile(join(storage, 'publication-main', 'marca.txt'), 'utf8'),
      'intacta',
    );
    assert.deepEqual(await leftovers(storage), []);
    await assert.rejects(readFile(join(storage, 'sync-daemon.lock')));
  }));

test('com um ciclo ou publicação em andamento, nada é trocado', () =>
  installation(async ({ storage, agent }) => {
    for (const lock of ['sync-daemon.lock', 'publish.lock']) {
      const unlock = await acquireLocalLock(join(storage, lock));
      try {
        await assert.rejects(
          updateAgent({ storage }),
          /Outra publicação ou sincronização/,
        );
      } finally {
        await unlock();
      }
      assert.equal(
        await readFile(join(agent, 'sync-local.mjs'), 'utf8'),
        '// agente antigo\n',
      );
      assert.deepEqual(await leftovers(storage), []);
    }
  }));

test('cópia nova incompleta, com erro de sintaxe ou importação faltando não substitui o agente', () =>
  installation(async ({ storage, agent }) => {
    const source = join(storage, 'fonte');
    await mkdir(source);
    await writeFile(join(source, 'sync-local.mjs'), "import './falta.mjs';\n");
    await writeFile(join(source, 'outro.mjs'), 'export const x = (;\n');
    for (const files of [
      ['sync-local.mjs', 'nao-existe.mjs'],
      ['sync-local.mjs', 'outro.mjs'],
      ['sync-local.mjs'],
    ])
      await assert.rejects(updateAgent({ storage, source, files }));
    assert.equal(
      await readFile(join(agent, 'sync-local.mjs'), 'utf8'),
      '// agente antigo\n',
    );
    assert.deepEqual(await leftovers(storage), []);
  }));

test('sem agente instalado, recusa e orienta a instalação completa', async () => {
  const storage = await mkdtemp(join(tmpdir(), 'lmup-agent-'));
  try {
    await assert.rejects(updateAgent({ storage }), /instalação completa/);
  } finally {
    await rm(storage, { recursive: true, force: true });
  }
});
