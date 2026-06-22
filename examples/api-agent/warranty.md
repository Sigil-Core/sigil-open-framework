---
title: "API Integration Agent"
description: "Warranty policy for an autonomous API agent: blocks SSRF, bounds email recipients, and requires allowlisted job types. Built for LangChain/ELIZA pipelines."
---

# Warranty Policy - API Integration Agent

Copy the policy body below into Sigil Warrant, sign it, and deploy it with the API key used by this agent.

```markdown
version: 1.0.0

## tool_calls
allowed: bash, web_fetch, email.send
bash.blocked_commands: rm -rf, curl -X DELETE, wget --delete-after
web_fetch.blocked_domains: localhost, 127.0.0.1, 0.0.0.0, 169.254.169.254, metadata.google.internal
email.require_approval: true
email.allowed_recipients: *@sigilcore.com, partner@example.com
email.blocked_recipients: noreply@sigilcore.com

## custom
# AWP-style allowlist: every governed intent must carry an approved job type.
allow_only.intent.metadata.job_type: research, data_labeling, escrow_release
deny_if.intent.metadata.job_type contains test

# Block any request to internal/private networks
deny_if.intent.url contains "localhost"
deny_if.intent.url contains "127.0.0.1"
deny_if.intent.url contains "192.168."
deny_if.intent.url contains "10.0."
deny_if.intent.url starts_with "http://"

# Block SSRF attempts via cloud metadata endpoints
deny_if.intent.url contains "169.254.169.254"
deny_if.intent.url contains "metadata.google.internal"

# Block credential leakage in request bodies
deny_string: "OPENAI_API_KEY"
deny_string: "ANTHROPIC_API_KEY"
deny_string: "STRIPE_SECRET_KEY"
deny_string: "DATABASE_URL"
deny_string: "BEGIN RSA PRIVATE KEY"

# Block mass data exfiltration patterns
deny_if.intent.metadata.record_count contains "1000"
deny_if.intent.command contains "SELECT * FROM"

## soft_limits
daily_tool_calls: 500

## execution_limits
max_tool_calls_per_task: 200

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
