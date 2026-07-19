---
title: "Conformance"
description: "The conformance contract for the Sigil Open Framework -- what every conforming signer must implement, what they may extend, and how to register an implementation."
---

# Conformance

This document defines the conformance contract for the Sigil Open Framework (SOF). It is the source of truth for any party building an SOF-conforming implementation, whether that party is Sigil Core, an audit firm, a custodian, an enterprise security team, or an independent open-source project.

SOF is a specification, not a product. Sigil Sign is the reference implementation. Other implementations are explicitly welcome.

<Note>
  **Who this document is for.** If you are integrating with an existing SOF deployment as a policy author or agent developer, you don't need to read this; start with [Getting Started](/getting-started). If you are building an implementation that issues Intent Attestations on behalf of operators, this document is the contract you must honor.
</Note>

---

## Conformance Vocabulary

This document uses the keywords **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** with the meanings defined in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174). Implementations that fail to honor any **MUST** or **MUST NOT** clause are non-conforming.

---

## Conformance Surfaces

A conforming implementation is a **signer**: a service that accepts intent submissions, evaluates them against operator policy, and issues cryptographically signed authorization decisions.

Conformance is evaluated across four surfaces:

1. **Intent Submission Interface**: the HTTP endpoint(s) operators use to submit intents
2. **Policy Evaluation**: the `warranty.md` schema interpretation
3. **Intent Attestation Issuance**: the cryptographic envelope and claim set
4. **Verification Surface**: how downstream gateways verify issued attestations

The wire-level details for surfaces (1), (3), and (4) are defined in the [sigil-attestations specification](https://github.com/Sigil-Core/sigil-attestations). This document specifies the conformance obligations against that wire format. The `warranty.md` schema for surface (2) is documented in the [Fiduciary Agent Framework (FAF)](https://github.com/Sigil-Core/faf).

---

## Conformance Levels

SOF defines two conformance levels.

### Core Conformance

A **Core Conformant** signer implements the minimum surface required for interoperability with SOF-aware policy authors and gateways. Most third-party signers will start here.

Core Conformance does not expand an implementation's enforcement surface beyond the interception point it controls. When a signer supports `bash` intents, it evaluates the submitted command string. The integrating hook must submit that string before execution and block execution without approval. That command-string gate alone does not intercept child-process network egress after the shell starts. The `bash.blocked_commands` policy key is a command-string control, not a network control. A signer **MUST NOT** claim network-egress coverage from a `bash` gate alone.

Core Conformance requires implementation of the six behaviors detailed in CR-01 through CR-06 below:

- CR-01: Intent submission interface
- CR-02: Policy evaluation against Class 1 structural rules
- CR-03: Ed25519-signed Intent Attestation issuance per the spec
- CR-04: JWKS publication and issuer trust
- CR-05: Structured non-approval responses
- CR-06: Versioning

### Extended Conformance

An **Extended Conformant** signer implements Core Conformance plus one or more advanced capabilities:

- Class 2 semantic rules (intent pattern matching, contextual analysis)
- Class 3 consensus rules (durable holds, multi-party sign-off, human-in-loop gating)
- Capability broker integration ([Sigil Vault](https://github.com/Sigil-Core/sigil-vault) or equivalent JIT credential release)
- Operator-facing oversight surface (real-time monitoring, kill switch, cryptographic countersignature)

A signer may declare Extended Conformance for any subset of the above. Most third-party signers will incrementally adopt Extended capabilities after Core Conformance is established.

---

## Required Behaviors (Core Conformance)

A Core Conformant signer **MUST** implement the following behaviors. Each behavior maps to a `MUST` or `MUST NOT` obligation. Failure to honor any of them disqualifies the implementation from claiming conformance.

### CR-01 -- Intent Submission Interface

The signer **MUST** expose an HTTP `POST` endpoint that accepts intent submissions in the request format defined in the sigil-attestations specification. The endpoint **MUST** be reachable over TLS 1.2 or higher.

The signer **MUST NOT** accept intent submissions over unencrypted transports.

### CR-02 -- Policy Evaluation

The signer **MUST** evaluate every received intent against the operator's `warranty.md` policy before issuing any authorization decision.

At minimum, the signer **MUST** support the following Class 1 (structural) rule classes:

- `max_transaction_eth`: hard ceiling on EVM transaction value
- `allowed_actions`: global action allowlist
- `allowed_chains`: permitted chain ID allowlist
- `chain_actions`: per-chain action overrides

When `chain_actions` defines rules for the submitted `chainId`, those per-chain actions take precedence over `allowed_actions`.

The signer **MUST** reject any intent that violates any Class 1 rule. The signer **MUST NOT** issue an Intent Attestation for an intent that fails policy evaluation.

### CR-03 -- Intent Attestation Issuance

For every intent that passes policy evaluation, the signer **MUST** issue an Intent Attestation conforming to the sigil-attestations specification. The attestation **MUST**:

- Be a JWT signed with Ed25519 (`alg: EdDSA`, `crv: Ed25519`)
- Include the required claim set: `iss`, `sub`, `aud`, `exp`, `iat`, `jti`, `chainId`, and one of `txCommit` or `userOpHash`
- Set `iss` to a stable issuer identifier that downstream verifiers can configure as trusted
- Include a `policyHash` claim: SHA-256 of the canonical JSON serialization of the evaluated `warranty.md` policy
- Have an expiry (`exp`) of no more than 60 seconds from issuance (`iat`)
- Be bound to the specific transaction commit or UserOp hash submitted

The signer **MUST NOT** issue Intent Attestations with arbitrary or omitted required claims.

The signer **MAY** additionally embed a hybrid post-quantum signature in an OPTIONAL `pqc` claim (an ML-DSA-65 signature over the canonicalized claim set, per the sigil-attestations specification). A signer that does so **SHOULD** declare the `pqc_hybrid_attestations` extended capability and publish its ML-DSA-65 public key set. The Ed25519 signature remains mandatory; the `pqc` claim never replaces it.

### CR-04 -- JWKS Publication and Issuer Trust

The signer **MUST** publish its public verification key set at a stable URL using the JWKS format defined in [RFC 7517](https://www.rfc-editor.org/rfc/rfc7517). The conventional path is `/.well-known/jwks.json`.

The JWKS endpoint **MUST** be reachable without authentication. The signer **MUST** include the `kid` header in every issued attestation matching a key entry in the published JWKS.

The signer **SHOULD** rotate signing keys at least every 90 days. The signer **MUST** retain superseded public keys in the JWKS for at least the maximum attestation lifetime (60 seconds) plus a 24-hour grace window.

Conforming execution layers that consume attestations **MUST** treat issuer trust as verifier configuration. A valid signature from an untrusted `iss` **MUST** be rejected. Hosted Sigil verifiers default to `sigil-core`; federated deployments add approved issuers explicitly.

### CR-05 -- Structured Non-Approval Responses

When an intent fails policy evaluation, the signer **MUST** return a structured response instead of silently passing the request through. The response **MUST** use one of two statuses:

- `DENIED`: the intent violates policy and execution is blocked immediately
- `PENDING`: the intent requires a durable hold or human approval before any attestation may be issued

For `DENIED` responses, the body **MUST** include:

- `status`: `DENIED`
- `error_code`: a machine-readable code namespaced under `SIGIL_*`
- `message`: human-readable explanation
- `intent_attestation`: explicitly `null`

For `PENDING` responses, the body **MUST** include:

- `status`: `PENDING`
- `message`: human-readable explanation
- `intent_attestation`: explicitly `null` unless and until the hold is resolved

The signer **MUST NOT** return silently passed-through responses, empty bodies, or generic HTTP error codes for policy violations.

### CR-06 -- Versioning

The signer **MUST** declare which SOF specification version it conforms to in:

- The HTTP response header `X-SOF-Version` on every authorization decision
- A versioned advertisement at `/.well-known/sof-conformance.json`

The current specification version is **`sigil-attestations-v1`**.

---

## Optional Behaviors (Extended Conformance)

Extended Conformance is opt-in. A signer **MAY** implement any subset of the following.

### XR-01 -- Class 2 Semantic Rules

The signer **MAY** implement Class 2 rule evaluation, including:

- Intent pattern matching against `warranty.md` `## custom` blocks
- `deny_if` field-match expressions
- `deny_string` substring matching
- `allow_only` affirmative allowlists (exact-match value sets per intent field; missing or unlisted values **MUST** be denied fail-closed, and deny rules **MUST** take precedence when both match)
- Per-token threshold rules (`token.<SYM>.*` in `## evm`): `decimals` **MUST** be required for every token rule, a token-carrying intent with no matching rule **MUST** be denied fail-closed, missing or unparseable token amounts **MUST** be denied fail-closed, and ETH-denominated limits **MUST NOT** be applied to token amounts
- Pinned token contract binding: when a matching token rule includes `addresses`, the intent `targetAddress` **MUST** match one of those addresses
- `email.send` recipient allowlist/denylist evaluation in the order denylist, allowlist, approval hold
- `execution_limits` hard ceilings for tool calls, including fail-closed `SIGIL_LIMIT_STORE_UNAVAILABLE` behavior when counter state cannot be updated
- Policy format 2.0 typed HTTP method and host boundaries, MCP server and tool taxonomy, trailing-wildcard validation, shim provenance gates, and named count or USD caps

### XR-02 -- Class 3 Consensus Rules

The signer **MAY** implement Class 3 consensus rule evaluation, including durable hold creation, multi-party countersignature, and human-in-loop gating per the consensus protocol defined in sigil-attestations.

A signer that implements Class 3 **MUST** expose hold state at a documented HTTP endpoint and **MUST** honor the 24-hour TTL minimum on consensus holds.

### XR-03 -- Capability Broker Integration

The signer **MAY** integrate with downstream JIT capability brokers ([Sigil Vault](https://github.com/Sigil-Core/sigil-vault) or equivalent) for credential release. The integration contract is defined separately in the Vault specification.

### XR-04 -- Operator Oversight Surface

The signer **MAY** expose an operator-facing oversight surface providing real-time monitoring, manual countersignature, and emergency pause (kill-switch) functionality. Sigil Command is the reference implementation of this surface.

---

## Branding and Naming

A conforming signer **MAY** brand and market its implementation under any name. The phrase "Sigil Open Framework" and the spec version identifier (`sigil-attestations-v1`) are reserved namespaces and **MUST** appear truthfully in conformance declarations.

A signer **MUST NOT** advertise itself as the reference implementation unless explicitly authorized to do so by Sigil Core. Currently, the only reference implementation is the engine published by Sigil Core at `sign.sigilcore.com`.

A signer **MAY** describe itself as "SOF-conforming," "an implementation of the Sigil Open Framework," "a third-party SOF signer," or equivalent.

---

## Conformance Verification

### Policy 2.0 and 2.1 Vector Corpus

The **SOF Conformance Test Suite** starts with the portable [Policy 2.0 and Policy 2.1 vector corpus](conformance/vectors/). A signer harness should run these fixtures against its parser, evaluator, counter store, and audit projection. The corpus provides:

- A vector format covering typed HTTP, MCP, provenance, approval, and aggregate-cap decisions
- A negative-test corpus for adversarial intent submissions
- Promotion rules for connector-specific vectors, including one controlled OBSERVE-to-ENFORCE run

Policy 2.1 adds destructive-resource safety profiles for repositories, filesystems, Git providers, and production databases. A signer claiming Policy 2.1 support MUST validate structured execution-boundary metadata, effect manifests, adapter compatibility, and one-time execution grants. A preflight-only adapter MUST NOT claim final mutation ownership or Policy 2.1 destructive-write conformance.

The vector corpus does not replace the signer harness. The corpus is available now; a maintained automated runner and formal verification workflow are not shipped yet. Until they are available, each implementation remains responsible for running the fixtures manually, signing the fixture policy, submitting the intents, and recording the policy hash and public error fields.

The Policy Primitives v2 corpus already tracks pending release-gating cases for [Google Ads bid management](conformance/pending/google-ads-bid-manager.md), [Meta Ads budget operations](conformance/pending/meta-ads-budget-operator.md), and the [Buffer MCP social scheduler](conformance/pending/buffer-social-scheduler.md). These cases are requirements, not deployable examples, until their aggregate-cap, Buffer count-cap, and MCP provenance dependencies ship.

To express interest in early access, open an issue on the [sigil-attestations](https://github.com/Sigil-Core/sigil-attestations/issues) repository with the label `conformance-suite`.

### Self-Assertion (Interim)

Until an automated runner and formal verification workflow ship, conformance is asserted by the signer operator. To self-assert:

1. Implement every Core Conformance behavior in this document
2. Verify interoperability against the reference implementation at `sign.sigilcore.com`
3. Publish a conformance declaration at `/.well-known/sof-conformance.json` on your signer's domain (schema below)
4. Open a registry issue on the sigil-open-framework repository with a link to your conformance declaration

A self-asserted implementation is listed in the registry with a `self-asserted` flag. Once the automated runner ships, self-asserted implementations are invited to undergo formal verification.

### Conformance Declaration Schema

Schema field notes:

- `conformance_level` **MUST** be either `core` or `extended`.
- `extended_capabilities` **MUST** be an array. Core-only signers use an empty array.
- Valid extended capability identifiers are `class_2`, `class_3`, `capability_broker`, `operator_oversight`, and `pqc_hybrid_attestations`.
- `policy_schema_versions_supported` **MUST** list every `warranty.md` policy schema version the signer accepts.

```json
{
  "spec_version": "sigil-attestations-v1",
  "policy_schema_versions_supported": ["1.0.0", "2.0.0", "2.1.0"],
  "conformance_level": "extended",
  "extended_capabilities": ["class_2", "class_3"],
  "implementation_name": "Acme Signer",
  "implementer": "Acme Audit Firm",
  "contact": "security@acme.example",
  "jwks_uri": "https://signer.acme.example/.well-known/jwks.json",
  "evaluated_against": "sign.sigilcore.com",
  "self_asserted": true,
  "asserted_at": "2026-05-15T00:00:00Z"
}
```

---

## Registry of Conforming Implementations

| Implementation             | Implementer | Level                                          | Self-Asserted | Notes                    |
| -------------------------- | ----------- | ---------------------------------------------- | ------------- | ------------------------ |
| Sigil Sign (OEE reference) | Sigil Core  | Extended (`class_2`, `class_3`, `operator_oversight`, `pqc_hybrid_attestations`) | N/A           | Reference implementation |

Third-party implementations are added to this registry by opening a PR against this document, including a link to the implementation's conformance declaration.

---

## Stability and Versioning

The conformance contract is versioned with the underlying specification. Currently, the contract is defined for `sigil-attestations-v1`.

Backwards-incompatible changes to the conformance contract will result in a new specification version (`sigil-attestations-v2`, etc.). Conforming implementations are expected to declare which spec version(s) they support; multi-version support is **OPTIONAL** but **RECOMMENDED**.

Deprecation policy: any deprecated `MUST` or `MUST NOT` clause will remain in effect for a minimum of 180 days after deprecation is announced, and will be retired only on a major version bump.

---

## Why Implement SOF

Audit firms, custody providers, and enterprises with existing trusted third-party relationships can implement SOF as a way to extend that trust surface to autonomous agent deployments without ceding the customer relationship to a new infrastructure vendor.

The customer keeps the relationship. The implementer keeps the brand. The market gets multiple signers. The specification wins.

If you are evaluating whether to build a conforming signer, the [sigil-attestations specification](https://github.com/Sigil-Core/sigil-attestations) is the right starting point. This document tells you what conformance means; that document tells you what to put on the wire.

---

## Questions

For specification-level questions, file an issue on the [sigil-attestations](https://github.com/Sigil-Core/sigil-attestations/issues) repository. For ecosystem questions or coordination on conformance verification, file an issue on the [sigil-open-framework](https://github.com/Sigil-Core/sigil-open-framework/issues) repository.
