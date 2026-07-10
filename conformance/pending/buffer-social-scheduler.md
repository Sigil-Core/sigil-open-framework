# Buffer Social Scheduler

**Status:** Pending Phase 2 count caps and Phase 3 MCP taxonomy/provenance.

This is the regression case that exposed the closed MCP action vocabulary. The current proxy submits a generic `tool_call`, which Sigil Sign denies in ENFORCE mode. Phase 3 replaces that value with `mcp.<serverId>.<toolName>`.

## Required policy behavior

- Require an approval hold before a Buffer post is created.
- Enforce separate daily caps for LinkedIn and X.
- Deny the N+1 post for each channel.
- Deny delete and destructive account-management tools.
- Require trusted-shim provenance for channel and profile identifiers.

## Required vector cases

1. `mcp.<serverId>.<toolName>` for an approved profile returns `PENDING` until approved.
2. The approved post consumes the correct channel counter only after approval.
3. The N+1 post for LinkedIn and X returns `DENIED`.
4. An unapproved profile or channel returns `DENIED`.
5. A delete tool returns `DENIED`.
6. Missing trusted provenance fails closed.

## Tool identity gate

`mcp.buffer.create_post` is illustrative pending connector discovery, not a definitive tool identity. Before promotion, capture the Buffer MCP server's real `serverId`, tool names, and argument schema from the installed connector and replace every placeholder with those observed values.
