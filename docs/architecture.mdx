---
title: "Architecture"
description: "The Brain, The Hands, and The Cryptographic Brakes."
---

# Architecture

AI models are probabilistic. Execution systems must not be[cite: 2].

Sigil Sign operates as a non-custodial, deterministic execution firewall[cite: 4, 6]. It ensures that high-stakes, agent-driven EVM actions physically cannot execute without mathematically proven authorization[cite: 3].

---

## Core Primitives

The Sigil Open Framework separates autonomous capital deployment into three distinct layers[cite: 4]:

| Layer            | Component      | Role                                                                                                             |
| ---------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| **The Firewall** | **Sigil Sign** | The execution enforcement layer. Proxies RPC/Bundler requests and issues Intent Attestations[cite: 4, 5].        |
| **The Engine**   | **OVE**        | Open Venture Engine. Orchestrates agent intelligence and formats EVM transactions[cite: 4, 14].                  |
| **The Rules**    | **FAF**        | Fiduciary Agent Framework. Defines the governance rules and legal parameters the agent must follow[cite: 4, 15]. |

---

## Intent Attestations

Intent Attestations are the cryptographic permission slips of the Sigil ecosystem.

They are **Ed25519-signed JWTs** that are:

- **Short-lived:** Expiring automatically in 60 seconds.
- **Tightly Bound:** Cryptographically linked to a specific `txCommit`, `userOpHash`, and `chainId`.

If an agent attempts to submit an `eth_sendRawTransaction` or `eth_sendUserOperation` to the Sigil gateway without a valid, matching attestation, the request is instantly rejected at the network edge.

---

## Execution Gateways

Sigil Sign exposes guarded gateways for both standard EOA and Account Abstraction flows.

- **JSON-RPC:** `POST /rpc/:chainId`
- **ERC-4337 Bundler:** `POST /bundler/:chainId`

**Chain Selection Precedence:**  
The gateway routes transactions based on the following fallback logic:

1. URL Path Parameter (`/rpc/8453`)
2. Custom Header (`Sigil-Chain-Id: 8453`)
3. Query Parameter (`?chainId=8453`)
4. Default Fallback (Chain `1` - Mainnet)

---

## Fiduciary Brakes

Fiduciary Brakes are deterministic execution controls[cite: 13]. When an agent requests an attestation via `POST /v1/authorize`, Sigil Sign evaluates the payload against your predefined `ASSURANCE.md` policy.

It deterministically prevents agents from:

- Executing unauthorized transactions[cite: 13].
- Bypassing governance constraints[cite: 13].
- Exceeding treasury limits[cite: 13].

Private keys are **never** stored in Sigil infrastructure[cite: 7]. Sigil signs the _permission_, not the _transaction_.
