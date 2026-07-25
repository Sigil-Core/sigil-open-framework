---
title: "Customer Support Agent"
description: "Warranty policy for an agent that answers tickets: holds every outbound reply for human approval and restricts recipients to customer and support domains, denies listed PII marker strings (case-sensitive substrings) as defense in depth, and requires a declared job type."
---

# Warranty Policy - Customer Support Agent

Copy the policy body below into Sigil Warrant, sign it, and deploy it with the API key used by this agent.

```markdown
version: 2.1.0

## tool_calls
allowed: web_fetch, email.send
web_fetch.blocked_domains: localhost, 127.0.0.1, 0.0.0.0, 169.254.169.254, metadata.google.internal
# The primary control: every outbound reply is held for human approval, and
# recipient rules fail closed — a send with no `to` is denied, and recipients
# outside the allowlist below are denied.
email.require_approval: true
email.allowed_recipients: *@customers.example.com, support@sigilcore.com
email.blocked_recipients: all-staff@sigilcore.com, everyone@sigilcore.com, internal@sigilcore.com

## custom
# Every governed intent must declare an approved support job type. Fails closed
# on a missing job_type; the value is agent-declared unless intents arrive
# through a trusted shim.
allow_only.intent.metadata.job_type: ticket_reply, status_update, refund_request
deny_if.intent.metadata.job_type contains test

# Refund requests are an allowed job type above; execution is denied here, so a
# refund reaches a human only through the email approval hold, never
# auto-executed from a ticket reply.
deny_if.intent.command contains "issue_refund"
deny_if.intent.metadata.action equals "refund"

# Denies listed PII marker strings anywhere in the intent. Case-sensitive
# substring matching, so both casings are listed: defense in depth, not a PII
# control.
deny_string: "Social Security Number"
deny_string: "social security number"
deny_string: "SSN:"
deny_string: "ssn:"
deny_string: "card number"
deny_string: "SELECT * FROM customers"
deny_string: "select * from customers"
deny_string: "SELECT * FROM accounts"
deny_string: "select * from accounts"

# Denies sends the agent labels as broadcasts (one ticket, one recipient).
deny_if.intent.metadata.broadcast equals "true"

## soft_limits
# Enforced across all governed tool calls: exceeding this limit returns DENIED;
# the day bucket resets at 00:00 UTC.
daily_tool_calls: 300

## execution_limits
max_tool_calls_per_task: 20
max_tool_calls_per_hour: 400

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
