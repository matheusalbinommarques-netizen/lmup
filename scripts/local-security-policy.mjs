import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { gitCommand } from './local-sync-core.mjs';

const execute = promisify(execFile);
const blocking = new Set(['moderate', 'high', 'critical']);
export const hashLockfile = (contents) =>
  createHash('sha256').update(contents.replace(/\r\n/g, '\n')).digest('hex');
export function evaluateAudit({
  report,
  exitCode,
  grant,
  commit,
  lockHash,
  now = Date.now(),
}) {
  if (
    ![0, 1].includes(exitCode) ||
    report?.error ||
    report?.auditReportVersion !== 2 ||
    !report?.metadata?.vulnerabilities ||
    !report?.vulnerabilities
  )
    throw Error(
      'A auditoria não terminou com um relatório válido. Publicação bloqueada.',
    );
  const entries = Object.entries(report.vulnerabilities).filter(([, item]) =>
    blocking.has(item.severity),
  );
  if (
    report.metadata.vulnerabilities.high > 0 ||
    report.metadata.vulnerabilities.critical > 0
  )
    throw Error(
      'Alertas altos ou críticos bloqueiam a publicação mesmo com exceção local.',
    );
  if (!entries.length) return { decision: 'pass', exception: false };
  const created = Date.parse(grant?.approvedAt),
    expires = Date.parse(grant?.expiresAt);
  if (
    grant?.approved !== true ||
    !grant.approvedBy ||
    grant.commit !== commit ||
    grant.lockHash !== lockHash ||
    !Number.isFinite(created) ||
    !Number.isFinite(expires) ||
    created > now ||
    expires <= now ||
    expires - created > 7 * 24 * 60 * 60 * 1000 ||
    expires <= created ||
    !Array.isArray(grant.advisories) ||
    !grant.advisories.length
  )
    throw Error(
      'Auditoria bloqueada: alertas moderados exigem aprovação local explícita, válida para este commit e lockfile, por até 7 dias.',
    );
  const allowed = new Set(grant.advisories);
  const reviewed = new Set([
    'https://github.com/advisories/GHSA-g3hv-75wg-m249',
    'https://github.com/advisories/GHSA-3g3m-2fjr-6pw4',
  ]);
  if ([...allowed].some((url) => !reviewed.has(url)))
    throw Error('A exceção contém um alerta sem análise de risco.');
  const reviewedAll = new Set([
    ...reviewed,
    'https://github.com/advisories/GHSA-gcqx-w48m-w2h4',
    'https://github.com/advisories/GHSA-pfhg-q3qv-9q6r',
    'https://github.com/advisories/GHSA-27mw-82g8-phjj',
  ]);
  for (const item of Object.values(report.vulnerabilities))
    for (const via of item.via)
      if (typeof via !== 'string' && !reviewedAll.has(via.url))
        throw Error('A auditoria contém um alerta novo, fora desta revisão.');
  function sources(name, seen = new Set()) {
    if (seen.has(name)) return [];
    const item = report.vulnerabilities[name];
    if (!item || !blocking.has(item.severity)) return [];
    const next = new Set([...seen, name]);
    return item.via.flatMap((via) =>
      typeof via === 'string'
        ? sources(via, next)
        : blocking.has(via.severity)
          ? [via.url]
          : [],
    );
  }
  for (const [name, item] of entries) {
    const ids = sources(name);
    if (
      item.severity !== 'moderate' ||
      !ids.length ||
      ids.some((id) => !allowed.has(id))
    )
      throw Error(
        `Alerta novo ou não aprovado em ${name}. Publicação bloqueada.`,
      );
  }
  return {
    decision: 'pass',
    exception: true,
    commit,
    expiresAt: grant.expiresAt,
  };
}

export async function auditLocalRelease({ project, storage, npmCli, logPath }) {
  const options = {
    cwd: project,
    windowsHide: true,
    timeout: 120000,
    maxBuffer: 16 * 1024 * 1024,
  };
  let output,
    exitCode = 0;
  try {
    output = (
      await execute(process.execPath, [npmCli, 'audit', '--json'], options)
    ).stdout;
  } catch (error) {
    exitCode = error.code;
    output = error.stdout;
    if (exitCode !== 1)
      throw Error(
        'Não foi possível concluir a auditoria; a versão instalada foi preservada.',
        { cause: error },
      );
  }
  const report = JSON.parse(output);
  await appendFile(
    logPath,
    `${JSON.stringify({ audit: report.metadata?.vulnerabilities })}\n`,
  );
  const grant = JSON.parse(
    await readFile(join(storage, 'security-exception.json'), 'utf8').catch(
      (error) => {
        if (error.code === 'ENOENT') return 'null';
        throw error;
      },
    ),
  );
  const result = evaluateAudit({
    report,
    exitCode,
    grant,
    commit: await gitCommand(project, ['rev-parse', 'HEAD']),
    lockHash: hashLockfile(
      await readFile(join(project, 'package-lock.json'), 'utf8'),
    ),
  });
  await appendFile(
    logPath,
    `${JSON.stringify({ audit: report.metadata.vulnerabilities, ...result })}\n`,
  );
  return result;
}
