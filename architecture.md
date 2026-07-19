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
│                        Agent Framework                      │
│          (e.g., Claude Code, ELIZA, LangChain, IronClaw)    │
└────────────────────────┬────────────────────────────────────┘
                         │  @sigilcore/agent-hooks
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Sigil Sign (OEE)                        │
│                                                             │
│  Intent Declaration → Sigil Sign Policy Evaluation           │
│       ↓                    ↓                    ↓           │
│    APPROVED             PENDING              DENIED         │
│  (attestation)      (consensus hold)     (hard block)       │
└────────────────────────┬────────────────────────────────────┘
                         │  Intent Attestation JWT (Ed25519 + ML-DSA-65)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               Sigil RPC / Bundler Gateway                   │
│      (rejects write operations without valid attestation)   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                    Target system
              (EVM, API, tool call, etc.)
```

The agent never reaches the execution target — on-chain or off — without a valid Intent Attestation. The gateway is the physical enforcement point. The firewall is where policy is evaluated. The agent hooks are the interception layer. Each is independently meaningful; together they form the complete enforcement chain.

The diagram above describes the request path through the **reference implementation** (Sigil Sign / OEE). Any conforming signer implements an equivalent path against the same specification — see [Conformance](/conformance) for the contract every implementation must honor.

---

## Layer 1: Open Execution Engine (OEE)

OEE is the reference implementation of the SOF enforcement specification. It is one valid signer, not the only valid one — see [Conformance](/conformance) for the obligations any third-party implementation may meet to interoperate with the same governance stack.

OEE itself is domain-agnostic. It does not know what industry you are deploying in. It does not know what your agent is trying to accomplish. It knows only what your policy permits — and it enforces that, deterministically, on every intent.

**Core responsibilities:**

- Receive intent declarations from agent frameworks
- Load and verify the operator's `warranty.md` policy at runtime
- Evaluate intent against all five policy block types
- Issue signed Intent Attestations for compliant intents
- Manage consensus hold state (PENDING decisions, 24-hour TTL)
- Expose the Sigil RPC and Bundler gateway endpoints

**Policy evaluation is stateless per request and runtime-reloadable.** If you update and re-sign your `warranty.md`, the next restart picks up the new policy. No redeployment of the execution engine is required.

<Card title="Open Execution Engine" icon="shield" href="/components/open-execution-engine">
  Full component reference — policy evaluation model, endpoint specification, and attestation format.
</Card>

---

## Layer 2: Fiduciary Agent Framework (FAF)

FAF converts the cryptographic guarantees from any conforming signer into bounded legal instruments. A `warranty.md` policy defines what an agent is technically permitted to do. FAF defines who is legally responsible for that policy — and to what limit.

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

Vertical boilerplates pre-assemble a conforming signer (OEE in the reference deployment) + FAF for a specific deployment context. Rather than composing the enforcement and legal layers from scratch, operators start with a pre-wired boilerplate for their industry and customize from there.

Each vertical inherits the conforming signer's enforcement primitives and adds domain-appropriate `warranty.md` templates, legal wrapper guidance, and integration examples. Healthcare, banking, and enterprise verticals follow the same pattern: enforcement and legal pre-assembled for a deployment context. Policy templates are signer-agnostic at the specification level — they conform to the SOF Conformance Contract and work with any conforming signer.

---

## The Enforcement Pipeline

Every intent that passes through OEE follows the same four-step sequence:

**1. Intent Declaration**

The agent submits a structured JSON payload describing what it is about to do — action type, target, value, chain, and any relevant metadata. This happens before any execution attempt.

**2. Policy Evaluation (Sigil Sign)**

Sigil Sign reads the operator's `warranty.md` at runtime and evaluates the intent against six typed policy blocks:

| Block | Type | Behavior on violation |
|---|---|---|
| `## evm` | Hard limits on transaction value, chain, and action type | `DENIED` |
| `## tool_calls` | Blocked tools, blocked domains, blocked commands | `DENIED` |
| `## mcp` | MCP server and tool allowlists, approval patterns, and shim provenance | `DENIED` or `PENDING` |
| `## custom` | Operator-defined deny expressions | `DENIED` |
| `## soft_limits` | Version-gated aggregate count and USD-sum caps | Informational under 1.x; `DENIED` on breach under 2.0 |
| `## execution_limits` | Hard runaway-loop ceilings for tool calls and adapter-reported model budget brakes | `DENIED` |

**3. Authorization Decision**

Sigil Sign returns one of three decisions:

- `APPROVED` — intent is within policy. A signed Intent Attestation is issued immediately.
- `DENIED` — intent violates a hard policy rule. No attestation. Execution is blocked.
- `PENDING` — intent matches a configured approval or consensus gate. A consensus hold is created with a 24-hour TTL. No attestation until the hold is resolved.

**4. Gated Execution**

The Sigil RPC and Bundler gateway reject any write operation that does not present a valid, unexpired Intent Attestation. The agent cannot bypass this — the gateway is the only path to execution.

### Enforcement Boundary

Enforcement follows the interception point exposed by each integration. For a `bash` intent, the `bash` gate evaluates the submitted command string before execution. Sigil Sign can approve or deny that command string before the shell starts.

Child-process network egress is not intercepted after shell execution begins. The `bash.blocked_commands` policy key evaluates the declared command string. It is a command-string control, not a network control. Operators must not claim network-egress coverage from a `bash` gate alone.

---

## Cryptographic Architecture

The cryptographic primitives below describe the contract every conforming signer must honor. The reference implementation (Sigil Sign / OEE) is described in detail; alternative signers implement the same primitives against the same specification.

### Ed25519 Keypair

Every operator generates an Ed25519 keypair when they create their `warranty.md` policy. The private key signs the policy. The public key is deployed as `SIGIL_OPERATOR_PUBLIC_KEY`.

Sigil Sign verifies the policy signature against this key at startup. If the policy has been modified after signing, Sigil Sign detects it and refuses to start. This makes the policy tamper-evident — any post-deployment modification breaks the signature chain.

### Intent Attestation JWT

An Intent Attestation is a short-lived (60-second TTL) Ed25519-signed JWT, carrying a parallel ML-DSA-65 post-quantum signature in its `pqc` claim, containing:

- `agentId` — the agent that declared the intent
- `txCommit` — SHA-256 of the transaction payload
- `policyHash` — SHA-256 of the warranty.md content (excluding the signature block) at evaluation time
- `chainId` — the target chain
- `iat` / `exp` — issuance and expiry timestamps
- `pqc` — hybrid ML-DSA-65 signature over the claim set, for post-quantum verification

The `policyHash` is the cryptographic link between the attestation and the exact policy version that authorized it. If your policy changes between evaluations, the policyHash changes — every attestation in your audit log is verifiably tied to the policy in effect at the time.

### JWK Verification

Intent Attestations can be verified independently against the issuing signer's published JWK set at `GET /.well-known/jwks.json`. The reference implementation publishes its keys at `https://sign.sigilcore.com/.well-known/jwks.json`; third-party conforming signers publish their own at their own domains. PQC-aware verifiers additionally fetch the ML-DSA-65 key set from `https://sign.sigilcore.com/v1/pqc-keys` to check the `pqc` claim.

Verifiers must pair JWK validation with a trusted issuer set. Hosted Sigil uses `sigil-core` as the default issuer; federated deployments add approved issuer IDs explicitly and reject signatures from untrusted `iss` values.

No Sigil infrastructure required for verification. Any JWT library that supports EdDSA can verify a conforming attestation locally when supplied with the issuer's JWK set and trusted issuer configuration.

<Card title="Sigil Attestations" icon="file-signature" href="/sigil-attestations">
  Full attestation specification — JWT structure, verification rules, and policyHash binding.
</Card>

---

## Agent Hooks

Agent hooks are the client-side interception layer. Without hooks, OEE governs only EVM transactions routed through the gateway. With hooks, OEE can govern each action class that the installed hook intercepts and represents as a structured intent, including bash commands, file writes, HTTP requests, wallet signing, and email sends. The enforcement boundary remains the intercepted intent. For `bash`, that boundary is the command string before shell execution, not network egress initiated later by a child process.

`@sigilcore/agent-hooks` and `agent-hooks-rs` intercept tool calls before they execute and route them through Sigil Sign for evaluation. Approved intents proceed; denied intents are blocked; held intents wait for operator review. For Sigil unreachability, TypeScript hooks support explicit `failMode: 'open' | 'closed'`, while the Rust crates default closed.

<Card title="Agent Hooks" icon="plug" href="/agent-hooks/overview">
  Installation and integration reference for TypeScript and Rust agent runtimes.
</Card>

---

## Consensus Holds

A consensus hold is a PENDING decision stored with a 24-hour TTL. It is triggered by configured approval gates such as EVM consensus thresholds or `email.require_approval`, not by `## soft_limits`. Under 1.x, soft limits remain informational. Under 2.0, an exceeded aggregate cap returns `DENIED`, never `PENDING`.

The hold is not optional monitoring. The agent cannot execute the held action until a human resolves the hold. Resolution options are APPROVE (issue attestation) or REJECT (deny permanently). If the hold expires without resolution, it auto-rejects.

This is the primary mechanism for human oversight in high-stakes autonomous deployments. The agent continues operating on all other actions — only the held action is gated.

---

## Deployment Model

The reference SOF implementation is operated by Sigil Core as a hosted service at the Sigil API. Intent Attestation issuance is backed by SOC 2 Type I controls, a verifiable audit chain, and usage-based pricing that scales with your deployment.

**Start free.** Register your email at [sigilcore.com/tools/keys](https://sigilcore.com/tools/keys) to receive a Developer tier key — 1,000 governed actions per month, no account required.

**Scale on demand.** When you outgrow the free tier, upgrade to $49/month — includes 10,000 governed actions, $0.002 per action above that. → [sigilcore.com/tools/upgrade](https://sigilcore.com/tools/upgrade)

**Enterprise and regulated deployments** with dedicated infrastructure, custom SLAs, and audit support are available through [Sigil Governance](https://sigilgovernance.com).

**Other paths.** The reference implementation is one of many possible signers. Operators with existing trusted relationships (audit firms, custodians, enterprise security teams) may prefer a third-party conforming signer over either Sigil-hosted or self-hosted reference. See the [Conformance Registry](/conformance#registry-of-conforming-implementations) for the current list.

---

*Need to run your own signing infrastructure? `sigil-sign` is MIT-licensed and self-hostable. For most teams, managing your own cryptographic signing layer is unnecessary overhead — the Sigil API handles it.*
