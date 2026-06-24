---
title: "Customer Support Agent"
description: "Warranty policy for an agent that answers tickets: holds email for approval, bounds recipients to customer and support domains, blocks PII exfiltration, and requires allowlisted job types."
---

# Warranty Policy - Customer Support Agent

Copy the policy body below into Sigil Warrant, sign it, and deploy it with the API key used by this agent.

```markdown
version: 1.0.0

## tool_calls
allowed: web_fetch, email.send
web_fetch.blocked_domains: localhost, 127.0.0.1, 0.0.0.0, 169.254.169.254, metadata.google.internal
email.require_approval: true
email.allowed_recipients: *@customers.example.com, support@sigilcore.com
email.blocked_recipients: all-staff@sigilcore.com, everyone@sigilcore.com, internal@sigilcore.com

## custom
# Require every governed intent to declare an approved support job type.
allow_only.intent.metadata.job_type: ticket_reply, status_update, refund_request
deny_if.intent.metadata.job_type contains test

# Refunds must route to a human, never auto-execute from a ticket reply
deny_if.intent.command contains "issue_refund"
deny_if.intent.metadata.action equals "refund"

# Block PII exfiltration in outbound bodies (literal markers)
deny_string: "BEGIN"
deny_string: "Social Security Number"
deny_string: "SSN:"
deny_string: "card number"
deny_string: "SELECT * FROM customers"
deny_string: "SELECT * FROM accounts"

# Block mass-send (one ticket, one recipient)
deny_if.intent.metadata.recipient_count contains "100"
deny_if.intent.metadata.broadcast equals "true"

## soft_limits
daily_tool_calls: 300

## execution_limits
max_tool_calls_per_task: 20
max_tool_calls_per_hour: 400

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
