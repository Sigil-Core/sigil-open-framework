# Google Ads Bid Manager

**Status:** Pending Phase 2 aggregate enforcement and Phase 3 MCP taxonomy/provenance.

## Required policy behavior

- Permit bid and budget adjustments for approved customer and campaign identifiers.
- Enforce a daily USD aggregate cap over approved adjustments.
- Deny campaign creation, pause, deletion, audience export, and account mutation.
- Require trusted-shim provenance for account, campaign, and amount projections.
- Keep `bash` outside the allowed tool surface.

## Required vector cases

1. An approved bid adjustment inside the daily cap returns `APPROVED`.
2. An unapproved account or campaign returns `DENIED`.
3. Campaign create, pause, and delete tools return `DENIED`.
4. An audience export tool returns `DENIED`.
5. An account mutation tool returns `DENIED`.
6. The action that exceeds the daily USD cap returns `DENIED` and does not execute.
7. Missing trusted provenance or a missing amount projection fails closed.

## Tool identity gate

The current design uses `mcp.google-ads.update_bid` as the illustrative action. Before promotion, capture the installed connector's real `serverId`, tool names, and argument schema. Pin the vector to those observed values rather than an inferred name.
