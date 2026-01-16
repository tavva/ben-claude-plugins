---
name: resend-cli
description: This skill should be used when the user asks to "send an email", "send email via Resend", "list emails", "check email status", "cancel scheduled email", "manage domains", "add domain", "verify domain DNS", "create API key", "list API keys", "manage templates", "create email template", or mentions Resend, transactional email, or email delivery. Also triggers on requests to configure Resend, check domain verification, or manage email infrastructure.
---

# Resend CLI (`resend`)

Command-line interface for the Resend email platform. Send transactional emails, manage domains, API keys, and templates.

## Quick Reference

```
resend config setup              # Interactive configuration
resend config show               # Show current config
resend emails send [OPTIONS]     # Send an email
resend emails list               # List recent emails
resend emails get <ID>           # Get email details
resend emails cancel <ID>        # Cancel scheduled email
resend emails update <ID>        # Update scheduled email
resend domains create <DOMAIN>   # Add a domain
resend domains list              # List all domains
resend domains get <ID>          # Get domain details (includes DNS records)
resend domains verify <ID>       # Trigger DNS verification
resend domains update <ID>       # Update domain settings
resend domains delete <ID>       # Remove a domain
resend api-keys create <NAME>    # Create an API key
resend api-keys list             # List API keys
resend api-keys delete <ID>      # Delete an API key
resend templates create <NAME>   # Create a template
resend templates list            # List templates
resend templates get <ID>        # Get template details
resend templates update <ID>     # Update a template
resend templates delete <ID>     # Delete a template
```

## Common Tasks

### Send a Simple Email

```bash
resend emails send \
  --from "sender@yourdomain.com" \
  --to "recipient@example.com" \
  --subject "Hello" \
  --text "Plain text body"
```

### Send HTML Email

```bash
resend emails send \
  --from "sender@yourdomain.com" \
  --to "recipient@example.com" \
  --subject "Newsletter" \
  --html "<h1>Welcome</h1><p>Thanks for subscribing!</p>"
```

### Send to Multiple Recipients

```bash
resend emails send \
  --from "sender@yourdomain.com" \
  --to "alice@example.com" \
  --to "bob@example.com" \
  --cc "manager@example.com" \
  --subject "Team Update" \
  --text "Weekly sync notes..."
```

### Schedule an Email

```bash
resend emails send \
  --from "sender@yourdomain.com" \
  --to "recipient@example.com" \
  --subject "Reminder" \
  --text "Don't forget!" \
  --scheduled-at "2025-01-20T09:00:00Z"
```

### Check Email Status

```bash
# List recent emails
resend emails list

# Get details of specific email
resend emails get <email-id>
```

### Cancel a Scheduled Email

```bash
resend emails cancel <email-id>
```

### Add and Verify a Domain

```bash
# Add domain
resend domains create example.com

# Add domain in specific region
resend domains create example.com --region eu-west-1

# Get DNS records to configure
resend domains get <domain-id>

# Trigger verification after configuring DNS
resend domains verify <domain-id>
```

### Configure Domain Tracking

```bash
resend domains update <domain-id> --open-tracking true --click-tracking true
```

### Manage API Keys

```bash
# Create a new API key
resend api-keys create "My CLI Key"

# Create with restricted permissions
resend api-keys create "Sending Only" --permission sending_access

# Create restricted to specific domain
resend api-keys create "Domain Key" --domain-id <domain-id>

# List all API keys
resend api-keys list

# Delete an API key
resend api-keys delete <key-id>
```

### Create and Use Templates

```bash
# Create a template
resend templates create "Welcome Email" \
  --subject "Welcome to {{company}}!" \
  --html "<h1>Welcome, {{name}}!</h1>"

# List templates
resend templates list

# Get template details
resend templates get <template-id>

# Update a template
resend templates update <template-id> --subject "New Subject"

# Delete a template
resend templates delete <template-id>
```

## Output Formats

All list commands support output format selection:

```bash
resend emails list              # Default table format
resend emails list --json       # JSON output
resend domains list --json --output domains.json  # Save to file
```

## Configuration

The CLI uses profile-based configuration. Credentials resolve in order:
1. Environment variables (`RESEND_API_KEY`, `RESEND_PROFILE`)
2. Config file profile (`~/.config/resend/config.yml`)

### Setup Profile

```bash
resend config setup
```

### Use Specific Profile

```bash
resend emails list --profile production
```

### Config File Structure

```yaml
profiles:
  default:
    api_key: re_123456789
  production:
    api_key: re_prod_key
```

## Additional Resources

For complete CLI documentation including all options:

- **`references/cli-reference.md`** - Full command reference with all flags
