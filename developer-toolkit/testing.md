---
title: "Testing"
description: "Validate your warranty.md policy and Sigil integration without touching production attestations, billing, or rate limits."
---

# Testing

Sigil Sign exposes two testing surfaces. Use them together: one is a separate hostname that mirrors production for end-to-end integration tests and CI; the other is a per-request simulation endpoint that runs against your live policy with no side effects.

| Surface | Scope | When to use |
|---|---|---|
| `sign-test.sigilcore.com` | Full hosted environment | Integration tests, CI pipelines, agent QA against a real Sigil Sign endpoint without touching prod billing or quota |
| `POST /v1/authorize/test-run` | Single-request simulation | Validate a specific intent against your already-deployed `warranty.md` without issuing an attestation, holding a row, or firing a webhook |

You can use both on the same flow. A common pattern is to point CI at `sign-test.sigilcore.com`, and reach for `/v1/authorize/test-run` whenever you want to ask "would my live policy approve this exact intent?" without paying for an attestation or recording a hold.

## sign-test.sigilcore.com

A non-production mirror of `sign.sigilcore.com`, with the same endpoint surface but isolated infrastructure, billing, and metering.

### What it accepts

- **API keys.** Use the live-format `sk_sigil_*` keys generated from the [hosted Keys tool](https://sigilcore.com/tools/keys). The first time a live key is presented to `sign-test`, the matching key record and deployed `warranty.md` are mirrored into the test database, and stay isolated from production usage from that point on. Legacy `sk_sigil_test_*` keys remain accepted for existing integrations.
- **Same request bodies, headers, and intents** as production. If a request works on `sign.sigilcore.com`, it works against `sign-test.sigilcore.com` with no payload changes.
- **The full endpoint set.** `/v1/authorize`, `/v1/authorize/test-run`, `/v1/warranty/deploy`, `/rpc[/:chainId]`, `/bundler[/:chainId]`, `/v1/holds/:holdId`, `/v1/keys/register`, `/v1/webhooks`.

### What is different from production

- **No quota.** Call as often as you need.
- **Billing is off.** Stripe runs in test mode and no real charges land on your card.
- **Distinct JWKS `kid`.** `https://sign-test.sigilcore.com/.well-known/jwks.json` serves a separate Ed25519 public key from production. Attestations issued by `sign-test` will not validate against the production JWKS, and vice versa.
- **Best-effort SLA.** No multi-region failover. Expect short outages during deploys.
- **Webhooks dispatch to your registered URLs.** The test environment fires real HTTP requests to whatever webhook endpoints you register against test-environment API keys, so make sure your receivers are ready to accept them.

### Quick check

```bash
curl -sS https://sign-test.sigilcore.com/healthz
# {"status":"ok"}

curl -sS -X POST https://sign-test.sigilcore.com/v1/authorize \
  -H "Authorization: Bearer sk_sigil_..." \
  -H "Content-Type: application/json" \
  --data '{
    "agentId": "agent_alpha_01",
    "chainId": 8453,
    "action": "wallet.transfer",
    "amount": "100000000",
    "to": "0xE592427A0AEce92De3Edee1F18E0157C05861564"
  }'
```

The response shape matches production: `intent_attestation`, `policyHash`, and decision metadata. The signing key ID embedded in the JWT header points at the test JWKS, not the prod one.

### Validating attestations

If your service validates Sigil attestations and you intend to validate both production and test JWTs, fetch the JWKS by `kid` from the JWT header rather than hard-coding a single JWKS URL. Both environments use the same JWT structure; only the signing key differs.

```ts
// Pseudocode for a JWKS resolver that handles both environments
async function resolveJwk(kid: string) {
  const prod  = await fetch('https://sign.sigilcore.com/.well-known/jwks.json').then(r => r.json());
  const test  = await fetch('https://sign-test.sigilcore.com/.well-known/jwks.json').then(r => r.json());
  return [...prod.keys, ...test.keys].find(k => k.kid === kid);
}
```

If you only validate production attestations, you can pin the production JWKS URL.

### What sign-test is not

It is not a sandbox for breaking changes. The test environment runs the same code as production, deployed first to NYC2 only. It is suitable for integration tests, agent QA, and verifying that your warranty.md behaves as expected against realistic intents. It is not suitable for production traffic and the hostname carries a best-effort availability commitment, separate from production.

## POST /v1/authorize/test-run

A simulation endpoint that evaluates an intent against your deployed policy and returns the decision Sigil Sign would make, without any of the side effects of `/v1/authorize`.

### What it does

- Runs the same policy evaluation as `/v1/authorize`.
- Returns `APPROVED`, `DENIED`, or `PENDING`, with the matched rule and the public Sigil error code.
- Includes `test_run: true` and `observe_mode_active: <bool>` in the response.

### What it does not do

- Issue an Intent Attestation (`intent_attestation` is always `null`).
- Create a hold row in Valkey for `PENDING` decisions.
- Fire webhooks to your registered endpoints.
- Emit a Stripe meter event.
- Increment the monthly rate-limit counter.

Test-run usage is recorded with a `TEST_RUN` decision so it shows up in dashboards as simulation traffic, distinct from real authorization traffic.

### Strict evaluation regardless of SIGIL_MODE

`/v1/authorize/test-run` always returns the strict, enforcement-mode decision. If your service is globally configured with `SIGIL_MODE=OBSERVE`, real `/v1/authorize` calls may approve intents that the policy would otherwise deny; test-run still shows you the strict outcome. The `observe_mode_active` field in the response tells you whether OBSERVE is currently in effect, so you can see at a glance that your live `/v1/authorize` would have approved a would-be `DENIED` intent.

This makes test-run a safe way to validate a warranty.md edit without flipping a global flag or standing up a parallel environment.

### Example

```bash
curl -sS -X POST https://sign.sigilcore.com/v1/authorize/test-run \
  -H "Authorization: Bearer sk_sigil_..." \
  -H "Content-Type: application/json" \
  --data '{
    "agentId": "agent_alpha_01",
    "chainId": 8453,
    "action": "wallet.transfer",
    "amount": "10000000000000000000",
    "to": "0xE592427A0AEce92De3Edee1F18E0157C05861564"
  }'
```

Sample `DENIED` response:

```json
{
  "status": "DENIED",
  "test_run": true,
  "intent_attestation": null,
  "error_code": "SIGIL_POLICY_VIOLATION_AMOUNT_EXCEEDED",
  "matched_rule": "evm.max_transaction_eth",
  "message": "Transaction amount exceeds the per-transaction ETH limit.",
  "observe_mode_active": false
}
```

The `error_code` and `matched_rule` fields tell you exactly which clause of your `warranty.md` rejected the intent. Use this to verify that a policy edit lands the way you expect before pushing it to production agents.

### Test-run on sign-test

`/v1/authorize/test-run` is available on both hostnames. On `sign-test.sigilcore.com` it behaves the same way; useful when you want to dry-run an intent against a test-environment key without consuming any of your already-zero quota.

## Recommended workflow

1. **Sign a fresh `warranty.md`** with [Sigil Warrant](https://sigilcore.com/tools/warrant) when you are ready to test a policy change.
2. **Deploy it to your test API key** via `POST https://sign-test.sigilcore.com/v1/warranty/deploy`. The hosted record is per-key, so test-environment changes do not touch production policies.
3. **Run your agent QA suite** against `sign-test.sigilcore.com`. Real attestations are issued, real webhooks fire, but billing and quota stay clean.
4. **Cross-check edge cases** with `POST /v1/authorize/test-run` against either environment when you want a side-effect-free decision for a specific intent.
5. **Promote the policy** by signing it again with the production operator key and deploying via `POST https://sign.sigilcore.com/v1/warranty/deploy`.

## CI integration

A typical GitHub Actions step:

```yaml
- name: Verify policy approves expected intents
  env:
    SIGIL_TEST_KEY: ${{ secrets.SIGIL_TEST_KEY }}
  run: |
    response=$(curl -sS -X POST https://sign-test.sigilcore.com/v1/authorize/test-run \
      -H "Authorization: Bearer $SIGIL_TEST_KEY" \
      -H "Content-Type: application/json" \
      --data @fixtures/expected-approved-intent.json)

    decision=$(echo "$response" | jq -r '.status')
    if [ "$decision" != "APPROVED" ]; then
      echo "Policy regression: expected APPROVED, got $decision"
      echo "$response" | jq
      exit 1
    fi
```

Pair this with a second step that asserts a known-bad intent receives `DENIED`. Together they let you fail CI on any unintended policy regression.

## Gotchas

- **Validators that hard-code the production JWKS URL will reject test attestations.** Resolve JWKS by `kid` if you intend to validate both environments.
- **Production rejects `sk_sigil_test_*` keys** with `SIGIL_API_KEY_WRONG_ENV`. Use a live-format key against production. Test-environment endpoints accept both.
- **Webhooks registered against a key fire from whichever environment hits that key.** If you do not want test traffic dispatching to your production webhook endpoint, register webhooks separately per environment.
- **Test-run does not issue an attestation, so downstream RPC/bundler routes will reject it** if you forward the (null) attestation to them. Test-run is for policy validation, not full transaction simulation.
- **Hosted policies are per API key.** Deploying a new `warranty.md` to your test key does not affect any other key, including your production key. The promotion step is explicit.
