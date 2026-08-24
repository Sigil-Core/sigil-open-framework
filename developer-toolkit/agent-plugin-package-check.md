---
title: "Agent Plugin Package Check"
description: "Sign, inspect, and verify Agent Plugin packages before distribution."
---

# Agent Plugin Package Check

`@sigilcore/plugin-attest` creates and verifies tamper-evident records for
Agent Plugin packages. It can also inspect a package for schema and capability
issues. The source repository is private; the reviewed runtime is distributed
publicly through npm.

## Install

Use Node.js `22.22.2` or later on a supported runtime:

```bash
npm install -g @sigilcore/plugin-attest
```

The current native runtime supports macOS on APFS and Linux on ext4. Other
runtime filesystems fail closed.

## Inspect a package

```bash
sigil-plugin-attest inspect ./my-plugin --json
```

Inspection reports package-schema and capability issues. It is not a security
verdict and does not claim that a plugin is safe.

## Sign a package

Set the externally pinned trust configuration and TSA endpoint, then provide an
Ed25519 private JWK through a local file:

```bash
export SIGIL_PLUGIN_ATTEST_TRUST_SHA256=<64-lowercase-hex>
export SIGIL_PLUGIN_ATTEST_TRUST_ORGANIZATION=<organization-id>
export SIGIL_PLUGIN_ATTEST_TRUST_ORGANIZATION_VERSION=<positive-integer>
export SIGIL_PLUGIN_ATTEST_SIGN_TRUST_SNAPSHOT=<snapshot-path>
export SIGIL_PLUGIN_ATTEST_TSA_URL=<https-tsa-url>

sigil-plugin-attest sign ./my-plugin \
  --output ./published/<plugin-digest> \
  --key ./publisher-key.jwk
```

The final output directory must be the computed lowercase plugin digest. The
command fails instead of replacing an existing destination.

## Verify offline

Set the same externally pinned trust values, then verify the complete package:

```bash
sigil-plugin-attest verify ./published/<plugin-digest> \
  --trust-snapshot ./trust-snapshot.json \
  --offline
```

A successful verification confirms the signed bytes, their integrity, and the
configured signer policy. It does not prove that the plugin is safe and does
not block a client from loading it.

## JavaScript API

Install the package locally to use its public profile, attestation, capability,
package-schema, snapshot, and trust modules:

```bash
npm install @sigilcore/plugin-attest
```

Report defects or security concerns to `support@sigilcore.com`. Do not attach
private keys, credentials, or private trust material.
