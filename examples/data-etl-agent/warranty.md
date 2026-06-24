---
title: "Data ETL Agent"
description: "Warranty policy for a data pipeline agent: blocks destructive SQL and shell, restricts file writes to safe paths, blocks SSRF and mass exfiltration, and requires allowlisted job types."
---

# Warranty Policy - Data ETL Agent

Copy the policy body below into Sigil Warrant, sign it, and deploy it with the API key used by this agent.

```markdown
version: 1.0.0

## tool_calls
allowed: bash, web_fetch, file_write
bash.blocked_commands: rm -rf, rm -r /, DROP TABLE, DELETE FROM, TRUNCATE, mkfs, dd if=
web_fetch.blocked_domains: localhost, 127.0.0.1, 0.0.0.0, 169.254.169.254, metadata.google.internal
file_write.blocked_paths: /etc, /root, /var, /usr, /sys, /proc, /boot, ~/.ssh, ~/.gnupg, ~/.aws

## custom
# Require every governed intent to declare an approved pipeline stage.
allow_only.intent.metadata.job_type: extract, transform, load
deny_if.intent.metadata.job_type contains test

# Block destructive SQL and shell passed through bash
deny_if.intent.command contains "DROP TABLE"
deny_if.intent.command contains "DELETE FROM"
deny_if.intent.command contains "TRUNCATE"
deny_if.intent.command contains "rm -rf"

# Block writes outside safe data directories
deny_if.intent.path starts_with "/etc"
deny_if.intent.path starts_with "/root"
deny_if.intent.path starts_with "/var"
deny_if.intent.path contains ".ssh"
deny_if.intent.path contains ".env"

# Block requests to internal/private networks (SSRF)
deny_if.intent.url contains "169.254.169.254"
deny_if.intent.url contains "metadata.google.internal"
deny_if.intent.url contains "localhost"
deny_if.intent.url contains "127.0.0.1"

# Block mass exfiltration and credential strings
deny_if.intent.command contains "SELECT * FROM"
deny_string: "AWS_SECRET_ACCESS_KEY"
deny_string: "DATABASE_URL"
deny_string: "OPENAI_API_KEY"
deny_string: "BEGIN RSA PRIVATE KEY"

## soft_limits
daily_tool_calls: 5000

## execution_limits
max_tool_calls_per_task: 1000
max_tool_calls_per_hour: 5000

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
