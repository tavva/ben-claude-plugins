---
name: langfuse-cli
description: This skill should be used when the user asks to "query Langfuse traces", "show sessions", "check LLM costs", "analyse token usage", "view observations", "get scores", "query metrics", or mentions Langfuse, traces, or LLM observability. Also triggers on requests to analyse API latency, debug LLM calls, or investigate model performance.
---

# Langfuse CLI (`lf`)

Command-line interface for querying the Langfuse LLM observability platform. Query traces, sessions, observations, scores, and metrics with flexible filtering and output formats.

## Quick Reference

```
lf traces list [OPTIONS]       # List traces with filters
lf traces get <ID>             # Get specific trace
lf sessions list [OPTIONS]     # List sessions
lf sessions show <ID>          # Show session details
lf observations list [OPTIONS] # List observations (spans/generations)
lf observations get <ID>       # Get specific observation
lf scores list [OPTIONS]       # List scores
lf scores get <ID>             # Get specific score
lf metrics query [OPTIONS]     # Query aggregated metrics
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

# See all observations in a trace
lf observations list --trace-id tr-abc123

# Check scores for a trace
lf scores list --trace-id tr-abc123
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
