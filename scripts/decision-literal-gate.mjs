import { readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

const valueAfter = (flag, fallback) => {
  const index = process.argv.indexOf(flag);
  return index === -1 ? fallback : process.argv[index + 1];
};
const root = resolve(valueAfter('--root', process.cwd()));
const configPath = resolve(root, valueAfter('--config', 'decision-literal-allowlist.json'));
const blocking = process.argv.includes('--blocking');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
if (config.version !== 1 || !Array.isArray(config.scanPaths) || !Array.isArray(config.excludedPaths) || !Array.isArray(config.allowedOccurrences)) {
  throw new Error('Invalid decision literal allowlist schema.');
}

const realRoot = realpathSync(root);
const excluded = new Set(config.excludedPaths);
const files = [];
const extensions = /(?:^|\/)(?:Dockerfile|Makefile)$|\.(?:c|cc|css|go|h|html|js|json|jsx|md|mjs|rs|sh|sql|toml|ts|tsx|txt|ya?ml)$/;
const walk = (absolute) => {
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    if (['.git', '.next', 'build', 'coverage', 'dist', 'node_modules', 'target'].includes(entry.name)) continue;
    const child = resolve(absolute, entry.name);
    const repoPath = relative(realRoot, child).split('\\').join('/');
    if (excluded.has(repoPath)) continue;
    if (entry.isDirectory()) walk(child);
    else if (entry.isFile() && extensions.test(repoPath)) files.push(child);
  }
};
for (const scanPath of config.scanPaths) {
  const absolute = realpathSync(resolve(root, scanPath));
  const repoPath = relative(realRoot, absolute);
  if (repoPath === '..' || repoPath.startsWith(`..${sep}`) || isAbsolute(repoPath)) throw new Error('Scan path escapes repository root.');
  if (statSync(absolute).isDirectory()) walk(absolute);
  else files.push(absolute);
}

const allowances = config.allowedOccurrences.map((entry) => ({ ...entry, actualCount: 0 }));
const legacy = ['APP', 'ROVED'].join('');
const violations = [];
for (const file of files) {
  const repoPath = relative(realRoot, file).split('\\').join('/');
  const lines = readFileSync(file, 'utf8').split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const expression = lines[index].trim();
    let offset = 0;
    while ((offset = lines[index].indexOf(legacy, offset)) !== -1) {
      const allowance = allowances.find((entry) => entry.path === repoPath && entry.expression === expression);
      if (allowance) allowance.actualCount += 1;
      else violations.push(`${repoPath}:${index + 1}:${expression}`);
      offset += legacy.length;
    }
  }
}
for (const allowance of allowances) {
  if (allowance.actualCount !== allowance.expectedCount) {
    violations.push(`${allowance.path}: expected ${allowance.expectedCount} occurrence(s) of ${JSON.stringify(allowance.expression)}, found ${allowance.actualCount}`);
  }
}
if (violations.length === 0) console.log(`decision-literal-gate: ${files.length} files, 0 violations`);
else {
  console.error(`decision-literal-gate: ${violations.length} violation(s)${blocking ? '' : ' (advisory)'}`);
  for (const violation of violations) console.error(violation);
  if (blocking) process.exitCode = 1;
}
