import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAudit, hashLockfile } from './local-security-policy.mjs';
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
