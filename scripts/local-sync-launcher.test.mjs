// Lançador da tarefa agendada (start-local-sync.ps1) no Windows PowerShell 5.1
// e o iniciador oculto (start-local-sync-hidden.js, no wscript.exe) que o roda
// sem console: esperam só o processo do ciclo, mesmo que ele deixe um filho
// aberto (como o servidor da porta 5174), e repassam o código de saída do ciclo.
//
// Os testes com o Agendador de Tarefas de verdade (troca da ação, foco da
// janela, restauração) criam e apagam tarefas sintéticas "LMUP Teste Janela
// ..." e precisam de uma área de trabalho interativa: só rodam com
// LMUP_TEST_SCHEDULED_TASK=1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  access,
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
const onlyWindows =
  !windows && 'só no Windows (tarefa agendada e PowerShell 5.1)';
const scheduler =
  onlyWindows ||
  (process.env.LMUP_TEST_SCHEDULED_TASK !== '1' &&
    'cria tarefas agendadas sintéticas: rode com LMUP_TEST_SCHEDULED_TASK=1');
const LIMIT_MS = 20_000;
const system32 = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32');
const powershell = join(
  system32,
  'WindowsPowerShell',
  'v1.0',
  'powershell.exe',
);

// Ciclo sintético no lugar do sync-local.mjs: registra onde rodou, escreve nos
// dois logs, abre um filho persistente como o ensureServer abre o servidor
// (destacado, saída num log próprio) e sai conforme .local-app/test-cycle.json
// (a tarefa agendada não recebe variáveis do teste).
const CYCLE = `
import { spawn } from 'node:child_process';
import { openSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const storage = join(process.cwd(), '.local-app');
const plan = JSON.parse(readFileSync(join(storage, 'test-cycle.json'), 'utf8'));
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
await new Promise((done) => setTimeout(done, plan.delay ?? 0));
if (plan.exit === 'throw') throw Error('falha no ciclo');
process.exitCode = plan.exit;
`;

// Instalação sintética num caminho com espaços. `launchers` é a pasta dos
// lançadores relativa ao projeto: 'scripts' (instalador) ou '.local-app'
// (lançador manual da instalação atual).
async function installation({
  node = process.execPath,
  launchers = 'scripts',
  hidden = true,
} = {}) {
  const project = await mkdtemp(join(tmpdir(), 'lmup lançador '));
  await mkdir(join(project, '.local-app', 'agent', 'scripts'), {
    recursive: true,
  });
  await mkdir(join(project, launchers), { recursive: true });
  const names = ['start-local-sync.ps1'];
  if (hidden) names.push('start-local-sync-hidden.js');
  for (const name of names)
    await copyFile(join(here, name), join(project, launchers, name));
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

const plan = (project, exit, delay = 0) =>
  writeFile(
    join(project, '.local-app', 'test-cycle.json'),
    JSON.stringify({ exit, delay }),
  );

// Espera o processo sem pipes: um filho que os herdasse prenderia o teste, não
// o lançador.
function run(file, args, project) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const child = spawn(file, args, {
      cwd: project,
      stdio: 'ignore',
      windowsHide: true,
    });
    const timer = setTimeout(() => {
      child.kill();
      reject(Error(`O lançador não terminou em ${LIMIT_MS} ms.`));
    }, LIMIT_MS);
    child.on('error', reject);
    child.on('exit', (code) => {
      clearTimeout(timer);
      resolve({ code, elapsed: Date.now() - started });
    });
  });
}

// Como a tarefa criada antes do iniciador oculto chama o lançador.
const launch = (project) =>
  run(
    powershell,
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
    project,
  );

// Como a tarefa criada pelo instalador chama o iniciador oculto.
const launchHidden = (project, launchers = 'scripts') =>
  run(
    join(system32, 'wscript.exe'),
    [
      '//B',
      '//NoLogo',
      '//E:jscript',
      join(project, launchers, 'start-local-sync-hidden.js'),
    ],
    project,
  );

const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

async function withInstallation(options, body) {
  const project = await installation(options);
  const childPid = async () =>
    Number(await readFile(join(project, '.local-app', 'child.pid'), 'utf8'));
  try {
    await body(project, childPid);
  } finally {
    // Encerra o filho sintético mesmo quando o teste falha antes de lê-lo.
    const pid = await childPid().catch(() => null);
    if (pid && alive(pid)) process.kill(pid);
    await rm(project, { recursive: true, force: true, maxRetries: 5 });
  }
}

const same = (a, b) => a.toLowerCase() === b.toLowerCase();
const read = (project, name) =>
  readFile(join(project, '.local-app', name), 'utf8');

async function assertCycleRan(project) {
  const cycle = JSON.parse(await read(project, 'cycle.json'));
  assert.ok(same(cycle.cwd, project), `diretório: ${cycle.cwd}`);
  assert.ok(same(cycle.project, project), `projeto: ${cycle.project}`);
  assert.match(await read(project, 'sync-launch.log'), /ciclo concluido/);
  assert.match(await read(project, 'sync-launch-error.log'), /aviso do ciclo/);
}

for (const [name, start] of [
  ['o lançador', launch],
  ['o iniciador oculto', launchHidden],
]) {
  test(
    `${name} termina com o ciclo e não espera o filho persistente`,
    { skip: onlyWindows },
    async () => {
      await withInstallation({}, async (project, childPid) => {
        await plan(project, 0);
        const { code } = await start(project);
        assert.equal(code, 0);
        assert.ok(alive(await childPid()), 'o filho do ciclo continua aberto');
        await assertCycleRan(project);
      });
    },
  );

  test(
    `falha do ciclo chega à tarefa como falha por ${name}, mesmo com o filho aberto`,
    { skip: onlyWindows },
    async () => {
      for (const [exit, expected] of [
        [7, 7],
        ['throw', 1],
      ])
        await withInstallation({}, async (project, childPid) => {
          await plan(project, exit);
          const { code } = await start(project);
          assert.equal(code, expected, `ciclo ${exit}`);
          assert.ok(
            alive(await childPid()),
            'o filho do ciclo continua aberto',
          );
        });
    },
  );

  test(
    `sem conseguir iniciar o ciclo, ${name} falha`,
    { skip: onlyWindows },
    async () => {
      const project = await installation({
        node: join(tmpdir(), 'lmup-sem-node', 'node.exe'),
      });
      try {
        await plan(project, 0);
        const { code } = await start(project);
        assert.notEqual(code, 0);
      } finally {
        await rm(project, { recursive: true, force: true, maxRetries: 5 });
      }
    },
  );
}

test(
  'o iniciador oculto roda o lançador da própria pasta, também em .local-app',
  { skip: onlyWindows },
  async () => {
    await withInstallation(
      { launchers: '.local-app' },
      async (project, childPid) => {
        await plan(project, 0);
        const { code } = await launchHidden(project, '.local-app');
        assert.equal(code, 0);
        assert.ok(alive(await childPid()));
        await assertCycleRan(project);
      },
    );
  },
);

test(
  'sem o lançador PowerShell ao lado, o iniciador oculto falha',
  { skip: onlyWindows },
  async () => {
    const project = await installation();
    try {
      await rm(join(project, 'scripts', 'start-local-sync.ps1'));
      await plan(project, 0);
      const { code } = await launchHidden(project);
      assert.notEqual(code, 0);
      await assert.rejects(read(project, 'cycle.json'));
    } finally {
      await rm(project, { recursive: true, force: true, maxRetries: 5 });
    }
  },
);

test('o instalador cria a tarefa com o iniciador oculto e aceita as anteriores', async () => {
  const text = await readFile(join(here, 'install-local-sync.ps1'), 'utf8');
  const action = text.match(/\$syncAction = New-ScheduledTaskAction (.+)/);
  assert.ok(action, 'ação da tarefa no instalador');
  assert.match(action[1], /System32\\wscript\.exe/);
  assert.match(
    action[1],
    /'\/\/B \/\/NoLogo \/\/E:jscript "' \+ \$syncHiddenLauncher \+ '"'/,
  );
  assert.doesNotMatch(action[1], /powershell/i);
  const guard = text.match(/if \(\$syncTask -and (.+)\) \{ throw/);
  assert.ok(guard, 'validação da tarefa existente');
  assert.match(guard[1], /\$syncLauncher/);
  assert.match(guard[1], /\$syncHiddenLauncher/);
  const task = await readFile(join(here, 'local-sync-task-action.ps1'), 'utf8');
  assert.ok(
    task.includes("('//B //NoLogo //E:jscript \"' + $current.hidden + '\"')"),
    'a troca da ação usa os mesmos argumentos do instalador',
  );
});

// --- Agendador de Tarefas de verdade (opcional) ---------------------------

function shell(script, env = {}) {
  return new Promise((resolve, reject) => {
    execFile(
      powershell,
      [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        // Sem isso o PowerShell escreve no código de página do console e os
        // acentos (inclusive do caminho de teste) chegam trocados.
        `[Console]::OutputEncoding = [Text.Encoding]::UTF8\n${script}`,
      ],
      {
        env: { ...process.env, ...env },
        windowsHide: true,
        timeout: 120_000,
        maxBuffer: 4 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error) {
          error.message += `\n${stderr}`;
          reject(error);
        } else resolve(stdout.trim());
      },
    );
  });
}

const taskEnv = (name, project) => ({
  LMUP_T_NAME: name,
  LMUP_T_PROJECT: project,
});

// Igual ao que o instalador registrava antes do iniciador oculto, com o
// lançador em .local-app (como na instalação atual) e o gatilho de repetição
// daqui a 30 dias, para não disparar sozinho durante o teste.
async function registerConsoleTask(name, project) {
  await shell(
    `$u = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$l = Join-Path $env:LMUP_T_PROJECT '.local-app\\start-local-sync.ps1'
$a = New-ScheduledTaskAction -Execute '${powershell}' -Argument ('-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $l + '"') -WorkingDirectory $env:LMUP_T_PROJECT
$t = @((New-ScheduledTaskTrigger -AtLogOn -User $u), (New-ScheduledTaskTrigger -Once -At (Get-Date).AddDays(30) -RepetitionInterval (New-TimeSpan -Minutes 5)))
$s = New-ScheduledTaskSettingsSet -Hidden -StartWhenAvailable -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 1)
$p = New-ScheduledTaskPrincipal -UserId $u -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $env:LMUP_T_NAME -Action $a -Trigger $t -Settings $s -Principal $p -Description 'LMUP: teste sintético do iniciador oculto' | Out-Null`,
    taskEnv(name, project),
  );
}

const exportTask = (name) =>
  shell('Export-ScheduledTask -TaskName $env:LMUP_T_NAME', {
    LMUP_T_NAME: name,
  });

// Definição sem espaços entre elementos, com ou sem a ação.
const normal = (xml, { actions = true } = {}) => {
  let text = xml.replace(/>\s+</g, '><').trim();
  if (!actions) text = text.replace(/<Actions[\s\S]*<\/Actions>/, '');
  return text;
};

const taskAction = (name, project, mode, env = {}) =>
  shell(
    `& (Join-Path $env:LMUP_T_SCRIPTS 'local-sync-task-action.ps1') -Mode ${mode} -TaskName $env:LMUP_T_NAME -BackupDirectory (Join-Path $env:LMUP_T_PROJECT '.local-app') -Backup $env:LMUP_T_BACKUP -WaitSeconds 60`,
    { ...taskEnv(name, project), LMUP_T_SCRIPTS: here, ...env },
  );

// Observa, enquanto a tarefa roda, toda troca de janela em primeiro plano e
// toda janela de console que aparece (SetWinEventHook: nada escapa entre duas
// leituras, ao contrário de consultar a janela ativa de tempos em tempos).
const WATCHER = `
Add-Type -TypeDefinition @'
using System; using System.Text; using System.Diagnostics; using System.Collections.Generic; using System.Runtime.InteropServices;
public static class LmupWatch {
  public delegate void Proc(IntPtr hook, uint ev, IntPtr hwnd, int obj, int child, uint thread, uint time);
  [DllImport("user32.dll")] static extern IntPtr SetWinEventHook(uint min, uint max, IntPtr mod, Proc proc, uint pid, uint tid, uint flags);
  [DllImport("user32.dll")] static extern bool UnhookWinEvent(IntPtr hook);
  [DllImport("user32.dll")] static extern int PeekMessage(out MSG m, IntPtr hwnd, uint a, uint b, uint remove);
  [DllImport("user32.dll")] static extern bool TranslateMessage(ref MSG m);
  [DllImport("user32.dll")] static extern IntPtr DispatchMessage(ref MSG m);
  [DllImport("user32.dll")] static extern uint MsgWaitForMultipleObjects(uint n, IntPtr[] handles, bool all, uint ms, uint mask);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetClassName(IntPtr hwnd, StringBuilder text, int size);
  [StructLayout(LayoutKind.Sequential)] struct MSG { public IntPtr hwnd; public uint message; public IntPtr w; public IntPtr l; public uint time; public int x; public int y; }
  public static List<string> Events = new List<string>();
  static Proc keep;
  public static string Describe(string kind, IntPtr hwnd) {
    uint pid; GetWindowThreadProcessId(hwnd, out pid);
    StringBuilder c = new StringBuilder(256); GetClassName(hwnd, c, 256);
    string name = "?"; try { name = Process.GetProcessById((int)pid).ProcessName; } catch {}
    return kind + "\\t" + DateTime.Now.ToString("HH:mm:ss.fff") + "\\t" + pid + "\\t" + name + "\\t" + c;
  }
  public static void Run(string stop) {
    keep = delegate(IntPtr hook, uint ev, IntPtr hwnd, int obj, int child, uint thread, uint time) {
      if (hwnd == IntPtr.Zero || obj != 0) return;
      if (ev == 3) { Events.Add(Describe("foreground", hwnd)); return; }
      StringBuilder c = new StringBuilder(256); GetClassName(hwnd, c, 256);
      string k = c.ToString();
      if (k == "ConsoleWindowClass" || k == "CASCADIA_HOSTING_WINDOW_CLASS" || k == "PseudoConsoleWindow") Events.Add(Describe("console", hwnd));
    };
    IntPtr a = SetWinEventHook(3, 3, IntPtr.Zero, keep, 0, 0, 0);
    IntPtr b = SetWinEventHook(0x8002, 0x8002, IntPtr.Zero, keep, 0, 0, 0);
    Console.WriteLine("ready"); Console.Out.Flush();
    DateTime end = DateTime.UtcNow.AddSeconds(120);
    MSG m;
    while (DateTime.UtcNow < end && !System.IO.File.Exists(stop)) {
      MsgWaitForMultipleObjects(0, null, false, 20, 0x04FF);
      while (PeekMessage(out m, IntPtr.Zero, 0, 0, 1) != 0) { TranslateMessage(ref m); DispatchMessage(ref m); }
    }
    UnhookWinEvent(a); UnhookWinEvent(b);
  }
}
'@
'before' + [char]9 + [LmupWatch]::Describe('window', [LmupWatch]::GetForegroundWindow())
[LmupWatch]::Run($env:LMUP_T_STOP)
[LmupWatch]::Events
'after' + [char]9 + [LmupWatch]::Describe('window', [LmupWatch]::GetForegroundWindow())
`;

// Processos que só aparecem na tela por causa do lançador.
const LAUNCH = /\t(powershell|pwsh|wscript|cscript|node|conhost|git|\?)\t/i;
const CONSOLE =
  /\t(ConsoleWindowClass|CASCADIA_HOSTING_WINDOW_CLASS|PseudoConsoleWindow)$/;

// Dispara a tarefa como o Agendador, espera ela terminar e devolve o
// resultado e o que apareceu na tela antes, durante e depois.
async function runTaskWatched(name, project) {
  const stop = join(project, 'watch.stop');
  const ran = join(project, '.local-app', 'cycle.json');
  await rm(stop, { force: true });
  await rm(ran, { force: true });
  // Em arquivo: pela entrada padrão (-Command -) o here-string não funciona.
  const script = join(project, 'watch-focus.ps1');
  await writeFile(script, WATCHER);
  const watcher = spawn(
    powershell,
    [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      script,
    ],
    {
      env: { ...process.env, LMUP_T_STOP: stop },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    },
  );
  let output = '';
  let errors = '';
  const ready = new Promise((resolve, reject) => {
    watcher.stdout.on('data', (chunk) => {
      output += chunk;
      if (/^ready$/m.test(output)) resolve();
    });
    watcher.stderr.on('data', (chunk) => (errors += chunk));
    watcher.on('exit', () => reject(Error(`observador saiu: ${errors}`)));
  });
  const finished = new Promise((resolve) => watcher.on('exit', resolve));
  await ready;
  const result = await shell(
    // Terminou quando o ciclo já gravou cycle.json e a tarefa voltou a Ready.
    `$started = Get-Date
Start-ScheduledTask -TaskName $env:LMUP_T_NAME
$limit = $started.AddSeconds(60)
do {
  Start-Sleep -Milliseconds 250
  $state = [string](Get-ScheduledTask -TaskName $env:LMUP_T_NAME).State
  $done = $state -eq 'Ready' -and (Test-Path -LiteralPath $env:LMUP_T_RAN)
} while (!$done -and (Get-Date) -lt $limit)
$info = Get-ScheduledTaskInfo -TaskName $env:LMUP_T_NAME
$state + '|' + $info.LastTaskResult + '|' + $done + '|' + [int]((Get-Date) - $started).TotalMilliseconds`,
    { LMUP_T_NAME: name, LMUP_T_RAN: ran },
  );
  // Um instante para uma janela tardia ainda ser vista.
  await new Promise((done) => setTimeout(done, 1500));
  await writeFile(stop, '');
  await finished;
  const [state, code, done, elapsed] = result.split('|');
  assert.equal(done, 'True', `a tarefa não terminou em 60 s (${result})`);
  const lines = output.split(/\r?\n/).filter(Boolean);
  const events = lines.filter((line) => /^(foreground|console)\t/.test(line));
  return {
    state,
    code: Number(code),
    elapsed: Number(elapsed),
    before: lines.find((line) => line.startsWith('before\t')),
    after: lines.find((line) => line.startsWith('after\t')),
    events,
    intrusive: events.filter(
      (line) =>
        line.startsWith('console\t') || LAUNCH.test(line) || CONSOLE.test(line),
    ),
  };
}

async function withScheduledTask(body) {
  const name = `LMUP Teste Janela ${randomBytes(4).toString('hex')}`;
  const project = await installation({
    launchers: '.local-app',
    hidden: false,
  });
  const childPids = [];
  const childPid = async () => {
    const pid = Number(await read(project, 'child.pid'));
    childPids.push(pid);
    return pid;
  };
  try {
    await registerConsoleTask(name, project);
    await body({ name, project, childPid });
  } finally {
    await shell(
      `if (Get-ScheduledTask -TaskName $env:LMUP_T_NAME -ErrorAction SilentlyContinue) { Stop-ScheduledTask -TaskName $env:LMUP_T_NAME; Unregister-ScheduledTask -TaskName $env:LMUP_T_NAME -Confirm:$false }`,
      { LMUP_T_NAME: name },
    ).catch(() => {});
    for (const pid of childPids) if (alive(pid)) process.kill(pid);
    const last = await read(project, 'child.pid').catch(() => null);
    if (last && alive(Number(last))) process.kill(Number(last));
    await rm(project, { recursive: true, force: true, maxRetries: 5 });
  }
}

test(
  'a tarefa com o iniciador oculto não abre console nem rouba o foco; a ação antiga, sim',
  { skip: scheduler, timeout: 300_000 },
  async (t) => {
    await withScheduledTask(async ({ name, project, childPid }) => {
      // Controle: a ação antiga, como está instalada hoje. Prova que o
      // observador enxerga a janela que incomoda.
      await plan(project, 0, 1500);
      const before = await runTaskWatched(name, project);
      t.diagnostic(`ação antiga: ${JSON.stringify(before, null, 1)}`);
      assert.equal(before.code, 0);
      assert.ok(
        before.intrusive.length > 0,
        'o controle deveria mostrar o console do powershell.exe',
      );
      await childPid();

      const original = await exportTask(name);
      const applied = await taskAction(name, project, 'apply');
      t.diagnostic(applied);
      const backup = applied.match(/Backup da definição anterior: (.+\.xml)/);
      assert.ok(backup, 'o apply informa o backup');
      await access(join(project, '.local-app', 'start-local-sync-hidden.js'));
      const changed = await exportTask(name);
      assert.equal(
        normal(changed, { actions: false }),
        normal(original, { actions: false }),
        'gatilhos, usuário e configurações iguais',
      );
      assert.match(
        changed,
        /<Command>[^<]*\\System32\\wscript\.exe<\/Command>/i,
      );
      assert.match(changed, /start-local-sync-hidden\.js/);
      assert.match(
        changed,
        new RegExp(
          `<WorkingDirectory>${project.replace(/[\\.()[\]]/g, '\\$&')}</WorkingDirectory>`,
        ),
      );

      for (const [exit, expected] of [
        [0, 0],
        [7, 7],
      ]) {
        await plan(project, exit, 1500);
        const after = await runTaskWatched(name, project);
        t.diagnostic(
          `iniciador oculto, ciclo ${exit}: ${JSON.stringify(after, null, 1)}`,
        );
        assert.equal(
          after.state,
          'Ready',
          'a tarefa terminou com o filho aberto',
        );
        assert.equal(
          after.code,
          expected,
          'resultado da tarefa = saída do ciclo',
        );
        assert.deepEqual(
          after.intrusive,
          [],
          'nenhum console nem troca de foco',
        );
        // Antes e depois podem diferir porque alguém usa o computador durante
        // o teste (fica no diagnóstico); a janela final nunca é da tarefa.
        assert.ok(
          !LAUNCH.test(after.after) && !CONSOLE.test(after.after),
          `janela final: ${after.after}`,
        );
        assert.ok(alive(await childPid()), 'o filho do ciclo continua aberto');
        await assertCycleRan(project);
      }

      // Reversão: a definição exportada volta inteira.
      await taskAction(name, project, 'rollback', { LMUP_T_BACKUP: backup[1] });
      assert.equal(normal(await exportTask(name)), normal(original));
    });
  },
);

test(
  'falha depois da troca restaura a tarefa original; tarefa alheia é recusada sem mudança',
  { skip: scheduler, timeout: 120_000 },
  async () => {
    await withScheduledTask(async ({ name, project }) => {
      const original = await exportTask(name);
      await assert.rejects(
        taskAction(name, project, 'apply', {
          LMUP_TASK_ACTION_TEST_FAIL: 'after-set',
        }),
        /A tarefa original foi restaurada/,
      );
      assert.equal(normal(await exportTask(name)), normal(original));
      await assert.rejects(
        access(join(project, '.local-app', 'start-local-sync-hidden.js')),
        'o iniciador copiado é removido na restauração',
      );

      await shell(
        `Set-ScheduledTask -TaskName $env:LMUP_T_NAME -Action (New-ScheduledTaskAction -Execute 'notepad.exe') | Out-Null`,
        { LMUP_T_NAME: name },
      );
      const foreign = await exportTask(name);
      await assert.rejects(
        taskAction(name, project, 'apply'),
        // Só o trecho sem acentos: o PowerShell escreve no código de página do
        // console.
        /do sincronizador do LMUP/,
      );
      assert.equal(normal(await exportTask(name)), normal(foreign));
    });
  },
);
