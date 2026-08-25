---
title: "ELIZA"
description: "Use an @sigilcore/agent-hooks decision helper in an ElizaOS action path."
---

## Installation

```bash
npm install @sigilcore/agent-hooks
```

## Usage

```typescript
import { checkElizaAction } from '@sigilcore/agent-hooks';

HTTP note: emit typed `http` only for an explicit valid method in the intercepted action; otherwise preserve `web_fetch` and its unknown-method semantics.

const config = {
  apiKey: process.env.SIGIL_API_KEY!,
  agentId: 'my-eliza-agent',
  failMode: 'closed',
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

This is a decision helper, not automatic ElizaOS registration. The host must call
it before every governed action and must not execute when it returns a rejection.
Unwrapped actions and callers that ignore the result remain outside coverage.
The package default is fail-open for compatibility, so production integrations
must set `failMode: 'closed'` explicitly.

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
| `failMode` | `'open' \| 'closed'` | No | `'open'` | Adapter result when Sigil is unreachable; use `'closed'` for governed production paths |
| `onDenied` | `function` | No | — | Called when action is denied |
| `onPending` | `function` | No | — | Called when action is held |
| `onError` | `function` | No | — | Called on network error |
