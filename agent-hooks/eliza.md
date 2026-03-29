---
title: "ELIZA"
description: "Use @sigilcore/agent-hooks with ElizaOS to gate agent actions before execution."
---

## Installation

```bash
npm install @sigilcore/agent-hooks
```

## Usage

```typescript
import { checkElizaAction } from '@sigilcore/agent-hooks';

const config = {
  apiKey: process.env.SIGIL_API_KEY!,
  agentId: 'my-eliza-agent',
};

// Before any ELIZA action:
const blocked = await checkElizaAction(
  { name: 'SEND_TOKEN', params: { to: '0x...', amount: '1.0' } },
  config
);

if (blocked) {
  console.error('Blocked by Sigil:', blocked.rejection);
  return;
}
// Action is approved — proceed
```

## How It Works

`checkElizaAction` maps the ELIZA action name to a Sigil action type (lowercased), submits it to `/v1/authorize`, and returns `null` on approval or a rejection object on denial or hold.

```typescript
// Returns null if approved
// Returns { blocked: true, rejection: SigilRejectionContext } if denied or pending
```

## Configuration

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `apiKey` | `string` | Yes | — | Sigil API key (`sk_sigil_...`) |
| `apiUrl` | `string` | No | `https://sign.sigilcore.com` | Sigil Sign endpoint |
| `agentId` | `string` | No | `'agent'` | Agent identifier |
| `onDenied` | `function` | No | — | Called when action is denied |
| `onPending` | `function` | No | — | Called when action is held |
| `onError` | `function` | No | — | Called on network error |
