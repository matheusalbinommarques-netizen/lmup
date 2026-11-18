// Relatórios e consultas sintéticos para os testes da auditoria local e da
// sincronização (formato do `npm audit --json`, versão 2). Nada aqui usa rede.
export const PICOMATCH = 'GHSA-fc5q-39xc-vjpf';
export const PICOMATCH_URL = `https://github.com/advisories/${PICOMATCH}`;
/** Moderado já revisado pela política local (aceita concessão local). */
export const REVIEWED_MODERATE =
  'https://github.com/advisories/GHSA-g3hv-75wg-m249';

export const picomatchException = (extra = {}) => ({
  id: PICOMATCH,
  package: 'picomatch',
  range: '<=4.0.7',
  expires: '2026-12-17',
  approvedBy: 'autor do projeto',
  approvedAt: '2026-11-17',
  reason: 'ReDoS só em ferramentas de build; app estático sem glob externo.',
  ...extra,
});

const picomatchVia = () => ({
  source: 1247710,
  name: 'picomatch',
  dependency: 'picomatch',
  title: 'picomatch vulnerable to ReDoS',
  url: PICOMATCH_URL,
  severity: 'high',
  range: '<=4.0.7',
});

/** picomatch e a cadeia tinyglobby → vite → @sveltejs/kit, todos altos. */
export function picomatchReport() {
  return {
    auditReportVersion: 2,
    vulnerabilities: {
      picomatch: { name: 'picomatch', severity: 'high', via: [picomatchVia()] },
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

/** Acrescenta uma entrada nova ao relatório, ajustando as contagens. */
export function addEntry(report, name, severity, via) {
  report.vulnerabilities[name] = { name, severity, via };
  report.metadata.vulnerabilities[severity] += 1;
  report.metadata.vulnerabilities.total += 1;
  return report;
}

export const advisory = (url, severity, name, range = '<9.9.9') => ({
  source: 1,
  name,
  dependency: name,
  title: `${name} advisory`,
  url,
  severity,
  range,
});

/** GitHub e registro sem correção publicada. */
export const upstreamOk = (github = {}, versions = ['2.3.2', '4.0.7']) => ({
  [PICOMATCH]: {
    github: {
      ghsa_id: PICOMATCH,
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

export const upstreamPatched = () =>
  upstreamOk({
    vulnerabilities: [
      {
        package: { ecosystem: 'npm', name: 'picomatch' },
        vulnerable_version_range: '<= 4.0.7',
        first_patched_version: { identifier: '4.0.8' },
      },
    ],
  });
