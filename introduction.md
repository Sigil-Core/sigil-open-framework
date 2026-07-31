---
title: "Introduction"
description: "An open specification for cryptographic pre-execution authorization of autonomous AI agents."
---

# Sigil Open Framework (SOF)

The **Sigil Open Framework (SOF)** is an open specification for cryptographic pre-execution authorization of autonomous AI agents. Define what's allowed once, in policy. Everything else is blocked automatically — before it fires.

SOF defines a protocol contract that conforming signers, policy engines, and legal wrappers implement to give autonomous agents the cryptographic and legal boundaries required to operate safely in production. The specification is implementation-agnostic by design: any signer that issues conforming Intent Attestations against a `warranty.md` policy is a valid SOF implementation.

Sigil Core publishes the reference implementation. Independent implementations — by audit firms, custodians, enterprise security teams, or any third party — are explicitly welcome and structurally accommodated. The full conformance contract is documented in [Conformance](/conformance).

If standard agentic frameworks are the accelerator pedal, SOF is the cryptographic brake protocol. The reference implementation is one engine that speaks it. Others can speak it too.

---

## Evidence a third party can check

The central question is not whether an agent seems safe. It is whether an outside reviewer can determine who authorized a specific action, under which policy, before the action ran.

SOF binds the signed policy, declared intent, decision, approval outcome where required, and execution check into evidence a verifier can inspect. A reviewer does not need a commercial relationship with the deployment to examine the artifacts. The reviewer still makes an independent trust decision about the policy owner and issuer. Verification proves what the signed evidence says. It does not make the action correct or make a signer trustworthy.

The reference signer publishes a JSON Web Key Set (JWKS) for its JWT Intent Attestations. That is the correct discovery format for JWK-formatted JWT verification keys. Other signature systems can use different discovery formats. For example, a deployment using [RFC 9421 HTTP Message Signatures](https://www.rfc-editor.org/rfc/rfc9421.html) can expose an HTTP Message Signatures directory with `keyid`, `alg`, and hexadecimal `public_key` values. That directory is not a JWKS.

[Pipelock documents](https://github.com/luckyPipewrench/pipelock/blob/4aa4867b53211cc36c6d4ffc28a52c9eabce39d2/docs/guides/federation.md#well-known-directory) an operator-hosted directory at `/.well-known/http-message-signatures-directory` for its HTTP Message Signatures verification keys. That can be a stronger trust posture than a vendor-hosted JWKS because it removes the vendor from the verification path. SOF does not claim that its JWKS is categorically more trustworthy. Its defensible distinction is that a third party can discover the verification material and evaluate the evidence without a relationship to the deployment.

---

## The Doctrine of Structural Trust

> Safety is not a property of prompts. Safety is a property of architecture.

The Sigil Open Framework is built on a single, non-negotiable principle: autonomous agents cannot be trusted to self-govern. Trust must be structurally enforced — cryptographically, deterministically, and before execution, not after loss.

Under SOF, every conforming agent operates within these guarantees:

- AI agents **never hold private keys**
- AI agents **never see raw API credentials**
- AI agents **cannot execute without deterministic authorization**
- High-stakes actions **must route through a policy enforcement layer**

Execution only proceeds if the action carries a valid **Intent Attestation** issued by a conforming signer.

This doctrine is enforced at the specification level. Every SOF-conforming implementation — reference or third-party — must uphold it within its own domain:

- **Conforming signers** enforce it technically — no execution without cryptographic authorization
- **FAF** enforces it legally — no liability exposure without structural governance
- **Sigil Attestations** proves it cryptographically — every authorized action is verifiable

---

## A Governed Protocol Stack

SOF is a **composable protocol stack** — a specification at the center, with three implementation layers around it. The conformance contract is universal: every SOF-conforming deployment, regardless of vendor, runs against the same cryptographic specification. The legal layer converts those guarantees into fiduciary instruments. The vertical boilerplates are pre-assembled deployments — enforcement and legal wired together for a specific industry context.

<CardGroup cols={2}>
  <Card
    title="The Conformance Contract"
    icon="file-signature"
    href="/conformance"
  >
    The conformance target every SOF implementation must honor. Defines Intent
    Attestation structure, JWKS publication, trusted issuer validation, chain
    binding, and the verification protocol used by gated execution layers. Not
    a product; the specification itself.
  </Card>
  <Card
    title="Layer 1: Reference Engine (OEE)"
    icon="shield"
    href="/components/open-execution-engine"
  >
    **Open Execution Engine** is the reference implementation of the SOF
    enforcement specification. Policy evaluation via Sigil Lex, Intent
    Attestation issuance, consensus hold management, and gated RPC/bundler
    execution. One valid signer; not the only valid one.
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card
    title="Layer 2: Legal Governance (FAF)"
    icon="scale-balanced"
    href="/components/fiduciary-agent-framework"
  >
    **Fiduciary Agent Framework** converts cryptographic guarantees from any
    conforming signer into bounded fiduciary instruments — entity templates,
    operating agreements, and warranty.md policy structure so human General
    Partners can assume quantifiable liability without unlimited personal
    exposure.
  </Card>
  <Card
    title="Layer 3: Vertical Boilerplates"
    icon="layers"
    href="/architecture#layer-3-vertical-boilerplates"
  >
    Domain-specific implementations of conforming signer + FAF, pre-assembled
    for specific deployment contexts. Healthcare, banking, and enterprise
    verticals follow the same pattern. The conformance contract is constant;
    the deployment context is what varies.
  </Card>
</CardGroup>

---

## Operator Surface: Command & Vault

The protocol stack governs execution. These two components extend governance into the human layer and the credential layer. Both are part of the reference implementation; conforming signers MAY expose equivalent surfaces.

<CardGroup cols={2}>
  <Card
    title="Sigil Command"
    icon="terminal"
    href="/components/sigil-command"
  >
    **Operator console.** Tenant-scoped, real-time enforcement visibility for
    policy events on your API key. In a Class 3-capable deployment, authenticated
    operators can review exact held intents under the SOF hold-resolution
    requirements. Verify deployment availability separately.
  </Card>
  <Card
    title="Sigil Vault"
    icon="vault"
    href="/components/sigil-vault"
  >
    **JIT credential broker.** Non-custodial, cryptographically-gated credential
    injection for agent requests. Agents never possess API keys or cloud secrets
    — Vault fetches them on-demand from your own infrastructure after validating
    an Intent Attestation.
  </Card>
</CardGroup>

---

## Client-Side Enforcement: Agent Hooks

The protocol stack governs what happens at the execution layer. `@sigilcore/agent-hooks` is the client-side package that connects your agent framework to that layer — intercepting every tool call before it executes and routing it through a conforming signer for policy evaluation.

Without agent-hooks, SOF governs EVM transactions. With agent-hooks, SOF governs **any agent action on any framework**: bash commands, HTTP requests, file writes, wallet signing, and email sends. The agent never reaches the API — or the blockchain — without a verified clearance.

<CardGroup cols={2}>
  <Card
    title="Agent Hooks Overview"
    icon="plug"
    href="/agent-hooks/overview"
  >
    Install `@sigilcore/agent-hooks` and connect Claude Code, OpenAI Codex,
    OpenRouter, Hermes Agent, ELIZA, LangChain, or any framework to your Sigil
    policy in minutes.
  </Card>
  <Card
    title="Claude Desktop & Kimi (MCP Proxy)"
    icon="shield-halved"
    href="/mcp-proxy/overview"
  >
    Govern MCP tool calls from clients with no native pre-tool hook. The Sigil MCP
    Proxy authorizes every `tools/call` at the transport layer.
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

Before an agent can execute a transaction on-chain, it must evaluate its intent against the deterministic constraints defined in its policy. If the intent is compliant, a conforming signer issues a short-lived, Ed25519-signed JWT; the hosted reference signer adds a parallel ML-DSA-65 post-quantum signature in the `pqc` claim. The EVM gateway physically rejects any write operation that does not include this valid attestation.

<Card title="Read the Attestation Specification" icon="file-signature" href="/sigil-attestations">
  Explore the canonical specification for generating, binding, and verifying
  Intent Attestations, including the hybrid post-quantum signature layer.
</Card>

---

## Start Building

Choose the path that fits your role.

<CardGroup cols={3}>
  <Card
    title="Developer Toolkit"
    icon="code"
    href="/developer-toolkit/quick-start"
  >
    **Fastest time to value.** Local testing environment to simulate the Sigil
    execution firewall offline. Mock Express.js engine and Python LangChain
    authorizer.
  </Card>
  <Card title="Getting Started API" icon="bolt" href="/getting-started">
    **Ready for production.** Two-step flow to request an Intent Attestation
    and route a live transaction through the reference Sigil gateway.
  </Card>
  <Card
    title="Build a Conforming Signer"
    icon="file-contract"
    href="/conformance"
  >
    **For audit firms, custodians, and enterprise security teams.** The
    conformance contract — what a conforming signer must implement, what it
    may extend, and how to register an implementation.
  </Card>
</CardGroup>


---
