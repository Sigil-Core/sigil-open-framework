# Meta Ads Budget Operator

**Status:** Pending Phase 2 aggregate enforcement and Phase 3 MCP taxonomy/provenance.

## Required policy behavior

- Permit budget adjustments only for approved ad accounts and campaign identifiers.
- Enforce a daily USD aggregate cap and a per-action approval threshold.
- Deny campaign creation, pause, deletion, audience mutation, and audience export.
- Require trusted-shim provenance for account, campaign, and amount projections.
- Keep `bash` outside the allowed tool surface.

## Required vector cases

1. A small budget adjustment inside both boundaries returns `APPROVED`.
2. An adjustment above the approval threshold returns `PENDING`.
3. An unapproved account or campaign returns `DENIED`.
4. A campaign or audience mutation tool returns `DENIED`.
5. An audience export tool returns `DENIED`.
6. The action that exceeds the daily USD cap returns `DENIED`.

## Tool identity gate

Do not publish an action name until connector discovery captures the real Meta Ads MCP `serverId`, tool names, and argument schema. The promoted vector must use observed connector metadata.
