---
title: "Sigil Attestations"
description: "The canonical standard for cryptographic execution approval."
---

Intent Attestations are the foundational cryptographic primitive of the Sigil Open Framework. They are the mathematical permission slips that allow an agent to execute a transaction.

## The Standard

An Intent Attestation is an Ed25519-signed JSON Web Token (JWT).

To ensure security and prevent replay attacks, all attestations are:

- **Short-lived:** They expire exactly 60 seconds after issuance.
- **Tightly Bound:** They are cryptographically linked to a specific transaction context, including the `txCommit`, `userOpHash`, and `chainId`.

## Verification

You do not need to blindly trust the Sigil gateway. Attestations can be verified independently using Sigil’s published JWK (JSON Web Key) set.

The canonical rules for generating, binding, and verifying these attestations are maintained in our dedicated specification repository.

**View the Specification:** [github.com/Sigil-Core/sigil-attestations](https://github.com/Sigil-Core/sigil-attestations)
