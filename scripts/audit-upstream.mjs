// Consultas externas da política de auditoria (scripts/audit-policy.mjs),
// usadas pela CI e pela publicação local. Nunca lançam: uma falha volta como
// `{ error }`, e a política reprova.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execute = promisify(execFile);

/** Roda o npm pelo npm-cli.js indicado; devolve código de saída e stdout. */
export async function runNpmJson(npmCli, args, options = {}) {
  if (!npmCli) return { exitCode: -1, stdout: '' };
  try {
    const { stdout } = await execute(process.execPath, [npmCli, ...args], {
      timeout: 180_000,
      maxBuffer: 64 * 1024 * 1024,
      windowsHide: true,
      ...options,
    });
    return { exitCode: 0, stdout };
  } catch (error) {
    return {
      exitCode: Number.isInteger(error.code) ? error.code : -1,
      stdout: error.stdout ?? '',
    };
  }
}

export const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/** Advisory na base pública do GitHub. */
export async function githubAdvisory(id, token) {
  try {
    const response = await fetch(`https://api.github.com/advisories/${id}`, {
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': 'lmup-audit-security',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) return { error: `HTTP ${response.status}` };
    return (await response.json()) ?? { error: 'resposta vazia' };
  } catch (error) {
    return { error: error.message };
  }
}

/** Versões publicadas do pacote no registro configurado no npm. */
export async function registryVersions(npmCli, name, options) {
  const { exitCode, stdout } = await runNpmJson(
    npmCli,
    ['view', name, 'versions', '--json'],
    options,
  );
  const list = exitCode === 0 ? parseJson(stdout) : null;
  return Array.isArray(list) ? list : { error: `npm view ${name}` };
}

/** Situação publicada de cada exceção, no formato que a política espera. */
export async function fetchUpstream(exceptions, { npmCli, token, options }) {
  const upstream = {};
  for (const item of Array.isArray(exceptions) ? exceptions : [])
    upstream[item?.id] = {
      github: await githubAdvisory(item?.id, token),
      versions: await registryVersions(npmCli, item?.package, options),
    };
  return upstream;
}
