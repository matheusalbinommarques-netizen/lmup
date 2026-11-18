import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { gitCommand } from './local-sync-core.mjs';
import {
  classifyAudit,
  normalizeRange,
  validateExceptions,
} from './audit-policy.mjs';
import { fetchUpstream } from './audit-upstream.mjs';

const execute = promisify(execFile);
export const hashLockfile = (contents) =>
  createHash('sha256').update(contents.replace(/\r\n/g, '\n')).digest('hex');
/**
 * Limite próprio do agente para as exceções da publicação local. O arquivo de
 * exceções vem da versão candidata e só pode pedir menos do que isto: mesmo
 * advisory, pacote e intervalo, e validade até a data máxima. Qualquer outra
 * exceção ou ampliação exige nova decisão do autor e atualização do agente.
 * Decisão de 17/11/2026: GHSA-fc5q-39xc-vjpf, até 17/12/2026.
 */
export const LOCAL_AUTHORIZED_EXCEPTIONS = Object.freeze([
  Object.freeze({
    id: 'GHSA-fc5q-39xc-vjpf',
    package: 'picomatch',
    range: '<=4.0.7',
    maxExpires: '2026-12-17',
  }),
]);

export function limitCandidateExceptions(
  exceptions,
  authorized = LOCAL_AUTHORIZED_EXCEPTIONS,
) {
  for (const item of exceptions) {
    const allowed = authorized.find((entry) => entry.id === item.id);
    if (
      !allowed ||
      item.package !== allowed.package ||
      normalizeRange(item.range) !== normalizeRange(allowed.range) ||
      !(item.expires <= allowed.maxExpires)
    )
      throw Error(
        `Exceção ${item.id} (${item.package} ${item.range}, até ${item.expires}) não está autorizada para a publicação local. Exige nova decisão e atualização do agente.`,
      );
  }
  return exceptions;
}

/**
 * Decisão da publicação local. Primeiro a classificação compartilhada com a
 * CI (scripts/audit-policy.mjs) separa o que a exceção temporária aprovada
 * cobre, sem alterar o relatório e reprovando em qualquer dúvida (exceção
 * vencida, correção publicada, consulta indisponível, relatório inválido).
 * O que sobra passa pelas regras locais de sempre: alto ou crítico bloqueia;
 * moderado exige concessão local para este commit e lockfile, por até 7 dias.
 */
export function evaluateAudit({
  report,
  exitCode,
  grant,
  commit,
  lockHash,
  now = Date.now(),
  exceptions = [],
  upstream = {},
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
  let shared;
  try {
    limitCandidateExceptions(exceptions);
    shared = classifyAudit({
      report,
      exitCode,
      exceptions,
      today: new Date(now).toISOString().slice(0, 10),
      upstream,
    });
  } catch (error) {
    throw Error(`Auditoria bloqueada: ${error.message}`, { cause: error });
  }
  const ciException = { sharedExceptions: shared.used, lines: shared.lines };
  if (
    shared.remaining.some((entry) =>
      ['high', 'critical'].includes(entry.severity),
    )
  )
    throw Error(
      'Alertas altos ou críticos bloqueiam a publicação mesmo com exceção local.',
    );
  const reviewed = new Set([
    'https://github.com/advisories/GHSA-g3hv-75wg-m249',
    'https://github.com/advisories/GHSA-3g3m-2fjr-6pw4',
  ]);
  const reviewedAll = new Set([
    ...reviewed,
    'https://github.com/advisories/GHSA-gcqx-w48m-w2h4',
    'https://github.com/advisories/GHSA-pfhg-q3qv-9q6r',
    'https://github.com/advisories/GHSA-27mw-82g8-phjj',
  ]);
  for (const item of Object.values(report.vulnerabilities))
    for (const via of item.via)
      if (
        typeof via !== 'string' &&
        !shared.isCovered(via) &&
        !reviewedAll.has(via.url)
      )
        throw Error('A auditoria contém um alerta novo, fora desta revisão.');
  if (!shared.remaining.length)
    return { decision: 'pass', exception: false, ...ciException };
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
  if ([...allowed].some((url) => !reviewed.has(url)))
    throw Error('A exceção contém um alerta sem análise de risco.');
  for (const entry of shared.remaining)
    if (
      entry.severity !== 'moderate' ||
      !entry.advisories.length ||
      entry.advisories.some((id) => !allowed.has(id))
    )
      throw Error(
        `Alerta novo ou não aprovado em ${entry.name}. Publicação bloqueada.`,
      );
  return {
    decision: 'pass',
    exception: true,
    commit,
    expiresAt: grant.expiresAt,
    ...ciException,
  };
}

/**
 * Exceções aprovadas lidas do checkout que vai ser publicado, só como dado:
 * nenhum código da versão candidata é carregado. Sem o arquivo, não há
 * exceção; arquivo ilegível, inválido ou além do limite do agente bloqueia.
 */
export async function readCandidateExceptions(project) {
  let text;
  try {
    text = await readFile(
      join(project, 'scripts', 'audit-exceptions.json'),
      'utf8',
    );
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw Error('Não foi possível ler as exceções da auditoria.', {
      cause: error,
    });
  }
  let exceptions;
  try {
    exceptions = validateExceptions(JSON.parse(text));
  } catch (error) {
    throw Error(
      `Exceções da auditoria inválidas; publicação bloqueada. ${error.message}`,
      { cause: error },
    );
  }
  // Recusa logo o que o agente não autoriza, antes de qualquer consulta externa.
  return limitCandidateExceptions(exceptions);
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
  const exceptions = await readCandidateExceptions(project);
  const upstream = await fetchUpstream(exceptions, {
    npmCli,
    token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
    options: { cwd: project },
  });
  const result = evaluateAudit({
    report,
    exitCode,
    exceptions,
    upstream,
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
