---
title: "Trusted-shim activation"
description: "The cryptographic activation contract for destructive Policy 2.1 Warrant profiles."
---

# Trusted-shim activation

Sigil Sign enforces trusted-shim tightening when a Policy `2.1.x` Warrant
contains a `repository`, `filesystem`, `git`, or `database` block. Parsing and
authoring remain lossless: false or absent `require_shim` values can still be
imported and migrated, but hosted activation fails closed.

Every present destructive block must set `require_shim: true`. If the same
policy contains `execution_limits`, that block must also set
`require_shim: true`. Standalone execution limits are not classified as a
destructive resource profile.

## Deploy request

`POST /v1/warranty/deploy` accepts:

```json
{
  "warranty_md": "the complete signed warranty.md bytes",
  "operator_public_key": "the base64url Ed25519 public key",
  "trusted_shim_attestation": "a compact EdDSA JWT"
}
```

The attestation is separate from `warranty.md`. Authoring tools must not insert
it into the policy, coerce `require_shim`, change signed bytes, or re-sign a
policy automatically.

## JWT contract

The protected header uses `alg=EdDSA`, `typ=JWT`, and an exact trusted-anchor
`kid`. Required claims are:

- `activation_schema`: `sigil-trusted-shim-activation/v1`
- `iss`: the registered issuer
- `sub`: the registered shim identity
- `aud`: the exact Sign activation endpoint
- `iat` and `exp`: a maximum 300-second lifetime
- `jti`: a one-time 16 to 128 character nonce
- `shim_version`: an exact allowlisted version
- `policy_hash`: the canonical policy hash
- `operator_key_fingerprint`: lowercase SHA-256 of the UTF-8
  `operator_public_key` request value
- `capabilities`: the allowlisted capabilities required by the policy

The production audience is
`https://sign.sigilcore.com/v1/warranty/deploy`. The test audience is
`https://sign-test.sigilcore.com/v1/warranty/deploy`.

Capabilities are `profile.repository`, `profile.filesystem`, `profile.git`,
`profile.database`, and `profile.execution_limits`.

## Trust and versions

An API key `trusted_shim` flag alone is insufficient. Activation also requires
a non-revoked public anchor bound to that key and a non-revoked exact shim
version whose capability allowlist covers the policy. Runtime provenance keeps
checking recorded activation identity and version state.

Private shim and operator keys never go to Sigil Sign.

## Exceptions

An exception can waive only a false or absent `require_shim` declaration while
a policy migrates. It cannot waive the cryptographic attestation or any
identity, issuer, audience, version, capability, freshness, policy-binding, or
replay check.

An exception binds one API key to one exact policy hash, uses reason code
`require_shim_declaration_migration`, identifies its approver and approval
record, contains a justification, expires, and can be revoked. There are no
wildcard or default exceptions.

## Stable activation denial codes

- `SIGIL_TRUSTED_SHIM_REQUIRED`
- `SIGIL_TRUSTED_SHIM_ATTESTATION_REQUIRED`
- `SIGIL_TRUSTED_SHIM_ATTESTATION_MALFORMED`
- `SIGIL_TRUSTED_SHIM_UNTRUSTED`
- `SIGIL_TRUSTED_SHIM_VERSION_REQUIRED`
- `SIGIL_TRUSTED_SHIM_VERSION_UNSUPPORTED`
- `SIGIL_TRUSTED_SHIM_ISSUER_INVALID`
- `SIGIL_TRUSTED_SHIM_AUDIENCE_INVALID`
- `SIGIL_TRUSTED_SHIM_IDENTITY_INVALID`
- `SIGIL_TRUSTED_SHIM_ATTESTATION_EXPIRED`
- `SIGIL_TRUSTED_SHIM_NONCE_INVALID`
- `SIGIL_TRUSTED_SHIM_ATTESTATION_REPLAYED`
- `SIGIL_TRUSTED_SHIM_CAPABILITY_MISSING`
- `SIGIL_TRUSTED_SHIM_POLICY_BINDING_INVALID`

All checks complete before activation writes. Nonce reservation, policy
activation, activation evidence, and the successful API-key touch commit in one
transaction. A rejection leaves no active policy, nonce, usage, hold, webhook,
billing, or application counter side effect.
