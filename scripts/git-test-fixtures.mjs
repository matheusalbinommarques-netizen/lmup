// Synthetic Git for the gitCommand time-limit tests. It runs with node and
// creates persistent descendants like Git for Windows' wrapper does
// (git.exe -> mingw64 git.exe -> helpers). Processes are found by the
// unique script path in their command line, so a failing test still
// cleans them up and never touches unrelated processes.
import { execFile } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { runGit } from './local-sync-core.mjs';

const execute = promisify(execFile);
export const windows = process.platform === 'win32';

// Modes: argv = [node, script, mode, pidsFile, ...gitArgs].
const SCRIPT = `import { spawn } from 'node:child_process';
import { appendFileSync } from 'node:fs';
const [mode, pids] = process.argv.slice(2);
const record = () => appendFileSync(pids, process.pid + '\\n');
const hold = () => setInterval(() => {}, 1 << 30);
// detached: on Windows node would otherwise put the child in a job object
// that dies with the parent; Git for Windows' wrapper does not, which is
// what leaves descendants running after the wrapper is killed.
const child = (next) =>
  spawn(process.execPath, [process.argv[1], next, pids], {
    stdio: 'inherit',
    windowsHide: true,
    detached: true,
  });
if (mode === 'ok') process.stdout.write('  saida ok\\n');
else if (mode === 'fail') {
  process.stderr.write(
    'fatal: falhou em https://usuario:segredo@example.com/repo.git?token=abc ' +
      'ghp_' + 'a'.repeat(36) + '\\n',
  );
  process.exitCode = 128;
} else if (mode === 'hang') {
  record();
  hold();
} else if (mode === 'flood') {
  record();
  process.stdout.write('x'.repeat(300000));
  hold();
} else if (mode === 'tree') {
  // Wrapper alive, waiting for its child (like git.exe).
  record();
  child('mid');
  hold();
} else if (mode === 'mid') {
  record();
  child('leaf');
  hold();
} else if (mode === 'leaf') {
  record();
  hold();
}
`;

async function windowsMatching(text) {
  const { stdout } = await execute(
    'powershell.exe',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      'Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($env:LMUP_FAKE_GIT) } | ForEach-Object { $_.ProcessId }',
    ],
    { env: { ...process.env, LMUP_FAKE_GIT: text }, windowsHide: true },
  );
  return stdout.split(/\s+/).filter(Boolean).map(Number);
}

async function procMatching(text) {
  const found = [];
  for (const entry of await readdir('/proc').catch(() => [])) {
    if (!/^\d+$/.test(entry) || Number(entry) === process.pid) continue;
    const command = await readFile(`/proc/${entry}/cmdline`, 'utf8').catch(
      () => '',
    );
    if (command.includes(text)) found.push(Number(entry));
  }
  return found;
}

export async function fakeGit() {
  const directory = await mkdtemp(join(tmpdir(), 'lmup-fake-git-'));
  const script = join(directory, 'fake-git.mjs');
  const pids = join(directory, 'pids.txt');
  await writeFile(script, SCRIPT);
  await writeFile(pids, '');
  const running = () =>
    windows ? windowsMatching(script) : procMatching(script);
  /** runGit options that run this fake in the given mode. */
  const options = (mode, extra = {}) => ({
    executable: process.execPath,
    executableArgs: [script, mode, pids],
    ...extra,
  });
  return {
    directory,
    options,
    run: (mode, args = ['fetch'], extra = {}) =>
      runGit(directory, args, options(mode, extra)),
    recorded: async () =>
      (await readFile(pids, 'utf8')).split(/\s+/).filter(Boolean).map(Number),
    running,
    async dispose() {
      for (const pid of await running())
        try {
          process.kill(pid);
        } catch {
          // Already gone.
        }
      await rm(directory, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 200,
      });
    },
  };
}
