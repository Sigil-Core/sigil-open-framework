---
title: "Getting Started"
description: "From zero to your first authorized execution in 2 minutes."
---

# Getting Started

Sigil Sign is the reference implementation of the [SOF enforcement specification](/conformance), a deterministic execution firewall for agent-driven EVM actions. It sits between your AI agent and the blockchain, ensuring that high-stakes actions cannot execute without explicit authorization.

**Base URL:** `https://sign.sigilcore.com`

---

## Choose Your Path

Three roles, three starting points:

- **Integrating an agent with SOF?** This page is for you. Use the Sigil API or self-host the reference implementation. The API Quick Start below is the fastest route.
- **Hacking on SOF locally?** Use the [Developer Toolkit](/developer-toolkit/quick-start), with a mock Express.js engine and Python LangChain authorizer, no API key required.
- **Building your own SOF-conforming signer?** (Audit firms, custodians, enterprise security teams.) Read the [Conformance Contract](/conformance). It defines what your implementation must honor to interoperate with the SOF ecosystem.

The remainder of this guide assumes you are integrating an agent and using the reference implementation, hosted or self-hosted.

---

## API Quick Start

The fastest path to your first governed action. The Sigil API handles signing infrastructure, key management, and attestation issuance so you do not have to run anything yourself.

**1. Get your API key.** Register your email at [sigilcore.com/tools/keys](https://sigilcore.com/tools/keys) to receive a Developer tier key. 1,000 governed actions per month, free.

**2. Sign your warranty.md.** Use [Sigil Warrant](https://sigilcore.com/tools/warrant) to define your policy and generate a signed `warranty.md`. The tool produces your Ed25519 keypair in the browser, signs the policy, and gives you your `SIGIL_OPERATOR_PUBLIC_KEY` value.

**3. Authorize your first action.** Submit an intent to `POST /v1/authorize` with your API key. If the intent passes your policy, you receive an Ed25519-signed JWT. Attach it to your transaction via `Authorization: Bearer <jwt>` and route through the Sigil RPC gateway.

That is the complete flow. The sections below cover each step in detail.

**Pricing tiers:**

| Tier | Cost | Governed actions |
|---|---|---|
| Developer | Free | 1,000/month |
| Growth | $25/month | 10,000/month, $0.002 per action above |
| Enterprise | Custom | Dedicated infrastructure, custom SLAs, audit support via [Sigil Governance](https://sigilgovernance.com) |

> Need to run your own signing infrastructure? `sigil-sign` is MIT-licensed and self-hostable. See the [Self-hosted deployment](#self-hosted-deployment) section below. For most teams, managing your own cryptographic signing layer is unnecessary overhead.

---

## Before You Deploy: Two Prerequisites

Whether you use the hosted Sigil API or self-host sigil-sign, two things must be in place. Without both, the service refuses to authorize anything. This is intentional: the service will not run without a verified operator policy.

### 1. A signed warranty.md file

Your warranty.md defines what your agent is allowed to do. The file must be signed with your Ed25519 operator key. An unsigned policy file is rejected at startup.

**Use [Sigil Warrant](https://sigilcore.com/tools/warrant)** to generate, sign, and download your `warranty.md`. Two paths are available:

- **Warrant Builder:** guided step-by-step flow covering all five policy blocks. No policy syntax required. Recommended for first-time operators.
- **Manual Warrant:** write your policy directly in the `warranty.md` format. Full control over every field.

Both paths generate your Ed25519 keypair in the browser (no key material ever leaves your machine), sign the policy, and provide your `SIGIL_OPERATOR_PUBLIC_KEY` value ready to paste.

Deploy the signed warranty.md to your server and set `WARRANTY_PATH` to its location. If you omit this path, the service looks for `config/warranty.md` relative to `process.cwd()`.

### 2. SIGIL_OPERATOR_PUBLIC_KEY environment variable

Set this to the base64url-encoded public key value Sigil Warrant gives you in Step 1. Sigil Lex verifies your policy signature against this key at startup.

```bash
SIGIL_OPERATOR_PUBLIC_KEY=<base64url-encoded-public-key>
```

This variable must be present in `.env.local` (development) or your production environment. If it is missing, the service throws with:

```
[Sigil] SIGIL_OPERATOR_PUBLIC_KEY is not set.
```

**Together, these two items form the cryptographic chain:**
`operator signature → policy content → Intent Attestation JWT`

Every attestation your service issues is verifiably linked to the exact policy version you signed and deployed. If anyone modifies the warranty.md after signing, Sigil Lex detects it on the next restart and refuses to start.

> **Sigil Warrant** is the tool that satisfies both requirements. It lives at
> [sigilcore.com/tools/warrant](https://sigilcore.com/tools/warrant).
> Use the guided Builder or Manual flow to generate your keypair, define your policy, and download the
> signed file. The whole flow takes under two minutes.

---

## The Execution Flow

Once your policy is deployed, executing an agent-driven transaction is a strict two-step process:

1. **Request Authorization:** Submit your intent to the firewall to receive a short-lived Intent Attestation.
2. **Execute:** Submit the transaction to the Sigil RPC/Bundler gateway, attaching the attestation as your authorization bearer token.

---

### Step 1: Request an Intent Attestation

Before your agent can route a write transaction, it must obtain an **Intent Attestation**.

**Endpoint:** `POST /v1/authorize`

```bash
curl -X POST https://sign.sigilcore.com/v1/authorize \
 -H "Content-Type: application/json" \
 -d '{
   "framework": "agent-hooks",
   "txCommit": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
   "agentId": "agent_alpha_01",
   "chainId": 8453,
   "intent": {
     "action": "wallet.transfer",
     "targetAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
     "token": "USDC",
     "amount": "1000.00"
   }
 }'
```

**Crucial Formatting Rules:**

- `framework`: A string identifying your agent framework (e.g. `"agent-hooks"`, `"eliza"`, `"langchain"`, `"ironclaw"`). Any non-empty string is accepted. See the [Framework Registry](framework-registry) for known values.
- `txCommit`: Must be a lowercase 64-character hex SHA-256 string. **Do not include a `0x` prefix.**
- `chainId`: Must be in your warranty.md `allowed_chains` list. Supported values: 1, 10, 56, 137, 999, 8453, 42161.
- `intent.action`: Must be in your warranty.md `allowed_actions` list (or the per-chain override for the requested chain).
- `intent.token` (optional): ERC-20 token symbol (`"USDC"`) or `0x` contract address. When present, the policy's `token.<SYM>.*` rules govern the amount; without a matching rule the intent is `DENIED`. If the matched rule pins addresses, `targetAddress` must match one of them. Omit for native ETH.
- `intent.to` (optional): recipient email address or array of addresses for `email.send` intents. Required when the policy declares `email.allowed_recipients` or `email.blocked_recipients`.

If your intent passes your warranty.md policy, you will receive an Ed25519-signed JWT in the `intent_attestation` field. The JWT embeds a `policyHash`, a SHA-256 of the exact policy content that was evaluated, excluding the signature block. This is your cryptographic proof that the correct policy version was in effect.

---

### Step 2: Route the Transaction

Once you hold a valid Intent Attestation, you have exactly **60 seconds** to execute the transaction.

Read operations are public. **Write operations require your Intent Attestation.**

**Endpoints:**

- Standard EVM: `POST /rpc/:chainId`
- Account Abstraction: `POST /bundler/:chainId`

Provide your attestation in the headers using either `Authorization: Bearer <jwt>` or `Sigil-Receipt: <jwt>`.

```bash
curl -X POST https://sign.sigilcore.com/rpc/8453 \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9..." \
 -d '{
   "jsonrpc": "2.0",
   "method": "eth_sendRawTransaction",
   "params": ["0x..."],
   "id": 1
 }'
```

---

### Verifying Attestations Locally

You do not need to trust the firewall blindly. You can verify Intent Attestations locally using Sigil's published JWK set.

**Endpoint:** `GET /.well-known/jwks.json`

Verification rules are strictly defined in our canonical specification: [sigil-attestations](https://github.com/Sigil-Core/sigil-attestations).

---

## Defining Your Policy

Your warranty.md uses typed section blocks. Sigil Lex evaluates them at runtime to govern agent behavior.

**Use [Sigil Warrant](https://sigilcore.com/tools/warrant)** to generate a signed policy interactively. The tool produces a signed `warranty.md` with an embedded Ed25519 operator signature, the cryptographic proof that the policy evaluated at runtime is the one you authorized.

Pre-built templates for common deployment contexts are available in the [FAF policy-templates directory](https://github.com/Sigil-Core/faf/tree/main/policy-templates).

### Policy Format Reference

Sigil Lex parses a strict structured Markdown format. At least one of `## evm`, `## tool_calls`, or `## custom` is required. Unknown fields are rejected at parse time. The `## signature` block at the end is generated by Sigil Warrant; do not edit it manually.

```markdown
version: 1.0.0

## evm
max_transaction_eth: 5.0
allowed_actions: wallet.transfer, contract.call
allowed_chains: 1, 8453, 42161
chain_actions:
  "1": wallet.transfer, contract.call
  "8453": wallet.transfer
consensus_threshold_eth: 3.0
consensus_require_hold: true
token.USDC.max_transaction: 10000
token.USDC.decimals: 6   # required; USDC/USDT are 6, most ERC-20s are 18
token.USDC.addresses: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

## tool_calls
allowed: bash, web_fetch, file_write, wallet_sign, email.send
bash.blocked_commands: rm -rf, curl, wget
web_fetch.blocked_domains: evil.com, malicious.io
file_write.blocked_paths: /etc, /root, ~/.ssh
email.require_approval: true
email.allowed_recipients: *@yourcompany.com, partner@example.com
email.blocked_recipients: noreply@yourcompany.com

## custom
allow_only.intent.metadata.job_type: research, data_labeling
deny_if.metadata.phone starts_with +1900
deny_string: DROP TABLE

## soft_limits
daily_evm_limit_eth: 20.0
daily_tool_calls: 500

## execution_limits
max_tool_calls_per_task: 50
max_tool_calls_per_hour: 1000
max_model_spend_usd_per_task: "5.00"
max_model_tokens_per_task: 50000

## signature
sigil-sig: <base64url-ed25519-signature>
```

| Section | Behavior |
|---|---|
| `## evm` | EVM transaction limits and consensus gates. Violations return `DENIED`. Consensus-gated intents return `PENDING`. Per-token rules (`token.<SYM>.*`) cap ERC-20 spends; an intent carrying a `token` with no matching rule is `DENIED` fail-closed, and ETH-denominated limits never apply to token amounts. |
| `## tool_calls` | Agent tool call allowlist and blocklists. Blocked calls return `DENIED`. For `email.send`, recipient checks run denylist first, then allowlist, then the `require_approval` hold (`PENDING`). Missing recipients with recipient rules present are `DENIED` fail-closed. |
| `## custom` | Operator-defined deny rules and affirmative allowlists. Deny matches return `DENIED`. `allow_only.<field>` requires the field to equal one of the listed values. A missing field or unlisted value is `DENIED` fail-closed, and deny rules take precedence when both match. |
| `## soft_limits` | Aggregate daily caps. Evaluation-only; never a hard denial. |
| `## execution_limits` | Hard runaway-loop ceilings for tool calls and model budget brakes. Tool-call overages return `DENIED` with `SIGIL_LOOP_LIMIT_EXCEEDED`. Model budget overages return `SIGIL_MODEL_SPEND_LIMIT_EXCEEDED` or `SIGIL_MODEL_TOKEN_LIMIT_EXCEEDED`. Available on the Developer tier. |

Model budget brakes require a compatible adapter to report cumulative provider usage for the current `intent.task_id` in `intent.metadata.model_usage`. Sigil does not proxy LLM inference, bill model calls, or maintain a provider price table. Dollar caps depend on adapter-reported `estimated_spend_usd`; token caps depend on provider-reported token usage.

> **Compatibility:** `token.<SYM>.*`, `email.allowed_recipients` / `email.blocked_recipients`, `allow_only`, and tool-call `execution_limits` ship with sigil-sign builds from June 2026 onward. Model budget fields require v2-compatible sigil-sign and adapter builds. Older strict runtimes can reject these fields at parse time; upgrade before publishing policies that rely on them. Policies that do not use the new fields keep their existing `policyHash` unchanged.

### Updating Your Policy

If you update your warranty.md, you must re-sign it with Sigil Warrant before redeploying. An updated but unsigned policy will be rejected at startup. The version field in your policy should be incremented to reflect the change, making the new `policyHash` in subsequent attestations distinguishable from the previous version.

---

## Self-hosted Deployment

`sigil-sign` is MIT-licensed and can be run on your own infrastructure. This path gives you full control over the execution firewall, policy storage, and signing keys. For most teams, the hosted Sigil API is the faster and lower-maintenance option.

The minimum deployment surface:

```
sigil-sign/
  ├── config/
  │   └── warranty.md   # signed operator policy
  └── .env.local         # SIGIL_OPERATOR_PUBLIC_KEY
```

Set `SIGIL_OPERATOR_PUBLIC_KEY` in `.env.local` and place your signed `warranty.md` at the path `WARRANTY_PATH` points to (defaults to `config/warranty.md`). The prerequisites and execution flow documented above apply identically to self-hosted deployments.

---

## Building a Conforming Signer

If you are an audit firm, custody provider, or enterprise security team building your own SOF-conforming signer rather than running the reference implementation, the integration path is different. Start with the [Conformance Contract](/conformance). It defines exactly what your signer must implement (six MUST clauses) and what it may extend.

The [sigil-attestations specification](https://github.com/Sigil-Core/sigil-attestations) defines the wire format. The Conformance Contract defines the obligations against that format. Together they are the complete contract for any third-party signer.

Until the SOF Conformance Test Suite ships, conformance is asserted by the signer operator and verified through direct integration testing with the reference implementation at `sign.sigilcore.com`. See the [self-assertion protocol](/conformance#self-assertion-interim) for the registry process.
