import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  gitCommand,
  gitSubcommand,
  listWindowsProcesses,
  redactGitText,
  runGit,
} from './local-sync-core.mjs';
import { fakeGit, windows } from './git-test-fixtures.mjs';

const onlyWindows = windows
  ? {}
  : { skip: 'cenário do wrapper do Git for Windows' };

async function withFake(work) {
  const fake = await fakeGit();
  try {
    await work(fake);
  } finally {
    await fake.dispose();
  }
}

async function withRepository(work) {
  const directory = await mkdtemp(join(tmpdir(), 'lmup-git-command-'));
  try {
    await work(directory);
  } finally {
    await rm(directory, { recursive: true, maxRetries: 3, retryDelay: 100 });
  }
}

test('subcomando e texto do Git não expõem URL, credenciais nem tokens', () => {
  assert.equal(
    gitSubcommand(['-c', 'core.hooksPath=', 'merge', '--ff-only']),
    'merge',
  );
  assert.equal(
    gitSubcommand(['fetch', 'https://usuario:segredo@example.com/x.git']),
    'fetch',
  );
  assert.equal(gitSubcommand(['https://example.com/x.git']), '(subcomando)');
  const text = redactGitText(
    `fatal: https://usuario:segredo@example.com/r.git?token=abc ghp_${'b'.repeat(36)} Authorization: Bearer xyz`,
  );
  for (const secret of ['usuario', 'segredo', 'token=abc', 'ghp_', 'xyz'])
    assert.ok(!text.includes(secret), `${secret} em ${text}`);
  assert.match(text, /https:\/\/\*\*\*@example\.com\/r\.git\?\*\*\*/);
});

test('execução normal devolve a saída sem espaços nas pontas', async () => {
  assert.match(await gitCommand(tmpdir(), ['--version']), /^git version /);
  await withFake(async (fake) => {
    assert.equal(await fake.run('ok'), 'saida ok');
  });
});

test('erro do Git preserva o código de saída e não expõe credenciais', async () => {
  await withFake(async (fake) => {
    const url = 'https://usuario:segredo@example.com/repo.git';
    await assert.rejects(fake.run('fail', ['fetch', url]), (error) => {
      assert.equal(error.code, 128);
      assert.equal(error.exitCode, 128);
      assert.equal(error.gitSubcommand, 'fetch');
      assert.equal(error.timedOut, false);
      assert.match(error.message, /^git fetch falhou: código de saída 128 /);
      assert.match(error.message, /fatal: falhou em https:\/\/\*\*\*@/);
      for (const secret of ['usuario', 'segredo', 'token=abc', 'ghp_'])
        assert.ok(!error.message.includes(secret), error.message);
      return true;
    });
  });
  await withRepository(async (directory) => {
    const git = (...args) => gitCommand(directory, args);
    await git('init', '-b', 'main');
    await git('config', 'user.name', 'LMUP Test');
    await git('config', 'user.email', 'test@example.invalid');
    const commit = async (value) => {
      await writeFile(join(directory, 'f.txt'), value);
      await git('add', 'f.txt');
      await git('-c', 'core.hooksPath=', 'commit', '-m', value);
      return git('rev-parse', 'HEAD');
    };
    const first = await commit('um');
    const second = await commit('dois');
    // merge-base --is-ancestor responde "não" com código 1; quem chama lê isso.
    await assert.rejects(
      git('merge-base', '--is-ancestor', second, first),
      (error) => error.code === 1 && error.timedOut === false,
    );
    await assert.rejects(
      git('rev-parse', '--verify', 'nao-existe^{commit}'),
      (error) => error.code === 128,
    );
  });
});

test('falha ao iniciar o executável preserva o código do sistema', async () => {
  await withRepository(async (directory) => {
    await assert.rejects(
      runGit(directory, ['status'], {
        executable: join(directory, 'nao-existe-git.exe'),
      }),
      (error) => {
        assert.equal(error.code, 'ENOENT');
        assert.equal(error.gitSubcommand, 'status');
        assert.match(
          error.message,
          /^git status falhou: não foi possível iniciar o executável \(ENOENT\)/,
        );
        return true;
      },
    );
  });
});

test('tempo limite falha de forma segura com ETIMEDOUT, nunca com código 1', async () => {
  await withFake(async (fake) => {
    await assert.rejects(
      fake.run('hang', ['merge-base', '--is-ancestor', 'a', 'b'], {
        timeout: 1500,
      }),
      (error) => {
        assert.equal(error.code, 'ETIMEDOUT');
        assert.equal(error.timedOut, true);
        assert.equal(error.killed, true);
        assert.equal(error.cleanup, windows ? 'confirmada' : 'não verificada');
        assert.match(
          error.message,
          /^git merge-base falhou: tempo limite de 1500 ms excedido; /,
        );
        assert.ok(error.durationMs >= 1500);
        return true;
      },
    );
    assert.equal((await fake.recorded()).length, 1);
    assert.deepEqual(await fake.running(), []);
  });
});

test(
  'tempo limite encerra a árvore inteira com o wrapper ainda vivo',
  onlyWindows,
  async () => {
    await withFake(async (fake) => {
      await assert.rejects(
        fake.run('tree', ['fetch'], { timeout: 4000 }),
        (error) =>
          error.code === 'ETIMEDOUT' &&
          error.cleanup === 'confirmada' &&
          /árvore de processos encerrada/.test(error.message),
      );
      // wrapper, filho e neto chegaram a rodar e nenhum ficou.
      assert.equal((await fake.recorded()).length, 3);
      assert.deepEqual(await fake.running(), []);
    });
  },
);

test(
  'a limpeza não depende do wrapper: descendentes de um wrapper já encerrado também terminam',
  onlyWindows,
  async () => {
    await withFake(async (fake) => {
      // Como o timeout nativo do execFile fazia: o wrapper morre antes de a
      // árvore ser levantada; filho e neto ficam com o pai inexistente.
      let first = true;
      const listProcesses = async () => {
        if (first) {
          first = false;
          const [wrapper] = await fake.recorded();
          process.kill(wrapper);
          await new Promise((done) => setTimeout(done, 300));
        }
        return listWindowsProcesses();
      };
      await assert.rejects(
        fake.run('tree', ['fetch'], { timeout: 4000, listProcesses }),
        (error) => error.code === 'ETIMEDOUT' && error.cleanup === 'confirmada',
      );
      assert.equal((await fake.recorded()).length, 3);
      assert.deepEqual(await fake.running(), []);
    });
  },
);

test('saída acima do limite encerra o comando e falha', async () => {
  await withFake(async (fake) => {
    await assert.rejects(
      fake.run('flood', ['log'], { maxBuffer: 1024, timeout: 20000 }),
      (error) => {
        assert.equal(error.code, 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER');
        assert.equal(error.timedOut, false);
        assert.match(
          error.message,
          /^git log falhou: saída acima de 1024 bytes; /,
        );
        return true;
      },
    );
    assert.deepEqual(await fake.running(), []);
  });
});

test('encerramento que não pode ser confirmado também falha', async () => {
  await withFake(async (fake) => {
    // A listagem de processos falha (depois de encerrar o comando para o
    // teste não esperar): sem confirmação, o erro diz isso.
    const listProcesses = async () => {
      for (const pid of await fake.recorded()) process.kill(pid);
      throw Error('listagem indisponível');
    };
    await assert.rejects(
      fake.run('hang', ['fetch'], {
        timeout: 1500,
        platform: 'win32',
        listProcesses,
      }),
      (error) => {
        assert.equal(error.code, 'ETIMEDOUT');
        assert.equal(error.cleanup, 'falhou');
        assert.match(
          error.message,
          /encerramento não confirmado \(não foi possível listar os processos \(listagem indisponível\); taskkill \/T enviado ao processo raiz\)/,
        );
        return true;
      },
    );
  });
});
