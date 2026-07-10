---
title: "OpenClaw"
description: "Gate OpenClaw tool calls against a signed Sigil policy before execution."
---

## Adapter status

OpenClaw is covered by the `createOpenclawSigilHandler` export. The handler
submits the action at the host execution boundary and blocks on a `DENIED`
decision.

For web-capable tools, the handler emits a typed `http` intent only when the
tool input explicitly supplies a valid HTTP method. It never infers `GET`.
Without an explicit method it preserves the legacy `web_fetch` action, whose
method is unknown and therefore cannot satisfy a non-empty HTTP method allowlist.

## Policy note

Use `http.allowed_methods`, `http.blocked_methods`, and `http.allowed_hosts` for
typed requests. Sign derives `host`, `path`, and `query` from the submitted URL;
client-supplied derived fields are not trusted.
