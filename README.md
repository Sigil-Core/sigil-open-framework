# Sigil Open Framework (SOF)

**The open specification for cryptographic pre-execution authorization of autonomous AI agents.**

[![Status](https://img.shields.io/badge/status-active--development-black)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#)
[![Spec](https://img.shields.io/badge/spec-sigil--attestations--v1-blue)](https://github.com/Sigil-Core/sigil-attestations)
[![Ecosystem](https://img.shields.io/badge/ecosystem-Sigil--OS-purple)](#)

---

## Executive Summary

The **Sigil Open Framework (SOF)** is an open specification for cryptographic pre-execution authorization of autonomous AI agents. Define what's allowed once, in policy. Everything else is blocked automatically — before it fires.

SOF defines a protocol contract that conforming signers, policy engines, and legal wrappers implement to give autonomous agents the cryptographic and legal boundaries required to operate safely in production. The specification is implementation-agnostic by design: any signer that issues conforming Intent Attestations against a `warranty.md` policy is a valid SOF implementation.

Sigil Core publishes the reference implementation. Independent implementations — by audit firms, custodians, enterprise security teams, or any third party — are explicitly welcome and structurally accommodated.

If standard agentic frameworks are the accelerator pedal, SOF is the cryptographic brake protocol. The reference implementation is one engine that speaks it. Others can speak it too.

---

## The Doctrine of Structural Trust

> Safety is not a property of prompts. Safety is a property of architecture.

The Sigil Open Framework is built on a single, non-negotiable principle: autonomous agents cannot be trusted to self-govern. Trust must be structurally enforced — cryptographically, deterministically, and before execution, not after loss.

Under SOF, every conforming agent operates within these guarantees:

- AI agents **never hold private keys**
- AI agents **never see raw API credentials**
- AI agents **cannot execute without deterministic authorization**
- High-stakes actions **must route through a policy enforcement layer**

Execution only proceeds if the action carries a valid **Intent Attestation** issued by a conforming signer.

This doctrine is enforced at the specification level. Every SOF-conforming implementation — reference or third-party — must uphold it within its own domain:

- **Conforming signers** enforce it technically — no execution without cryptographic authorization
- **FAF** enforces it legally — no liability exposure without structural governance
- **Sigil Attestations** proves it cryptographically — every authorized action is verifiable

The doctrine is the contract. Implementations are the means.

---

## The Architecture: A Governed Protocol Stack

SOF is not a single codebase. It is a **composable protocol stack** — a specification at the center, with three implementation layers around it, each independently useful, each enabling the one above it.

The conformance contract is universal: every SOF-conforming deployment, regardless of vendor, runs against the same cryptographic specification. The legal layer converts those guarantees into fiduciary instruments. The vertical boilerplates are pre-assembled deployments — enforcement and legal wired together for a specific industry context.

---

### The Conformance Contract: Sigil Attestations

[**→ View the Attestations Repository**](https://github.com/Sigil-Core/sigil-attestations)

The `sigil-attestations` specification is the conformance target for the entire SOF ecosystem. It is the contract every conforming implementation must honor.

The specification defines:

- The structure and claim set of short-lived, Ed25519-signed JWTs (**Intent Attestations**), including the OPTIONAL hybrid ML-DSA-65 post-quantum signature claim
- JWKS publication requirements for conforming signers
- Trusted issuer validation rules for federated signers
- Chain binding and commit binding semantics
- The verification protocol used by gated execution layers (RPC gateways, bundlers, capability brokers)

Any signer, including the reference implementation, an audit firm's productized signer, or an enterprise's internal signer, that issues attestations conforming to this specification is a valid SOF signer. Verifiers still decide which conforming signers they trust; conformance does not make every issuer globally trusted. The `warranty.md` policy schema is the second half of the conformance surface: the attestation spec defines the cryptographic envelope; `warranty.md` defines the policy semantics evaluated before each attestation is issued.

The contract is the specification. Not any single engine. Not any single product.

---

### Layer 1 — The Reference Enforcement Engine: Open Execution Engine (OEE)

OEE is the reference implementation of the SOF enforcement specification. The specification defines policy evaluation via Sigil Lex, Intent Attestation issuance, consensus hold management, and gated RPC/bundler execution. It is the engine Sigil Core publishes and operates at sign.sigilcore.com. A deployment's conformance and evidence status must be verified separately.

OEE is one valid SOF engine. It is not the only one. Alternative engines may conform to the specification and interoperate within the same governance stack — see [Implementing a Conforming Signer](#implementing-a-conforming-signer) below.

What every conforming engine must guarantee: no transaction executes without cryptographic authorization. No exceptions, no industry carve-outs.

---

### Layer 2 — The Legal Governance Layer: Fiduciary Agent Framework (FAF)

[**→ View the FAF Repository**](https://github.com/Sigil-Core/faf)

FAF is the legal-technical bridge. The enforcement layer enforces compliance technically; FAF enforces it in the legal domain — converting cryptographic guarantees from any conforming signer into bounded fiduciary instruments. FAF provides entity templates, operating agreements, and `warranty.md` policy structure so that human General Partners can assume quantifiable liability for autonomous deployment without unlimited personal exposure.

FAF makes the conformance contract legally meaningful.

---

### Layer 3 — The Vertical Boilerplates

Vertical boilerplates are domain-specific implementations of conforming signer + FAF, pre-assembled for specific deployment contexts. Each inherits the full enforcement stack and adds domain-appropriate `warranty.md` policy templates, sector-specific legal wrapper guidance, and integration examples for common agent frameworks in that industry.

Healthcare, banking, and enterprise verticals follow the same architecture. Each new vertical is a deployment context, not a new enforcement mechanism. The conformance contract is constant.

---

## Implementing a Conforming Signer

SOF is a specification, not a product. Sigil Core publishes the reference implementation. Other parties — particularly audit firms, custodians, and enterprise security teams that already hold trusted third-party relationships — are explicitly welcome to implement conforming signers.

This section is for anyone building one.

### What a Conforming Signer MUST Do

A signer that conforms to SOF MUST:

1. **Accept intent submissions** at a documented HTTP endpoint with the request semantics defined in the [sigil-attestations specification](https://github.com/Sigil-Core/sigil-attestations).
2. **Evaluate the submitted intent** against the operator's `warranty.md` policy, supporting at minimum the Class 1 (structural) rule classes defined in the specification.
3. **Issue Ed25519-signed JWTs** that conform to the Intent Attestation claim set, including chain binding, commit binding, and expiry semantics.
4. **Publish a JWKS endpoint** at `/.well-known/jwks.json` so gated execution layers can verify issued attestations.
5. **Reject non-conforming intents** with structured denial responses, not silent passthrough.

If the signer claims Class 3 consensus support, it MUST also implement the hold-resolution requirements in [the Conformance Contract](conformance.md#xr-02----class-3-consensus-rules): tenant-scoped authenticated review; durable identity, decision, reason, time, and idempotency evidence; exact-intent-only approval; and fail-closed behavior for expiry, rejection, mismatch, authorization failure, conflict, or unavailable storage.

### What a Conforming Signer MAY Do

A conforming signer MAY:

- Implement higher rule classes (Class 2 semantic, Class 3 consensus) beyond the Class 1 minimum
- Add additional claims to issued JWTs, provided the required claim set is preserved
- Integrate with downstream capability brokers (Sigil Vault or equivalent) for credential release
- Operate as a third-party notary, an in-tenant signer, or a hybrid — all are valid deployment models
- Brand and market the implementation under the implementer's own name

### Conformance Verification

The **SOF Conformance Test Suite** begins with the portable Policy 2.0 and Policy 2.1 vector corpus in [`conformance/vectors/`](conformance/vectors/). Implementations should run those fixtures through their parser, evaluator, counter store, and audit projection, then publish the resulting policy hash and decision evidence with their conformance declaration. Policy 2.1 vectors require a structured execution boundary, trusted effect metadata, and a one-time execution grant.

The current authoring contract is published in the [Policy 2.3 capability matrix](developer-toolkit/policy-2-3.md#authoring-capability-matrix). It derives from the exact `@sigilcore/warrant-core` manifest shared with Sigil Sign, so operators can choose Manual Form, Manual Advanced, or Warrant Builder without silently losing a policy control.

For the cryptographic conformance declaration, publish `/.well-known/sof-conformance.json` using the schema in [`conformance.md`](conformance.md). The declaration keeps the attestation contract version (`sigil-attestations-v1`) separate from the supported `warranty.md` policy schema versions.

### Why Build a Conforming Signer

Audit firms, custody providers, and enterprises with existing trusted third-party relationships can implement SOF as a way to extend that trust surface to autonomous agent deployments — without ceding the customer relationship to a new infrastructure vendor. The customer keeps the relationship. The implementer keeps the brand. The market gets multiple signers. The specification wins.

---

## Aligning with the Linux Foundation (AAIF)

The Linux Foundation's Agentic AI Foundation (AAIF) has established open-source standards for how agents are built and connected, primarily through the `AGENTS.md` specification.

**The Problem:** `AGENTS.md` tells the world what an agent is **capable** of doing. It does not dictate what the agent **cannot** do.

**The SOF Solution:** The Sigil Open Framework natively wraps AAIF standards but introduces a mandatory **Security & Execution Constraints** block for SOF-conforming agents. In portable manifests, this block appears under the standardized `sof-warranty` key. While AAIF defines the capabilities, SOF defines the deterministic limits — and any conforming signer can enforce them.

### Example: Extending `AGENTS.md` with SOF

When building an SOF-conforming agent, your `AGENTS.md` file will include the standard AAIF routing, accompanied by SOF cryptographic constraints:

```yaml
# AGENTS.md (AAIF + Sigil SOF Extension)

name: "Alpha Yield Agent"
version: "1.0.0"
description: "Autonomous capital deployment for DeFi yield strategies."

capabilities:
  - EVM_Transaction_Generation
  - Market_Analysis
  - ERC4337_UserOp_Formatting

# --- SIGIL OPEN FRAMEWORK: SECURITY & EXECUTION CONSTRAINTS ---
sof-warranty:
  enforcement_layer: "sigil-lex"          # any conforming signer identifier
  policy_uri: "ipfs://QmYourWarrantyPolicyHashHere"
  attestation_standard: "sigil-attestations-v1"
  policy_schema_versions_supported: ["1.0.0", "2.0.0", "2.1.0", "2.2.0"]
  warranty_blocks:
    evm:
      max_transaction_eth: 5.0
      allowed_actions: ["wallet.transfer", "contract.call"]
      allowed_chains: [1, 8453, 42161, 10, 137]
      chain_actions:
        "8453": ["contract.call"]
      consensus_threshold_eth: 3.0
    tool_calls:
      allowed: ["bash", "web_fetch", "file_write"]
      bash_blocked_commands: ["rm -rf", "curl"]
    custom:
      - deny_string: "DROP TABLE"
      - deny_if: "metadata.email_to contains @competitor.com"
```

The `sof-warranty.enforcement_layer` field accepts any conforming signer identifier. The reference implementation registers as `sigil-lex`. Third-party signers register their own identifiers.

If the agent proposes a transaction that violates any rule in its `warranty.md` policy blocks, the conforming signer intercepts the request, denies the Intent Attestation, and execution halts at the cryptographic level.

---

## Prior Art and Terminology

Sigil Open Framework (SOF) enforces authorization at the pre-execution boundary: a deterministic allow, deny, or hold decision is evaluated at a non-bypassable control point before an agent action is permitted to proceed. This control pattern is well established and predates SOF.

The pattern originates in the Policy Enforcement Point (PEP) and Policy Decision Point (PDP) model of access control, standardized by OASIS in [XACML 1.0 (2003)](https://en.wikipedia.org/wiki/XACML) and codified by NIST in [Special Publication 800-162, Guide to Attribute-Based Access Control (2014)](https://csrc.nist.gov/pubs/sp/800/162/final). In that model the PEP demands an authorization decision and grants or denies access at the moment of the request, and the PDP renders the decision. "Authorization before execution" at a non-bypassable enforcement point is the defining property of a PEP.

The same control concept is in broad, independent use across the AI agent governance field, including work from [Microsoft](https://techcommunity.microsoft.com/blog/microsoft-security-blog/authorization-and-governance-for-ai-agents-runtime-authorization-beyond-identity/4509161) and Oracle on runtime authorization for agents, and a growing body of published research on pre-action and pre-execution authorization for autonomous systems. Regulatory frameworks such as the EU AI Act and the NIST AI Risk Management Framework increasingly expect governance to be enforced at the point of execution rather than reconstructed after the fact.

SOF does not claim to have originated this primitive. SOF's contribution is a specific implementation of it for AI agents: a cryptographically signed Sigil Warrant, hybrid Ed25519 + ML-DSA-65 intent attestations, deterministic deny, allow, and hold decisions enforced at the agent's PreToolUse boundary, and a tamper-evident evidence trail suitable for audit. SOF uses the field's established, descriptive terminology by design, so operators can map it to the access-control and compliance concepts they already know.

---

## Human-in-the-Loop Oversight

SOF can require human review for governed actions when a signer implements the Class 3 consensus workflow. Through an operator surface such as **Sigil Command**, human operators can retain:

- **Real-time Execution Monitoring:** View enforcement events for governed intents.
- **High-Value Approvals:** For a Class 3-capable signer, review the exact held intent and record an approval or rejection under the conformance requirements.
- **The Kill Switch:** An emergency pause that stops new attestations when the deployment implements it.

Conforming signers MAY expose equivalent oversight surfaces on their own implementations.

---

## Getting Started

To begin building with the Sigil Open Framework, select the path that fits your role.

### 🛠️ Start Building Now (Hackathons & Local Dev)

Jump into the local toolkit to simulate the Sigil execution firewall offline. It includes a mock Express.js engine, a Python LangChain authorizer, and a `warranty.md` template.

→ [**Open the Developer Toolkit**](./developer-toolkit)

### 📚 Explore the Core Components

If you are designing a full production architecture, explore the specialized ecosystem repositories:

1. **Structuring Legal Compliance?** Start with [Fiduciary Agent Framework (FAF)](https://github.com/Sigil-Core/faf).
2. **Integrating the API?** Read the [Sigil Attestations Specification](https://github.com/Sigil-Core/sigil-attestations).

### 🤝 Building a Conforming Signer

If you are an audit firm, custody provider, or enterprise security team building your own SOF-conforming signer, start with the specification itself.

→ [**Read the Sigil Attestations Specification**](https://github.com/Sigil-Core/sigil-attestations)

The SOF Conformance Test Suite begins with the portable Policy 2.0 and Policy 2.1 vector corpus in [`conformance/vectors/`](conformance/vectors/). Implementations should run those fixtures through their parser, evaluator, counter store, and audit projection, then publish the resulting policy hash and decision evidence with their conformance declaration.

---

For comprehensive developer guides, API references, and architecture deep-dives, visit the official documentation.

→ [**docs.sigilcore.com**](https://docs.sigilcore.com)

## API Reference

The full HTTP API surface is auto-generated from the OpenAPI spec and lives in [`api-reference.md`](./api-reference.md).
