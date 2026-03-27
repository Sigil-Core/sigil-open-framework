---
title: "Architecture"
description: "The Brain, The Hands, and The Cryptographic Brakes."
---

# Architecture

AI models are probabilistic. Execution systems must not be.

Sigil Sign operates as a non-custodial, deterministic execution firewall. It ensures that high-stakes, agent-driven EVM actions physically cannot execute without mathematically proven authorization.

---

## Core Primitives

The Sigil Open Framework separates autonomous capital deployment into three distinct layers:

| Layer            | Component      | Role                                                                                                             |
| ---------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| **The Firewall** | **Sigil Sign** | The execution enforcement layer. Proxies RPC/Bundler requests and issues Intent Attestations.        |
| **The Engine**   | **OEE**        | Open Execution Engine. The domain-agnostic enforcement substrate — policy evaluation, Intent Attestation issuance, and gated RPC/bundler execution. |
| **The Rules**    | **FAF**        | Fiduciary Agent Framework. Defines the governance rules and legal parameters the agent must follow. |

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

Fiduciary Brakes are deterministic execution controls. When an agent requests an attestation via `POST /v1/authorize`, Sigil Sign evaluates the payload against your predefined `warranty.md` policy.

It deterministically prevents agents from:

- Executing unauthorized transactions.
- Bypassing governance constraints.
- Exceeding treasury limits.

Private keys are **never** stored in Sigil infrastructure. Sigil signs the _permission_, not the _transaction_.
