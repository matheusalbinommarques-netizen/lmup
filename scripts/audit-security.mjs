// `npm run audit:security`: auditoria real do npm com a política de
// scripts/audit-policy.mjs. Reprova em qualquer dúvida; quando aprova com
// exceção, o log e a anotação da CI dizem qual advisory foi aceito e até quando.
import { readFile } from 'node:fs/promises';
import {
  AuditError,
  evaluateCiAudit,
  validateExceptions,
} from './audit-policy.mjs';
import { fetchUpstream, parseJson, runNpmJson } from './audit-upstream.mjs';

const ci = process.env.GITHUB_ACTIONS === 'true';
const say = (kind, text) => {
  for (const line of text.split('\n'))
    console.log(ci && kind ? `::${kind}::${line}` : line);
};
const npmCli = process.env.npm_execpath;

try {
  if (!npmCli) throw new AuditError('Rode pelo npm: npm run audit:security.');
  const exceptions = validateExceptions(
    JSON.parse(
      await readFile(
        new URL('./audit-exceptions.json', import.meta.url),
        'utf8',
      ),
    ),
  );
  const { exitCode, stdout } = await runNpmJson(npmCli, ['audit', '--json']);
  const report = parseJson(stdout);
  const meta = report?.metadata?.vulnerabilities;
  if (meta)
    say(
      '',
      `npm audit: ${['critical', 'high', 'moderate', 'low', 'info'].map((s) => `${s} ${meta[s] ?? 0}`).join(' · ')}`,
    );
  const upstream = await fetchUpstream(exceptions, {
    npmCli,
    token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
  });
  const result = evaluateCiAudit({
    report,
    exitCode,
    exceptions,
    today: new Date().toISOString().slice(0, 10),
    upstream,
  });
  for (const line of result.lines)
    say(line.startsWith('EXCEÇÃO') ? 'warning' : '', line);
  say('', 'Auditoria de segurança aprovada pela política.');
} catch (error) {
  say('error', `Auditoria de segurança reprovada: ${error.message}`);
  if (!(error instanceof AuditError)) console.error(error);
  process.exit(1);
}
