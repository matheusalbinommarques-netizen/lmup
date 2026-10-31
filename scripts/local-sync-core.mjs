import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { access, open } from 'node:fs/promises';
import { join } from 'node:path';
import { acquireLocalLock } from './local-process-lock.mjs';
import { activeRelease, publishBuild } from './local-release-store.mjs';

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

export async function gitCommand(project, args) {
  const { stdout } = await execute('git', args, {
    cwd: project,
    env: environment(),
    windowsHide: true,
    timeout: 120000,
    maxBuffer: 2 * 1024 * 1024,
  });
  return stdout.trim();
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
}) {
  const unlock = await acquireLocalLock(join(storage, 'publish.lock'));
  const git = (...args) => gitCommand(project, args);
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
    if (active?.source?.commit === target && !active.source.dirty)
      return { state: 'current', commit: target, version: active.version };
    await verify();
    reason = await guard(target);
    if (reason) return waiting(reason);
    const release = await publish(join(project, 'build'), storage, {
      commit: target,
      dirty: false,
      channel: 'github-sync',
      remote: config.remote,
      branch: config.branch,
    });
    return { state: 'published', commit: target, version: release.version };
  } finally {
    await unlock();
  }
}
