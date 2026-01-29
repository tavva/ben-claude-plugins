---
name: sprite-cli
description: This skill should be used when the user asks to "create a sprite", "run in sprite", "execute in sprite", "sprite exec", "open sprite console", "list sprites", "destroy sprite", "create checkpoint", "restore checkpoint", "proxy through sprite", or mentions Sprite, isolated environments, or persistent microVMs. Also triggers on requests to manage sprite authentication, checkpoints, or port forwarding.
---

# Sprite CLI (`sprite`)

Command-line interface for Sprites - persistent, hardware-isolated Linux microVMs for safe code execution. Sprites maintain filesystem and memory between runs, wake instantly from hibernation, and charge per-second of compute.

## Quick Reference

```
sprite login                     # Authenticate with Fly.io
sprite logout                    # Remove configuration
sprite create [name]             # Create a new sprite
sprite use <name>                # Activate sprite for current directory
sprite use --unset               # Remove sprite association
sprite list                      # List all sprites (alias: ls)
sprite destroy [-f] <name>       # Remove a sprite
sprite exec <command>            # Run command in sprite (alias: x)
sprite exec -file src:dst <cmd>  # Upload file before execution
sprite console                   # Open interactive shell (alias: c)
sprite checkpoint create [-c]    # Save current state
sprite checkpoint list           # List checkpoints (alias: ls)
sprite checkpoint info <id>      # Show checkpoint details
sprite checkpoint delete <id>    # Remove checkpoint (alias: rm)
sprite restore [version-id]      # Restore from checkpoint
sprite proxy <port>              # Forward local port to sprite
sprite url update --auth <type>  # Set URL access (public/default)
sprite api <path> [curl-opts]    # Make authenticated API calls
sprite upgrade                   # Update CLI to latest version
```

## Global Options

Available with any command:

- `--debug[=<file>]` - Enable debug logging
- `-o, --org <name>` - Specify organization
- `-s, --sprite <name>` - Specify sprite
- `-h, --help` - Display help

## Common Tasks

### Create and Use a Sprite

```bash
# Create a new sprite
sprite create my-dev-env

# Activate sprite for current directory (creates .sprite file)
sprite use my-dev-env

# Now commands run in this sprite context
sprite exec npm install
```

### Execute Commands

```bash
# Run a single command
sprite exec ls -la

# Short alias
sprite x python script.py

# With environment variables
sprite exec -e API_KEY=secret ./run.sh

# Upload a file before execution (source:dest format)
sprite exec -file ./local-file.txt:/tmp/local-file.txt cat /tmp/local-file.txt

# Run with TTY (for interactive commands)
sprite exec -t vim file.txt
```

### Interactive Shell

```bash
# Open shell (auto-detects bash/zsh/fish/tcsh/ksh)
sprite console

# Short alias
sprite c
```

### Checkpoint Management

```bash
# Save current state with comment
sprite checkpoint create -c "Before risky changes"

# List all checkpoints
sprite checkpoint list

# View checkpoint details
sprite checkpoint info <version-id>

# Restore to a checkpoint
sprite restore <version-id>

# Delete a checkpoint
sprite checkpoint delete <version-id>
```

### Port Forwarding

```bash
# Forward local port 3000 to sprite port 3000
sprite proxy 3000

# Forward local 8080 to sprite 3000
sprite proxy 8080:3000

# Multiple ports
sprite proxy 3000 5432 6379
```

### URL Access Control

```bash
# Make sprite publicly accessible
sprite url update --auth public

# Require authentication (default)
sprite url update --auth default
```

## Authentication

### Initial Setup

```bash
# Interactive login via Fly.io
sprite login

# Or with pre-generated token
sprite auth setup --token <token>
```

### Organization Management

```bash
# List configured tokens
sprite org list

# Add API token to organization
sprite org auth

# Remove all tokens
sprite org logout

# Toggle keyring storage
sprite org keyring enable
sprite org keyring disable
```

## Configuration

- **Global config**: `~/.sprites/sprites.json`
- **Local context**: `.sprite` file in project directory

The `.sprite` file stores organization and sprite selection, similar to `.nvmrc` or `.python-version`.

## Exit Codes

- **0** - Success
- **1** - General error
- **2** - Command not found
- **126** - Command cannot execute
- **127+** - Command/signal termination

## Additional Resources

For complete CLI documentation including all options:

- **`references/cli-reference.md`** - Full command reference with all flags
