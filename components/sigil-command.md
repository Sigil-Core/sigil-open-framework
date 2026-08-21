---
title: "Sigil Command"
description: "The operator oversight surface for real-time policy enforcement visibility and hold review."
---

**Sigil Command** is the operator oversight surface for Sigil Sign. It presents tenant-scoped enforcement decisions, including denials and consensus holds, to authenticated operators.

Command is not a dashboard you configure. It is a window into what your firewall is actually doing. When your agent hits a policy boundary, the event appears in Command within seconds.

**URL:** [command.sigilcore.com](https://command.sigilcore.com)

---

## Hold Review Requirements

For a signer that claims SOF Class 3 consensus support, Command or an equivalent operator surface MUST support authenticated, tenant-scoped review of active holds. It MUST show the held intent binding, triggering policy rule, policy hash, creation time, and expiry. On resolution, it MUST record the authenticated resolver identity, `APPROVE` or `REJECT` decision, resolution time, idempotency key or equivalent request identifier, and any reason the resolver supplies.

Approval may resume only the exact held intent and only after the resolution record is durable. It may issue at most one short-lived attestation. Rejection, expiry, an unauthorized tenant, a mismatched intent, duplicate conflicting resolution, or storage failure MUST fail closed and issue no attestation. A review surface MUST NOT allow editing the held intent; a modified action requires rejection and a new intent.

These are SOF normative requirements for Class 3 support. Availability and historical evidence for a particular Sigil Sign deployment require separate production verification.

## What You See

Command displays your **violation log** — the chronological record of every policy enforcement event for your API key:

| Column | Description |
|---|---|
| **Time** | When the event occurred (UTC) |
| **Endpoint** | The API path the agent called |
| **Chain** | The blockchain chain ID for the transaction |
| **Decision** | `DENIED`, `PENDING`, or `ALLOWED` |
| **Policy rule** | The specific warranty.md rule that matched |

Events are paginated (50 per page) with cursor-based loading. Every event is tied to your API key — you only see your own enforcement data. Tenant isolation is enforced server-side; the client cannot override it.

---

## How It Relates to the Stack

Command is the human-facing surface of OEE's enforcement pipeline. When the [Open Execution Engine](/components/open-execution-engine) evaluates an intent and returns `DENIED` or `PENDING`, that decision is recorded and surfaced in Command.

For consensus holds (`PENDING`), Command is the reference review surface. In a deployment that enables the Class 3 workflow, the agent cannot proceed until an eligible operator explicitly approves or rejects the exact held intent. The signer, not the UI, enforces the resulting decision.

---

## Getting Started

Command is included with every Sigil Sign API key — all tiers, including the free Developer tier. No separate signup or configuration required.

### Step 1: Open Command

Go to [command.sigilcore.com](https://command.sigilcore.com).

### Step 2: Sign in with your email

Enter the email address associated with your Sigil Sign API key. Command uses **passwordless magic link authentication** — we send a time-limited link (10 minutes) to your inbox.

### Step 3: Click the magic link

Check your email (sender: `keys@sigilcore.com`). Click the link. Your browser verifies the token and creates a session (24-hour validity).

### Step 4: View your violations

You land on the violation log. Every policy enforcement event for your API key is listed in reverse chronological order. Click **Load more** to paginate through older events.

### Step 5: Log out

Click **Logout** in the top-right corner. Your session cookie is cleared and you are redirected to the login page.

---

## Notes

- Command does not permit modification or deletion of violation records. A Class 3-enabled deployment may add hold-resolution actions subject to the requirements above.
- Sessions last **24 hours**. After expiry you re-authenticate via magic link.
- If you do not see any violations, your agent has not triggered any policy denials yet. Run a test intent that breaches your warranty.md to confirm the pipeline is working end-to-end.
