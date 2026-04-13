---
title: "Sigil Vault"
description: "The non-custodial, cryptographically-gated JIT credential broker for autonomous agents."
---

**Sigil Vault** is the just-in-time (JIT) credential broker for the Sigil ecosystem. It ensures that autonomous agents can use external credentials — API keys, cloud secrets, MPC co-signatures — without ever possessing them.

Vault is **not a secrets manager**. It does not store or custody secrets. It is a deterministic capability broker: it intercepts agent requests, validates a cryptographic Intent Attestation from Sigil Sign, fetches a short-lived credential from your own infrastructure at request time, injects it into the outbound request, and purges it from memory.

**Doctrine:** Agents never possess credentials. Vault never stores them. Every capability release requires cryptographic proof of authorization.

---

## The Enterprise Fragmentation Problem

Most enterprises operate with decades of accumulated systems: on-premises databases, cloud infrastructure that was lifted-and-shifted without modernization, and a long tail of SaaS tools — each with its own credential model. Autonomous agents cannot tap into these systems in a unified way without a credential injection layer that bridges the gap between the agent's reasoning context and the access controls each system requires.

Vault solves this structurally:

- **Agents never receive standing credentials** — no agent holds a long-lived API key or cloud secret. Every request is gated by a cryptographic Intent Attestation before any credential is released.
- **Any credential backend, one integration** — Vault abstracts across HashiCorp Vault, AWS Secrets Manager, AWS STS, Azure Key Vault, GCP Secret Manager, and environment variables. Your agents call one proxy; Vault handles the fragmented backend.
- **Legacy systems gain agent-safe access** — systems that were never designed for autonomous AI access (internal databases, enterprise SaaS, healthcare platforms, financial APIs) can be safely surfaced to agents through Vault's attestation-gated injection model.
- **No organizational change required** — agents route through Vault's local proxy. Your existing credential infrastructure stays in place. No migration, no re-architecture.

This is the missing integration layer for enterprises deploying agents into fragmented, legacy-heavy environments.

---

## How It Works

Vault operates as a localhost MITM TLS proxy that sits between your agent and external services:

1. **Agent sends request** — the agent makes a normal HTTPS call through Vault's proxy (`127.0.0.1:10255`), attaching its Intent Attestation from Sigil Sign.
2. **Attestation gate** — Vault validates the Ed25519 JWT signature, claims, expiry, and JTI (replay prevention). Invalid or missing attestations are hard-rejected. No fail-open path exists.
3. **Credential fetch** — Vault requests a short-lived, scoped credential from your backend (HashiCorp Vault, AWS Secrets Manager, AWS STS, Azure Key Vault, GCP Secret Manager).
4. **Injection and forwarding** — Vault injects the real credential into the outbound request, strips the attestation header, and forwards via real TLS to the upstream service.
5. **Audit and purge** — the credential is zeroed from memory. The event is appended to a hash-chained audit log linking Intent Attestation to capability release to execution outcome.

The agent never sees the real credential. The credential never persists in Vault.

---

## Supported Backends

Vault fetches credentials on-demand from client-owned infrastructure:

| Backend | Kind | Credential type |
|---|---|---|
| HashiCorp Vault | `hashicorp-vault` | Dynamic secrets, KV, PKI |
| AWS Secrets Manager | `aws-secrets-manager` | Stored secrets |
| AWS STS | `aws-sts` | Temporary session credentials |
| Azure Key Vault | `azure-key-vault` | Secrets, keys, certificates |
| GCP Secret Manager | `gcp-secret-manager` | Secret versions |
| Environment variables | `env` | Static values (dev/test only) |

---

## How It Relates to the Stack

Vault extends Sigil Sign's authorization model from on-chain execution to off-chain credential access. The flow is:

```
Agent Intent
  → Sigil Sign (evaluate warranty.md policy)
  → Intent Attestation JWT
  → Sigil Vault (verify attestation, fetch credential)
  → Inject credential into outbound request
  → External service (Stripe, OpenAI, cloud APIs)
```

Without Vault, Sigil governs EVM transactions. With Vault, Sigil governs **any authenticated external call** — API keys for Stripe, OpenAI, Salesforce, database credentials, cloud platform tokens, internal enterprise systems.

For enterprises with fragmented or legacy infrastructure, Vault is the bridge that makes those systems agent-accessible without exposing credentials to the agent's reasoning context or requiring re-architecture of existing backend systems.

---

## Getting Started

<Note>
Sigil Vault is in active development. The architecture is finalized and implementation is underway. The steps below describe the MVP operator workflow.
</Note>

### Step 1: Install Vault

```bash
# From source (Rust 1.78+)
cargo install --path sv-cli
```

### Step 2: Initialize and add a trust anchor

```bash
# Initialize the local database
sigil-vault init

# Add your Sigil Sign instance's signing key as a trust anchor
sigil-vault trust add --fingerprint "sha256:<hex>" --kid "<kid>"
```

The trust anchor tells Vault which signing key to accept when validating Intent Attestations. Use the `kid` and fingerprint from your Sigil Sign instance's `GET /.well-known/jwks.json` endpoint.

### Step 3: Register an agent

```bash
sigil-vault agents create --name "agent-prod-1"
# Returns an agent token — store it securely
```

The agent uses this token in its `Proxy-Authorization` header to authenticate with Vault's proxy.

### Step 4: Add a credential backend

```bash
sigil-vault backends add --name "hashi-prod" --kind "hashicorp-vault" \
  --options vault_addr=https://vault.internal:8200,auth_method=approle
```

### Step 5: Create a route

Routes bind an agent to a host pattern and a credential backend:

```bash
sigil-vault routes add --agent-id "<id>" --host "api.openai.com" \
  --path "/v1/*" --backend "hashi-prod"
```

When the agent makes a request to `api.openai.com/v1/*`, Vault intercepts it, validates the attestation, fetches the credential from `hashi-prod`, and injects it.

### Step 6: Point your agent at the proxy

```bash
export HTTPS_PROXY=127.0.0.1:10255
export HTTP_PROXY=127.0.0.1:10255
```

Your agent now routes all traffic through Vault. High-risk requests require an `X-Sigil-Attestation` header containing a valid JWT from Sigil Sign.

### Step 7: Verify the audit trail

```bash
sigil-vault audit tail     # Stream recent events
sigil-vault audit verify   # Verify hash chain integrity
```

---

## Security Model

- **Zero fail-open paths** — missing, invalid, expired, or replayed attestations are hard-rejected (403). Unknown or revoked agent tokens are rejected. Backend timeouts return 504, never a blind passthrough.
- **No standing privileges** — credentials are fetched on-demand and zeroed from memory after injection. No credential persists in Vault between requests.
- **Hash-chained audit log** — append-only JSONL linking Intent Attestation to capability release to execution outcome. Cryptographically verifiable chain integrity via `sigil-vault audit verify`.
- **5-second hard cap** — the entire request lifecycle (auth, attestation validation, credential fetch, injection, forwarding) must complete within 5 seconds.


**View the Repository:** [github.com/Sigil-Core/sigil-vault](https://github.com/Sigil-Core/sigil-vault)
