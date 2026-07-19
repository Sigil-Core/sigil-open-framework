---
title: "Sigil Attestations Specification"
description: "The canonical specification for Intent Attestations — the cryptographic primitive every SOF-conforming signer must issue."
---

# Sigil Attestations Specification

The `sigil-attestations` specification defines **Intent Attestations** — the cryptographic primitive at the center of the Sigil Open Framework. An Intent Attestation is a short-lived, Ed25519-signed JWT, carrying a parallel ML-DSA-65 post-quantum signature on the hosted reference signer, that proves an agent action was authorized against a specific policy version before execution.

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
- Includes a **`policyHash`** claim — SHA-256 of the canonical policy object defined in [Policy hash canonical input](#policy-hash-canonical-input), creating a verifiable link between the authorization decision and the policy version that made it
- May carry a **hybrid post-quantum signature** — an OPTIONAL `pqc` claim holding a parallel ML-DSA-65 signature over the same claim set, defined in [Hybrid post-quantum signatures](#hybrid-post-quantum-signatures)

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

A signer that advertises the `pqc_hybrid_attestations` extended capability additionally embeds an OPTIONAL `pqc` claim carrying the hybrid ML-DSA-65 signature described in [Hybrid post-quantum signatures](#hybrid-post-quantum-signatures). Verifiers that do not understand the claim ignore it; the Ed25519 envelope verifies unchanged.

---

## Verification

Verification of any conforming attestation is a self-contained operation. Any party with the issuer's published JWKS and a verifier configuration that trusts that issuer can verify any attestation the issuer produced. No Sigil infrastructure required.

The flow:

1. Decode the JWT header to extract `kid` (key identifier).
2. Select a candidate JWKS from the verifier's configured trusted issuer sources.
3. Locate the matching public key by `kid`.
4. Verify the Ed25519 signature.
5. Validate claims: `iss` in the trusted issuer set, `exp`, `iat`, `aud`, and the binding fields (`chainId` + `txCommit` or `userOpHash`).
6. Optionally parse the published unsigned `warranty.md` body with the same canonical-input algorithm and compare its SHA-256 to `policyHash`.
7. If the payload carries a `pqc` claim, optionally verify the parallel ML-DSA-65 signature as described in [Hybrid post-quantum signatures](#hybrid-post-quantum-signatures).

The hosted reference issuer is `sigil-core` and publishes keys at `https://sign.sigilcore.com/.well-known/jwks.json`. Third-party conforming signers publish their own keys at their own domains. Federated verifiers add approved issuer IDs to their trusted issuer set and reject any otherwise valid signature whose `iss` is not configured.

Any JWT library that supports EdDSA can verify a conforming attestation locally.

---

## Hybrid post-quantum signatures

Approved attestations issued by the hosted reference signer carry a parallel **ML-DSA-65** (FIPS 204) signature alongside the Ed25519 JWT signature, making the attestation resistant to a future quantum adversary. The envelope is unchanged: `intent_attestation` remains a compact Ed25519 JWT, and existing integrations continue to verify against the issuer's JWKS with no modification. The post-quantum layer rides in a single OPTIONAL `pqc` claim:

| Field | Value |
|---|---|
| `alg` | `ML-DSA-65` |
| `kid` | Identifier of the signer's published ML-DSA-65 public key |
| `ctx` | `sigil-pqc-attestation-v1` (domain-separation context) |
| `canonicalization` | `json-sorted-v1` |
| `sig` | Base64url-encoded ML-DSA-65 signature |

A PQC-aware verifier checks the hybrid signature as follows:

1. Decode the JWT payload and remove the `pqc` claim.
2. Canonicalize the remaining claims with `json-sorted-v1`: recursively sort object keys in ascending lexicographic order, preserve array order, serialize as compact JSON.
3. Prepend the signing context `sigil-pqc-attestation-v1` followed by a newline, and encode as UTF-8.
4. Verify `pqc.sig` over those bytes with the ML-DSA-65 public key whose `kid` matches `pqc.kid`.

The hosted signer publishes its ML-DSA-65 public keys at `https://sign.sigilcore.com/v1/pqc-keys` (canonical application path `/.well-known/sigil-pqc-keys.json`) and advertises the capability in its conformance declaration: `pqc_hybrid_attestations` in `extended_capabilities`, `ML-DSA-65` alongside `EdDSA` in `attestation_algorithms`, and the key endpoint in `pqc_keys_uri`.

Because the scheme is hybrid, verification degrades gracefully: a verifier that only understands Ed25519 still gets the full classical guarantee, while a PQC-aware verifier gains post-quantum assurance over the identical claim set.

---

## Relationship to the Conformance Contract

This specification is the wire-format half of the SOF conformance surface. The other half — what a signer must do operationally to produce these attestations correctly — is documented in the [Conformance Contract](/conformance).

Together, the two documents form the complete contract for any third-party signer:

- **`sigil-attestations`** — the JWT structure, claim set, and signing requirements
- **[Conformance Contract](/conformance)** — the operational obligations a signer must honor (intent submission interface, policy evaluation, JWKS publication, denial response semantics, versioning)

A signer is conforming if and only if it honors both.

## Policy hash canonical input

`policyHash` hashes the parsed policy object, not the Markdown bytes and not the `## signature` block. The canonical input is produced as follows:

1. Parse the unsigned policy body with the strict `warranty.md` parser.
2. Represent each policy block with the parser's runtime field names, such as `allowedTools`, `requireApproval`, `maxCount`, and `groupBy`.
3. Remove absent optional fields. Do not remove `false`, `0`, empty arrays that the schema permits, or any declared value.
4. Recursively sort object keys in ascending lexicographic order. Preserve array order.
5. Serialize as compact JSON with UTF-8 string values and no trailing newline.
6. Compute SHA-256 over those UTF-8 JSON bytes and encode the digest as lowercase hexadecimal.

The parser's field normalization is part of the canonical input. For example, `allowed_tools` in Markdown becomes `allowedTools` in the object, and a named cap becomes `soft_limits.caps.<name>.maxCount` or `maxSumUsd`. Independent signers MUST compare their canonical JSON and digest against the shared vectors before issuing attestations.

## Policy 2.0 binding

Policy format 2.0 does not change the attestation envelope. It expands the policy evaluation surface before issuance with typed HTTP boundaries, MCP server and tool identity, shim-derived provenance, durable approval patterns, and named aggregate caps. The `policyHash` claim binds the resulting decision to the canonical parsed policy, including those fields and using the algorithm above. A signer MUST NOT issue an attestation when a 2.0 parser or evaluator cannot represent a declared field without loss.

---

## Versioning

The current specification version is **`sigil-attestations-v1`**. This identifier appears in the conformance declaration of every conforming signer and in the `attestation_standard` field of every SOF-conforming `AGENTS.md`.

Backwards-incompatible changes will result in a new specification version (`sigil-attestations-v2`, etc.). Conforming implementations are expected to declare which spec version(s) they support.

---

## Repository

The canonical specification, including the full claim schema, request/response formats, and verification rules, lives in the repository.

**View the Specification:** [github.com/Sigil-Core/sigil-attestations](https://github.com/Sigil-Core/sigil-attestations)

For specification-level questions, file an issue on the [sigil-attestations](https://github.com/Sigil-Core/sigil-attestations/issues) repository.
