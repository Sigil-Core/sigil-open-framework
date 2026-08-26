import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  evaluateEvidenceDirectory,
  finalizeReceipt,
  parseEvidenceJson,
  validateDeploymentPayload,
  validateEvidenceRecord,
  validateInputs,
} from '../.github/actions/receipt-finalizer/finalize.mjs';

const commit = 'a'.repeat(40);
const repository = 'Sigil-Core/fleet-build-phase0a-scratch';
const runId = '42';
const runAttempt = 1;
const payload = {
  receipt_schema_version: 1,
  unit_id: 'sigil-sign/test',
  service: 'sigil-sign',
  environment: 'test',
  commit,
  intended_origins: ['ams3', 'nyc2'],
  run_id: runId,
};

function evidence(origin, overrides = {}) {
  return {
    evidence_schema_version: 1,
    unit_id: payload.unit_id,
    origin,
    run_id: runId,
    run_attempt: runAttempt,
    commit,
    parity_verified: true,
    parity_source: 'endpoint',
    completed_at: '2026-08-25T00:00:00Z',
    ...overrides,
  };
}

async function withEvidenceDirectory(callback, records = payload.intended_origins.map((origin) => evidence(origin)), attempt = runAttempt) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sigil-receipt-finalizer-'));
  try {
    for (const record of records) {
      const artifact = path.join(root, `deploy-evidence-${attempt}-${record.origin}`);
      fs.mkdirSync(artifact);
      fs.writeFileSync(path.join(artifact, 'evidence.json'), JSON.stringify(record));
    }
    return await callback(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function response(status, value) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => structuredClone(value),
  };
}

function inProgress(attempt = runAttempt, origins = payload.intended_origins.length) {
  return { state: 'in_progress', description: `sigil-receipt/1 attempt=${attempt} origins=${origins}` };
}

function artifact(origin, overrides = {}, attempt = runAttempt) {
  return {
    id: origin === 'ams3' ? 11 : 12,
    name: `deploy-evidence-${attempt}-${origin}`,
    size_in_bytes: 334,
    expired: false,
    digest: `sha256:${'b'.repeat(64)}`,
    workflow_run: { id: Number(runId), head_sha: commit },
    ...overrides,
  };
}

function fakeGithub({
  statuses = [inProgress()],
  statusesByDeployment = null,
  deployments = [{ id: 7, sha: commit, environment: 'test', payload }],
  expectedState = 'success',
  expectedDeploymentId = 7,
  attempt = runAttempt,
  workflowRun = {},
  artifacts = payload.intended_origins.map((origin) => artifact(origin, {}, attempt)),
  artifactTotalCount = artifacts.length,
} = {}) {
  const calls = [];
  const fetchImpl = (url, options) => {
    calls.push({ url, method: options.method, body: options.body ? JSON.parse(options.body) : null });
    if (url.includes('/deployments?')) return response(200, deployments);
    if (url.includes('/actions/runs/42/artifacts?')) return response(200, { total_count: artifactTotalCount, artifacts });
    if (url.includes(`/actions/runs/42/attempts/${attempt}`)) return response(200, {
      id: 42,
      run_attempt: attempt,
      repository: { full_name: repository },
      head_sha: commit,
      event: 'workflow_call',
      conclusion: 'failure',
      ...workflowRun,
    });
    const statusRead = /\/deployments\/(\d+)\/statuses\?/.exec(url);
    if (statusRead) return response(200, statusesByDeployment?.[statusRead[1]] ?? statuses);
    if (url.endsWith(`/deployments/${expectedDeploymentId}/statuses`) && options.method === 'POST') {
      const written = JSON.parse(options.body);
      assert.deepEqual(written, {
        state: expectedState,
        description: `sigil-receipt/1 attempt=${attempt} origins=${deployments.find((deployment) => deployment.id === expectedDeploymentId).payload.intended_origins.length}`,
        auto_inactive: false,
      });
      const target = statusesByDeployment?.[String(expectedDeploymentId)] ?? statuses;
      target.unshift(written);
      return response(201, { id: 9 });
    }
    throw new Error(`unexpected request ${options.method} ${url}`);
  };
  return { fetchImpl, calls };
}

test('validates bounded canonical action inputs and deployment payload binding', () => {
  assert.deepEqual(validateInputs({ repository, runId, runAttempt: '1' }), {
    repository, runId, runIdNumber: 42, runAttempt: 1,
  });
  const deploymentBinding = { runId, deploymentSha: commit, deploymentEnvironment: 'test' };
  assert.deepEqual(validateDeploymentPayload(payload, deploymentBinding), payload);
  for (const invalid of ['../../repo', 'Other/repo', 'Sigil-Core/repo/name']) {
    assert.throws(() => validateInputs({ repository: invalid, runId, runAttempt: '1' }), /allowlist/);
  }
  assert.throws(() => validateInputs({ repository, runId: '042', runAttempt: '1' }), /run-id/);
  assert.throws(() => validateDeploymentPayload({ ...payload, commit: 'b'.repeat(40) }, deploymentBinding), /payload/);
  assert.throws(() => validateDeploymentPayload({ ...payload, service: 'sigil_sign' }, deploymentBinding), /payload/);
  assert.throws(() => validateDeploymentPayload({ ...payload, intended_origins: ['1'] }, deploymentBinding), /payload|origins/);
  assert.throws(() => validateDeploymentPayload(payload, { ...deploymentBinding, deploymentEnvironment: 'production' }), /payload/);
});

test('rejects duplicate JSON keys and non-scalar evidence structures', () => {
  assert.throws(() => parseEvidenceJson(Buffer.from('{"origin":"nyc2","origin":"ams3"}')), /duplicate/);
  assert.throws(() => parseEvidenceJson(Buffer.from('{"origin":{"nested":true}}')), /scalar/);
  assert.throws(() => parseEvidenceJson(Buffer.from('{\u00a0"origin":"nyc2"}')), /key/);
});

test('requires the exact evidence schema and positive endpoint parity for success', () => {
  assert.deepEqual(validateEvidenceRecord(evidence('nyc2'), {
    unitId: payload.unit_id, origin: 'nyc2', runId, runAttempt, commit,
  }), evidence('nyc2'));
  const acceptedNegative = validateEvidenceRecord(evidence('nyc2', { parity_verified: false, parity_source: 'none' }), {
    unitId: payload.unit_id, origin: 'nyc2', runId, runAttempt, commit,
  });
  assert.equal(acceptedNegative.parity_verified, false);
  assert.throws(() => validateEvidenceRecord(evidence('nyc2', { completed_at: '2026-02-30T00:00:00Z' }), {
    unitId: payload.unit_id, origin: 'nyc2', runId, runAttempt, commit,
  }), /invalid/);
  for (const invalidParity of [
    { parity_verified: 'true', parity_source: 'endpoint' },
    { parity_verified: true, parity_source: true },
  ]) {
    assert.throws(() => validateEvidenceRecord(evidence('nyc2', invalidParity), {
      unitId: payload.unit_id, origin: 'nyc2', runId, runAttempt, commit,
    }), /invalid/);
  }
});

test('finalizes success from exactly one valid artifact per intended origin', () => withEvidenceDirectory(async (root) => {
  const github = fakeGithub();
  const result = await finalizeReceipt({ token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: github.fetchImpl });
  assert.deepEqual(result, { state: 'success', deploymentId: 7, idempotent: false, reason: null });
  assert.equal(github.calls.some((call) => call.method === 'POST'), true);
}));

test('accepts the verified single-artifact flattened download layout', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sigil-receipt-finalizer-flat-'));
  const singlePayload = { ...payload, intended_origins: ['nyc2'] };
  try {
    fs.writeFileSync(path.join(root, 'evidence.json'), JSON.stringify(evidence('nyc2')));
    const github = fakeGithub({
      deployments: [{ id: 7, sha: commit, environment: 'test', payload: singlePayload }],
      statuses: [inProgress(1, 1)],
      artifacts: [artifact('nyc2')],
    });
    const result = await finalizeReceipt({
      token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: github.fetchImpl,
    });
    assert.deepEqual(result, { state: 'success', deploymentId: 7, idempotent: false, reason: null });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a flattened download without the exact authoritative artifact', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sigil-receipt-finalizer-flat-name-'));
  const singlePayload = { ...payload, intended_origins: ['nyc2'] };
  try {
    fs.writeFileSync(path.join(root, 'evidence.json'), JSON.stringify(evidence('nyc2')));
    const github = fakeGithub({
      deployments: [{ id: 7, sha: commit, environment: 'test', payload: singlePayload }],
      statuses: [inProgress(1, 1)],
      artifacts: [artifact('wrong')],
      expectedState: 'failure',
    });
    const result = await finalizeReceipt({
      token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: github.fetchImpl,
    });
    assert.equal(result.state, 'failure');
    assert.match(result.reason, /artifact names/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects extra files beside a flattened evidence artifact', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sigil-receipt-finalizer-flat-extra-'));
  const singlePayload = { ...payload, intended_origins: ['nyc2'] };
  try {
    fs.writeFileSync(path.join(root, 'evidence.json'), JSON.stringify(evidence('nyc2')));
    fs.writeFileSync(path.join(root, 'unexpected.txt'), 'unexpected');
    const github = fakeGithub({
      deployments: [{ id: 7, sha: commit, environment: 'test', payload: singlePayload }],
      statuses: [inProgress(1, 1)],
      artifacts: [artifact('nyc2')],
      expectedState: 'failure',
    });
    const result = await finalizeReceipt({
      token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: github.fetchImpl,
    });
    assert.equal(result.state, 'failure');
    assert.match(result.reason, /artifact set/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('binds evidence artifact names and metadata before accepting downloaded files', async (t) => {
  for (const [name, artifacts] of [
    ['wrong name', [artifact('ams3'), artifact('wrong')]],
    ['expired', [artifact('ams3'), artifact('nyc2', { expired: true })]],
    ['wrong run', [artifact('ams3'), artifact('nyc2', { workflow_run: { id: 43, head_sha: commit } })]],
    ['wrong commit', [artifact('ams3'), artifact('nyc2', { workflow_run: { id: 42, head_sha: 'c'.repeat(40) } })]],
    ['missing digest', [artifact('ams3'), artifact('nyc2', { digest: null })]],
  ]) {
    await t.test(name, () => withEvidenceDirectory(async (root) => {
      const github = fakeGithub({ artifacts, expectedState: 'failure' });
      const result = await finalizeReceipt({
        token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: github.fetchImpl,
      });
      assert.equal(result.state, 'failure');
      assert.match(result.reason, /artifact/);
    }));
  }
});

test('rejects unstable artifact pagination before writing a terminal receipt', () => withEvidenceDirectory(async (root) => {
  const github = fakeGithub({ artifactTotalCount: 3 });
  await assert.rejects(finalizeReceipt({
    token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: github.fetchImpl,
  }), /artifact count changed/);
  assert.equal(github.calls.some((call) => call.method === 'POST'), false);
}));

test('binds the authoritative workflow attempt and commit without using its conclusion', () => withEvidenceDirectory(async (root) => {
  const wrongAttempt = fakeGithub({ workflowRun: { run_attempt: 2 } });
  await assert.rejects(finalizeReceipt({
    token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: wrongAttempt.fetchImpl,
  }), /workflow run identity/);
  assert.equal(wrongAttempt.calls.some((call) => call.method === 'POST'), false);

  const wrongCommit = fakeGithub({ workflowRun: { head_sha: 'b'.repeat(40) } });
  await assert.rejects(finalizeReceipt({
    token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: wrongCommit.fetchImpl,
  }), /workflow run identity/);
  assert.equal(wrongCommit.calls.some((call) => call.method === 'POST'), false);

  const wrongEvent = fakeGithub({ workflowRun: { event: 'pull_request' } });
  await assert.rejects(finalizeReceipt({
    token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: wrongEvent.fetchImpl,
  }), /workflow run identity/);
  assert.equal(wrongEvent.calls.some((call) => call.method === 'POST'), false);
}));

test('rejects a deployment whose top-level environment differs from its payload', () => withEvidenceDirectory(async (root) => {
  const github = fakeGithub({ deployments: [{ id: 7, sha: commit, environment: 'production', payload }] });
  await assert.rejects(finalizeReceipt({
    token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: github.fetchImpl,
  }), /deployment receipt payload is invalid/);
  assert.equal(github.calls.some((call) => call.method === 'POST'), false);
}));

test('every evidence-gate violation writes terminal failure', async (t) => {
  const cases = [
    ['missing', [evidence('ams3')], null],
    ['duplicate', null, (root) => fs.writeFileSync(path.join(root, 'deploy-evidence-1-ams3', 'duplicate.json'), '{}')],
    ['malformed', null, (root) => fs.writeFileSync(path.join(root, 'deploy-evidence-1-ams3', 'evidence.json'), '{')],
    ['wrong attempt', [evidence('ams3'), evidence('nyc2', { run_attempt: 2 })], null],
    ['wrong commit', [evidence('ams3'), evidence('nyc2', { commit: 'b'.repeat(40) })], null],
    ['wrong unit', [evidence('ams3'), evidence('nyc2', { unit_id: 'sigil-sign/prod' })], null],
    ['wrong run', [evidence('ams3'), evidence('nyc2', { run_id: '43' })], null],
    ['negative parity', [evidence('ams3'), evidence('nyc2', { parity_verified: false, parity_source: 'none' })], null],
  ];
  for (const [name, records, mutate] of cases) {
    await t.test(name, () => withEvidenceDirectory(async (root) => {
      mutate?.(root);
      const github = fakeGithub({ expectedState: 'failure' });
      const result = await finalizeReceipt({ token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: github.fetchImpl });
      assert.equal(result.state, 'failure');
      assert.notEqual(result.reason, null);
    }, records ?? undefined));
  }
});

test('is idempotent for one exact terminal receipt and rejects contradictions', () => withEvidenceDirectory(async (root) => {
  const github = fakeGithub({ statuses: [inProgress(), { state: 'success', description: 'sigil-receipt/1 attempt=1 origins=2' }] });
  const result = await finalizeReceipt({ token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: github.fetchImpl });
  assert.deepEqual(result, { state: 'success', deploymentId: 7, idempotent: true, reason: null });
  assert.equal(github.calls.some((call) => call.method === 'POST'), false);

  const duplicate = fakeGithub({ statuses: [
    inProgress(),
    { state: 'success', description: 'sigil-receipt/1 attempt=1 origins=2' },
    { state: 'failure', description: 'sigil-receipt/1 attempt=1 origins=2' },
  ] });
  await assert.rejects(finalizeReceipt({ token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: duplicate.fetchImpl }), /duplicate or contradictory/);
}));

test('rejects every malformed or wrong-attempt terminal status before writing', async (t) => {
  for (const [name, terminal] of [
    ['malformed', { state: 'success', description: 'deployment completed' }],
    ['wrong attempt', { state: 'failure', description: 'sigil-receipt/1 attempt=2 origins=2' }],
  ]) {
    await t.test(name, () => withEvidenceDirectory(async (root) => {
      const github = fakeGithub({ statuses: [inProgress(), terminal] });
      await assert.rejects(finalizeReceipt({
        token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: github.fetchImpl,
      }), /duplicate or contradictory/);
      assert.equal(github.calls.some((call) => call.method === 'POST'), false);
    }));
  }
});

test('selects the sole deployment carrying the exact attempt pointer on rerun', () => {
  const secondAttemptEvidence = payload.intended_origins.map((origin) => evidence(origin, { run_attempt: 2 }));
  return withEvidenceDirectory(async (root) => {
    const github = fakeGithub({
      attempt: 2,
      expectedDeploymentId: 8,
      deployments: [
        { id: 7, sha: commit, environment: 'test', payload },
        { id: 8, sha: commit, environment: 'test', payload },
      ],
      statusesByDeployment: {
        7: [inProgress(1), { state: 'success', description: 'sigil-receipt/1 attempt=1 origins=2' }],
        8: [inProgress(2)],
      },
    });
    const result = await finalizeReceipt({ token: 'test-token', repository, runId, runAttempt: 2, evidenceDirectory: root, fetchImpl: github.fetchImpl });
    assert.deepEqual(result, { state: 'success', deploymentId: 8, idempotent: false, reason: null });
  }, secondAttemptEvidence, 2);
});

test('fails closed when multiple deployments carry the same attempt pointer', () => withEvidenceDirectory(async (root) => {
  const github = fakeGithub({
    deployments: [
      { id: 7, sha: commit, environment: 'test', payload },
      { id: 8, sha: commit, environment: 'test', payload },
    ],
    statusesByDeployment: { 7: [inProgress()], 8: [inProgress()] },
  });
  await assert.rejects(finalizeReceipt({
    token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: github.fetchImpl,
  }), /exactly one deployment must match the workflow run attempt/);
  assert.equal(github.calls.some((call) => call.method === 'POST'), false);
}));

test('serialized sequential invocations write exactly one terminal receipt', () => withEvidenceDirectory(async (root) => {
  const github = fakeGithub();
  const args = { token: 'test-token', repository, runId, runAttempt, evidenceDirectory: root, fetchImpl: github.fetchImpl };
  const first = await finalizeReceipt(args);
  const second = await finalizeReceipt(args);
  assert.deepEqual(first, { state: 'success', deploymentId: 7, idempotent: false, reason: null });
  assert.deepEqual(second, { state: 'success', deploymentId: 7, idempotent: true, reason: null });
  assert.equal(github.calls.filter((call) => call.method === 'POST').length, 1);
}));

test('composite action preserves the proof action and states its caller serialization contract', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const action = fs.readFileSync(path.join(root, '.github/actions/receipt-finalizer/action.yml'), 'utf8');
  const proof = fs.readFileSync(path.join(root, '.github/actions/receipt-finalizer-resolution-proof/action.yml'), 'utf8');
  assert.match(action, /actions\/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c/);
  assert.match(action, /caller workflow MUST serialize invocations with a GitHub Actions concurrency/);
  assert.match(action, /target repository, run-id, and run-attempt/);
  assert.doesNotMatch(action, /upload-artifact|claim-lock|INPUT_CALLER_|INPUT_LOCK_/);
  assert.match(action, /Download exact-attempt deploy evidence\n\s+continue-on-error: true/);
  assert.doesNotMatch(action, /uses:\s+[^\s]+@(v|main|master)\b/);
  assert.doesNotMatch(action, /\$\{\{\s*secrets\./);
  assert.doesNotMatch(`${action}\n${fs.readFileSync(path.join(root, '.github/actions/receipt-finalizer/finalize.mjs'), 'utf8')}`, /workflow_run\.conclusion|INPUT_.*CONCLUSION/);
  assert.match(proof, /Receipt finalizer resolution proof/);
});

test('pure evidence evaluation never promotes false parity to success', () => withEvidenceDirectory((root) => {
  const result = evaluateEvidenceDirectory(root, payload, { runId, runAttempt });
  assert.equal(result.state, 'success');
}, [evidence('ams3'), evidence('nyc2')]));
