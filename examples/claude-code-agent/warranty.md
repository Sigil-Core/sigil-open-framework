---
title: "Claude Code Agent"
description: "Warranty policy for an autonomous coding agent: blocks destructive shell commands, bounds outbound email, and requires allowlisted job types."
---

# Warranty Policy - Claude Code Agent

This `warranty.md` governs an autonomous Claude Code agent. It blocks destructive shell commands, restricts file writes outside the working directory, bounds outbound email recipients, requires a known job type, and prevents credential exfiltration.

```markdown
version: 1.0.0

## tool_calls
allowed: bash, web_fetch, file_write, email.send
bash.blocked_commands: rm -rf, rm -r /, mkfs, dd if=, shutdown, reboot
web_fetch.blocked_domains: evil.com, malware.io
file_write.blocked_paths: /etc, /root, /var, /usr, /sys, /proc, /boot, ~/.ssh, ~/.gnupg, ~/.aws
email.require_approval: true
email.allowed_recipients: *@sigilcore.com, maintainer@example.com
email.blocked_recipients: noreply@sigilcore.com

## custom
# Require every governed intent to declare the kind of coding work requested.
allow_only.intent.metadata.job_type: code_review, test_run, documentation
deny_if.intent.metadata.job_type contains test_payload

# Block git push to main/master without human approval
deny_if.intent.command contains "git push origin main"
deny_if.intent.command contains "git push origin master"
deny_if.intent.command contains "git push --force"

# Block destructive git operations
deny_if.intent.command contains "git reset --hard"
deny_if.intent.command contains "git clean -fd"

# Block credential exfiltration
deny_string: AWS_SECRET_ACCESS_KEY
deny_string: ANTHROPIC_API_KEY
deny_string: OPENAI_API_KEY
deny_string: GITHUB_TOKEN
deny_string: BEGIN RSA PRIVATE KEY
deny_string: BEGIN OPENSSH PRIVATE KEY

# Block writes outside the project directory
deny_if.intent.path starts_with "/etc"
deny_if.intent.path starts_with "/root"
deny_if.intent.path starts_with "/var"
deny_if.intent.path contains ".ssh"
deny_if.intent.path contains ".env"

## soft_limits
daily_tool_calls: 1000

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
