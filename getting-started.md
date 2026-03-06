---
title: "Getting Started"
description: "From zero to your first authorized execution in 2 minutes."
---

# Getting Started

Sigil Sign is the deterministic execution firewall for agent-driven EVM actions. It sits between your AI agent and the blockchain, ensuring that high-stakes actions cannot execute without explicit authorization.

**Base URL:** `https://sign.sigilcore.com` 

## The Execution Flow

Executing an agent-driven transaction is a strict two-step process:

1. **Request Authorization:** Submit your intent to the firewall to receive a short-lived Intent Attestation.
2. **Execute:** Submit the transaction to the Sigil RPC/Bundler gateway, attaching the attestation as your authorization bearer token.

---

### Step 1: Request an Intent Attestation

Before your agent can route a write transaction, it must obtain an **Intent Attestation**.

**Endpoint:** `POST /v1/authorize`

```bash
curl -X POST https://sign.sigilcore.com/v1/authorize \
 -H "Content-Type: application/json" \
 -d '{
 "framework": "agentkit",
 "txCommit": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
 "agentId": "agent_alpha_01",
 "intent": {
 "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
 "amount": "1000000000000"
 }
 }'
```

**Crucial Formatting Rules:**

- framework: Must be exactly "agentkit" or "eliza".
- txCommit: Must be a lowercase 64-character hex SHA-256 string. **Do not include a 0x prefix.**
- Supported Chains: 1, 10, 56, 137, 999, 8453, 42161

If your intent passes your ASSURANCE.md policy, you will receive an Ed25519-signed JWT in the intent_attestation field.

---

**Step 2: Route the Transaction**

Once you hold a valid Intent Attestation, you have exactly **60 seconds** to execute the transaction.

Read operations are public. **Write operations require your Intent Attestation.**

**Endpoints:**

- Standard EVM: POST /rpc/:chainId
- Account Abstraction: POST /bundler/:chainId

Provide your attestation in the headers using either `Authorization: Bearer <jwt>` or `Sigil-Receipt: <jwt>`.

```bash
curl -X POST https://sign.sigilcore.com/rpc/8453 \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9..." \
 -d '{
 "jsonrpc": "2.0",
 "method": "eth_sendRawTransaction",
 "params": ["0x..."],
 "id": 1
 }'
```

---

**Verifying Attestations Locally**

You do not need to trust the firewall blindly. You can verify Intent Attestations locally using Sigil’s published JWK set.

**Endpoint:** GET /.well-known/jwks.json

Verification rules are strictly defined in our canonical specification: [sigil-attestations](https://github.com/Sigil-Core/sigil-attestations).
