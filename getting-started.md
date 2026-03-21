---
title: "Getting Started"
description: "From zero to your first authorized execution in 2 minutes."
---

# Getting Started

Sigil Sign is the deterministic execution firewall for agent-driven EVM actions. It sits between your AI agent and the blockchain, ensuring that high-stakes actions cannot execute without explicit authorization.

**Base URL:** `https://sign.sigilcore.com`

---

## Before You Deploy: Two Prerequisites

Before sigil-sign will start, two things must be in place. Without both, the service throws on startup and refuses to authorize anything. This is intentional — the service will not run without a verified operator policy.

### 1. A signed ASSURANCE.md file

Your ASSURANCE.md defines what your agent is allowed to do. Starting with this sprint, the file must be signed with your Ed25519 operator key. An unsigned policy file is rejected at startup.

**Use [Sigil Warrant](https://sigilcore.com/tools/warrant)** to:
- Generate your Ed25519 keypair in the browser (no key material ever leaves your machine)
- Define your policy using a structured form
- Download a signed ASSURANCE.md with your operator signature embedded
- Get your `LEX_OPERATOR_PUBLIC_KEY` value ready to paste

Deploy the signed ASSURANCE.md to your server and set `LEX_ASSURANCE_PATH` to its location. If you omit this path, the service looks for `config/ASSURANCE.md` relative to `process.cwd()`.

### 2. LEX_OPERATOR_PUBLIC_KEY environment variable

Set this to the base64url-encoded public key value Sigil Warrant gives you in Step 1. Sigil Lex verifies your policy signature against this key at startup.

```bash
LEX_OPERATOR_PUBLIC_KEY=<base64url-encoded-public-key>
```

This variable must be present in `.env.local` (development) or your production environment. If it is missing, the service throws with:

```
[Lex] LEX_OPERATOR_PUBLIC_KEY is not set.
```

**Together, these two items form the cryptographic chain:**
`operator signature → policy content → Intent Attestation JWT`

Every attestation your service issues is verifiably linked to the exact policy version you signed and deployed. If anyone modifies the ASSURANCE.md after signing, Sigil Lex detects it on the next restart and refuses to start.

> **Sigil Warrant** is the tool that satisfies both requirements. It lives at
> [sigilcore.com/tools/warrant](https://sigilcore.com/tools/warrant).
> Use it to generate your keypair, define your policy, and download the
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
   "framework": "agentkit",
   "txCommit": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
   "agentId": "agent_alpha_01",
   "chainId": 8453,
   "intent": {
     "action": "wallet.transfer",
     "targetAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
     "amount": "1000000000000"
   }
 }'
```

**Crucial Formatting Rules:**

- `framework`: Must be exactly `"agentkit"` or `"eliza"`.
- `txCommit`: Must be a lowercase 64-character hex SHA-256 string. **Do not include a `0x` prefix.**
- `chainId`: Must be in your ASSURANCE.md `allowed_chains` list. Supported values: 1, 10, 56, 137, 999, 8453, 42161.
- `intent.action`: Must be in your ASSURANCE.md `allowed_actions` list (or the per-chain override for the requested chain).

If your intent passes your ASSURANCE.md policy, you will receive an Ed25519-signed JWT in the `intent_attestation` field. The JWT embeds a `policyHash` — a SHA-256 of the exact policy content that was evaluated, excluding the signature block. This is your cryptographic proof that the correct policy version was in effect.

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

Your ASSURANCE.md defines three enforcement classes Sigil Lex evaluates at runtime.

**Use [Sigil Warrant](https://sigilcore.com/tools/warrant)** to generate a signed policy interactively. The tool produces a signed `ASSURANCE.md` with an embedded Ed25519 operator signature — the cryptographic proof that the policy evaluated at runtime is the one you authorized.

Pre-built templates for common deployment contexts are available in the [FAF policy-templates directory](https://github.com/Sigil-Core/faf/tree/main/policy-templates).

### Policy Format Reference

Sigil Lex parses a strict structured Markdown format. Unknown fields are rejected at parse time. The `## signature` block at the end is generated by Sigil Warrant — do not edit it manually.

```markdown
version: 1.0.0

## Class 1: Hard Rules
max_transaction_eth: 5.0
allowed_actions: wallet.transfer, contract.call
allowed_chains: 1, 8453, 42161
chain_actions:
  "1": wallet.transfer, contract.call
  "8453": wallet.transfer

## Class 2: Soft Rules
daily_limit_eth: 20.0

## Class 3: Consensus Rules
consensus_threshold_eth: 10.0
consensus_require_hold: false

## signature
sigil-sig: <base64url-ed25519-signature>
```

| Class | Behavior on Violation |
|---|---|
| Class 1 | Returns `DENIED` immediately |
| Class 2 | Returns `APPROVED` with informational flag — never a hard denial |
| Class 3 | Returns `PENDING` — creates a durable hold requiring human approval via Sigil Command |

### Updating Your Policy

If you update your ASSURANCE.md, you must re-sign it with Sigil Warrant before redeploying. An updated but unsigned policy will be rejected at startup. The version field in your policy should be incremented to reflect the change — this makes the new `policyHash` in subsequent attestations distinguishable from the previous version.
