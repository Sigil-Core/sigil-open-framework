---
title: "Sigil Command"
description: "The read-only operator console for real-time policy enforcement visibility."
---

**Sigil Command** is the operator console for Sigil Sign. It gives every API key holder a real-time, read-only view of their policy enforcement decisions — every denial, every consensus hold, every violation — as they happen.

Command is not a dashboard you configure. It is a window into what your firewall is actually doing. When your agent hits a policy boundary, the event appears in Command within seconds.

**URL:** [command.sigilcore.com](https://command.sigilcore.com)

---

## What You See

Command displays your **violation log** — the chronological record of every policy enforcement event for your API key:

| Column | Description |
|---|---|
| **Time** | When the event occurred (UTC) |
| **Endpoint** | The API path the agent called |
| **Chain** | The blockchain chain ID for the transaction |
| **Decision** | `DENIED`, `PENDING`, or `APPROVED` |
| **Policy rule** | The specific warranty.md rule that matched |

Events are paginated (50 per page) with cursor-based loading. Every event is tied to your API key — you only see your own enforcement data. Tenant isolation is enforced server-side; the client cannot override it.

---

## How It Relates to the Stack

Command is the human-facing surface of OEE's enforcement pipeline. When the [Open Execution Engine](/components/open-execution-engine) evaluates an intent and returns `DENIED` or `PENDING`, that decision is recorded and surfaced in Command.

For consensus holds (`PENDING`), Command is where the operator reviews and resolves the hold. This is the structural human-in-the-loop mechanism — the agent cannot proceed until the hold is explicitly approved or rejected through Command.

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

- Command is **read-only**. You cannot modify or delete violation records.
- Sessions last **24 hours**. After expiry you re-authenticate via magic link.
- If you do not see any violations, your agent has not triggered any policy denials yet. Run a test intent that breaches your warranty.md to confirm the pipeline is working end-to-end.
