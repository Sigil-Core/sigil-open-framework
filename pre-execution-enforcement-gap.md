---
title: "The Pre-Execution Enforcement Gap"
description: "A position paper on pre-execution enforcement as the missing control family for agentic AI governance."
---

Vernon Wharff<br />
Sigil Open Framework<br />
July 2026 - v1.3

[Download the v1.3 PDF](https://www.sigilgovernance.com/The_Pre-Execution_Enforcement_Gap_-_Sigil_Open_Framework.pdf)

**Version 1.3 correction.** Sections 7 and 8 now distinguish a pre-tool authorization checkpoint from the final mutation boundary required by Policy 2.1. An approval or hold resolution does not itself prove execution. A Policy 2.1 destructive-resource claim requires a trusted, fail-closed adapter that owns the final mutation, validates structured execution metadata, and consumes a one-time execution grant.

## Summary

AI governance standards now tell organizations how to define policy, allocate responsibility, assess risk, monitor behavior, and document outcomes. Agentic systems expose the remaining gap. Documentation can tell an agent what should happen. Evaluation can estimate what an agent might do. Monitoring can record what an agent did. Pre-execution enforcement controls what an agent can do. This paper names that gap the Pre-Execution Enforcement Gap and argues that high-stakes agent actions should pass through deterministic policy evaluation before they reach tools, credentials, wallets, APIs, or infrastructure. The Sigil Open Framework (SOF) proposes an execution control layer for that gap, using signed Sigil Warrants, Intent Attestations, holds, denials, and audit evidence to bind human intent to machine action.

## The Pre-Execution Enforcement Gap

AI governance has entered its standards era. ISO, NIST, Berkeley, the EU, and the frontier safety community now agree on the basic shape of responsible AI governance. Organizations must define policy, assign responsibility, map foreseeable harms, measure trustworthiness, treat risk, monitor results, document decisions, and report enough information for affected parties, auditors, regulators, and downstream operators to understand what happened.

That consensus matters. ISO/IEC 42001:2023 gives organizations the management-system frame. Its Annex A controls cover AI policy, roles, resources, impact assessment, lifecycle requirements, data management, information for interested parties, responsible use, and third-party relationships. NIST AI RMF 1.0 gives organizations the operating vocabulary. ISO/IEC 23894 gives organizations AI-specific risk-management guidance. NIST AI 600-1 extends the AI RMF into generative AI. Berkeley's General-Purpose AI Risk-Management Standards Profile v1.2 adapts those standards for GPAI models, including cutting-edge large language models and agentic models, then maps the resulting guidance back to ISO, NIST, the EU AI Act, the EU GPAI Code of Practice, the Hiroshima Process, and frontier safety commitments. Berkeley's companion Agentic AI Risk-Management Standards Profile focuses the same standards structure on systems granted autonomy, tools, environment access, and authority to act on behalf of users.

The landscape now points in one direction. AI governance has moved from principles to procedures. The best current standards no longer treat safety as a statement of values. They ask for risk thresholds, impact characterization, go/no-go decisions, red-teaming, third-party evaluation, documentation, incident response, post-deployment monitoring, and reporting. Berkeley's GPAI Profile v1.2 makes that shift explicit by adding high-priority emphasis on external feedback, third-party evaluation, and post-deployment monitoring. Its v1.2 update expands the risk landscape around manipulation, deception, sandbagging, situational awareness, socioeconomic and labor-market disruption, and the difficulty of removing backdoors. The Profile repeatedly treats agentic models and downstream agentic wrappers as part of the GPAI risk-management landscape, while the companion Agentic AI Profile addresses the additional risks that emerge when AI systems receive agency to act.

This is where the standards landscape exposes its central gap.

Most AI governance controls operate before deployment, around deployment, or after deployment. They create policy, evaluate models, review risks, document decisions, audit behavior, and respond to incidents. These controls reduce organizational blindness. They make risk legible. They help leaders decide whether a system should ship, where it should operate, and how teams should monitor it. They do not, by themselves, stop an autonomous system at the instant it attempts a high-stakes action.

This paper names that gap the Pre-Execution Enforcement Gap.

The Pre-Execution Enforcement Gap is the distance between documented AI governance and enforced runtime authorization at the moment an autonomous system attempts to act. It appears whenever a policy says an agent may not do something, but the execution path still gives the agent technical ability to do it. It appears when a risk register names a hazard, but the API, wallet, shell, database, or cloud credential accepts the call anyway. It appears when a human approval threshold exists in a procedure, but the payment rail, deployment pipeline, or signing endpoint has no cryptographic proof that approval happened.

The gap grows with autonomy. A chatbot that drafts text creates information risk. An agent that writes files, calls APIs, sends email, signs transactions, rotates infrastructure, or moves money creates execution risk. Execution risk needs a different control family. Documentation can tell an agent what should happen. Evaluation can estimate what an agent might do. Monitoring can record what an agent did. Pre-execution enforcement controls what an agent can do.

## Berkeley, NIST, and Human Control

The citation discipline matters. Govern, Map, Measure, and Manage are NIST AI RMF functions. Section labels such as Govern 2.1, Map 3.5, Manage 2.4, and Manage 4.1 originate in NIST AI RMF 1.0. Berkeley's GPAI Profile v1.2 uses that structure and adds profile-specific guidance for GPAI models. Berkeley's companion Agentic AI Profile uses the same structure for agentic systems and adds agent-specific control guidance. A defensible mapping cites the base NIST section when using NIST language, Berkeley's GPAI Profile v1.2 when using current GPAI profile guidance, and the Agentic AI Profile when the claim concerns agent-specific execution risk.

NIST AI RMF 1.0 describes the base human-control structure. Govern 2.1 concerns documented roles, responsibilities, and lines of communication for mapping, measuring, and managing AI risks. Map 3.5 concerns defined, assessed, and documented human oversight processes. Manage 2.4 concerns mechanisms to supersede, disengage, or deactivate AI systems that produce performance or outcomes inconsistent with intended use. Manage 4.1 concerns post-deployment monitoring, including input capture, appeal and override, decommissioning, incident response, recovery, and change management.

Berkeley's GPAI Profile v1.2 makes those NIST sections more operational for GPAI developers and deployers. Under Govern 2.1, it emphasizes clear allocation of responsibility across the GPAI value chain, risk oversight, risk ownership, risk support and monitoring, and assurance. Under Map 3.5, it calls for identifying AI system features and capabilities that require human oversight, defining oversight practices, evaluating those practices, and documenting roles, responsibilities, delegations of authority, skills, training, resources, and domain knowledge. Under Manage 2.4, it emphasizes structured access, staged release, emergency shutdown procedures, tiered control mechanisms, usage-guideline enforcement, and criteria for deactivation or disengagement. Under Manage 4.1, it emphasizes post-deployment monitoring, external feedback, serious incident reporting, vulnerability discovery, misuse monitoring, response, recovery, decommissioning, and continuous monitoring.

Berkeley's Agentic AI Profile carries that logic into the execution environment. It emphasizes human-agentic AI management hierarchies that preserve human authority, role definitions, intervention points, escalation pathways, shutdown mechanisms, oversight checkpoints, role-based permission management, explicit permission declarations, real-time permission requests for high-risk actions, activity logs, and records of tool use, resource access, and permission changes. Those additions point directly toward a runtime enforcement layer.

That is the key observation. Berkeley's GPAI Profile v1.2 and Agentic AI Profile name the right risk-management levers for human control and accountability. The levers include role allocation, human oversight, structured access, staged release, permission boundaries, intervention points, tiered control, deactivation procedures, monitoring, feedback, incident response, and assurance. Those levers become operationally meaningful only when the execution path can enforce them. A role definition matters at runtime only if the system can distinguish the policy owner, the agent, the approving human, and the credential authority. An intervention point matters only if the agent cannot proceed around it. An escalation pathway matters only if the risky action enters a hold state before execution. A deactivation procedure matters only if the system can restrict, suspend, or cut off the capability being used. An accountability record matters only if it binds the action to the policy, approval state, tool, credential release, and time of decision.

## Related Academic Work

A small academic literature has begun forming around the same architectural primitive that SOF instantiates. Nine preprints posted between February and May 2026 propose runtime authorization, policy-on-path governance, non-compensatory pre-action boundaries, capability tokens, task-scoped envelopes, dependency-graph enforcement, and authorization propagation for AI agents. SOF shipped to production in late February 2026 and predates them all. Their formal vocabulary is nonetheless useful for grounding the SOF position in academic terms.

Uchibeke (2026) characterizes the pre-action authorization problem and proposes Open Agent Passport (OAP), an open specification with reference implementation that intercepts tool calls synchronously, evaluates them against declarative policy, and produces a cryptographically signed audit record. The architecture described converges with what Sigil Sign + signed `warranty.md` + Ed25519 Intent Attestation already implements. SOF and OAP are best understood as parallel contemporaneous specifications converging on the same primitive, rather than one preceding the other in dependency.

Kaptein, Khan, and Podstavnychy (2026) provide a formal framework treating execution paths as the central object of governance. Their policy function maps agent identity, partial path, proposed next action, and shared organizational state to a violation probability. They argue that prompt-level control is not a case of this framework, and that static access control is a degenerate special case ignoring the path. The authors explicitly state that their paper does not present an implementation. SOF is the implementation: `warranty.md` rules instantiate the deterministic policy function, Sigil Sign acts as the Policy Engine, the per-task evidence chain serves as the governance state vector, and operator-level approval thresholds expose the fleet-level risk budget.

Lavi (2026) distinguishes pre-action legitimacy from pre-action authorization and proposes a Right-to-Act decision function: a deterministic, non-compensatory boundary in which a single failed required constraint cannot be offset by any number of satisfied constraints. SOF's deny-rule semantics are non-compensatory by construction. A single matched deny in `bash.blocked_commands`, `web_fetch.blocked_domains`, `file_write.blocked_paths`, or any custom deny string produces a DENIED outcome regardless of how many other allow conditions hold. Lavi's NON-ACTION decomposition into DEFER, ESCALATE, and REQUEST-INFO maps to SOF's PENDING decision class for human approval.

Tallam (2026) approaches the same domain from the synthesis side rather than proposing a new specification. The paper surveys the convergence of recent runtime authorization work — including invocation-bound capability tokens, execution-count revocation, task-scoped envelopes, dependency-graph enforcement, and post-quantum delegation chains — and distills seven structural requirements (R1–R7) for authorization architectures in multi-agent AI systems: agent principals as first-class subjects, explicit bounded delegation, boundary-level evaluation, aggregation-policy expressibility, workflow-scoped self-contained traces, temporal validity as policy decision, and recovery traceable through the synthesis graph. SOF satisfies R1, R2, R3, R5, and R6 directly through its signed warrant, Intent Attestations, PreToolUse gateway, per-session evidence chain, and configurable attestation expiry. R4 (aggregation) and R7 (recovery) are partial — SOF's deny-rules and evidence chain support these requirements but do not formally guarantee them across multi-agent synthesis graphs. SOF and Tallam's framework approach the same domain from opposite directions: SOF as deployed specification, the R1–R7 framework as synthesis vocabulary that names what SOF was already enforcing.

Several other 2026 preprints address adjacent mechanisms within the same architectural domain. Prakash (2026) specifies Invocation-Bound Capability Tokens that fuse identity, attenuated authorization, and provenance binding into an append-only token chain — functionally adjacent to SOF's Intent Attestation chain. Parakhin (2026) provides formal proof that TTL-based token revocation fails at agent execution speeds and proposes execution-count-based Release Consistency, an approach SOF could adopt for attestation invalidation. Sharma et al. (2026) propose task-scoped authorization envelopes derived from natural-language task descriptions; the envelope concept is architecturally adjacent to SOF's per-session evidence chain. Palumbo et al. (2026) propose a dependency-graph reference monitor for policy enforcement across agent state, providing a complementary mechanism for the aggregation requirements SOF's deny-rules only partially address. Chen (2026) provides a post-quantum continuous delegation protocol with formally verified revocation, relevant to SOF's hybrid Ed25519 + ML-DSA-65 attestation signatures, now shipped in the reference signer.

These papers add academic vocabulary to a category SOF has already shipped. They do not change the SOF claim. They sharpen the language available to describe it.

## The Sigil Open Framework Position

Pre-execution enforcement starts with a simple rule. An autonomous system should not reach a high-stakes target unless it carries verified proof that the action complies with an authorized policy. The target may be a blockchain gateway, cloud API, email system, filesystem, procurement workflow, database, model tool, or credential broker. The control should not depend on the agent's self-restraint, a prompt, or a dashboard that someone reads tomorrow. It should bind policy, intent, approval, and execution into the same path.

AI governance therefore needs an execution layer.

The Sigil Open Framework (SOF) supplies that layer. It does not replace ISO/IEC 42001, NIST AI RMF, ISO/IEC 23894, Berkeley's GPAI Profile v1.2, Berkeley's Agentic AI Profile, or the EU AI Act. It turns a specific class of their requirements into enforceable infrastructure. SOF gives organizations a way to express policy as Sigil Warrant, sign that policy, evaluate every declared intent against it, issue short-lived Intent Attestations for approved actions, hold threshold actions for human approval, and reject execution when proof fails.

The Open Execution Engine (OEE) is the implementation layer for that enforcement architecture. It packages SOF enforcement into domain-specific verticals that share the same pattern. The agent proposes an intent, Sigil Sign evaluates the signed `warranty.md` policy, the system issues an Ed25519 Intent Attestation when the action complies, and the execution engine proceeds only after attestation. The first OEE vertical is Open Venture Engine (OVE), a venture-capital stack that applies the same enforcement primitives to fund and treasury workflows.

In the formal vocabulary developed by Kaptein, Khan, and Podstavnychy, Sigil Sign is the Policy Engine, the signed `warranty.md` is the deterministic policy function, the per-session evidence chain is the governance state vector, and operator-level approval thresholds expose the fleet-level risk budget. SOF instantiates that framework. The signed warrant, Ed25519 attestations, and gateway-level rejection are how the framework becomes enforceable rather than merely formal.

This changes the compliance posture. A policy document says what leadership approved. A signed Sigil Warrant proves which policy governed the action. An Intent Attestation proves that the action passed that policy before execution. A gateway, hook, or credential broker rejects the action when that proof does not match. A violation log shows the denial, hold, approval, rule, and time. The audit record no longer starts after the event. It starts at the decision point.

This is also where accountability becomes more than attribution. After-the-fact attribution can tell a reviewer which agent, user, or system caused an event. Pre-execution accountability tells the reviewer whether the action had authority before it occurred. In SOF, the evidence chain can show the approved policy, the declared intent, the matched rule, the decision, the human hold outcome where needed, the attestation, the gateway check, and the credential release. That chain aligns with Berkeley's emphasis on role clarity, human oversight, structured access, permission boundaries, monitoring, incident response, and deactivation. It also supplies the kind of evidence an ISO/IEC 42001 audit will test when management-system language reaches operational claims.

FINRA's 2026 Annual Regulatory Oversight Report, published December 9, 2025, treats AI agents as a distinct category of risk. Its agent section says firms may wish to consider human-in-the-loop oversight, tracking agent actions and decisions, and guardrails or control mechanisms that limit agent behavior. FINRA does not endorse SOF or prescribe this architecture. Its guidance identifies the governance and evidence questions that a pre-execution control path addresses. [Read the FINRA agent guidance](https://www.finra.org/rules-guidance/guidance/reports/2026-finra-annual-regulatory-oversight-report/gen-ai).

## SOF to ISO/IEC 42001 Annex A

The SOF to ISO/IEC 42001 mapping is strongest where Annex A asks for proof that policy reached operation. The table below does not claim that SOF satisfies the whole AIMS. It identifies controls where SOF can serve as a primary evidence surface for the pre-execution enforcement portion of the control.

| Control | ISO/IEC 42001 control surface | SOF primitive | Evidence surface |
|---|---|---|---|
| `A.2.2` AI policy | AI policy documented for development or use of AI systems | Sigil Warrant and signed `warranty.md` | Operator-defined execution policy, Ed25519 signature, `policyHash` in attestations |
| `A.4.4` Tooling resources | Tooling resources documented for the AI system | Agent Hooks and framework registry | Supported framework identifier, governed action class, tool-call policy block |
| `A.6.2.5` AI system deployment | Deployment plan and requirements before deployment | OEE authorization path and gateway checks | Signed policy, verification key, `/v1/authorize`, write rejection without valid proof |
| `A.6.2.7` Technical documentation | Technical documentation for relevant parties | SOF component docs and attestation specification | Policy format, pipeline docs, attestation rules, integration references |
| `A.6.2.8` Event logs | Event logs while AI system is in use | Command, OEE decision records, Vault audit records | Approval, denial, hold, matched rule, timestamp, attestation, credential-release event |
| `A.9.2` Responsible use processes | Processes for responsible use of AI systems | OEE enforcement pipeline | Intent declaration, policy evaluation, approval, denial, hold, gated execution |
| `A.9.4` Intended use | AI system used according to intended use and documentation | Warrant rules, gateway rejection, Vault checks | Allowlists, blocklists, thresholds, custom deny rules, proof-gated access |

Partial mappings matter too. ISO/IEC 42001 contains controls that SOF can support without satisfying completely. A defensible statement of applicability should include these with scope language, so the organization does not over-claim.

| Control | What SOF supports | What remains outside SOF |
|---|---|---|
| `A.2.3` Policy alignment | Execution rules can encode security, privacy, finance, and acceptable-use requirements | The policy crosswalk, approval process, and ownership model |
| `A.2.4` AI policy review | Policy versions and `policyHash` changes show when new rules entered operation | Review cadence, management approval, and suitability analysis |
| `A.3.2` Roles and responsibilities | Operator signature, tenant scope, hold resolver, Vault trust anchors | Role definitions, competence records, staffing, governance authority |
| `A.3.3` Reporting of concerns | Denials and holds can feed concern and incident workflows | Confidential reporting, escalation, response, reprisal protection |
| `A.4.2` Resource documentation | Enforcement resources, frameworks, routes, backends, policy files | Model resources, data stores, full AI system inventory |
| `A.6.2.4` Verification and validation | Approval, denial, hold, expired-attestation, and gateway-rejection tests | Model validation, performance, robustness, bias, human factors, TEVV |
| `A.6.2.6` Operation and monitoring | Command events, hold queue, Vault audit records | Model quality, drift, task success, user impact, support processes |
| `A.8.2` User information | Operator and technical-user documentation for governed actions | End-user notice, benefit and harm disclosures, override instructions |
| `A.8.5` Information for interested parties | Exportable policy, attestation, denial, hold, and audit evidence | Legal reporting obligations, disclosure scope, deadlines |
| `A.9.3` Responsible use objectives | Runtime constraints for security, safety, spending, access, and human approval | Fairness, accessibility, explainability, customer expectations |
| `A.10.2` Responsibility allocation | Policy signer, API tenancy, framework identity, Vault routes | Contracts, RACI matrices, privacy-role analysis, customer terms |
| `A.10.3` Suppliers | Supplier boundary enforcement through framework, tool, route, and domain limits | Procurement diligence, supplier security review, data rights, service levels |

The mapping has limits. Sigil does not perform impact assessments. It does not judge fairness, labor-market effects, data-set quality, model interpretability, human competence, customer expectations, or societal impact. It does not choose an organization's risk tolerance. It cannot replace legal counsel, internal audit, model evaluation, red-teaming, privacy review, or third-party due diligence. SOF should not be mapped as satisfying ISO/IEC 42001 `A.4.3`, `A.5.2` through `A.5.5`, `A.7.2` through `A.7.6`, `A.8.3`, `A.8.4`, or `A.10.4` without separate organizational controls. Sigil makes one part of the control environment harder to fake, the part where an agent tries to act.

## SOF to NIST AI RMF 1.0

NIST AI RMF 1.0 is voluntary and flexible. It does not prescribe a single implementation architecture. SOF maps to a subset of NIST subcategories where runtime enforcement can produce direct evidence.

| NIST subcategory | NIST control surface | SOF primitive | Evidence surface |
|---|---|---|---|
| `Govern 1.3` | Processes determine needed risk-management activity based on risk tolerance | Sigil Warrant | Signed thresholds, allowlists, blocklists, approval gates |
| `Govern 1.4` | Risk-management process and outcomes established through policies and controls | Warrant plus Command | Signed policy tied to approval, denial, and hold records |
| `Map 3.5` | Human oversight processes defined, assessed, and documented | Approval thresholds and consensus holds | Hold creation, resolver action, outcome, timestamp, matched rule |
| `Manage 2.4` | Mechanisms supersede, disengage, or deactivate systems outside intended use | OEE denial, gateway rejection, Vault hard rejection | No attestation issued, write blocked, credential release refused |
| `Manage 4.1` | Post-deployment monitoring, appeal, override, decommissioning, incident response, recovery, change management | Command and Vault audit records | Denial and hold history, credential-release events, audit-chain verification |

These primary NIST mappings apply to governed action paths. They do not by themselves satisfy full model decommissioning, enterprise incident response, or organization-wide risk management.

SOF also supports several NIST subcategories partially.

| NIST subcategory | What SOF supports | What remains outside SOF |
|---|---|---|
| `Govern 2.1` | Operator key, tenant scope, hold resolver, framework identity | Role descriptions, training, competence, communication lines |
| `Govern 5.1` | Verifiable decisions that outside evaluators can inspect | Feedback intake, prioritization, stakeholder engagement |
| `Map 1.1` | Intended use expressed as enforceable action scope | Context analysis, laws, norms, user expectations |
| `Map 5.2` | Runtime evidence for feedback about impacts from denied or held actions | Engagement with affected actors and broader impact analysis |
| `Measure 2.7` | Security and resilience of the enforcement path | Security assessment, adversarial testing, vulnerability management |
| `Manage 1.3` | Risk treatments expressed as allow, deny, and hold rules | Risk selection, treatment design, residual-risk acceptance |

`Measure 2.7` and `Manage 1.3` remain partial mappings because SOF supplies runtime evidence and enforceable treatments for governed action paths, while the organization must still complete the broader security evaluation and risk-treatment program.

Several NIST subcategories remain outside SOF. `Map 4.1` requires legal risk mapping, including intellectual property. `Measure 2.10` requires privacy risk examination. `Measure 2.11` requires fairness and bias evaluation. `Measure 2.12` requires environmental-impact assessment. Govern 4 concerns organizational culture around trustworthy AI. SOF can supply evidence into those programs only when execution records become relevant.

## Threat Model Against NIST Trustworthy AI

NIST AI RMF 1.0 describes trustworthy AI through characteristics that include valid and reliable, safe, secure and resilient, accountable and transparent, explainable and interpretable, privacy-enhanced, and fair with harmful bias managed. Pre-execution enforcement maps strongly to three of these, partially to one, and weakly or not at all to the others.

**Safe.** NIST describes safe systems as those that do not, under defined conditions, endanger human life, health, property, or the environment. It also identifies real-time monitoring and the ability to shut down, modify, or have human intervention in systems that deviate from intended or expected functionality. Pre-execution enforcement supports this safety surface by checking action declarations before they reach the target. It addresses unauthorized financial transfers, unauthorized cloud or infrastructure mutations, destructive shell commands, and actions induced by prompt injection that would otherwise execute through an available tool. It does not make the model safe in the broader sense. It makes unsafe action pathways harder to exercise.

**Secure and resilient.** NIST frames security around protection against unauthorized access and use, adversarial examples, data poisoning, endpoint exfiltration, and protocols to avoid, protect against, respond to, or recover from attacks. SOF narrows the agent's effective attack surface by separating model reasoning from credential authority. Agent Hooks intercepts tool calls before execution. Vault refuses credential release without valid proof and has no fail-open path. OEE denies intents that violate signed policy. This helps defend against credential exfiltration through prompt injection, model-driven tool abuse, and confused-deputy patterns where an agent tries to combine available capabilities into an unauthorized external effect.

**Accountable and transparent.** NIST states that accountability presupposes transparency and that transparency should cover system decisions, deployment decisions, and who made them. SOF contributes by creating an evidence chain at the point of decision. The record can show the policy, policy hash, declared intent, matched rule, decision, hold outcome, attestation, gateway check, and credential-release event. This is stronger than ordinary execution logging because denied actions enter the record too. The absence of a completed transaction no longer erases the attempted violation.

**Valid and reliable.** SOF contributes partially. The enforcement layer is deterministic, so it can add a reliable boundary underneath stochastic model behavior. It can continue to deny out-of-policy actions even when the model is wrong. It does not validate the model's performance, accuracy, robustness, or task suitability. A model that repeatedly asks for denied actions may still be unreliable, even if SOF prevents the worst consequences.

**Explainable and interpretable.** SOF can explain which rule matched an action. It cannot explain why the model attempted the action. Model interpretability remains upstream.

**Privacy-enhanced.** Vault can prevent unauthorized credential release that could enable privacy violations. SOF does not perform differential privacy, data minimization, training-data privacy review, or privacy impact assessment.

**Fair with harmful bias managed.** SOF does not detect or mitigate model bias. A fairness checker could become an upstream condition that feeds a Sigil Warrant rule, but SOF would enforce the result. It would not generate the fairness judgment.

The threat model defines the claim. Pre-execution enforcement is not a general solution to AI risk. It is a control family for agentic execution risk, especially where safety, security, accountability, and transparency depend on whether a high-stakes action was authorized before it reached the target system.

## Worked Example: Pre-Execution Enforcement in a Production Agent Runtime

The architectural argument is simple. The path between an agent's reasoning and an external system effect must pass through deterministic policy evaluation before the action fires. In abstract, that is a claim about a control family. In practice, it becomes a sequence of code paths, network calls, signatures, and logs that either complete or fail.

This section walks through one such sequence. It uses Claude Code or the Anthropic SDK as the agent runtime, `@sigilcore/agent-hooks` as the in-runtime enforcement client, Sigil Sign as the authorization service, OEE as the policy evaluation path, and Sigil Command as the operator evidence surface. The example follows the published Agent Hooks and SOF documentation. The identifiers, keys, hashes, and signatures below are illustrative, but the control flow is the SOF control flow.

The scenario is intentionally narrow. An autonomous coding agent attempts to execute a destructive shell command against the operator's filesystem, and pre-execution enforcement intercepts it. The same pattern applies to wallet transactions, cloud API mutations, email sends, deployment triggers, credential rotations, database writes, and other high-stakes action classes because the enforcement primitive is action-class agnostic.

### 1. The operator-defined policy

Before any governed agent runs, the operator authors a Sigil Warrant in `warranty.md` and signs it with the operator's Ed25519 key. The signed policy is the authority the enforcement layer recognizes.

```markdown
version: 2.1.0

## tool_calls
allowed: bash, web_fetch, file_write, wallet_sign, email.send
bash.blocked_commands: rm -rf, sudo, curl | sh
web_fetch.blocked_domains: evil.com, malicious.io
file_write.blocked_paths: ~/.ssh, .env, secrets
email.require_approval: true

## custom
deny_string: "OPENAI_API_KEY"
deny_string: "DROP TABLE"

## signature
sigil-sig: <base64url-ed25519-signature>
```

This reference uses profileless Policy 2.1. It keeps the same tool-call policy surface and does not claim a repository, filesystem, Git, or database execution boundary.

The warrant expresses operator intent as a small, reviewable artifact. A human can read it. A machine can evaluate it. The signature binds the policy to the operator identity. The policy hash later binds an authorization decision to the exact policy version in force at evaluation time.

### 2. The agent attempts an action

A developer runs an autonomous coding agent in a repository. The session begins as an ordinary refactor. The model decides to clean a build directory and proposes a tool call:

```bash
rm -rf ./build
```

In a runtime without pre-execution enforcement, the bash tool receives this command and executes it. If the working directory is wrong, if the model misjudges scope, or if a prompt injection in a downstream file changes the agent's plan, the filesystem changes before governance has a chance to intervene. A log may exist after the fact, but the deletion has already happened.

In a runtime with pre-execution enforcement, the tool call enters the authorization path before the bash runtime receives it.

### 3. The PreToolUse hook fires

The Anthropic PreToolUse event fires before the tool executes. The `@sigilcore/agent-hooks` adapter observes the proposed tool call and constructs a declared intent from the raw tool input. This is important. The authorization service receives what the runtime is about to do, not a model-written summary of what the agent claims it intends.

```json
{
  "intent_id": "intent-7c2e1f4a",
  "session_id": "session-9b3a",
  "warrant_id": "warrant-prod-coding-agent-2026-04-26",
  "action_class": "tool_calls.bash",
  "action_payload": {
    "tool": "Bash",
    "command": "rm -rf ./build",
    "cwd": "/Users/operator/project"
  },
  "timestamp": "2026-04-26T14:32:18.114Z"
}
```

The hook submits that intent to Sigil Sign through the authorization path. The call asks a narrow question: does this specific action fit the signed policy that governs this session?

### 4. Sigil Sign evaluates against the signed warrant

Sigil Sign retrieves the referenced warrant, verifies the operator signature, computes or checks the policy hash, and evaluates the declared intent against the `## tool_calls` policy. The decision is deterministic for this command.

1. The evaluator checks blocked bash commands.
2. The command contains `rm -rf`.
3. The deny rule matches.
4. Sigil returns a denied decision with the matched rule and policy evidence.

```json
{
  "decision": "DENIED",
  "intent_id": "intent-7c2e1f4a",
  "warrant_id": "warrant-prod-coding-agent-2026-04-26",
  "matched_rule": {
    "block": "tool_calls.bash.blocked_commands",
    "value": "rm -rf",
    "rationale": "destructive recursive removal is outside the signed policy"
  },
  "policy_hash": "sha256:9a1fe408",
  "evaluated_at": "2026-04-26T14:32:18.241Z",
  "expires_at": "2026-04-26T14:33:18.241Z",
  "signature": "ed25519:b72c118f"
}
```

The signed decision is the operational evidence. A reviewer can verify the signature, compare the `policy_hash` to the warrant, inspect the declared intent, and see the rule that fired. The decision records that governance happened before execution, at the point where the agent still needed permission to act.

### 5. The hook acts on the decision

Agent Hooks parses the decision. Because the result is `DENIED`, the adapter returns the runtime's denial response and prevents the bash tool from executing.

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "SIGIL_BASH_BLOCKED: rm -rf matched tool_calls.bash.blocked_commands in warrant-prod-coding-agent-2026-04-26."
  }
}
```

The bash runtime never receives authorization to run the command. The filesystem remains unchanged. The agent receives the denial reason through the tool-result channel, which lets it propose a safer alternative without bypassing the boundary that rejected the original action.

Sigil Command records the event as an operator-visible enforcement record:

```text
2026-04-26T14:32:18Z  DENIED  tool_calls.bash
session:      session-9b3a
intent:       intent-7c2e1f4a
warrant:      warrant-prod-coding-agent-2026-04-26
command:      rm -rf ./build
matched:      tool_calls.bash.blocked_commands rm -rf
policy_hash:  sha256:9a1fe408
attestation:  ed25519:b72c118f
```

The denial is not merely a missing execution. It is a positive evidence event. The record shows the attempted action, the policy, the matched rule, the decision, the hash, and the signed proof.

### 6. What the evidence chain proves

The example answers the questions an auditor or compliance lead will ask.

| Audit question | Evidence produced |
|---|---|
| Was there a governing policy? | Yes. `warrant-prod-coding-agent-2026-04-26` existed as a signed Sigil Warrant. |
| Was the policy authorized at the time of decision? | Yes. The signature and policy hash bind the decision to the warrant version. |
| What did the agent try to do? | The declared intent records `tool_calls.bash` with `rm -rf ./build`. |
| Did the system evaluate the action before execution? | Yes. The PreToolUse path submitted the intent before the tool executed. |
| Which rule matched? | `tool_calls.bash.blocked_commands` matched `rm -rf`. |
| Did the system block the action? | Yes. The hook returned `permissionDecision: deny`. |
| Can a third party verify the chain? | Yes. The policy hash, signed decision, warrant, and event log create replayable evidence. |

This is the operational form of several standards surfaces. The signed warrant maps to ISO/IEC 42001 `A.2.2` and NIST AI RMF Govern 1.3 because it expresses approved policy as an evaluable artifact. The PreToolUse checkpoint maps to NIST AI RMF Map 3.5 and Berkeley Agentic AI Profile Map 3.5 because it inserts human-control policy before tool use. The denied decision maps to NIST AI RMF Manage 2.4, Berkeley GPAI Profile v1.2 Manage 2.4, and Berkeley Agentic AI Profile Manage 2.4 because it demonstrates a mechanism to disengage an action inconsistent with intended use. The Command event maps to ISO/IEC 42001 `A.6.2.8`, NIST AI RMF Manage 4.1, Berkeley GPAI Profile v1.2 Manage 4.1, and Berkeley Agentic AI Profile Manage 4.1 because it records the enforcement event for monitoring and audit.

### 7. What changes when policy permits the action

The same path approves permitted work. If the agent runs a command allowed by the signed warrant, the hook constructs the same kind of intent and Sigil returns an approved decision.

```bash
npm test
```

```json
{
  "intent_id": "intent-3f81c0d2",
  "session_id": "session-9b3a",
  "warrant_id": "warrant-prod-coding-agent-2026-04-26",
  "action_class": "tool_calls.bash",
  "action_payload": {
    "tool": "Bash",
    "command": "npm test",
    "cwd": "/Users/operator/project"
  },
  "timestamp": "2026-04-26T14:33:02.211Z"
}
```

```json
{
  "decision": "APPROVED",
  "intent_id": "intent-3f81c0d2",
  "warrant_id": "warrant-prod-coding-agent-2026-04-26",
  "matched_rule": {
    "block": "tool_calls.allowed",
    "value": "bash",
    "rationale": "bash tool allowed and no blocked command matched"
  },
  "policy_hash": "sha256:9a1fe408",
  "evaluated_at": "2026-04-26T14:33:02.412Z",
  "expires_at": "2026-04-26T14:34:02.412Z",
  "signature": "ed25519:c84e207a"
}
```

The hook returns `permissionDecision: allow`, so the runtime may continue to the next step. That result is authorization evidence. It is not, by itself, evidence that `npm test` executed, and a PreToolUse hook is not a final mutation boundary.

Policy 2.1 makes the boundary explicit for destructive-resource actions. A trusted adapter in the `2.1.x` family must own the final mutation path, submit structured target and effect metadata, fail closed, and validate a one-time execution grant bound to the policy hash, effect-manifest hash, adapter identity, and, where applicable, repository identity. The adapter consumes that grant before it performs the action. Only the final-boundary adapter can emit evidence of observed execution. A pre-tool approval remains useful as a checkpoint, but it must not be represented as final-mutation enforcement.

### 8. What changes when human approval is required

The same path also supports hold states. Suppose the agent proposes an outbound email:

```json
{
  "tool": "email.send",
  "to": "outside-counsel@example.com",
  "subject": "Draft diligence memo",
  "body": "Attached is the current diligence summary."
}
```

The warrant can require approval for `email.send`. In that case, Sigil returns `PENDING` instead of `APPROVED` or `DENIED`.

```json
{
  "decision": "PENDING",
  "intent_id": "intent-4a9d02be",
  "warrant_id": "warrant-prod-coding-agent-2026-04-26",
  "matched_rule": {
    "block": "tool_calls.email.require_approval",
    "value": "true",
    "rationale": "outbound email requires human approval"
  },
  "hold_id": "hold-82d11c",
  "policy_hash": "sha256:9a1fe408",
  "evaluated_at": "2026-04-26T14:36:11.018Z",
  "signature": "ed25519:f29a088d"
}
```

The hook does not let the message proceed. Command becomes the review surface. The human operator approves or rejects the hold. An approved hold changes the authorization state. It does not itself send the message or prove that a message was sent.

For an action that claims Policy 2.1 destructive-resource enforcement, the final-boundary adapter must bind the approved resolution to the original intent and validate the single-use execution grant before it performs the mutation. It must reject a stale, replayed, mismatched, or unavailable grant. This preserves the hold as a real runtime gate: the review decision cannot be replayed for another action, and neither a hook nor Command can be described as the final mutation boundary unless it owns that boundary. This is the runtime form of Berkeley GPAI Profile v1.2's human oversight and structured-access logic, and Berkeley Agentic AI Profile's real-time permission request and oversight-checkpoint guidance.

### 9. What the example does not prove

The example does not prove that the model is well-behaved. Pre-execution enforcement sits downstream of model reasoning. A model that repeatedly proposes denied actions wastes operator time and degrades agent utility. SOF defends against the consequences of unauthorized action. It does not improve the model's intent generation. Model evaluation, red-teaming, and TEVV remain separate responsibilities.

The example does not prove completeness of coverage. It demonstrates that this attempted action passed through enforcement. It does not prove that every attempted action in the session passed through enforcement. A tool registered without hooks, a side-channel command path, or a runtime that bypasses the SDK hook contract would sit outside this evidence chain. Operational completeness depends on consistent hook registration across every tool and target system in scope.

The example does not prove that the operator authored the correct policy. A warrant that allowed destructive commands would permit them. SOF enforces the policy the operator signs. It cannot decide whether the operator chose the right risk threshold. Policy review, approval thresholds, intended-use characterization, and risk acceptance remain organizational responsibilities.

## Coverage and Failure Modes

The first auditor question is coverage. A denial log proves that one attempted action passed through SOF. It does not prove that all actions in the deployment passed through SOF. A defensible deployment therefore needs a coverage statement. The statement should identify which agent frameworks, tools, APIs, wallets, gateways, and credential routes are in scope. It should identify out-of-band paths and either remove them, monitor them, or mark them outside the claim. Without that scope boundary, an attestation proves the governed path worked, not that every possible path was governed.

The second question is failure behavior. The published Agent Hooks package supports `failMode: 'open'` and `failMode: 'closed'`. In open mode, Sigil unreachability can return an approved fallback with a `failOpen` marker. In closed mode, unreachability returns `DENIED` with `SIGIL_UNREACHABLE`. The package documentation recommends closed mode for production agents, externally visible actions, and wallet or on-chain actions. Vault is stricter. Missing, invalid, expired, replayed, or otherwise unacceptable attestations are hard-rejected, and backend timeouts do not pass through blindly. SOF therefore should not claim a single universal fail-closed default across all components. The correct claim is more precise: high-stakes deployments should configure fail-closed behavior at the hook layer, and Vault enforces hard rejection for credential release.

The third question is policy integrity. Sigil Warrant signs the policy with the operator's Ed25519 key. The policy hash is embedded in Intent Attestations. If the file changes after signing, Sigil detects the signature failure at startup. That creates strong policy integrity evidence. It does not prove that the policy itself was well chosen. Risk thresholds, blocked commands, approval requirements, and intended-use definitions still require human judgment and review.

The fourth question is key and policy rotation. Because attestations are short-lived and bind to a policy hash, rotation should be visible in the evidence trail. A new Warrant version should produce a new policy hash. A new signing key should update the verification material and deployment record. Auditors should be able to sample actions before and after rotation and determine which policy and key governed each action.

The fifth question is whether deny rules can be compensated for by approved conditions elsewhere in the policy. They cannot. SOF's deny semantics are non-compensatory in the sense Lavi formalizes: a single failed required constraint cannot be offset by any number of satisfied constraints. A matched deny in `bash.blocked_commands`, `web_fetch.blocked_domains`, `file_write.blocked_paths`, or any custom deny string produces a DENIED decision regardless of how many other allow conditions hold. The structural reason is that allow rules establish permitted action classes while deny rules carve out specific exclusions inside those classes. No accumulation of allow signals can override a matched exclusion. This property gives the boundary deterministic strength: a deployment can prove that a specific class of action was prohibited, not merely that the system tended to refuse it.

## Fiduciary Agent Framework and the Legal Gap

Execution control also has a legal dimension. AI agents are not legal entities. They cannot assume fiduciary duties, sign contracts as persons, or carry liability in the way a human operator or company can. The Fiduciary Agent Framework (FAF) addresses that gap by pairing the technical enforcement layer supplied by Open Execution Engine (OEE) with a legal wrapper around agent authority. FAF treats the agent as controlled property, anchors it to a human or legal entity, and uses the signed policy and attestation trail as evidence that the agent's authority was bounded.

FAF and OEE solve different parts of the same fiduciary problem. FAF supplies the legal container. Its model wraps an autonomous agent in an entity structure and defines the agent's scope of authority, spend limits, risk tolerance, compliance duties, and human override conditions. OEE supplies the technical enforcement path. It routes high-stakes actions through signed policy evaluation before execution. The Open Venture Engine (OVE), OEE's first active vertical, applies that pattern to venture and fund operations with domain-tuned policy templates, integration examples, and documentation.

The sequence matters. FAF defines who owns the agent, what authority the agent has, and which human or legal entity remains responsible for it. OEE makes those boundaries executable. Sigil Warrant translates the legal and operational boundary into `warranty.md`. Sigil Sign evaluates each declared intent against that policy. Intent Attestations give the execution layer cryptographic proof when an action complies. Credential sequestration keeps sensitive authority outside the model's reasoning context. A denied or held action creates evidence that the system enforced the boundary before loss, not after.

This matters because the Pre-Execution Enforcement Gap is also a liability gap. A human operator can say the agent was not supposed to move funds, send an email, call an API, or change infrastructure. That statement helps after a loss, but it does not bound the agent's technical authority before the loss. FAF gives the legal structure a stronger factual foundation when the technical system can show that high-stakes actions required policy-bound proof. OEE closes the execution gap. FAF helps close the legal accountability gap.

## Input to Future Agentic Standards

An open question for future iterations of agentic-AI standards work is whether the human control and accountability lever should include a named enforcement primitive. One candidate name is pre-execution authorization. The substance already lives across NIST AI RMF 1.0, Berkeley GPAI Profile v1.2, and Berkeley's Agentic AI Profile. NIST supplies the base language for human oversight, deactivation, post-deployment monitoring, and risk treatment. Berkeley adds current GPAI guidance around role allocation, structured access, staged release, deactivation, incident response, monitoring, external feedback, and assurance. The Agentic AI Profile adds the agent-specific guidance around human-agentic management hierarchies, intervention points, real-time permission requests, role-based permission boundaries, tool-use logs, resource-access records, and shutdown mechanisms. What remains missing is the unifying control name.

The control pattern is straightforward. A deployer should be able to show that high-stakes actions pass through policy evaluation before the action reaches the tool, API, wallet, file system, or credential broker. The action should carry proof when approved. It should stop when denied. It should enter a hold state when human approval is required. The record should bind the policy, intent, decision, and execution path. That pattern would make Berkeley GPAI Profile v1.2 and the Agentic AI Profile easier to operationalize across ISO/IEC 42001, NIST AI RMF, and sector-specific audit programs.

The industry has built many advisory controls. System cards, model cards, evaluation reports, red-team memos, acceptable-use policies, procurement questionnaires, and audit dashboards all help. They make governance visible. They support regulators and customers. They cannot serve as the final boundary for autonomous execution. An agent does not need to persuade a document. It needs a credential, a network path, a signing key, or an API token.

Pre-execution enforcement treats those capabilities as controlled releases. The agent declares intent before it acts. The policy engine evaluates that intent against the signed warrant. The system issues proof only when the action fits the approved boundary. The execution layer verifies proof before it lets the action proceed. The credential layer releases access only after it sees valid proof. The operator layer records denials and holds in real time. This creates a direct line from human intent to machine action.

AI standards have defined the management system. SOF proposes the execution control. ISO/IEC 42001, NIST AI RMF, ISO/IEC 23894, Berkeley GPAI Profile v1.2, Berkeley's Agentic AI Profile, and the EU AI Act tell organizations what responsible AI governance must cover. Sigil answers the agentic question those frameworks now raise: how does an organization enforce policy-bound human intent at the moment an autonomous system attempts a high-stakes action?

The answer is pre-execution enforcement. Every high-stakes action should pass through deterministic policy evaluation before it reaches the target system. Every approval should produce verifiable proof. Every denial should block execution. Every hold should require a human decision. Every credential release should depend on authorization. Every audit trail should bind the action to the policy that allowed it.

That is the missing control family for agentic AI governance.

## References

- Berkeley Center for Long-Term Cybersecurity. Agentic AI Risk-Management Standards Profile. https://cltc.berkeley.edu/publication/agentic-ai-risk-management-standards-profile
- Berkeley Center for Long-Term Cybersecurity. General-Purpose AI Risk-Management Standards Profile v1.2. https://cltc.berkeley.edu/publication/ai-risk-management-standards-profile-v1-2/
- Berkeley Center for Long-Term Cybersecurity. AI Risk-Management Standards Profile for General-Purpose AI and Foundation Models v1.2. https://cltc.berkeley.edu/publication/ai-risk-management-standards-profile-v1-2/
- Chen, Z. AITH: Post-Quantum Continuous Delegation for AI Agents. arXiv:2604.07695, 2026. https://arxiv.org/abs/2604.07695
- European Commission. AI Act overview. https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
- International Organization for Standardization. ISO/IEC 42001:2023. https://www.iso.org/standard/42001
- Kaptein, M., V.-J. Khan, and A. Podstavnychy. Runtime Governance for AI Agents: Policies on Paths. arXiv:2603.16586, 2026. https://arxiv.org/abs/2603.16586
- Lavi, G. The Pre-Action Legitimacy Gap in AI Systems: A Deterministic, Non-Compensatory Decision Boundary for Execution. arXiv:2604.24153, 2026. https://arxiv.org/abs/2604.24153
- National Institute of Standards and Technology. AI Risk Management Framework 1.0. https://www.nist.gov/news-events/events/2023/01/nist-ai-risk-management-framework-ai-rmf-10-launch
- National Institute of Standards and Technology. Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile. https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence
- Palumbo, A., S. Jha, et al. PCAS: Policy Compiler for Agentic Systems. arXiv:2602.16708, 2026. https://arxiv.org/abs/2602.16708
- Parakhin, V. The Bureaucracy of Speed: Capability Coherence Systems for Agent Authorization. arXiv:2603.09875, 2026. https://arxiv.org/abs/2603.09875
- Prakash, S. AIP: Invocation-Bound Capability Tokens with Biscuit and Datalog. arXiv:2603.24775, 2026. https://arxiv.org/abs/2603.24775
- Sigil Open Framework documentation index. https://docs.sigilcore.com/llms.txt
- Sigil Open Framework Agent Hooks. https://docs.sigilcore.com/agent-hooks/overview.md
- Sigil Open Framework Agent Hooks repository. https://github.com/Sigil-Core/agent-hooks
- Sigil Open Framework Fiduciary Agent Framework. https://docs.sigilcore.com/components/fiduciary-agent-framework.md
- Sigil Open Framework Fiduciary Agent Framework repository. https://github.com/Sigil-Core/faf/blob/main/README.md
- Sigil Open Framework Open Execution Engine. https://docs.sigilcore.com/components/open-execution-engine.md
- Sigil Open Framework Open Execution Engine repository. https://github.com/Sigil-Core/oee/blob/main/README.md
- Sigil Open Framework Open Execution Engine vertical contribution guide. https://github.com/Sigil-Core/oee/blob/main/CONTRIBUTING.md
- Sigil Open Framework Sigil Command. https://docs.sigilcore.com/components/sigil-command.md
- Sigil Open Framework Sigil Vault. https://docs.sigilcore.com/components/sigil-vault.md
- Sigil Open Framework Sigil Warrant and warranty.md. https://docs.sigilcore.com/developer-toolkit/warranty-policy.md
- Sharma, A., R. Jiang, Z. Lin, and L. Chen. PAuth: Precise Task-Scoped Authorization for AI Agents. arXiv:2603.17170, 2026. https://arxiv.org/abs/2603.17170
- Tallam, K. Authorization Propagation in Multi-Agent AI Systems: Identity Governance as Infrastructure. arXiv:2605.05440, 2026. https://arxiv.org/abs/2605.05440
- Uchibeke, U. Before the Tool Call: Deterministic Pre-Action Authorization for Autonomous AI Agents. arXiv:2603.20953, 2026. https://arxiv.org/abs/2603.20953
