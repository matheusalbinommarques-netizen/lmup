import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { access, open } from 'node:fs/promises';
import { join } from 'node:path';
import { acquireLocalLock } from './local-process-lock.mjs';
import { activeRelease, publishBuild } from './local-release-store.mjs';
import {
  consumeApproval,
  markApprovalFailed,
  readApproval,
} from './local-sync-approval.mjs';

const execute = promisify(execFile);
const environment = () => {
  const env = {
    ...process.env,
    HUSKY: '0',
    CI: 'true',
    GIT_TERMINAL_PROMPT: '0',
    GCM_INTERACTIVE: 'Never',
    ...(process.platform === 'win32' ? { LMU_BROWSER_CHANNEL: 'chrome' } : {}),
  };
  delete env.LMU_INSTALLATION_PROJECT;
  delete env.LMU_PUBLICATION_ROOT;
  delete env.LMU_PREVIEW_PORT;
  return env;
};
const exists = (path) =>
  access(path).then(
    () => true,
    () => false,
  );

export const GIT_TIMEOUT_MS = 120000;
const GIT_MAX_BUFFER = 2 * 1024 * 1024;
// After the tree is gone, how long to wait for the output pipes to close.
const CLOSE_GRACE_MS = 10000;
// Process creation times are compared with Date.now() of this process.
const CLOCK_SLACK_MS = 1000;
const TREE_KILL_ROUNDS = 3;

/** Git subcommand for messages; never the URL or other arguments. */
export function gitSubcommand(args) {
  for (let index = 0; index < args.length; index++) {
    const arg = String(args[index]);
    if (arg === '-c' || arg === '-C') index++;
    else if (!arg.startsWith('-'))
      return /^[a-z][a-z0-9-]*$/.test(arg) ? arg : '(subcomando)';
  }
  return '(sem subcomando)';
}

/** Removes credentials, query strings and tokens from Git output. */
export function redactGitText(text) {
  return String(text)
    .replace(/\b([a-z][a-z0-9+.-]*:\/\/)[^\s/@'"]*@/gi, '$1***@')
    .replace(/(\b[a-z][a-z0-9+.-]*:\/\/[^\s'"?#]*)[?#][^\s'"]*/gi, '$1?***')
    .replace(/\b(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{16,}/g, '***')
    .replace(/\b(authorization:\s*)\S+(?:\s+\S+)?/gi, '$1***');
}

/** Every process of the machine: pid, parent pid and creation time (ms). */
export async function listWindowsProcesses() {
  const { stdout } = await execute(
    'powershell.exe',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      "Get-CimInstance Win32_Process | Where-Object CreationDate | ForEach-Object { '{0} {1} {2}' -f $_.ProcessId, $_.ParentProcessId, $_.CreationDate.ToUniversalTime().ToString('o') }",
    ],
    { windowsHide: true, timeout: 30000, maxBuffer: 16 * 1024 * 1024 },
  );
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim().split(' '))
    .filter((parts) => parts.length === 3)
    .map(([pid, ppid, created]) => ({
      pid: Number(pid),
      ppid: Number(ppid),
      created: Date.parse(created),
    }));
}

/**
 * Processes of the command's tree still running. The tree is followed by
 * parent pid from the root and from every member seen before, so children
 * of an already finished wrapper (whose parent pid no longer exists) are
 * still found. Only processes created after the command started count.
 */
function runningTree(rootPid, processes, since, known) {
  const running = new Map();
  const parents = new Set([rootPid, ...known.keys()]);
  for (let grew = true; grew;) {
    grew = false;
    for (const item of processes) {
      if (running.has(item.pid) || !(item.created >= since - CLOCK_SLACK_MS))
        continue;
      if (item.pid === rootPid || parents.has(item.ppid)) {
        running.set(item.pid, item);
        if (!parents.has(item.pid)) {
          parents.add(item.pid);
          grew = true;
        }
      }
    }
  }
  return running;
}

/**
 * Ends the whole tree of a Git command on Windows (Git for Windows' git.exe
 * is a wrapper: killing only it leaves git.exe and its children running) and
 * confirms nothing of it is left. Elsewhere keeps execFile's behaviour.
 * Throws when the end cannot be confirmed.
 */
async function terminateGitTree(child, since, platform, listProcesses) {
  if (platform !== 'win32') {
    child.kill('SIGTERM');
    return 'sinal SIGTERM enviado';
  }
  if (!child.pid) return 'processo não iniciado';
  const taskkill = (pids) =>
    execute(
      'taskkill.exe',
      ['/F', '/T', ...pids.flatMap((pid) => ['/PID', `${pid}`])],
      { windowsHide: true, timeout: 30000 },
    ).catch(() => undefined);
  const known = new Map();
  for (let round = 0; ; round++) {
    let processes;
    try {
      processes = await listProcesses();
    } catch (error) {
      // Best effort without the list; the end stays unconfirmed.
      await taskkill([child.pid, ...known.keys()]);
      throw Error(
        `não foi possível listar os processos (${error.message}); taskkill /T enviado ao processo raiz`,
        { cause: error },
      );
    }
    const running = runningTree(child.pid, processes, since, known);
    if (!running.size) return 'árvore de processos encerrada';
    if (round === TREE_KILL_ROUNDS)
      throw Error(`processos ainda ativos: ${[...running.keys()].join(', ')}`);
    for (const item of running.values()) known.set(item.pid, item);
    await taskkill([...running.keys()]);
    await new Promise((done) => setTimeout(done, 250));
  }
}

function gitFailure(subcommand, detail, startedAt, stderr, fields) {
  const tail = redactGitText(stderr).replace(/\s+/g, ' ').trim().slice(-600);
  const error = Error(
    `git ${subcommand} falhou: ${detail} [${Date.now() - startedAt} ms]${tail ? `: ${tail}` : ''}`,
  );
  return Object.assign(error, {
    gitSubcommand: subcommand,
    durationMs: Date.now() - startedAt,
    timedOut: false,
    killed: false,
    exitCode: null,
    signal: null,
    cleanup: null,
    stderr,
    ...fields,
  });
}

/**
 * Runs Git with a time limit that ends the command's whole process tree.
 * Same contract as before: resolves with trimmed stdout on exit 0; rejects
 * otherwise, with `code` = exit code (callers read `code === 1`), the
 * spawn error code (`ENOENT`), `ETIMEDOUT` or the maxBuffer code.
 * The options exist for tests.
 */
export async function runGit(project, args, options = {}) {
  const {
    executable = 'git',
    executableArgs = [],
    timeout = GIT_TIMEOUT_MS,
    maxBuffer = GIT_MAX_BUFFER,
    platform = process.platform,
    listProcesses = listWindowsProcesses,
  } = options;
  const subcommand = gitSubcommand(args);
  const startedAt = Date.now();
  const child = spawn(executable, [...executableArgs, ...args], {
    cwd: project,
    env: environment(),
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const stdout = [],
    stderr = [];
  let size = 0,
    reason = null,
    cleanup = null,
    graceTimer;
  let aborted;
  const abortSignal = new Promise((done) => (aborted = done));
  const abort = (why) => {
    if (reason) return;
    reason = why;
    cleanup = terminateGitTree(child, startedAt, platform, listProcesses).then(
      (detail) => ({ ok: true, detail }),
      (error) => ({ ok: false, detail: error.message }),
    );
    aborted();
  };
  const collect = (chunks) => (chunk) => {
    size += chunk.length;
    if (size > maxBuffer) abort('maxBuffer');
    else chunks.push(chunk);
  };
  child.stdout.on('data', collect(stdout));
  child.stderr.on('data', collect(stderr));
  const timer = setTimeout(() => abort('timeout'), timeout);
  const ended = new Promise((done) => {
    child.once('error', (error) => done({ error }));
    child.once('close', (code, signal) => done({ code, signal }));
  });
  // The tree is gone but the pipes never closed: stop waiting.
  const stuck = abortSignal
    .then(() => cleanup)
    .then(
      () =>
        new Promise((done) => {
          graceTimer = setTimeout(() => done({ stuck: true }), CLOSE_GRACE_MS);
        }),
    );
  const outcome = await Promise.race([ended, stuck]);
  clearTimeout(timer);
  clearTimeout(graceTimer);
  if (outcome.stuck) {
    child.stdout.destroy();
    child.stderr.destroy();
  }
  const output = Buffer.concat(stdout).toString();
  const errors = Buffer.concat(stderr).toString();
  if (reason) {
    const result = await cleanup;
    const confirmed = result.ok && !outcome.stuck;
    const what =
      reason === 'timeout'
        ? `tempo limite de ${timeout} ms excedido`
        : `saída acima de ${maxBuffer} bytes`;
    const how = result.ok
      ? `${result.detail}${outcome.stuck ? '; a saída não fechou' : ''}`
      : `encerramento não confirmado (${result.detail})`;
    throw gitFailure(subcommand, `${what}; ${how}`, startedAt, errors, {
      code:
        reason === 'timeout'
          ? 'ETIMEDOUT'
          : 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER',
      timedOut: reason === 'timeout',
      killed: true,
      signal: platform === 'win32' ? null : 'SIGTERM',
      cleanup:
        platform !== 'win32'
          ? 'não verificada'
          : confirmed
            ? 'confirmada'
            : 'falhou',
      stdout: output,
    });
  }
  if (outcome.error)
    throw gitFailure(
      subcommand,
      `não foi possível iniciar o executável (${outcome.error.code ?? outcome.error.message})`,
      startedAt,
      errors,
      { code: outcome.error.code, cause: outcome.error, stdout: output },
    );
  if (outcome.code === 0) return output.trim();
  throw gitFailure(
    subcommand,
    outcome.signal
      ? `encerrado pelo sinal ${outcome.signal}`
      : `código de saída ${outcome.code}`,
    startedAt,
    errors,
    {
      code: outcome.code,
      exitCode: outcome.code,
      signal: outcome.signal,
      stdout: output,
    },
  );
}

export async function gitCommand(project, args) {
  return runGit(project, args);
}

export async function runNpm(project, npmCli, args, logPath) {
  const log = await open(logPath, 'a');
  try {
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [npmCli, ...args], {
        cwd: project,
        env: environment(),
        windowsHide: true,
        stdio: ['ignore', log.fd, log.fd],
      });
      let expired = false;
      const timer = setTimeout(
        () => {
          expired = true;
          if (process.platform === 'win32')
            // Terminate only this worker's process tree, never the installed app server.
            void execute(
              'taskkill.exe',
              ['/PID', String(child.pid), '/T', '/F'],
              {
                windowsHide: true,
              },
            ).catch(() => child.kill());
          else child.kill('SIGTERM');
        },
        15 * 60 * 1000,
      );
      child.once('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
      child.once('close', (code) => {
        clearTimeout(timer);
        if (code === 0 && !expired) resolve();
        else
          reject(
            Error(
              expired
                ? 'Tempo limite da verificação excedido.'
                : `npm ${args[0]} falhou (${code}); consulte o log.`,
            ),
          );
      });
    });
  } finally {
    await log.close();
  }
}

export async function synchronize({
  project,
  storage,
  config,
  verify,
  publish = publishBuild,
  // Tests only: replaces how Git is run.
  runGitCommand = gitCommand,
}) {
  const unlock = await acquireLocalLock(join(storage, 'publish.lock'));
  const git = (...args) => runGitCommand(project, args);
  const waiting = (reason) => ({ state: 'waiting', reason });
  async function guard(expected) {
    if ((await git('branch', '--show-current')) !== config.branch)
      return 'branch-different';
    if (await git('status', '--porcelain', '--untracked-files=all'))
      return 'local-changes';
    for (const name of [
      'MERGE_HEAD',
      'CHERRY_PICK_HEAD',
      'REVERT_HEAD',
      'rebase-merge',
      'rebase-apply',
      'BISECT_LOG',
    ]) {
      const path = await git(
        'rev-parse',
        '--path-format=absolute',
        '--git-path',
        name,
      );
      if (await exists(path)) return 'git-operation';
    }
    if (expected && (await git('rev-parse', 'HEAD')) !== expected)
      return 'head-changed';
    return null;
  }
  try {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(config.remote))
      throw Error('Nome do remoto inválido.');
    await git('check-ref-format', '--branch', config.branch);
    if ((await git('remote', 'get-url', config.remote)) !== config.url)
      return waiting('remote-changed');
    let reason = await guard();
    if (reason) return waiting(reason);
    const original = await git('rev-parse', 'HEAD');
    await git(
      'fetch',
      '--no-tags',
      config.remote,
      `+refs/heads/${config.branch}:refs/remotes/${config.remote}/${config.branch}`,
    );
    reason = await guard(original);
    if (reason) return waiting(reason);
    const target = await git(
      'rev-parse',
      `refs/remotes/${config.remote}/${config.branch}`,
    );
    if (original !== target) {
      try {
        await git('merge-base', '--is-ancestor', original, target);
      } catch (error) {
        if (error.code === 1) return waiting('diverged-or-local-ahead');
        throw error;
      }
      // No merge commits, stash, reset or automatic conflict resolution.
      await git(
        '-c',
        'core.hooksPath=',
        'merge',
        '--ff-only',
        '--no-edit',
        target,
      );
    }
    reason = await guard(target);
    if (reason) return waiting(reason);
    const active = await activeRelease(storage);
    const approval = await readApproval(storage);
    if (active?.source?.commit === target && !active.source.dirty) {
      // Publicação confirmada, inclusive quando interrompida antes de consumir.
      if (approval?.commit === target)
        await consumeApproval(storage, approval, active);
      return { state: 'current', commit: target, version: active.version };
    }
    // Receber a main não autoriza publicá-la: só o commit exato aprovado.
    if (approval?.commit !== target)
      return {
        state: 'awaiting-approval',
        commit: target,
        approved: approval?.commit ?? null,
      };
    if (approval.failure)
      return {
        state: 'approval-failed',
        commit: target,
        message: approval.failure.message,
      };
    if ((await git('rev-parse', `${target}^{tree}`)) !== approval.tree)
      return waiting('approval-tree-mismatch');
    let release;
    try {
      await verify();
      reason = await guard(target);
      if (reason) return waiting(reason);
      release = await publish(join(project, 'build'), storage, {
        commit: target,
        dirty: false,
        channel: 'github-sync',
        remote: config.remote,
        branch: config.branch,
        pr: approval.pr.number,
      });
    } catch (error) {
      // Para no erro: nada de nova tentativa até uma nova autorização.
      await markApprovalFailed(storage, approval, error.message);
      throw error;
    }
    await consumeApproval(storage, approval, release);
    return {
      state: 'published',
      commit: target,
      version: release.version,
      pr: approval.pr.number,
    };
  } finally {
    await unlock();
  }
}
