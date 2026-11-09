// Reproduce C02 on the same machine and full app, changing only its six-line optimization.
// Intended for disposable CI checkouts. Never run against an installed app or personal profile.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

if (!process.env.CI) throw Error('Use somente em checkout descartável da CI.');
const root = process.cwd();
const target = path.join(root, 'src/services/rewardService.ts');
const original = fs.readFileSync(target, 'utf8');
const normalized = original.replaceAll('\r\n', '\n');
const current =
  '  const events = await db.activityEvents.toArray();\n  const eventsById = new Map(events.map((event) => [event.id, event]));\n  const history = events';
const lookup = 'eventsById.get(row.completionEventId)';
if (
  normalized.split(current).length !== 2 ||
  normalized.split(lookup).length !== 2
)
  throw Error('C02 mudou; revisar a reconstrução do antes.');
const previous = normalized
  .replace(current, '  const history = (await db.activityEvents.toArray())')
  .replace(lookup, 'await db.activityEvents.get(row.completionEventId)');
fs.mkdirSync('perf-results', { recursive: true });
function run(args, name, expectedFailure = false) {
  const result = spawnSync(process.execPath, args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, PERF_PORT: '5198', TZ: 'America/Sao_Paulo' },
  });
  fs.writeFileSync(
    `perf-results/${name}.log`,
    `${result.stdout ?? ''}\n${result.stderr ?? ''}`,
  );
  if (result.error || (!expectedFailure && result.status !== 0))
    throw (
      result.error ??
      Error(`${name} falhou (${result.status}); consulte o log.`)
    );
  return result;
}
const results = {};
try {
  for (const [variant, source] of [
    ['before', previous],
    ['after', original],
  ]) {
    fs.writeFileSync(target, source);
    run(['node_modules/vite/bin/vite.js', 'build'], `${variant}-build`);
    run(['scripts/build-pwa.mjs'], `${variant}-pwa`);
    const prior = new Set(fs.readdirSync('perf-results'));
    run(['scripts/perf/measure.mjs', 'scale'], `${variant}-scale`);
    const file = fs
      .readdirSync('perf-results')
      .find(
        (file) =>
          !prior.has(file) &&
          file.startsWith('scale-') &&
          file.endsWith('.json'),
      );
    if (!file) throw Error(`Relatório C01 ausente: ${variant}`);
    results[variant] = JSON.parse(
      fs.readFileSync(`perf-results/${file}`, 'utf8'),
    );
    console.log(variant, JSON.stringify(results[variant].results));
  }
} finally {
  fs.writeFileSync(target, original);
}
run(
  [
    'node_modules/vitest/vitest.mjs',
    'run',
    'src/services/refreshCompletionStreak.test.ts',
    '--reporter=json',
    '--outputFile=perf-results/m06-baseline.json',
  ],
  'm06-baseline',
);
const mutant = run(
  [
    'node_modules/vitest/vitest.mjs',
    'run',
    'src/services/refreshCompletionStreak.test.ts',
    '--config',
    'scripts/perf/m06.config.mjs',
    '--reporter=json',
    '--outputFile=perf-results/m06-mutant.json',
  ],
  'm06-mutant',
  true,
);
const report = JSON.parse(
  fs.readFileSync('perf-results/m06-mutant.json', 'utf8'),
);
const failed = report.testResults
  .flatMap((suite) => suite.assertionResults)
  .filter((test) => test.status === 'failed');
if (
  mutant.status !== 1 ||
  failed.length !== 1 ||
  !failed[0].fullName.includes('recalcula com conclusões')
)
  throw Error('M06 não foi morto pela asserção de comportamento esperada.');
if (fs.readFileSync(target, 'utf8') !== original)
  throw Error('Fonte não foi restaurada.');
results.m06 = { result: 'morto', killer: failed[0].fullName };
results.meta = {
  sha: process.env.GITHUB_SHA,
  node: process.version,
  measuredAt: new Date().toISOString(),
  note: 'C01 scale completo; mesma máquina, mesma configuração; apenas C02 reconstruído no antes. Ordem fixa antes/depois, sem atribuir toda diferença a C02.',
};
fs.writeFileSync(
  'perf-results/c02-closeout.json',
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results.m06));
