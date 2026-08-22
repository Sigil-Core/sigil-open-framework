import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const legacy = ['APP', 'ROVED'].join('');
const workflow = readFileSync(resolve(process.cwd(), '.github/workflows/decision-literal-gate.yml'), 'utf8');
if (!workflow.split('\n').some((line) => line.trim() === 'run: node scripts/decision-literal-gate.mjs --blocking')) {
  throw new Error('CI decision literal gate must run in blocking mode.');
}
const root = mkdtempSync(join(tmpdir(), 'decision-literal-gate-'));
try {
  mkdirSync(resolve(root, 'scripts'));
  mkdirSync(resolve(root, 'src'));
  cpSync(resolve(process.cwd(), 'scripts/decision-literal-gate.mjs'), resolve(root, 'scripts/decision-literal-gate.mjs'));
  writeFileSync(resolve(root, 'decision-literal-allowlist.json'), `${JSON.stringify({ version: 1, scanPaths: ['src'], excludedPaths: [], allowedOccurrences: [] }, null, 2)}\n`);
  writeFileSync(resolve(root, 'src/planted-config'), `decision=${legacy}\n`);
  const gate = resolve(root, 'scripts/decision-literal-gate.mjs');
  const blocked = spawnSync(process.execPath, [gate, '--root', root, '--blocking'], { encoding: 'utf8' });
  if (blocked.status !== 1 || !blocked.stderr.includes('src/planted-config:1')) throw new Error(`blocking proof failed\n${blocked.stdout}\n${blocked.stderr}`);
  const advisory = spawnSync(process.execPath, [gate, '--root', root], { encoding: 'utf8' });
  if (advisory.status !== 0 || !advisory.stderr.includes('(advisory)')) throw new Error(`advisory proof failed\n${advisory.stdout}\n${advisory.stderr}`);
  console.log('decision-literal-gate-test: planted violation blocked, advisory mode reported it, and CI is blocking');
} finally {
  rmSync(root, { recursive: true, force: true });
}
