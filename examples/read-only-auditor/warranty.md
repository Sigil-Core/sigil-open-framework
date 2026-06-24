---
title: "Read-Only Auditor Agent"
description: "Warranty policy for a strictly read-only agent: web_fetch only, no shell or file writes, blocks any write or mutate intent, blocks SSRF, and requires allowlisted job types."
---

# Warranty Policy - Read-Only Auditor Agent

Copy the policy body below into Sigil Warrant, sign it, and deploy it with the API key used by this agent.

```markdown
version: 1.0.0

## tool_calls
allowed: web_fetch
web_fetch.blocked_domains: localhost, 127.0.0.1, 0.0.0.0, 169.254.169.254, metadata.google.internal

## custom
# Require every governed intent to declare an approved read-only job type.
allow_only.intent.metadata.job_type: audit, report, scan
deny_if.intent.metadata.job_type contains test

# Deny any write or mutate operation
deny_if.intent.command contains "DROP"
deny_if.intent.command contains "INSERT"
deny_if.intent.command contains "UPDATE"
deny_if.intent.command contains "DELETE"
deny_if.intent.command contains "TRUNCATE"
deny_if.intent.command contains "rm "

# Block requests to internal/private networks (SSRF)
deny_if.intent.url contains "169.254.169.254"
deny_if.intent.url contains "metadata.google.internal"
deny_if.intent.url contains "localhost"
deny_if.intent.url contains "127.0.0.1"
deny_if.intent.url starts_with "http://"

# Block secret exfiltration
deny_string: "AWS_SECRET_ACCESS_KEY"
deny_string: "DATABASE_URL"
deny_string: "OPENAI_API_KEY"
deny_string: "BEGIN RSA PRIVATE KEY"

## soft_limits
daily_tool_calls: 200

## execution_limits
max_tool_calls_per_task: 25
max_tool_calls_per_hour: 200

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
