---
title: "Data ETL Agent"
description: "Warranty policy for a data pipeline agent: denies listed destructive SQL and shell strings (case-sensitive substrings), denies file writes to listed sensitive paths, denies listed private-network hostnames, and requires a declared pipeline stage."
---

# Warranty Policy - Data ETL Agent

Copy the policy body below into Sigil Warrant, sign it, and deploy it with the API key used by this agent.

```markdown
version: 1.0.0

## tool_calls
# bash commands are governed only by the listed blocked substrings below;
# remove bash from `allowed` if the deployment does not need a shell.
allowed: bash, web_fetch, file_write
# Case-sensitive substring matching over the command string, so both casings
# of each SQL form are listed; other casings and split forms are not matched.
bash.blocked_commands: rm -rf, rm -r /, DROP TABLE, drop table, DELETE FROM, delete from, TRUNCATE, truncate, mkfs, dd if=
web_fetch.blocked_domains: localhost, 127.0.0.1, 0.0.0.0, 169.254.169.254, metadata.google.internal
# Raw startsWith matching on the supplied path. The tilde entries match only
# literal `~` paths; the custom `contains` rules below backstop the expanded
# home-directory forms. A file_write intent with no path is denied.
file_write.blocked_paths: /etc, /root, /var, /usr, /sys, /proc, /boot, ~/.ssh, ~/.gnupg, ~/.aws

## custom
# Every governed intent must declare an approved pipeline stage. Fails closed
# on a missing job_type; the value is agent-declared unless intents arrive
# through a trusted shim.
allow_only.intent.metadata.job_type: extract, transform, load
deny_if.intent.metadata.job_type contains test

# Denies listed destructive SQL and shell substrings in bash command strings.
# Case-sensitive, so both casings are listed.
deny_if.intent.command contains "DROP TABLE"
deny_if.intent.command contains "drop table"
deny_if.intent.command contains "DELETE FROM"
deny_if.intent.command contains "delete from"
deny_if.intent.command contains "TRUNCATE"
deny_if.intent.command contains "truncate"
deny_if.intent.command contains "rm -rf"

# Denies writes to listed sensitive path substrings, including the expanded
# home-directory forms the tilde entries above cannot match.
deny_if.intent.path starts_with "/etc"
deny_if.intent.path starts_with "/root"
deny_if.intent.path starts_with "/var"
deny_if.intent.path contains ".ssh"
deny_if.intent.path contains ".env"
deny_if.intent.path contains ".aws"
deny_if.intent.path contains ".gnupg"

# Denies listed private-network and metadata hostnames in intent URLs.
deny_if.intent.url contains "169.254.169.254"
deny_if.intent.url contains "metadata.google.internal"
deny_if.intent.url contains "localhost"
deny_if.intent.url contains "127.0.0.1"

# Denies the listed SQL substring and credential strings anywhere in the
# intent. Case-sensitive substring matching: defense in depth, not a control.
deny_if.intent.command contains "SELECT * FROM"
deny_if.intent.command contains "select * from"
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
