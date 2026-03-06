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

## Two Halves of the Same Coin

SOF is not a single codebase. It is a composable ecosystem of specialized primitives. Developers can snap these components together to build autonomous financial entities, self-driving DAO treasuries, and Agentic VC funds safely.

<CardGroup cols={2}>
  <Card
    title="The Technical Engine (OVE)"
    icon="engine"
    href="/components/open-venture-engine"
  >
    **Open Venture Engine** acts as the deterministic execution firewall. It
    mathematically binds the AI to a hard-coded rulebook (`ASSURANCE.md`),
    ensuring the agent physically cannot execute a transaction without a
    cryptographically signed Intent Attestation.
  </Card>
  <Card
    title="The Legal Wrapper (FAF)"
    icon="scale-balanced"
    href="/components/fiduciary-agent-framework"
  >
    **Fiduciary Agent Framework** is the legal-technical bridge. Because OVE
    guarantees the AI won't go rogue, human operators can safely use FAF to wrap
    the agent in a traditional legal entity (like an LLC) to assume bounded,
    quantifiable liability.
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
