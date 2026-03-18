---
title: "Introduction"
description: "The open-source standard for cryptographically secured, legally compliant autonomous agents."
---

# Sigil Open Framework (SOF)

The **Sigil Open Framework (SOF)** is a modular, open-source architecture designed to solve the final barrier to autonomous agent adoption: **Liability.**

Standard AI frameworks give agents the intelligence to act. The Linux Foundation’s Agentic AI Foundation (AAIF) has established open-source standards (`AGENTS.md`) for how these agents are built and connected. But standard frameworks act only as the accelerator pedal—they tell the agent what to do, but they cannot physically prevent the agent from doing something catastrophic.

**SOF is the cryptographic brake system and the vehicle's registration.**

By acting as an umbrella over both technical execution and legal structuring, SOF bridges the gap between autonomous code and real-world compliance.

---

## A Governed Protocol Stack

SOF is not a single codebase and not a two-sided product. It is a **composable protocol stack** — three layers that bring enforcement, legal governance, and domain-specific deployments together in one architecture. Think of it as a franchise protocol: a universal enforcement substrate, a legal operating standard built on top of it, and vertical boilerplates that pre-assemble both for specific industries.

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
    ASSURANCE.md policy structure so human General Partners can assume
    quantifiable liability without unlimited personal exposure.
  </Card>
</CardGroup>

<Card
  title="Layer 3: Vertical Boilerplates"
  icon="layers"
  href="/components/verticals"
>
  Domain-specific implementations of OEE + FAF. **[Open Venture Engine
  (OVE)](https://github.com/Sigil-Core/oee/tree/main/verticals/venture/)** is the first — OEE pre-wired for
  autonomous venture capital, with VC-optimized policy templates, ERC-6551 agent
  identity, and Sigil Action Provider integration. Healthcare, banking, and
  enterprise verticals follow the same pattern: enforcement and legal
  pre-assembled for a deployment context, ready to go.
</Card>

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
