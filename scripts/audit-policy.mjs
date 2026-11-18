// Política da auditoria de segurança da CI (`npm run audit:security`).
// Bloqueia todo alerta moderado, alto ou crítico. A única saída é uma
// exceção temporária, por identificador de advisory, registrada em
// scripts/audit-exceptions.json e revisada pelo autor. Qualquer dúvida
// (relatório inválido, consulta externa falha, correção publicada,
// exceção vencida) reprova. Ver docs/AUDITORIA-SEGURANCA.md.

export const BLOCKING = new Set(['moderate', 'high', 'critical']);
const SEVERITIES = new Set(['info', 'low', ...BLOCKING]);
const GHSA =
  /GHSA-[23456789cfghjmpqrvwx]{4}-[23456789cfghjmpqrvwx]{4}-[23456789cfghjmpqrvwx]{4}/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const FIELDS = [
  'id',
  'package',
  'range',
  'expires',
  'approvedBy',
  'approvedAt',
  'reason',
];

export class AuditError extends Error {}
const fail = (message) => {
  throw new AuditError(message);
};

const validDay = (text) =>
  typeof text === 'string' &&
  DAY.test(text) &&
  new Date(`${text}T00:00:00Z`).toISOString().slice(0, 10) === text;
/** "<= 4.0.7" (GitHub) e "<=4.0.7" (npm) são o mesmo intervalo. */
export const normalizeRange = (range) =>
  typeof range === 'string' ? range.replace(/\s+/g, '') : '';
export const advisoryId = (url) =>
  typeof url === 'string' ? (url.match(GHSA)?.[0] ?? null) : null;

/** Valida o arquivo de exceções: campos fixos, datas reais, ids únicos. */
export function validateExceptions(list) {
  if (!Array.isArray(list)) fail('Arquivo de exceções inválido.');
  const ids = new Set();
  for (const item of list) {
    if (
      !item ||
      typeof item !== 'object' ||
      Object.keys(item).sort().join() !== [...FIELDS].sort().join() ||
      advisoryId(item.id) !== item.id ||
      ids.has(item.id) ||
      typeof item.package !== 'string' ||
      !item.package ||
      !/^<=?\d+\.\d+\.\d+$/.test(normalizeRange(item.range)) ||
      !validDay(item.expires) ||
      !validDay(item.approvedAt) ||
      item.approvedAt > item.expires ||
      typeof item.approvedBy !== 'string' ||
      !item.approvedBy.trim() ||
      typeof item.reason !== 'string' ||
      item.reason.trim().length < 20
    )
      fail(`Exceção inválida: ${JSON.stringify(item?.id ?? item)}.`);
    ids.add(item.id);
  }
  return list;
}

/** O relatório precisa estar completo para ser interpretado. */
export function validateReport(report, exitCode) {
  if (![0, 1].includes(exitCode))
    fail(`npm audit terminou com código ${exitCode}; relatório não confiável.`);
  if (!report || typeof report !== 'object' || report.error)
    fail('npm audit não devolveu um relatório (erro de rede ou do registro).');
  if (
    report.auditReportVersion !== 2 ||
    !report.metadata?.vulnerabilities ||
    !report.vulnerabilities ||
    typeof report.vulnerabilities !== 'object'
  )
    fail('Relatório do npm audit em formato desconhecido ou incompleto.');
  const entries = Object.entries(report.vulnerabilities);
  const counts = {};
  for (const [name, item] of entries) {
    if (
      !item ||
      !SEVERITIES.has(item.severity) ||
      !Array.isArray(item.via) ||
      !item.via.length
    )
      fail(`Entrada incompleta no relatório: ${name}.`);
    for (const via of item.via)
      if (typeof via === 'string') {
        if (!report.vulnerabilities[via])
          fail(`A cadeia de ${name} cita ${via}, ausente do relatório.`);
      } else if (
        !via ||
        typeof via !== 'object' ||
        !SEVERITIES.has(via.severity) ||
        typeof via.url !== 'string'
      )
        fail(`Advisory incompleto em ${name}.`);
    counts[item.severity] = (counts[item.severity] ?? 0) + 1;
  }
  const meta = report.metadata.vulnerabilities;
  for (const severity of SEVERITIES)
    if ((meta[severity] ?? 0) !== (counts[severity] ?? 0))
      fail(
        `Contagem do relatório não confere em ${severity}: ${meta[severity] ?? 0} declaradas, ${counts[severity] ?? 0} listadas.`,
      );
  if ((meta.total ?? entries.length) !== entries.length)
    fail('Total do relatório não confere com as entradas.');
}

/**
 * Situação publicada do advisory, de duas fontes independentes do relatório:
 * a base de advisories do GitHub (`first_patched_version`) e as versões do
 * pacote no registro do npm. `fixAvailable` do npm audit não serve: indica
 * outra resolução da árvore (às vezes um rebaixamento), não uma versão segura.
 */
export function checkUpstream(exception, upstream) {
  const { github, versions } = upstream ?? {};
  if (!github || github.error)
    fail(
      `Não foi possível consultar ${exception.id} no GitHub${github?.error ? ` (${github.error})` : ''}; sem essa confirmação a exceção não vale.`,
    );
  if (github.ghsa_id !== exception.id)
    fail(`Resposta do GitHub não corresponde a ${exception.id}.`);
  if (github.withdrawn_at)
    fail(`${exception.id} foi retirado; revise e remova a exceção.`);
  const entries = (github.vulnerabilities ?? []).filter(
    (row) =>
      row?.package?.ecosystem === 'npm' &&
      row?.package?.name === exception.package,
  );
  if (!entries.length)
    fail(`${exception.id} não cita ${exception.package} no GitHub.`);
  for (const row of entries) {
    if (row.first_patched_version)
      fail(
        `${exception.id}: o GitHub informa correção em ${exception.package} ${row.first_patched_version.identifier ?? row.first_patched_version}. A exceção deixa de valer; atualize a dependência.`,
      );
    if (
      normalizeRange(row.vulnerable_version_range) !==
      normalizeRange(exception.range)
    )
      fail(
        `${exception.id}: o intervalo afetado no GitHub mudou para "${row.vulnerable_version_range}". Revise a exceção.`,
      );
  }
  if (!Array.isArray(versions) || !versions.length || versions.error)
    fail(
      `Não foi possível ler as versões de ${exception.package} no registro do npm.`,
    );
  const limit = parseVersion(
    normalizeRange(exception.range).replace(/^<=?/, ''),
  );
  const inclusive = normalizeRange(exception.range).startsWith('<=');
  for (const version of versions) {
    const parsed = parseVersion(version);
    if (!parsed)
      fail(
        `Versão desconhecida de ${exception.package} no registro: ${version}.`,
      );
    const cmp = compare(parsed, limit);
    if (cmp > 0 || (cmp === 0 && !inclusive))
      fail(
        `${exception.package} ${version} foi publicado, fora do intervalo ${exception.range}. Pode ser a correção: a exceção deixa de valer até a revisão.`,
      );
  }
  return {
    latest: versions.at(-1),
  };
}
function parseVersion(text) {
  const match = /^(\d+)\.(\d+)\.(\d+)(-[\w.-]+)?$/.exec(String(text));
  return match ? match.slice(1, 4).map(Number) : null;
}
function compare(a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

/** Ids de advisory na origem de uma entrada, seguindo a cadeia transitiva. */
function sources(report, name, seen = new Set()) {
  if (seen.has(name)) return [];
  const item = report.vulnerabilities[name];
  const next = new Set([...seen, name]);
  return item.via.flatMap((via) =>
    typeof via === 'string'
      ? sources(report, via, next)
      : BLOCKING.has(via.severity)
        ? [via]
        : [],
  );
}

const RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

/**
 * Classificação compartilhada pela CI e pela publicação local. Valida o
 * relatório, as exceções (validade e situação publicada de todas) e separa,
 * sem alterar o relatório, as entradas cobertas pelas exceções das que
 * sobram. Uma entrada só é coberta quando todos os advisories na origem dela
 * têm exceção; se a cadeia tiver também outro advisory, ela sobra com a
 * severidade dos advisories sem exceção. Lança AuditError em qualquer dúvida.
 */
export function classifyAudit({
  report,
  exitCode,
  exceptions,
  today,
  upstream = {},
}) {
  validateExceptions(exceptions);
  if (!validDay(today)) fail('Data de hoje inválida.');
  validateReport(report, exitCode);
  for (const item of exceptions)
    if (today > item.expires)
      fail(
        `A exceção de ${item.id} venceu em ${item.expires}. Revise: atualize a dependência ou peça nova decisão do autor.`,
      );
  // Toda exceção cadastrada passa pela verificação externa, mesmo sem uso:
  // correção publicada ou consulta falha reprova e força a revisão.
  const latest = new Map(
    exceptions.map((item) => [
      item.id,
      checkUpstream(item, upstream[item.id]).latest,
    ]),
  );
  const byId = new Map(exceptions.map((item) => [item.id, item]));
  const isCovered = (via) => {
    const item = byId.get(advisoryId(via.url));
    return (
      !!item &&
      via.name === item.package &&
      (via.dependency === undefined || via.dependency === item.package) &&
      normalizeRange(via.range) === normalizeRange(item.range)
    );
  };
  const problems = [];
  const used = new Map();
  /** Entradas moderadas ou acima que não ficam inteiramente cobertas. */
  const remaining = [];
  for (const [name, item] of Object.entries(report.vulnerabilities)) {
    for (const via of item.via)
      if (
        typeof via !== 'string' &&
        BLOCKING.has(via.severity) &&
        !isCovered(via)
      )
        problems.push(
          `${name}: ${via.severity} ${advisoryId(via.url) ?? via.url} (${via.name ?? '?'} ${via.range ?? ''}) não tem exceção.`,
        );
    if (!BLOCKING.has(item.severity)) continue;
    const roots = sources(report, name);
    if (!roots.length) {
      problems.push(
        `${name}: ${item.severity} sem advisory de origem identificável.`,
      );
      remaining.push({ name, severity: item.severity, advisories: [] });
      continue;
    }
    const open = roots.filter((via) => !isCovered(via));
    for (const via of roots)
      if (isCovered(via)) {
        const id = advisoryId(via.url);
        used.set(id, [...(used.get(id) ?? []), name]);
      }
    for (const via of open)
      problems.push(
        `${name}: ${item.severity} por ${advisoryId(via.url) ?? via.url} (${via.name ?? '?'}), sem exceção.`,
      );
    if (open.length)
      remaining.push({
        name,
        severity: open.reduce(
          (top, via) => (RANK[via.severity] > RANK[top] ? via.severity : top),
          'moderate',
        ),
        advisories: [...new Set(open.map((via) => via.url))],
      });
  }
  const lines = [];
  for (const item of exceptions) {
    const names = used.get(item.id);
    if (names) {
      const unique = [...new Set(names)].sort();
      lines.push(
        `EXCEÇÃO TEMPORÁRIA EM USO: ${item.id} (${item.package} ${item.range}), aprovada por ${item.approvedBy} em ${item.approvedAt}, válida até ${item.expires}. Cobre ${unique.length} entradas: ${unique.join(', ')}.`,
      );
    } else
      lines.push(
        `Exceção sem uso: ${item.id} não aparece mais no relatório; remova-a de scripts/audit-exceptions.json.`,
      );
    lines.push(
      `Correção publicada para ${item.id}: nenhuma (GitHub sem first_patched_version; última ${item.package} no npm: ${latest.get(item.id)}).`,
    );
  }
  return {
    used: [...used.keys()],
    remaining,
    problems: [...new Set(problems)],
    isCovered,
    lines,
  };
}

/**
 * Decide a auditoria da CI: qualquer moderado ou acima sem exceção reprova.
 * Lança AuditError com o motivo; quando aprova, devolve as linhas de log,
 * sempre citando a exceção em uso.
 */
export function evaluateCiAudit(input) {
  const result = classifyAudit(input);
  if (result.problems.length)
    fail(
      `Alertas moderados ou acima sem exceção:\n- ${result.problems.join('\n- ')}`,
    );
  return {
    ok: true,
    used: result.used,
    lines: [...result.lines, 'Nenhum outro alerta moderado, alto ou crítico.'],
  };
}
