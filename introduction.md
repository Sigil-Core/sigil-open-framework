---
title: "Introduction"
description: "The open-source policy engine that sits between your agent and production."
---

# Sigil Open Framework (SOF)

The **Sigil Open Framework (SOF)** is the open-source policy engine that sits between your agent and production. Define what's allowed once. Everything else is blocked automatically — before it fires.

While standard AI frameworks give agents the intelligence to act, SOF gives them the cryptographic and legal boundaries required to operate safely in the real world. SOF bridges the gap between autonomous code and real-world compliance through a **governed protocol stack**: a domain-agnostic enforcement engine, a legal governance layer, and a set of vertical boilerplates that bring both together for specific deployment contexts.

If standard agentic frameworks are the accelerator pedal, SOF is the cryptographic brake system and the vehicle's registration.

---

## The Doctrine of Structural Trust

> Safety is not a property of prompts. Safety is a property of architecture.

The Sigil Open Framework is built on a single, non-negotiable principle: autonomous agents cannot be trusted to self-govern. Trust must be structurally enforced — cryptographically, deterministically, and before execution, not after loss.

Under SOF, every compliant agent operates within these guarantees:

- AI agents **never hold private keys**
- AI agents **never see raw API credentials**
- AI agents **cannot execute without deterministic authorization**
- High-stakes actions **must route through a policy enforcement layer**

Execution only proceeds if the action carries a valid **Intent Attestation**.

This doctrine is not a feature of any single component. It is the architectural contract that every layer of SOF is designed to enforce:

- **OEE** enforces it technically — no execution without cryptographic authorization
- **FAF** enforces it legally — no liability exposure without structural governance
- **Sigil Attestations** proves it cryptographically — every authorized action is verifiable

---

## A Governed Protocol Stack

SOF is not a single codebase. It is a **composable protocol stack** — three layers, each independently useful, each enabling the one above it.

Think of it as a franchise protocol. The enforcement substrate is universal — every SOF-compliant deployment runs on the same cryptographic enforcement primitives, regardless of industry. The legal layer converts those guarantees into fiduciary instruments. The vertical boilerplates are the franchise concepts: enforcement and legal pre-assembled for a specific deployment context, ready to go.

<CardGroup cols={2}>
  <Card
    title="Layer 1: The Enforcement Engine (OEE)"
    icon="shield"
    href="/components/open-execution-engine"
  >
    **Open Execution Engine** is the domain-agnostic execution enforcement
    substrate. It provides the deterministic primitives every SOF-compliant agent
    runs on: policy evaluation via Sigil Lex, Intent Attestation issuance,
    consensus hold management, and gated RPC/bundler execution. Not specific to
    any industry — it is the substrate.
  </Card>
  <Card
    title="Layer 2: The Legal Governance Layer (FAF)"
    icon="scale-balanced"
    href="/components/fiduciary-agent-framework"
  >
    **Fiduciary Agent Framework** converts OEE's technical enforcement into
    bounded fiduciary instruments — entity templates, operating agreements, and
    warranty.md policy structure so human General Partners can assume
    quantifiable liability without unlimited personal exposure.
  </Card>
</CardGroup>

<Card
  title="Layer 3: Vertical Boilerplates"
  icon="layers"
  href="/components/open-execution-engine"
>
  Domain-specific implementations of OEE + FAF. **[Open Venture Engine
  (OVE)](https://github.com/Sigil-Core/oee/tree/main/verticals/venture/)** is the first — OEE pre-wired for
  autonomous venture capital, with VC-optimized policy templates, ERC-6551 agent
  identity, and Sigil Action Provider integration. Healthcare, banking, and
  enterprise verticals follow the same pattern: enforcement and legal
  pre-assembled for a deployment context, ready to go.
</Card>

---

## Client-Side Enforcement: Agent Hooks

The protocol stack governs what happens at the execution layer. `@sigilcore/agent-hooks` is the client-side package that connects your agent framework to that layer — intercepting every tool call before it executes and routing it through Sigil Sign for policy evaluation.

Without agent-hooks, Sigil governs EVM transactions. With agent-hooks, Sigil governs **any agent action on any framework**: bash commands, HTTP requests, file writes, wallet signing, and email sends. The agent never reaches the API — or the blockchain — without a verified clearance.

<CardGroup cols={2}>
  <Card
    title="Agent Hooks Overview"
    icon="plug"
    href="/agent-hooks/overview"
  >
    Install `@sigilcore/agent-hooks` and connect Claude Code, ELIZA, LangChain,
    or any framework to your Sigil policy in minutes.
  </Card>
  <Card
    title="AgentPay (WLFI) Compatibility"
    icon="wallet"
    href="/agent-hooks/agentpay"
  >
    `agent-hooks` is fully compatible with the AgentPay SDK. USD1 transfers on
    Ethereum and BNB Smart Chain route through your Sigil policy before the
    transaction is signed.
  </Card>
</CardGroup>

---

## The Standard: Intent Attestations

The entire framework relies on a single cryptographic primitive: the **Intent Attestation**.

Before an agent can execute a transaction on-chain, it must evaluate its intent against the deterministic constraints defined in its policy. If the intent is compliant, the Sigil execution firewall issues a short-lived, Ed25519-signed JWT. The EVM gateway physically rejects any write operation that does not include this valid attestation.

<Card title="Read the Attestation Specification" icon="file-signature" href="/components/sigil-attestations">
  Explore the canonical specification for generating, binding, and verifying
  Ed25519 Intent Attestations.
</Card>

---

## Start Building

Choose your path to get started with the Sigil Open Framework.

<CardGroup cols={2}>
  <Card
    title="Developer Toolkit"
    icon="code"
    href="/developer-toolkit/quick-start"
  >
    **Fastest time to value.** Download our local testing environment to
    simulate the Sigil execution firewall offline. Includes a mock Express.js
    engine and Python LangChain authorizer.
  </Card>
  <Card title="Getting Started API" icon="bolt" href="/getting-started">
    **Ready for production.** Learn the exact two-step flow to request an Intent
    Attestation and route a live transaction through the Sigil gateway.
  </Card>
</CardGroup>
