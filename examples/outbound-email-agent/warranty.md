---
title: "Outbound Email Agent"
description: "Warranty policy for an SDR-style outreach agent: holds every send for human approval, forces a recipient on every send intent, denies internal broadcast lists, requires a declared campaign and job type, and caps daily send volume per campaign."
---

# Warranty Policy - Outbound Email Agent

This policy governs an agent that drafts and sends outreach email through a provider API (Resend, SendGrid, Gmail API) and reads prospect data from a CRM. Outreach recipients are unknown in advance, so this policy does not use a recipient allowlist. Its controls are the ones the evaluator enforces fail-closed: every send is held for human approval, every send intent must carry a recipient, listed internal broadcast addresses are denied, every intent must declare an approved job type and a campaign, and per-campaign daily volume is capped. Suppression lists, unsubscribe handling, and CAN-SPAM/GDPR mechanics live in your email provider; this policy does not replace them. `job_type` and `campaign` are declared by the agent unless your deployment submits intents through a trusted shim. Replace the example hosts and addresses, then copy the policy body into Sigil Warrant and sign it.

```markdown
version: 2.0.0

## tool_calls
allowed: http, email.send
# CRM and enrichment reads only: GET to the allowlisted host, nothing else.
http.allowed_methods: GET
http.allowed_hosts: api.crm.example.com

# Every send is held for human approval. Remove this line only after the
# recipient, campaign, and volume controls below have run clean in production.
email.require_approval: true

# Declaring recipient rules makes a missing `to` fail closed: a send intent
# with no recipient is denied, not approved.
email.blocked_recipients: all-staff@yourcompany.example.com, everyone@yourcompany.example.com, *@internal.yourcompany.example.com

## custom
# The agent must declare an approved outreach job type. Declared, not
# independently verified, unless intents arrive via a trusted shim.
allow_only.intent.metadata.job_type: prospect_outreach, follow_up, reply_draft
deny_if.intent.metadata.job_type contains test

# One prospect per send. Broadcasts belong in your ESP with its own controls.
deny_if.intent.metadata.broadcast equals "true"

# Deny listed credential strings anywhere in the intent. Case-sensitive
# substring matching: defense in depth, not a secrets control.
deny_string: "OPENAI_API_KEY"
deny_string: "ANTHROPIC_API_KEY"
deny_string: "RESEND_API_KEY"
deny_string: "SENDGRID_API_KEY"
deny_string: "BEGIN RSA PRIVATE KEY"
deny_string: "api_key="

## soft_limits
daily_tool_calls: 300

# Per-campaign daily send cap. group_by fails closed: a send intent without
# metadata.campaign is denied, which forces campaign labeling on every send.
cap.outbound_sends.max_count: 150
cap.outbound_sends.window: day
cap.outbound_sends.action: email.send
cap.outbound_sends.group_by: metadata.campaign

## execution_limits
max_tool_calls_per_task: 15
max_tool_calls_per_hour: 100

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
