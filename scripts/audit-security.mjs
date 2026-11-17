// `npm run audit:security`: auditoria real do npm com a política de
// scripts/audit-policy.mjs. Reprova em qualquer dúvida; quando aprova com
// exceção, o log e a anotação da CI dizem qual advisory foi aceito e até quando.
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { AuditError, evaluateCiAudit } from './audit-policy.mjs';

const execute = promisify(execFile);
const ci = process.env.GITHUB_ACTIONS === 'true';
const say = (kind, text) => {
  for (const line of text.split('\n'))
    console.log(ci && kind ? `::${kind}::${line}` : line);
};

async function npm(args) {
  const cli = process.env.npm_execpath;
  if (!cli) throw new AuditError('Rode pelo npm: npm run audit:security.');
  try {
    const { stdout } = await execute(process.execPath, [cli, ...args], {
      timeout: 180_000,
      maxBuffer: 64 * 1024 * 1024,
      windowsHide: true,
    });
    return { exitCode: 0, stdout };
  } catch (error) {
    return { exitCode: error.code ?? -1, stdout: error.stdout ?? '' };
  }
}
const parse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

async function github(id) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
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
async function versions(name) {
  const { exitCode, stdout } = await npm(['view', name, 'versions', '--json']);
  const list = exitCode === 0 ? parse(stdout) : null;
  return Array.isArray(list) ? list : { error: `npm view ${name}` };
}

try {
  const exceptions = JSON.parse(
    await readFile(new URL('./audit-exceptions.json', import.meta.url), 'utf8'),
  );
  const { exitCode, stdout } = await npm(['audit', '--json']);
  const report = parse(stdout);
  const meta = report?.metadata?.vulnerabilities;
  if (meta)
    say(
      '',
      `npm audit: ${['critical', 'high', 'moderate', 'low', 'info'].map((s) => `${s} ${meta[s] ?? 0}`).join(' · ')}`,
    );
  const upstream = {};
  for (const item of exceptions)
    upstream[item.id] = {
      github: await github(item.id),
      versions: await versions(item.package),
    };
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
