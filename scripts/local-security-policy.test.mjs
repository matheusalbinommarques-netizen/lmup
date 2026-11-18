import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  evaluateAudit,
  hashLockfile,
  readCandidateExceptions,
} from './local-security-policy.mjs';
import {
  PICOMATCH,
  REVIEWED_MODERATE,
  addEntry,
  advisory,
  picomatchException,
  picomatchReport,
  upstreamOk,
  upstreamPatched,
} from './audit-test-fixtures.mjs';
const id = 'https://github.com/advisories/GHSA-g3hv-75wg-m249';
const now = Date.parse('2026-10-31T12:00:00Z');
test('hash de aprovação preserva conteúdo e normaliza apenas finais de linha do Git no Windows', () => {
  assert.equal(
    hashLockfile('{\n"version":1\n}'),
    hashLockfile('{\r\n"version":1\r\n}'),
  );
  assert.notEqual(
    hashLockfile('{\n"version":1\n}'),
    hashLockfile('{\n"version":2\n}'),
  );
});
function fixture() {
  return {
    report: {
      auditReportVersion: 2,
      metadata: { vulnerabilities: { moderate: 2 } },
      vulnerabilities: {
        minimatch: {
          severity: 'moderate',
          via: [{ url: id, severity: 'moderate' }],
        },
        eslint: { severity: 'moderate', via: ['minimatch', 'eslint'] },
      },
    },
    exitCode: 1,
    commit: 'chosen',
    lockHash: 'lock',
    now,
    grant: {
      approved: true,
      approvedBy: 'test-user',
      approvedAt: new Date(now - 1000).toISOString(),
      expiresAt: new Date(now + 86400000).toISOString(),
      commit: 'chosen',
      lockHash: 'lock',
      advisories: [id],
    },
  };
}
test('auditoria sem alertas passa sem exceção; rede ou relatório inválido bloqueia', () => {
  assert.equal(
    evaluateAudit({
      report: {
        auditReportVersion: 2,
        metadata: { vulnerabilities: {} },
        vulnerabilities: {},
      },
      exitCode: 0,
    }).exception,
    false,
  );
  for (const changed of [
    { exitCode: 2 },
    { report: { error: 'network' } },
    { report: null },
  ])
    assert.throws(() => evaluateAudit({ ...fixture(), ...changed }));
});
test('exceção explícita cobre apenas os alertas e commit aprovados', () => {
  assert.equal(evaluateAudit(fixture()).exception, true);
  for (const changed of [
    { grant: null },
    { commit: 'other' },
    { lockHash: 'other' },
    { now: now + 8 * 86400000 },
  ])
    assert.throws(() => evaluateAudit({ ...fixture(), ...changed }));
});
test('aprovação ausente, duração excessiva e alertas novos ou graves são recusados', () => {
  for (const changed of [
    { approved: false },
    { approvedBy: '' },
    { expiresAt: new Date(now + 8 * 86400000).toISOString() },
    { advisories: ['unknown'] },
  ]) {
    const input = fixture();
    input.grant = { ...input.grant, ...changed };
    assert.throws(() => evaluateAudit(input));
  }
  for (const severity of ['low', 'moderate', 'high', 'critical']) {
    const input = fixture();
    input.report.vulnerabilities.newPackage = {
      severity,
      via: [{ url: 'new-advisory', severity }],
    };
    assert.throws(() => evaluateAudit(input));
  }
});

// Exceção compartilhada com a CI (scripts/audit-exceptions.json, #115).
const nov = Date.parse('2026-11-18T12:00:00Z');
const shared = (extra = {}) => ({
  report: picomatchReport(),
  exitCode: 1,
  exceptions: [picomatchException()],
  upstream: upstreamOk(),
  commit: 'chosen',
  lockHash: 'lock',
  now: nov,
  ...extra,
});
const localGrant = () => ({
  approved: true,
  approvedBy: 'test-user',
  approvedAt: new Date(nov - 1000).toISOString(),
  expiresAt: new Date(nov + 86400000).toISOString(),
  commit: 'chosen',
  lockHash: 'lock',
  advisories: [REVIEWED_MODERATE],
});
const OTHER_HIGH = 'https://github.com/advisories/GHSA-pxg6-pf52-xh8x';

test('só o picomatch autorizado: publicação permitida, com a exceção no registro', () => {
  const result = evaluateAudit(shared());
  assert.equal(result.decision, 'pass');
  assert.equal(result.exception, false);
  assert.deepEqual(result.sharedExceptions, [PICOMATCH]);
  assert.match(
    result.lines[0],
    /EXCEÇÃO TEMPORÁRIA EM USO: GHSA-fc5q-39xc-vjpf/,
  );
  // Sem a exceção cadastrada, o mesmo relatório continua bloqueado.
  assert.throws(
    () => evaluateAudit(shared({ exceptions: [] })),
    /altos ou críticos/,
  );
});

test('picomatch autorizado + outro alerta alto: publicação bloqueada', () => {
  const other = addEntry(picomatchReport(), 'cookie', 'high', [
    advisory(OTHER_HIGH, 'high', 'cookie'),
  ]);
  assert.throws(
    () => evaluateAudit(shared({ report: other })),
    /altos ou críticos/,
  );
  // Outro advisory alto na mesma cadeia do picomatch também bloqueia.
  const chain = picomatchReport();
  chain.vulnerabilities.vite.via.push(advisory(OTHER_HIGH, 'high', 'vite'));
  assert.throws(
    () => evaluateAudit(shared({ report: chain })),
    /altos ou críticos/,
  );
  // Concessão local não libera alto.
  assert.throws(
    () => evaluateAudit(shared({ report: other, grant: localGrant() })),
    /altos ou críticos/,
  );
});

test('picomatch autorizado + moderado: só passa com concessão local válida, como antes', () => {
  const moderate = () =>
    addEntry(picomatchReport(), 'minimatch', 'moderate', [
      advisory(REVIEWED_MODERATE, 'moderate', 'minimatch'),
    ]);
  assert.throws(
    () => evaluateAudit(shared({ report: moderate() })),
    /aprovação local explícita/,
  );
  for (const change of [
    { commit: 'outro' },
    { lockHash: 'outro' },
    { expiresAt: new Date(nov - 1).toISOString() },
    { approved: false },
  ])
    assert.throws(() =>
      evaluateAudit(
        shared({ report: moderate(), grant: { ...localGrant(), ...change } }),
      ),
    );
  const ok = evaluateAudit(shared({ report: moderate(), grant: localGrant() }));
  assert.equal(ok.exception, true);
  assert.deepEqual(ok.sharedExceptions, [PICOMATCH]);
  // Cadeia com os dois: vite via picomatch (coberto) e um moderado próprio.
  const mixed = picomatchReport();
  mixed.vulnerabilities.vite.via.push(
    advisory(REVIEWED_MODERATE, 'moderate', 'vite'),
  );
  assert.throws(
    () => evaluateAudit(shared({ report: mixed })),
    /aprovação local explícita/,
  );
  assert.equal(
    evaluateAudit(shared({ report: mixed, grant: localGrant() })).exception,
    true,
  );
  // Moderado que a política local nunca revisou continua bloqueado.
  const unknown = addEntry(picomatchReport(), 'other', 'moderate', [
    advisory(
      'https://github.com/advisories/GHSA-2222-3333-5555',
      'moderate',
      'other',
    ),
  ]);
  assert.throws(
    () => evaluateAudit(shared({ report: unknown, grant: localGrant() })),
    /fora desta revisão/,
  );
});

test('exceção vencida, correção publicada ou consulta indisponível: publicação bloqueada', () => {
  assert.throws(
    () => evaluateAudit(shared({ now: Date.parse('2026-12-18T00:00:01Z') })),
    /venceu em 2026-12-17/,
  );
  assert.equal(
    evaluateAudit(shared({ now: Date.parse('2026-12-17T23:59:59Z') })).decision,
    'pass',
  );
  assert.throws(
    () => evaluateAudit(shared({ upstream: upstreamPatched() })),
    /informa correção/,
  );
  assert.throws(
    () =>
      evaluateAudit(shared({ upstream: upstreamOk({}, ['4.0.7', '4.0.8']) })),
    /4\.0\.8 foi publicado/,
  );
  assert.throws(
    () => evaluateAudit(shared({ upstream: {} })),
    /Não foi possível consultar/,
  );
  assert.throws(
    () =>
      evaluateAudit(
        shared({
          upstream: {
            [PICOMATCH]: { github: { error: 'HTTP 503' }, versions: ['4.0.7'] },
          },
        }),
      ),
    /HTTP 503/,
  );
  // Relatório incompleto também bloqueia.
  const broken = picomatchReport();
  delete broken.vulnerabilities.tinyglobby;
  assert.throws(
    () => evaluateAudit(shared({ report: broken })),
    /Auditoria bloqueada/,
  );
});

test('exceções da versão candidata são lidas só como dado e validadas', async () => {
  const project = await mkdtemp(join(tmpdir(), 'lmup-audit-'));
  try {
    assert.deepEqual(await readCandidateExceptions(project), []);
    await mkdir(join(project, 'scripts'));
    const file = join(project, 'scripts', 'audit-exceptions.json');
    await writeFile(file, '{ não é json');
    await assert.rejects(readCandidateExceptions(project), /inválidas/);
    await writeFile(
      file,
      JSON.stringify([picomatchException({ expires: '2026-02-30' })]),
    );
    await assert.rejects(readCandidateExceptions(project), /inválidas/);
    await writeFile(file, JSON.stringify([picomatchException()]));
    assert.deepEqual(await readCandidateExceptions(project), [
      picomatchException(),
    ]);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});
