---
title: "MCP Server Agent"
description: "Warranty policy for an agent that calls external tools through MCP servers: blocks destructive shell, blocks SSRF, bounds email recipients, and requires allowlisted job types."
---

# Warranty Policy - MCP Server Agent

Copy the policy body below into Sigil Warrant, sign it, and deploy it with the API key used by this agent.

```markdown
version: 1.0.0

## tool_calls
allowed: bash, web_fetch, email.send
bash.blocked_commands: rm -rf, rm -r /, mkfs, dd if=, shutdown, reboot, curl -X DELETE
web_fetch.blocked_domains: localhost, 127.0.0.1, 0.0.0.0, 169.254.169.254, metadata.google.internal
email.require_approval: true
email.allowed_recipients: *@sigilcore.com, partner@example.com
email.blocked_recipients: noreply@sigilcore.com

## custom
# Require every governed intent to declare an approved job type.
allow_only.intent.metadata.job_type: tool_call, data_sync, notify
deny_if.intent.metadata.job_type contains test

# Block requests to internal/private networks (SSRF)
deny_if.intent.url contains "localhost"
deny_if.intent.url contains "127.0.0.1"
deny_if.intent.url contains "192.168."
deny_if.intent.url contains "10.0."
deny_if.intent.url starts_with "http://"

# Block SSRF attempts via cloud metadata endpoints
deny_if.intent.url contains "169.254.169.254"
deny_if.intent.url contains "metadata.google.internal"

# Block destructive shell passed through an MCP tool
deny_if.intent.command contains "rm -rf"
deny_if.intent.command contains "DROP TABLE"

# Block credential leakage in request bodies
deny_string: "OPENAI_API_KEY"
deny_string: "ANTHROPIC_API_KEY"
deny_string: "AWS_SECRET_ACCESS_KEY"
deny_string: "DATABASE_URL"
deny_string: "BEGIN RSA PRIVATE KEY"

## soft_limits
daily_tool_calls: 500

## execution_limits
max_tool_calls_per_task: 100
max_tool_calls_per_hour: 1000

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
