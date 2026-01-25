---
name: langfuse-cli
description: This skill should be used when the user asks to "query Langfuse traces", "show sessions", "check LLM costs", "analyse token usage", "view observations", "get scores", "create score", "add score to trace", "query metrics", or mentions Langfuse, traces, or LLM observability. Also triggers on requests to analyse API latency, debug LLM calls, or investigate model performance. Use for prompt management tasks like "list prompts", "get prompt", "create prompt", "update prompt labels", or "deploy prompt to production". Use for dataset management tasks like "list datasets", "create dataset", "add dataset item", "view dataset runs", or "manage evaluation datasets".
---

# Langfuse CLI (`lf`)

Command-line interface for the Langfuse LLM observability platform. Query traces, sessions, observations, scores, and metrics. Manage prompts with versioning and labels. Manage datasets for evaluation.

## Quick Reference

```
lf traces list [OPTIONS]       # List traces with filters
lf traces get <ID>             # Get specific trace (--with-observations)
lf sessions list [OPTIONS]     # List sessions
lf sessions show <ID>          # Show session details (--with-traces)
lf observations list [OPTIONS] # List observations (spans/generations/events)
lf observations get <ID>       # Get specific observation
lf scores list [OPTIONS]       # List scores
lf scores get <ID>             # Get specific score
lf scores create [OPTIONS]     # Create a new score
lf metrics query [OPTIONS]     # Query aggregated metrics
lf prompts list [OPTIONS]      # List prompts
lf prompts get <NAME>          # Get prompt (by label or version)
lf prompts create-text         # Create text prompt (-m for commit message)
lf prompts create-chat         # Create chat prompt (-m for commit message)
lf prompts label <NAME> <VER>  # Set labels on prompt version
lf prompts delete <NAME>       # Delete prompt
lf datasets list [OPTIONS]     # List datasets
lf datasets get <NAME>         # Get dataset by name
lf datasets create <NAME>      # Create a new dataset
lf datasets items [OPTIONS]    # List dataset items (--dataset to filter)
lf datasets item-get <ID>      # Get dataset item by ID
lf datasets item-create        # Create dataset item (--dataset, --input required)
lf datasets runs <DATASET>     # List runs for a dataset
lf datasets run-get <DS> <RUN> # Get a specific run
```

## Common Tasks

### View Recent Traces

```bash
lf traces list --limit 20
```

### Filter Traces by Time

```bash
# Today's traces
lf traces list --from "$(date -u +%Y-%m-%dT00:00:00Z)"

# Last 24 hours
lf traces list --from "$(date -u -v-1d +%Y-%m-%dT%H:%M:%SZ)"

# Specific date range
lf traces list --from 2024-01-15T00:00:00Z --to 2024-01-16T00:00:00Z
```

### Filter by User or Session

```bash
lf traces list --user-id user123
lf traces list --session-id sess456
lf traces list --name "chat-completion"
lf traces list --tags production --tags v2
```

### Analyse Costs

```bash
# Total cost over time
lf metrics query --view traces --measure total-cost --aggregation sum --granularity day

# Cost by model
lf metrics query --view observations --measure total-cost --aggregation sum --dimensions model

# Average cost per trace
lf metrics query --view traces --measure total-cost --aggregation avg
```

### Analyse Latency

```bash
# P95 latency
lf metrics query --view traces --measure latency --aggregation p95

# Latency by trace name
lf metrics query --view traces --measure latency --aggregation avg --dimensions traceName

# Latency trends
lf metrics query --view traces --measure latency --aggregation p50 --granularity hour
```

### Token Usage

```bash
# Total tokens
lf metrics query --view observations --measure total-tokens --aggregation sum

# Tokens by model
lf metrics query --view observations --measure total-tokens --aggregation sum --dimensions model

# Input vs output tokens
lf metrics query --view observations --measure input-tokens --aggregation sum
lf metrics query --view observations --measure output-tokens --aggregation sum
```

### Investigate Specific Trace

```bash
# Get trace details
lf traces get tr-abc123

# Get trace with observation metadata (recommended - faster, less noise)
lf traces get tr-abc123 --with-observations --summary

# Get trace with full observation content (large input/output fields)
lf traces get tr-abc123 --with-observations

# Fetch full content for a specific observation when needed
lf observations get obs-xyz789

# See all observations in a trace
lf observations list --trace-id tr-abc123

# Check scores for a trace
lf scores list --name accuracy
```

### Create Scores

```bash
# Score a trace
lf scores create --name accuracy --value 0.95 --trace-id tr-abc123

# Score an observation with comment
lf scores create --name relevance --value 0.8 \
  --observation-id obs-xyz789 --comment "Good but could be more specific"

# Categorical score
lf scores create --name sentiment --value 1 \
  --data-type CATEGORICAL --trace-id tr-abc123

# Boolean score
lf scores create --name approved --value 1 \
  --data-type BOOLEAN --trace-id tr-abc123
```

### Manage Prompts

```bash
# List all prompts
lf prompts list

# Filter by label or tag
lf prompts list --label production
lf prompts list --tag summarisation

# Get production version of a prompt
lf prompts get my-prompt

# Get specific version or label
lf prompts get my-prompt --version 3
lf prompts get my-prompt --label staging

# Get raw content (for piping)
lf prompts get my-prompt --raw > prompt.txt
```

### Create and Update Prompts

```bash
# Create text prompt from file
lf prompts create-text --name my-prompt -f prompt.txt

# Create with commit message documenting the change
lf prompts create-text --name my-prompt -f prompt.txt \
  -m "Add context about user preferences"

# Create from stdin
echo "You are a helpful assistant." | lf prompts create-text --name my-prompt

# Create with labels and config
lf prompts create-text --name my-prompt -f prompt.txt \
  --labels production --tags summarisation \
  --config '{"model": "gpt-4", "temperature": 0.7}'

# Create chat prompt from JSON
lf prompts create-chat --name chat-prompt -f messages.json

# Label a version as production
lf prompts label my-prompt 5 --labels production

# Delete a prompt
lf prompts delete old-prompt
lf prompts delete my-prompt --version 2
```

### Manage Datasets

Datasets store input/output pairs for evaluation. Items can be created manually or from existing traces.

```bash
# List all datasets
lf datasets list

# Create a dataset
lf datasets create my-eval-dataset -d "Test cases for summarisation"

# Create with metadata
lf datasets create my-eval-dataset \
  -d "Test cases for summarisation" \
  -m '{"version": "1.0", "owner": "team-ml"}'

# Get dataset details
lf datasets get my-eval-dataset
```

### Add Dataset Items

```bash
# Create item with input and expected output
lf datasets item-create --dataset my-eval-dataset \
  --input '{"text": "Long article content..."}' \
  --expected-output '{"summary": "Brief summary..."}'

# Create item from existing trace
lf datasets item-create --dataset my-eval-dataset \
  --input '{"prompt": "Summarise this"}' \
  --source-trace-id tr-abc123

# Create item with metadata
lf datasets item-create --dataset my-eval-dataset \
  --input '{"text": "Content"}' \
  --expected-output '{"result": "Expected"}' \
  --metadata '{"category": "short-form", "difficulty": "easy"}'

# List items in a dataset
lf datasets items --dataset my-eval-dataset

# Get specific item
lf datasets item-get item-abc123
```

### View Dataset Runs

Runs represent evaluation executions against a dataset.

```bash
# List runs for a dataset
lf datasets runs my-eval-dataset

# Get details of a specific run
lf datasets run-get my-eval-dataset run-2024-01-15
```

## Output Formats

All list and query commands support output format selection:

```bash
lf traces list --format table    # Default, human-readable
lf traces list --format json     # Machine-readable, full details
lf traces list --format csv      # Spreadsheet-compatible
lf traces list --format markdown # Documentation-friendly
```

Save to file:

```bash
lf traces list --format json --output traces.json
```

## Configuration

The CLI uses profile-based configuration. Credentials resolve in order:
1. CLI arguments (`--public-key`, `--secret-key`, `--host`)
2. Environment variables (`LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_HOST`)
3. Config file profile (`~/.config/langfuse/config.yml`)

### Setup Profile

```bash
lf config setup
```

### Use Specific Profile

```bash
lf traces list --profile production
```

## Metrics Query Deep Dive

The metrics command provides aggregated analytics:

**Required parameters:**
- `--view`: `traces` or `observations`
- `--measure`: What to measure
- `--aggregation`: How to aggregate

**Measures:**
- `count` - Number of items
- `latency` - Duration in milliseconds
- `input-tokens`, `output-tokens`, `total-tokens` - Token counts
- `input-cost`, `output-cost`, `total-cost` - Cost in USD

**Aggregations:**
- `count` - Total count
- `sum` - Total sum
- `avg` - Average
- `p50`, `p95`, `p99` - Percentiles
- `histogram` - Distribution buckets

**Dimensions** (group by):
- `traceName`, `model`, `environment`, `version`, `release`

**Granularity** (time bucketing):
- `auto`, `minute`, `hour`, `day`, `week`, `month`

## Additional Resources

For complete CLI documentation including all options:

- **`references/cli-reference.md`** - Full command reference with all flags
