---
title: "Architecture"
description: "How Sigil's protocol stack is assembled — enforcement, legal governance, and cryptographic audit as composable layers."
---

# Architecture

Sigil is a composable protocol stack. Three layers — enforcement, legal governance, and domain-specific deployment — are independently deployable and designed to compose. Each layer has a clear boundary, a single responsibility, and defined interfaces to the layers above and below it.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Agent Framework                       │
│           (Claude Code, ELIZA, LangChain, AgentKit)         │
└────────────────────────┬────────────────────────────────────┘
                         │  @sigilcore/agent-hooks
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Sigil Sign (OEE)                         │
│                                                              │
│  Intent Declaration → Sigil Lex Policy Evaluation           │
│       ↓                    ↓                    ↓            │
│    APPROVED             PENDING              DENIED          │
│  (attestation)      (consensus hold)     (hard block)        │
└────────────────────────┬────────────────────────────────────┘
                         │  Intent Attestation JWT (Ed25519)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               Sigil RPC / Bundler Gateway                    │
│      (rejects write operations without valid attestation)    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                    Target system
              (EVM, API, tool call, etc.)
```

The agent never reaches the execution target — on-chain or off — without a valid Intent Attestation. The gateway is the physical enforcement point. The firewall is where policy is evaluated. The agent hooks are the interception layer. Each is independently meaningful; together they form the complete enforcement chain.

---

## Layer 1: Open Execution Engine (OEE)

OEE is the domain-agnostic enforcement substrate. It does not know what industry you are deploying in. It does not know what your agent is trying to accomplish. It knows only what your policy permits — and it enforces that, deterministically, on every intent.

**Core responsibilities:**

- Receive intent declarations from agent frameworks
- Load and verify the operator's `warranty.md` policy at runtime
- Evaluate intent against all four policy block types
- Issue signed Intent Attestations for compliant intents
- Manage consensus hold state (PENDING decisions, 24-hour TTL)
- Expose the Sigil RPC and Bundler gateway endpoints

**Policy evaluation is stateless per request and runtime-reloadable.** If you update and re-sign your `warranty.md`, the next restart picks up the new policy. No redeployment of the execution engine is required.

<Card title="Open Execution Engine" icon="shield" href="/components/open-execution-engine">
  Full component reference — policy evaluation model, endpoint specification, and attestation format.
</Card>

---

## Layer 2: Fiduciary Agent Framework (FAF)

FAF converts OEE's technical enforcement into bounded legal instruments. A `warranty.md` policy defines what an agent is technically permitted to do. FAF defines who is legally responsible for that policy — and to what limit.

**Core responsibilities:**

- Entity templates (LLC, DAO LLC) establishing the human General Partner as the bounded fiduciary
- Operating agreement structures that scope liability to the deployed warranty
- Policy template library for regulated verticals (venture capital, healthcare, banking)
- The bridge between `policyHash` in an Intent Attestation and a legally defensible audit record

FAF does not replace legal counsel. It assembles the standard structural components that legal counsel would otherwise build from scratch, anchored to the cryptographic record OEE produces.

<Card title="Fiduciary Agent Framework" icon="scale-balanced" href="/components/fiduciary-agent-framework">
  Entity templates, operating agreement structure, and policy-template library.
</Card>

---

## Layer 3: Vertical Boilerplates

Vertical boilerplates pre-assemble OEE + FAF for a specific deployment context. Rather than composing the enforcement and legal layers from scratch, operators start with a pre-wired boilerplate for their industry and customize from there.

The first vertical is the **Open Venture Engine** — OEE configured for autonomous venture capital, with VC-optimized `warranty.md` defaults, ERC-6551 token-bound agent identities, Safe treasury custody, and Superfluid revenue streaming. It lives at `oee/verticals/venture/` in the OEE monorepo.

Healthcare, banking, and enterprise verticals follow the same pattern: enforcement and legal pre-assembled for a deployment context.

---

## The Enforcement Pipeline

Every intent that passes through OEE follows the same four-step sequence:

**1. Intent Declaration**

The agent submits a structured JSON payload describing what it is about to do — action type, target, value, chain, and any relevant metadata. This happens before any execution attempt.

**2. Policy Evaluation (Sigil Lex)**

Sigil Lex reads the operator's `warranty.md` at runtime and evaluates the intent against four typed policy blocks:

| Block | Type | Behavior on violation |
|---|---|---|
| `## evm` | Hard limits on transaction value, chain, and action type | `DENIED` |
| `## tool_calls` | Blocked tools, blocked domains, blocked commands | `DENIED` |
| `## custom` | Operator-defined deny expressions | `DENIED` |
| `## soft_limits` | Daily aggregate caps (ETH value, tool call count) | `PENDING` |

**3. Authorization Decision**

Sigil Lex returns one of three decisions:

- `APPROVED` — intent is within policy. A signed Intent Attestation is issued immediately.
- `DENIED` — intent violates a hard policy rule. No attestation. Execution is blocked.
- `PENDING` — intent exceeds a soft limit and requires human review. A consensus hold is created with a 24-hour TTL. No attestation until the hold is resolved.

**4. Gated Execution**

The Sigil RPC and Bundler gateway reject any write operation that does not present a valid, unexpired Intent Attestation. The agent cannot bypass this — the gateway is the only path to execution.

---

## Cryptographic Architecture

### Ed25519 Keypair

Every operator generates an Ed25519 keypair when they create their `warranty.md` policy. The private key signs the policy. The public key is deployed as `LEX_OPERATOR_PUBLIC_KEY`.

Sigil Lex verifies the policy signature against this key at startup. If the policy has been modified after signing, Lex detects it and refuses to start. This makes the policy tamper-evident — any post-deployment modification breaks the signature chain.

### Intent Attestation JWT

An Intent Attestation is a short-lived (60-second TTL) Ed25519-signed JWT containing:

- `agentId` — the agent that declared the intent
- `txCommit` — SHA-256 of the transaction payload
- `policyHash` — SHA-256 of the warranty.md content (excluding the signature block) at evaluation time
- `chainId` — the target chain
- `iat` / `exp` — issuance and expiry timestamps

The `policyHash` is the cryptographic link between the attestation and the exact policy version that authorized it. If your policy changes between evaluations, the policyHash changes — every attestation in your audit log is verifiably tied to the policy in effect at the time.

### JWK Verification

Intent Attestations can be verified independently against Sigil's published JWK set at `GET /.well-known/jwks.json`. No Sigil infrastructure required for verification — any JWT library that supports EdDSA can verify an attestation locally.

<Card title="Sigil Attestations" icon="file-signature" href="/components/sigil-attestations">
  Full attestation specification — JWT structure, verification rules, and policyHash binding.
</Card>

---

## Agent Hooks

Agent hooks are the client-side interception layer. Without hooks, OEE governs only EVM transactions routed through the gateway. With hooks, OEE governs **any agent action on any framework** — bash commands, file writes, HTTP requests, wallet signing, email sends.

`@sigilcore/agent-hooks` intercepts tool calls before they execute and routes them through Sigil Sign for evaluation. The tool call does not proceed unless an attestation is returned.

<Card title="Agent Hooks" icon="plug" href="/agent-hooks/overview">
  Installation and integration reference for Claude Code, ELIZA, LangChain, and AgentKit.
</Card>

---

## Consensus Holds

A consensus hold is a PENDING decision stored with a 24-hour TTL. It is triggered when an intent exceeds a soft limit — not a hard policy violation, but an action requiring human review before proceeding.

The hold is not optional monitoring. The agent cannot execute the held action until a human resolves the hold. Resolution options are APPROVE (issue attestation) or REJECT (deny permanently). If the hold expires without resolution, it auto-rejects.

This is the primary mechanism for human oversight in high-stakes autonomous deployments. The agent continues operating on all other actions — only the held action is gated.

---

## Deployment Model

SOF runs on the Sigil API — hosted Intent Attestation backed by SOC 2 Type I controls, a verifiable audit chain, and usage-based pricing that scales with your deployment.

**Start free.** Register your email at [sigilcore.com/tools/keys](https://sigilcore.com/tools/keys) to receive a Developer tier key — 1,000 governed actions per month, no account required.

**Scale on demand.** When you outgrow the free tier, upgrade to $25/month — includes 10,000 governed actions, $0.002 per action above that. → [sigilcore.com/tools/upgrade](https://sigilcore.com/tools/upgrade)

**Enterprise and regulated deployments** with dedicated infrastructure, custom SLAs, and audit support are available through [Sigil Governance](https://sigilgovernance.com).

---

*Need to run your own signing infrastructure? `sigil-sign` is MIT-licensed and self-hostable. For most teams, managing your own cryptographic signing layer is unnecessary overhead — the Sigil API handles it.*
