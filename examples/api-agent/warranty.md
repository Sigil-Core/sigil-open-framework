---
title: "API Integration Agent"
description: "Warranty policy for an autonomous API agent: restricts requests to allowlisted hosts and methods, denies listed private-network hostnames as defense in depth, bounds email recipients, and requires a declared job type. Built for LangChain/ELIZA pipelines."
---

# Warranty Policy - API Integration Agent

Copy the policy body below into Sigil Warrant, sign it, and deploy it with the API key used by this agent.

```markdown
version: 2.0.0

## tool_calls
# bash commands are governed only by the listed blocked substrings below;
# remove bash from `allowed` if the deployment does not need a shell.
allowed: bash, http, email.send
bash.blocked_commands: rm -rf, curl -X DELETE, wget --delete-after
# The allowlist is the control: only these methods and hosts are authorized,
# and both checks fail closed. Replace the placeholder hosts with the real
# partner API hosts this agent calls.
http.allowed_methods: GET, POST
http.allowed_hosts: api.partner.example.com, data.vendor.example.com
# Defense in depth: denies listed hostnames if an allowlisted entry is ever
# widened to a wildcard. The allowlist above already excludes these hosts.
web_fetch.blocked_domains: localhost, 127.0.0.1, 0.0.0.0, 169.254.169.254, metadata.google.internal
email.require_approval: true
email.allowed_recipients: *@sigilcore.com, partner@example.com
email.blocked_recipients: noreply@sigilcore.com

## custom
# Every governed intent must declare an approved job type. Fails closed on a
# missing job_type; the value is agent-declared unless intents arrive through
# a trusted shim.
allow_only.intent.metadata.job_type: research, data_labeling, escrow_release
deny_if.intent.metadata.job_type contains test

# Denies listed credential strings anywhere in the intent. Case-sensitive
# substring matching: defense in depth, not a secrets control.
deny_string: "OPENAI_API_KEY"
deny_string: "ANTHROPIC_API_KEY"
deny_string: "STRIPE_SECRET_KEY"
deny_string: "DATABASE_URL"
deny_string: "BEGIN RSA PRIVATE KEY"

# Denies intent URLs that start with the literal lowercase "http://",
# steering traffic to https. Case-sensitive prefix match.
deny_if.intent.url starts_with "http://"

# Denies the listed SQL substring in bash command strings. Case-sensitive, so
# both casings are listed; other casings and split forms are not matched.
deny_if.intent.command contains "SELECT * FROM"
deny_if.intent.command contains "select * from"

## soft_limits
daily_tool_calls: 500

## execution_limits
max_tool_calls_per_task: 200

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
