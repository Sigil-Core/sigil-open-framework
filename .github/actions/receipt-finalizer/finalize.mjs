import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const API = 'https://api.github.com';
const SHA = /^[a-f0-9]{40}$/;
const REPOSITORY = /^(Sigil-Core|SigilWatch)\/[A-Za-z0-9._-]+$/;
const UNIT_ID = /^[a-z][a-z0-9-]{2,63}\/[a-z][a-z0-9-]{1,19}$/;
const SERVICE = /^[a-z][a-z0-9-]{2,39}$/;
const ORIGIN = /^[a-z][a-z0-9-]{1,31}$/;
const UTC_SECOND = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const ARTIFACT_DIGEST = /^sha256:[a-f0-9]{64}$/;
const PAYLOAD_KEYS = new Set(['receipt_schema_version', 'unit_id', 'service', 'environment', 'commit', 'intended_origins', 'run_id']);
const EVIDENCE_KEYS = new Set(['evidence_schema_version', 'unit_id', 'origin', 'run_id', 'run_attempt', 'commit', 'parity_verified', 'parity_source', 'completed_at']);
const REQUEST_TIMEOUT_MS = 15_000;
const RETRY_WINDOW_MS = 180_000;
const RETRY_ATTEMPTS = 10;

class ReceiptValidationError extends Error {}
class RetryDeadlineError extends Error {}

function requireTime(deadline, now, description) {
  const remaining = deadline - now();
  if (!Number.isSafeInteger(remaining) || remaining < 1) {
    throw new RetryDeadlineError(`${description} exceeded the shared retry deadline`);
  }
  return remaining;
}

function retryable(error) {
  return !(error instanceof ReceiptValidationError) &&
    !(error instanceof RetryDeadlineError) && error?.retryable !== false;
}

async function waitToRetry(controls, description) {
  const remaining = requireTime(controls.deadline, controls.now, description);
  await controls.sleep(Math.min(1_000, remaining));
  requireTime(controls.deadline, controls.now, description);
}

function record(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function exactKeys(value, expected) {
  return record(value) && Object.keys(value).length === expected.size && Object.keys(value).every((key) => expected.has(key));
}

function canonicalPositiveDecimal(value, maxDigits = 16) {
  if (typeof value !== 'string' || !new RegExp(`^[1-9]\\d{0,${maxDigits - 1}}$`).test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 1 && String(parsed) === value ? parsed : null;
}

function exactUtcSecond(value) {
  if (typeof value !== 'string' || !UTC_SECOND.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().replace('.000Z', 'Z') === value;
}

function parseString(text, cursor) {
  let index = cursor + 1;
  for (; index < text.length; index += 1) {
    if (text[index] === '\\') {
      index += 1;
      continue;
    }
    if (text[index] === '"') {
      const raw = text.slice(cursor, index + 1);
      return { value: JSON.parse(raw), cursor: index + 1 };
    }
  }
  throw new Error('unterminated JSON string');
}

function skipSpace(text, cursor) {
  let index = cursor;
  while (index < text.length && /[ \t\r\n]/u.test(text[index])) index += 1;
  return index;
}

function parseScalar(text, cursor) {
  if (text[cursor] === '"') return parseString(text, cursor);
  const match = /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/u.exec(text.slice(cursor));
  if (!match) throw new Error('evidence JSON value is not a scalar');
  return { value: JSON.parse(match[0]), cursor: cursor + match[0].length };
}

export function parseEvidenceJson(bytes) {
  const text = Buffer.from(bytes).toString('utf8');
  if (!Buffer.from(text, 'utf8').equals(Buffer.from(bytes)) || text.includes('\u0000')) throw new Error('evidence JSON encoding is invalid');
  let cursor = skipSpace(text, 0);
  if (text[cursor] !== '{') throw new Error('evidence JSON must be an object');
  cursor = skipSpace(text, cursor + 1);
  const result = Object.create(null);
  if (text[cursor] === '}') return result;
  while (cursor < text.length) {
    if (text[cursor] !== '"') throw new Error('evidence JSON key is invalid');
    const key = parseString(text, cursor);
    if (Object.hasOwn(result, key.value)) throw new Error('evidence JSON has duplicate keys');
    cursor = skipSpace(text, key.cursor);
    if (text[cursor] !== ':') throw new Error('evidence JSON separator is invalid');
    const scalar = parseScalar(text, skipSpace(text, cursor + 1));
    result[key.value] = scalar.value;
    cursor = skipSpace(text, scalar.cursor);
    if (text[cursor] === '}') {
      cursor = skipSpace(text, cursor + 1);
      if (cursor !== text.length) throw new Error('evidence JSON has trailing data');
      return { ...result };
    }
    if (text[cursor] !== ',') throw new Error('evidence JSON separator is invalid');
    cursor = skipSpace(text, cursor + 1);
  }
  throw new Error('evidence JSON is incomplete');
}

export function validateInputs({ repository, runId, runAttempt }) {
  const runIdNumber = canonicalPositiveDecimal(runId);
  const runAttemptNumber = canonicalPositiveDecimal(runAttempt, 4);
  if (!REPOSITORY.test(repository ?? '')) throw new Error('repository is outside the finalizer allowlist');
  if (runIdNumber === null) throw new Error('run-id must be a canonical positive safe decimal');
  if (runAttemptNumber === null || runAttemptNumber > 9999) throw new Error('run-attempt must be between 1 and 9999');
  return { repository, runId, runIdNumber, runAttempt: runAttemptNumber };
}

export function validateDeploymentPayload(payload, { runId, deploymentSha, deploymentEnvironment }) {
  const expectedUnitId = `${payload?.service}/${payload?.environment === 'production' ? 'prod' : payload?.environment}`;
  if (!exactKeys(payload, PAYLOAD_KEYS) || payload.receipt_schema_version !== 1 || !UNIT_ID.test(payload.unit_id ?? '') ||
      !SERVICE.test(payload.service ?? '') || !['production', 'test'].includes(payload.environment) || !SHA.test(payload.commit ?? '') ||
      payload.unit_id !== expectedUnitId || payload.commit !== deploymentSha || payload.environment !== deploymentEnvironment ||
      payload.run_id !== runId || !Array.isArray(payload.intended_origins) ||
      payload.intended_origins.length < 1 || payload.intended_origins.length > 99) throw new Error('deployment receipt payload is invalid');
  const origins = [...payload.intended_origins];
  if (origins.some((origin) => typeof origin !== 'string' || !ORIGIN.test(origin)) || new Set(origins).size !== origins.length) {
    throw new Error('deployment intended_origins are invalid');
  }
  return { ...payload, intended_origins: origins };
}

export function validateEvidenceRecord(value, binding) {
  if (!exactKeys(value, EVIDENCE_KEYS) || value.evidence_schema_version !== 1 || value.unit_id !== binding.unitId ||
      value.origin !== binding.origin || value.run_id !== binding.runId || value.run_attempt !== binding.runAttempt ||
      value.commit !== binding.commit || typeof value.parity_verified !== 'boolean' || typeof value.parity_source !== 'string' ||
      !exactUtcSecond(value.completed_at)) throw new Error(`evidence for ${binding.origin} is invalid`);
  const parityTuple = `${String(value.parity_verified)}:${String(value.parity_source)}`;
  if (!['true:endpoint', 'false:none'].includes(parityTuple)) throw new Error(`evidence parity tuple for ${binding.origin} is invalid`);
  return value;
}

function readEvidenceFile(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  if (entries.length !== 1 || entries[0].name !== 'evidence.json' || !entries[0].isFile()) throw new Error('artifact must contain exactly one evidence.json file');
  const evidencePath = path.join(directory, entries[0].name);
  const stat = fs.lstatSync(evidencePath);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size < 2 || stat.size > 16_384) throw new Error('evidence.json size or type is invalid');
  return parseEvidenceJson(fs.readFileSync(evidencePath));
}

export function evaluateEvidenceArtifactSet(artifacts, payload, { runIdNumber, runAttempt, commit }) {
  try {
    const prefix = `deploy-evidence-${runAttempt}-`;
    const expectedNames = payload.intended_origins.map((origin) => `${prefix}${origin}`).sort();
    const evidenceArtifacts = artifacts.filter((artifact) => String(artifact?.name ?? '').startsWith(prefix));
    const names = evidenceArtifacts.map((artifact) => artifact.name).sort();
    if (JSON.stringify(names) !== JSON.stringify(expectedNames)) {
      throw new Error('evidence artifact names are missing, duplicate, or unexpected');
    }
    for (const artifact of evidenceArtifacts) {
      if (deploymentId(artifact.id) === null || artifact.expired !== false ||
          !ARTIFACT_DIGEST.test(artifact.digest ?? '') || !Number.isSafeInteger(artifact.size_in_bytes) ||
          artifact.size_in_bytes < 2 || artifact.size_in_bytes > 65_536 ||
          artifact.workflow_run?.id !== runIdNumber || artifact.workflow_run?.head_sha !== commit) {
        throw new Error('evidence artifact metadata is invalid');
      }
    }
    return { state: 'success', artifacts: evidenceArtifacts, reason: null };
  } catch (error) {
    return { state: 'failure', artifacts: [], reason: error instanceof Error ? error.message : 'artifact validation failed' };
  }
}

export function evaluateEvidenceDirectory(root, payload, { runId, runAttempt, allowFlattenedSingle = false }) {
  try {
    const expectedNames = payload.intended_origins.map((origin) => `deploy-evidence-${runAttempt}-${origin}`);
    const entries = fs.readdirSync(root, { withFileTypes: true });
    if (allowFlattenedSingle && expectedNames.length === 1 && entries.length === 1 &&
        entries[0].isFile() && entries[0].name === 'evidence.json') {
      const record = validateEvidenceRecord(readEvidenceFile(root), {
        unitId: payload.unit_id,
        origin: payload.intended_origins[0],
        runId,
        runAttempt,
        commit: payload.commit,
      });
      if (record.parity_verified !== true || record.parity_source !== 'endpoint') {
        throw new Error('every origin must have positive endpoint parity');
      }
      return { state: 'success', records: [record], reason: null };
    }
    const names = entries.map((entry) => entry.name).sort();
    if (entries.some((entry) => !entry.isDirectory()) || JSON.stringify(names) !== JSON.stringify([...expectedNames].sort())) {
      throw new Error('evidence artifact set is missing, duplicate, or unexpected');
    }
    const records = payload.intended_origins.map((origin) => validateEvidenceRecord(
      readEvidenceFile(path.join(root, `deploy-evidence-${runAttempt}-${origin}`)),
      { unitId: payload.unit_id, origin, runId, runAttempt, commit: payload.commit },
    ));
    if (records.some((record) => record.parity_verified !== true || record.parity_source !== 'endpoint')) {
      throw new Error('every origin must have positive endpoint parity');
    }
    return { state: 'success', records, reason: null };
  } catch (error) {
    return { state: 'failure', records: [], reason: error instanceof Error ? error.message : 'evidence validation failed' };
  }
}

async function githubRequest(fetchImpl, token, method, pathname, body, timeoutMilliseconds) {
  if (!Number.isInteger(timeoutMilliseconds) || timeoutMilliseconds < 1 || timeoutMilliseconds > REQUEST_TIMEOUT_MS) {
    throw new Error('GitHub API request timeout is invalid');
  }
  const response = await fetchImpl(`${API}${pathname}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(timeoutMilliseconds),
  });
  if (!response.ok) {
    const error = new Error(`GitHub API ${method} ${pathname} failed with ${response.status}`);
    error.retryable = response.status === 408 || response.status === 429 || response.status >= 500;
    throw error;
  }
  if (response.status === 204) return null;
  try {
    return await response.json();
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    throw new ReceiptValidationError(`GitHub API ${method} ${pathname} returned invalid JSON`);
  }
}

async function requestWithRetries(fetchImpl, token, method, pathname, controls, body) {
  let lastError = null;
  for (let attempt = 1; attempt <= controls.attempts; attempt += 1) {
    const timeoutMilliseconds = Math.min(
      REQUEST_TIMEOUT_MS,
      requireTime(controls.deadline, controls.now, `GitHub API ${method} ${pathname}`),
    );
    try {
      return await githubRequest(fetchImpl, token, method, pathname, body, timeoutMilliseconds);
    } catch (error) {
      if (!retryable(error)) throw error;
      lastError = error;
      if (attempt < controls.attempts) await waitToRetry(controls, `GitHub API ${method} ${pathname}`);
    }
  }
  throw new Error(`GitHub API ${method} ${pathname} failed after bounded retries: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

async function collectPages(fetchImpl, token, pathname, controls) {
  const values = [];
  for (let page = 1; page <= 100; page += 1) {
    requireTime(controls.deadline, controls.now, `GitHub API pagination for ${pathname}`);
    const separator = pathname.includes('?') ? '&' : '?';
    const batch = await requestWithRetries(
      fetchImpl,
      token,
      'GET',
      `${pathname}${separator}per_page=100&page=${page}`,
      controls,
    );
    if (!Array.isArray(batch)) throw new ReceiptValidationError('GitHub API pagination response is invalid');
    values.push(...batch);
    if (batch.length < 100) return values;
  }
  throw new ReceiptValidationError(`GitHub API pagination limit exceeded for ${pathname}`);
}

async function collectArtifactPages(fetchImpl, token, repository, runId, controls) {
  const values = [];
  for (let page = 1; page <= 100; page += 1) {
    requireTime(controls.deadline, controls.now, 'GitHub artifact pagination');
    const result = await requestWithRetries(
      fetchImpl,
      token,
      'GET',
      `/repos/${repository}/actions/runs/${runId}/artifacts?per_page=100&page=${page}`,
      controls,
    );
    if (!record(result) || !Number.isSafeInteger(result.total_count) || result.total_count < 0 || !Array.isArray(result.artifacts)) {
      throw new ReceiptValidationError('GitHub artifact pagination response is invalid');
    }
    values.push(...result.artifacts);
    if (result.artifacts.length < 100) {
      if (values.length !== result.total_count) throw new Error('GitHub artifact count changed during pagination');
      return values;
    }
  }
  throw new ReceiptValidationError('GitHub API pagination limit exceeded for workflow artifacts');
}

function deploymentId(value) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 1 && String(parsed) === String(value) ? parsed : null;
}

function matchingAttemptPointer(statuses, runAttempt, originCount) {
  const prefix = `sigil-receipt/1 attempt=${runAttempt} origins=`;
  const sameAttempt = statuses.filter((status) => status?.state === 'in_progress' && String(status.description ?? '').startsWith(prefix));
  if (sameAttempt.length > 1 || (sameAttempt.length === 1 && sameAttempt[0].description !== terminalPointer(runAttempt, originCount))) {
    throw new Error('deployment in-progress receipt pointer is duplicate or contradictory');
  }
  return sameAttempt.length === 1;
}

async function selectDeployment(fetchImpl, token, repository, runId, runAttempt, controls) {
  const deployments = await collectPages(fetchImpl, token, `/repos/${repository}/deployments`, controls);
  const candidates = deployments.filter((deployment) => record(deployment?.payload) && deployment.payload.run_id === runId);
  const selected = [];
  for (const candidate of candidates) {
    const id = deploymentId(candidate.id);
    if (id === null || !SHA.test(candidate.sha ?? '')) throw new Error('matched deployment identity is invalid');
    const payload = validateDeploymentPayload(candidate.payload, {
      runId,
      deploymentSha: candidate.sha,
      deploymentEnvironment: candidate.environment,
    });
    const statuses = await collectPages(fetchImpl, token, `/repos/${repository}/deployments/${id}/statuses`, controls);
    if (matchingAttemptPointer(statuses, runAttempt, payload.intended_origins.length)) selected.push({ id, sha: candidate.sha, payload, statuses });
  }
  if (selected.length !== 1) throw new Error('exactly one deployment must match the workflow run attempt');
  return selected[0];
}

async function validateWorkflowRun(fetchImpl, token, input, commit, controls) {
  const run = await requestWithRetries(
    fetchImpl,
    token,
    'GET',
    `/repos/${input.repository}/actions/runs/${input.runId}/attempts/${input.runAttempt}`,
    controls,
  );
  if (!record(run) || run.id !== input.runIdNumber || run.run_attempt !== input.runAttempt ||
      run.repository?.full_name !== input.repository || run.head_sha !== commit ||
      !['push', 'workflow_call', 'workflow_dispatch', 'repository_dispatch'].includes(run.event)) {
    throw new Error('workflow run identity or trigger is invalid');
  }
}

function terminalPointer(runAttempt, originCount) {
  return `sigil-receipt/1 attempt=${runAttempt} origins=${originCount}`;
}

function existingTerminal(statuses, runAttempt, originCount) {
  const terminals = statuses.filter((status) => ['success', 'failure'].includes(status?.state));
  if (terminals.length === 0) return null;
  const expected = terminalPointer(runAttempt, originCount);
  if (terminals.length !== 1 || terminals[0].description !== expected) throw new Error('terminal receipt status is duplicate or contradictory');
  return terminals[0].state;
}

export async function finalizeReceipt({
  token,
  repository,
  runId,
  runAttempt,
  evidenceDirectory,
  fetchImpl = fetch,
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  now = Date.now,
  retryWindowMilliseconds = RETRY_WINDOW_MS,
  retryAttempts = RETRY_ATTEMPTS,
}) {
  if (typeof token !== 'string' || token.length < 1) throw new Error('github-token is required');
  if (typeof fetchImpl !== 'function' || typeof sleep !== 'function' || typeof now !== 'function' ||
      !Number.isInteger(retryWindowMilliseconds) || retryWindowMilliseconds < 1 || retryWindowMilliseconds > 240_000 ||
      !Number.isInteger(retryAttempts) || retryAttempts < 1 || retryAttempts > 30) {
    throw new Error('receipt finalizer retry controls are invalid');
  }
  const deadline = now() + retryWindowMilliseconds;
  if (!Number.isSafeInteger(deadline)) throw new Error('receipt finalizer retry deadline is invalid');
  const controls = { deadline, now, sleep, attempts: retryAttempts };
  const input = validateInputs({ repository, runId, runAttempt: String(runAttempt) });
  const deployment = await selectDeployment(fetchImpl, token, repository, runId, input.runAttempt, controls);
  await validateWorkflowRun(fetchImpl, token, input, deployment.payload.commit, controls);
  const prior = existingTerminal(deployment.statuses, input.runAttempt, deployment.payload.intended_origins.length);
  if (prior) return { state: prior, deploymentId: deployment.id, idempotent: true, reason: null };
  const artifacts = await collectArtifactPages(fetchImpl, token, repository, runId, controls);
  const artifactEvidence = evaluateEvidenceArtifactSet(artifacts, deployment.payload, {
    runIdNumber: input.runIdNumber,
    runAttempt: input.runAttempt,
    commit: deployment.payload.commit,
  });
  const evidence = artifactEvidence.state === 'failure'
    ? { state: 'failure', records: [], reason: artifactEvidence.reason }
    : evaluateEvidenceDirectory(evidenceDirectory, deployment.payload, {
      ...input,
      allowFlattenedSingle: deployment.payload.intended_origins.length === 1,
    });
  const description = terminalPointer(input.runAttempt, deployment.payload.intended_origins.length);
  const beforeWrite = await collectPages(fetchImpl, token, `/repos/${repository}/deployments/${deployment.id}/statuses`, controls);
  const raced = existingTerminal(beforeWrite, input.runAttempt, deployment.payload.intended_origins.length);
  if (raced) return { state: raced, deploymentId: deployment.id, idempotent: true, reason: null };
  let writeError = null;
  try {
    const writeTimeout = Math.min(
      REQUEST_TIMEOUT_MS,
      requireTime(deadline, now, 'terminal receipt status write'),
    );
    await githubRequest(fetchImpl, token, 'POST', `/repos/${repository}/deployments/${deployment.id}/statuses`, {
      state: evidence.state,
      description,
      auto_inactive: false,
    }, writeTimeout);
  } catch (error) {
    writeError = error;
  }
  const afterWrite = await collectPages(
    fetchImpl,
    token,
    `/repos/${repository}/deployments/${deployment.id}/statuses`,
    controls,
  );
  const serializedState = existingTerminal(afterWrite, input.runAttempt, deployment.payload.intended_origins.length);
  if (serializedState !== evidence.state) {
    if (writeError) throw writeError;
    throw new Error('terminal receipt status was not durably serialized');
  }
  return { state: evidence.state, deploymentId: deployment.id, idempotent: false, reason: evidence.reason };
}

function appendOutput(name, value) {
  const output = process.env.GITHUB_OUTPUT;
  if (!output) return;
  fs.appendFileSync(output, `${name}=${value}\n`, { encoding: 'utf8' });
}

async function main() {
  const repository = process.env.INPUT_REPOSITORY;
  const runId = process.env.INPUT_RUN_ID;
  const runAttempt = process.env.INPUT_RUN_ATTEMPT;
  if (process.argv[2] === '--validate-inputs') {
    validateInputs({ repository, runId, runAttempt });
    return;
  }
  const result = await finalizeReceipt({
    token: process.env.INPUT_GITHUB_TOKEN,
    repository,
    runId,
    runAttempt,
    evidenceDirectory: process.env.INPUT_EVIDENCE_DIRECTORY,
  });
  appendOutput('state', result.state);
  appendOutput('deployment-id', result.deploymentId);
  if (result.reason) process.stderr.write(`Receipt finalized as failure: ${result.reason}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
