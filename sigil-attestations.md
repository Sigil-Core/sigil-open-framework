---
title: "Sigil Attestations Specification"
description: "The canonical specification for Intent Attestations — the cryptographic primitive every SOF-conforming signer must issue."
---

# Sigil Attestations Specification

The `sigil-attestations` specification defines **Intent Attestations** — the cryptographic primitive at the center of the Sigil Open Framework. An Intent Attestation is a short-lived, Ed25519-signed JWT that proves an agent action was authorized against a specific policy version before execution.

This page is the developer-facing summary. The full specification lives in the [sigil-attestations repository](https://github.com/Sigil-Core/sigil-attestations), and the [Conformance Contract](/conformance) defines what every SOF-conforming signer must produce.

<Note>
  **This is the specification, not a Sigil product.** Intent Attestations are issued by any SOF-conforming signer — Sigil Sign (the reference implementation), third-party signers operated by audit firms or custodians, or enterprise security teams running their own infrastructure. The wire format is the same for all of them.
</Note>

---

## What an Intent Attestation Is

An Intent Attestation is a JSON Web Token (JWT) that:

- Is signed by a conforming signer using **Ed25519** (`alg: EdDSA`, `crv: Ed25519`)
- Is **short-lived** — expires no more than 60 seconds after issuance
- Is **tightly bound** — cryptographically linked to a specific transaction context via `txCommit` (or `userOpHash` for ERC-4337) and `chainId`
- Includes a **`policyHash`** claim — SHA-256 of the canonical JSON serialization of the evaluated `warranty.md` policy, creating a verifiable link between the authorization decision and the policy version that made it

Every claim in the attestation is purposeful. Together they form the cryptographic chain: *operator policy → policy hash → attestation → execution outcome*. Any link in that chain can be independently verified, after the fact, by any party.

---

## Required Claim Set

Every conforming Intent Attestation MUST include the following claims. The full claim set (including OPTIONAL fields) is documented in the spec repository.

| Claim | Purpose |
|---|---|
| `iss` | Issuer — the conforming signer that produced this attestation |
| `sub` | Subject — typically the agent or operator identifier |
| `aud` | Audience — the gateway or service that will verify and consume the attestation |
| `exp` | Expiry — Unix timestamp, MUST be ≤ 60s after `iat` |
| `iat` | Issued-at — Unix timestamp |
| `jti` | JWT ID — unique identifier for replay prevention |
| `chainId` | Target blockchain chain ID |
| `txCommit` *or* `userOpHash` | Transaction binding — SHA-256 of the transaction payload, or the ERC-4337 UserOp hash |
| `policyHash` | SHA-256 of the canonical serialization of the evaluated `warranty.md` |

---

## Verification

Verification of any conforming attestation is a self-contained operation. Any party with the issuer's published JWKS and a verifier configuration that trusts that issuer can verify any attestation the issuer produced. No Sigil infrastructure required.

The flow:

1. Decode the JWT header to extract `kid` (key identifier).
2. Select a candidate JWKS from the verifier's configured trusted issuer sources.
3. Locate the matching public key by `kid`.
4. Verify the Ed25519 signature.
5. Validate claims: `iss` in the trusted issuer set, `exp`, `iat`, `aud`, and the binding fields (`chainId` + `txCommit` or `userOpHash`).
6. Optionally cross-check the `policyHash` against the published `warranty.md` to confirm policy version.

The hosted reference issuer is `sigil-core` and publishes keys at `https://sign.sigilcore.com/.well-known/jwks.json`. Third-party conforming signers publish their own keys at their own domains. Federated verifiers add approved issuer IDs to their trusted issuer set and reject any otherwise valid signature whose `iss` is not configured.

Any JWT library that supports EdDSA can verify a conforming attestation locally.

---

## Relationship to the Conformance Contract

This specification is the wire-format half of the SOF conformance surface. The other half — what a signer must do operationally to produce these attestations correctly — is documented in the [Conformance Contract](/conformance).

Together, the two documents form the complete contract for any third-party signer:

- **`sigil-attestations`** — the JWT structure, claim set, and signing requirements
- **[Conformance Contract](/conformance)** — the operational obligations a signer must honor (intent submission interface, policy evaluation, JWKS publication, denial response semantics, versioning)

A signer is conforming if and only if it honors both.

---

## Versioning

The current specification version is **`sigil-attestations-v1`**. This identifier appears in the conformance declaration of every conforming signer and in the `attestation_standard` field of every SOF-conforming `AGENTS.md`.

Backwards-incompatible changes will result in a new specification version (`sigil-attestations-v2`, etc.). Conforming implementations are expected to declare which spec version(s) they support.

---

## Repository

The canonical specification, including the full claim schema, request/response formats, and verification rules, lives in the repository.

**View the Specification:** [github.com/Sigil-Core/sigil-attestations](https://github.com/Sigil-Core/sigil-attestations)

For specification-level questions, file an issue on the [sigil-attestations](https://github.com/Sigil-Core/sigil-attestations/issues) repository.
