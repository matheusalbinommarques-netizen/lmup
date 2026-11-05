// Runs the Living Reward spec in one of two explicit modes. Requires `npm run build`.
//   --check       Fails unless the spec leaves a clean Git worktree unchanged.
//   --regenerate  Updates the screenshots documented in docs/RECOMPENSA-VIVA-0.1.md.
import { execFileSync, spawnSync } from 'node:child_process';

const SPEC = 'tests/e2e/living-reward.spec.ts';
const DOCUMENTED_DIR = 'docs/recompensa-viva-capturas';

function gitStatus() {
  return execFileSync('git', ['status', '--porcelain'], {
    encoding: 'utf8',
  }).trimEnd();
}

function runSpec(env = process.env) {
  // A shell resolves npx.cmd on Windows; every argument here is a fixed literal.
  return (
    spawnSync(`npx playwright test ${SPEC}`, {
      env,
      shell: true,
      stdio: 'inherit',
    }).status ?? 1
  );
}

const mode = process.argv[2];

if (mode === '--regenerate') {
  process.exit(
    runSpec({ ...process.env, LMU_REWARD_CAPTURE_DIR: DOCUMENTED_DIR }),
  );
} else if (mode === '--check') {
  if (gitStatus()) {
    console.error(
      'A verificação exige um worktree limpo. Alterações já existentes:',
    );
    console.error(gitStatus());
    process.exit(2);
  }
  const exitCode = runSpec();
  const changes = gitStatus();
  if (changes) {
    console.error('A spec alterou arquivos do worktree:');
    console.error(changes);
    process.exit(1);
  }
  if (exitCode !== 0) process.exit(exitCode);
  console.log('A spec passou e não alterou arquivos do worktree.');
} else {
  console.error(
    'Uso: node scripts/reward-captures.mjs --check | --regenerate',
  );
  process.exit(2);
}
