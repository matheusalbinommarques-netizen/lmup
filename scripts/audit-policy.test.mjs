import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  AuditError,
  checkUpstream,
  evaluateCiAudit,
  validateExceptions,
} from './audit-policy.mjs';

// Relatórios sintéticos no formato do `npm audit --json` (versão 2); nada aqui
// consulta a rede. A CI roda a auditoria real com `npm run audit:security`.
const ID = 'GHSA-fc5q-39xc-vjpf';
const ADVISORY_URL = `https://github.com/advisories/${ID}`;
const exception = () => ({
  id: ID,
  package: 'picomatch',
  range: '<=4.0.7',
  expires: '2026-12-17',
  approvedBy: 'autor do projeto',
  approvedAt: '2026-11-17',
  reason: 'ReDoS só em ferramentas de build; app estático sem glob externo.',
});
const advisory = (extra = {}) => ({
  source: 1247710,
  name: 'picomatch',
  dependency: 'picomatch',
  title: 'picomatch vulnerable to ReDoS',
  url: ADVISORY_URL,
  severity: 'high',
  range: '<=4.0.7',
  ...extra,
});
/** picomatch com a cadeia transitiva: tinyglobby → vite → @sveltejs/kit. */
function report() {
  return {
    auditReportVersion: 2,
    vulnerabilities: {
      picomatch: { name: 'picomatch', severity: 'high', via: [advisory()] },
      tinyglobby: { name: 'tinyglobby', severity: 'high', via: ['picomatch'] },
      vite: {
        name: 'vite',
        severity: 'high',
        via: ['picomatch', 'tinyglobby'],
      },
      '@sveltejs/kit': {
        name: '@sveltejs/kit',
        severity: 'high',
        via: ['vite'],
      },
    },
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 4,
        critical: 0,
        total: 4,
      },
    },
  };
}
const upstream = (
  github = {},
  versions = ['2.3.2', '3.0.2', '4.0.6', '4.0.7'],
) => ({
  [ID]: {
    github: {
      ghsa_id: ID,
      withdrawn_at: null,
      vulnerabilities: [
        {
          package: { ecosystem: 'npm', name: 'picomatch' },
          vulnerable_version_range: '<= 4.0.7',
          first_patched_version: null,
        },
      ],
      ...github,
    },
    versions,
  },
});
const input = (extra = {}) => ({
  report: report(),
  exitCode: 1,
  exceptions: [exception()],
  today: '2026-11-17',
  upstream: upstream(),
  ...extra,
});
const rejects = (value, pattern) =>
  assert.throws(
    () => evaluateCiAudit(value),
    (error) => {
      assert.ok(error instanceof AuditError, error.message);
      if (pattern) assert.match(error.message, pattern);
      return true;
    },
  );

// GHSA-fc5q-39xc-vjpf foi retirado em 18/11/2026 e saiu do npm audit; a
// exceção foi removida. Os testes abaixo seguem usando-a como dado sintético.
test('o arquivo versionado não tem exceções vigentes', () => {
  const list = JSON.parse(
    readFileSync(new URL('./audit-exceptions.json', import.meta.url), 'utf8'),
  );
  assert.deepEqual(validateExceptions(list), []);
});

test('aprova só o advisory da exceção, com a cadeia transitiva, e diz isso no log', () => {
  const result = evaluateCiAudit(input());
  assert.deepEqual(result.used, [ID]);
  assert.match(
    result.lines[0],
    /^EXCEÇÃO TEMPORÁRIA EM USO: GHSA-fc5q-39xc-vjpf/,
  );
  assert.match(result.lines[0], /válida até 2026-12-17/);
  assert.match(
    result.lines[0],
    /Cobre 4 entradas: @sveltejs\/kit, picomatch, tinyglobby, vite/,
  );
  assert.match(
    result.lines[1],
    /Correção publicada para GHSA-fc5q-39xc-vjpf: nenhuma .* 4\.0\.7/,
  );
});

const emptyReport = () => ({
  auditReportVersion: 2,
  vulnerabilities: {},
  metadata: { vulnerabilities: { high: 0, total: 0 } },
});

test('sem alertas aprova; exceção sem uso aparece no log para ser removida', () => {
  const result = evaluateCiAudit(input({ report: emptyReport(), exitCode: 0 }));
  assert.deepEqual(result.used, []);
  const log = result.lines.join(' | ');
  assert.match(log, /Exceção sem uso: GHSA-fc5q-39xc-vjpf/);
  assert.match(log, /Correção publicada para GHSA-fc5q-39xc-vjpf: nenhuma/);
  assert.doesNotMatch(log, /EXCEÇÃO TEMPORÁRIA EM USO/);
});

test('exceção sem uso também reprova com correção publicada ou consulta que falha', () => {
  const unused = (extra) =>
    input({ report: emptyReport(), exitCode: 0, ...extra });
  rejects(
    unused({
      upstream: upstream({
        vulnerabilities: [
          {
            package: { ecosystem: 'npm', name: 'picomatch' },
            vulnerable_version_range: '<= 4.0.7',
            first_patched_version: { identifier: '4.0.8' },
          },
        ],
      }),
    }),
    /informa correção em picomatch 4\.0\.8/,
  );
  rejects(
    unused({ upstream: upstream({}, ['4.0.7', '4.0.8']) }),
    /4\.0\.8 foi publicado/,
  );
  rejects(
    unused({ upstream: upstream({ withdrawn_at: '2026-11-20T00:00:00Z' }) }),
    /retirado/,
  );
  rejects(unused({ upstream: {} }), /Não foi possível consultar/);
  rejects(
    unused({
      upstream: {
        [ID]: { github: { error: 'HTTP 503' }, versions: ['4.0.7'] },
      },
    }),
    /HTTP 503/,
  );
  rejects(
    unused({
      upstream: {
        [ID]: {
          github: upstream()[ID].github,
          versions: { error: 'npm view picomatch' },
        },
      },
    }),
    /registro do npm/,
  );
});

test('reprova qualquer outro advisory moderado, alto ou crítico, inclusive no picomatch e na mesma cadeia', () => {
  for (const severity of ['moderate', 'high', 'critical']) {
    // Outro advisory no próprio picomatch.
    const same = report();
    same.vulnerabilities.picomatch.via.push(
      advisory({
        url: 'https://github.com/advisories/GHSA-2222-3333-4444',
        severity,
      }),
    );
    rejects(input({ report: same }), /GHSA-2222-3333-4444/);
    // Advisory próprio de um pacote que já estava na cadeia do picomatch.
    const chain = report();
    chain.vulnerabilities.vite.via.push({
      source: 1,
      name: 'vite',
      dependency: 'vite',
      url: 'https://github.com/advisories/GHSA-5555-6666-7777',
      severity,
      range: '<8.4.0',
    });
    rejects(input({ report: chain }), /vite: .*GHSA-5555-6666-7777/);
    // Pacote novo, fora da cadeia.
    const other = report();
    other.vulnerabilities.cookie = {
      name: 'cookie',
      severity,
      via: [
        {
          source: 2,
          name: 'cookie',
          url: 'https://github.com/advisories/GHSA-pxg6-pf52-xh8x',
          severity,
          range: '<0.7.0',
        },
      ],
    };
    other.metadata.vulnerabilities[severity] += 1;
    other.metadata.vulnerabilities.total += 1;
    rejects(input({ report: other }), /cookie/);
  }
});

test('alerta baixo continua fora do bloqueio, como antes', () => {
  const low = report();
  low.vulnerabilities.cookie = {
    name: 'cookie',
    severity: 'low',
    via: [
      {
        source: 2,
        name: 'cookie',
        url: 'https://github.com/advisories/GHSA-pxg6-pf52-xh8x',
        severity: 'low',
        range: '<0.7.0',
      },
    ],
  };
  low.metadata.vulnerabilities.low = 1;
  low.metadata.vulnerabilities.total = 5;
  assert.equal(evaluateCiAudit(input({ report: low })).ok, true);
});

test('mesmo id em outro pacote ou com intervalo diferente não é coberto', () => {
  const name = report();
  name.vulnerabilities.picomatch.via = [advisory({ name: 'micromatch' })];
  rejects(input({ report: name }), /não tem exceção/);
  const range = report();
  range.vulnerabilities.picomatch.via = [advisory({ range: '<4.0.8' })];
  rejects(input({ report: range }), /não tem exceção/);
});

test('a exceção vence: vale até 17/12 e reprova a partir de 18/12, mesmo sem uso', () => {
  assert.equal(evaluateCiAudit(input({ today: '2026-12-17' })).ok, true);
  rejects(input({ today: '2026-12-18' }), /venceu em 2026-12-17/);
  rejects(
    input({
      today: '2026-12-18',
      report: {
        auditReportVersion: 2,
        vulnerabilities: {},
        metadata: { vulnerabilities: { total: 0 } },
      },
      exitCode: 0,
    }),
    /venceu/,
  );
});

test('correção publicada reprova, pelo GitHub ou pelo registro do npm', () => {
  rejects(
    input({
      upstream: upstream({
        vulnerabilities: [
          {
            package: { ecosystem: 'npm', name: 'picomatch' },
            vulnerable_version_range: '<= 4.0.7',
            first_patched_version: { identifier: '4.0.8' },
          },
        ],
      }),
    }),
    /informa correção em picomatch 4\.0\.8/,
  );
  rejects(
    input({ upstream: upstream({}, ['4.0.7', '4.0.8']) }),
    /4\.0\.8 foi publicado/,
  );
  rejects(
    input({ upstream: upstream({}, ['4.0.7', '5.0.0-beta.1']) }),
    /5\.0\.0-beta\.1 foi publicado/,
  );
  rejects(
    input({
      upstream: upstream({
        vulnerabilities: [
          {
            package: { ecosystem: 'npm', name: 'picomatch' },
            vulnerable_version_range: '< 4.0.8',
            first_patched_version: null,
          },
        ],
      }),
    }),
    /intervalo afetado no GitHub mudou/,
  );
  rejects(
    input({ upstream: upstream({ withdrawn_at: '2026-11-20T00:00:00Z' }) }),
    /retirado/,
  );
});

test('`fixAvailable` do relatório não é tomado como correção publicada', () => {
  const value = report();
  value.vulnerabilities.picomatch.fixAvailable = {
    name: 'vitest',
    version: '3.1.4',
    isSemVerMajor: true,
  };
  assert.equal(evaluateCiAudit(input({ report: value })).ok, true);
});

test('consulta externa que falha ou responde incompleto não aprova', () => {
  for (const entry of [
    { github: { error: 'HTTP 403' }, versions: ['4.0.7'] },
    { github: undefined, versions: ['4.0.7'] },
    { github: { ghsa_id: 'GHSA-2222-3333-4444' }, versions: ['4.0.7'] },
    {
      github: upstream()[ID].github,
      versions: { error: 'npm view picomatch' },
    },
    { github: upstream()[ID].github, versions: [] },
    { github: upstream()[ID].github, versions: ['latest'] },
    { github: { ghsa_id: ID, vulnerabilities: [] }, versions: ['4.0.7'] },
  ])
    rejects(input({ upstream: { [ID]: entry } }));
  rejects(input({ upstream: {} }), /Não foi possível consultar/);
  assert.throws(() => checkUpstream(exception(), null), AuditError);
});

test('relatório inválido, incompleto ou com erro de rede não aprova', () => {
  const broken = [
    { report: null },
    { report: { error: { code: 'ENOTFOUND' } } },
    { exitCode: 2 },
    { exitCode: -1 },
    { report: { ...report(), auditReportVersion: 1 } },
    { report: { ...report(), metadata: {} } },
  ];
  for (const change of broken) rejects(input(change));
  const missing = report();
  delete missing.vulnerabilities.tinyglobby;
  missing.metadata.vulnerabilities.high = 3;
  missing.metadata.vulnerabilities.total = 3;
  rejects(input({ report: missing }), /cita tinyglobby, ausente/);
  const count = report();
  count.metadata.vulnerabilities.high = 3;
  rejects(input({ report: count }), /Contagem do relatório não confere/);
  const empty = report();
  empty.vulnerabilities.vite.via = [];
  rejects(input({ report: empty }), /Entrada incompleta/);
  const orphan = report();
  orphan.vulnerabilities.vite.via = ['vite'];
  rejects(input({ report: orphan }), /sem advisory de origem/);
});

test('arquivo de exceções malformado não aprova', () => {
  for (const change of [
    { id: 'GHSA-xxxx' },
    { expires: '2026-02-30' },
    { approvedAt: '2026-12-18' },
    { range: 'qualquer' },
    { approvedBy: ' ' },
    { reason: 'curto' },
    { extra: true },
  ])
    rejects(input({ exceptions: [{ ...exception(), ...change }] }));
  rejects(input({ exceptions: [exception(), exception()] }));
  rejects(input({ exceptions: {} }));
});
