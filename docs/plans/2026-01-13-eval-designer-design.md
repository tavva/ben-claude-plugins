# Eval Designer Plugin - Design Document

## Overview

A standalone Claude Code plugin that guides users through designing production-quality LLM evaluations. The skill acts as an eval expert consultant, outputting structured specs that a coding agent can implement using the Langfuse SDK/API.

**Key constraint:** This skill designs evals, it does not implement them. Implementation is handled by a coding agent using the `langfuse-cli` skill.

## Plugin Structure

```
plugins/eval-designer/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── eval-design/
        ├── SKILL.md (~1,800 words)
        └── references/
            ├── document-template.md
            ├── eval-types.md
            └── judge-prompts.md
```

## plugin.json

```json
{
  "name": "eval-designer",
  "version": "0.1.0",
  "description": "Design production-quality LLM evaluations for Langfuse",
  "category": "development",
  "tags": ["langfuse", "evals", "llm", "testing", "quality"]
}
```

## SKILL.md Frontmatter

```yaml
---
name: eval-design
description: >
  Use when designing LLM evaluations, creating scoring rubrics,
  building golden datasets, setting up LLM-as-judge, or asking
  "how do I know if my LLM is working". Also triggers on
  "eval", "evaluation", "quality metrics", "test my outputs".
---
```

## Diagnostic Conversation Flow

The skill follows a structured discovery process, asking one question at a time:

### Phase 1: Understand the System

- What does the LLM application do? (summarisation, Q&A, agent, chat, etc.)
- What's already instrumented in Langfuse? (traces, spans, generations)
- What does a "good" output look like for users?

### Phase 2: Identify Failure Modes

- What failures have occurred in production? (or what are the concerns?)
- Has error analysis been done on real traces? If yes, what patterns emerged?
- Which failures have the highest business impact?

### Phase 3: Match Eval Type to Problem

Based on failure modes, recommend the appropriate eval type:

| Problem Type | Recommended Eval | Reasoning |
|--------------|------------------|-----------|
| Format validation (JSON, dates, structure) | Code-based | Deterministic, fast, cheap |
| Factual accuracy with known answers | Code-based + exact/fuzzy match | Ground truth exists |
| Tone, helpfulness, coherence | LLM-as-judge | Subjective, needs reasoning |
| Safety, toxicity | LLM-as-judge or classifier | Nuanced judgment required |
| RAG retrieval quality | LLM-as-judge per chunk | Needs context understanding |
| High-stakes decisions | Human annotation → LLM-judge | Calibrate before automating |
| Novel/unclear failure modes | Human annotation first | Need to understand before automating |

### Phase 4: Design the Eval

- Define success criteria (prefer binary PASS/FAIL)
- Design the rubric or logic
- Specify dataset requirements (happy path, edge cases, adversarial)
- Determine integration point (CI, production sampling, batch)

### Adaptation

If user gives detailed technical answers, skip basics. If user seems uncertain, explain concepts before asking.

## Output Document Structure

The design document maps directly to Langfuse primitives so a coding agent can implement it:

```markdown
# Eval Design: [Name]

## Overview
- **Objective**: What this eval measures and why it matters
- **Eval Type**: LLM-as-judge | Code-based | Human annotation | Hybrid
- **Failure Mode**: The specific problem this catches

## Success Criteria
- **Passing condition**: Binary PASS/FAIL definition
- **Threshold**: (if applicable) e.g., "≥80% of chunks relevant"

## Implementation

### For LLM-as-Judge:
- **Judge model**: e.g., gpt-4o, claude-sonnet
- **Judge prompt**: The exact prompt with placeholders ({{input}}, {{output}}, etc.)
- **Scoring rubric**: Clear criteria the judge applies
- **Output format**: Expected response structure

### For Code-based:
- **Logic**: The assertions/checks to implement
- **Examples**: Input/output pairs showing pass and fail cases

### For Human Annotation:
- **Annotation schema**: What annotators evaluate
- **Guidelines**: Instructions for consistent labelling

## Dataset Requirements
- **Happy path cases**: [count] - typical successful inputs
- **Edge cases**: [count] - boundary conditions, unusual inputs
- **Adversarial cases**: [count] - inputs designed to break the system
- **Source**: Where to get/generate these (production traces, synthetic, manual)

## Integration
- **When to run**: CI / production sampling / batch
- **Sampling strategy**: (if production) e.g., 5% of traces, all failures
- **Alert conditions**: When to notify (e.g., pass rate drops below X%)
```

## Embedded Expert Knowledge

### Principles for Great Evals

1. **Start from error analysis** - examine real failures, not hypothetical concerns
2. **Match tool to task** - code-based for deterministic, LLM-as-judge for subjective, human for calibration
3. **Binary PASS/FAIL** over Likert scales - clearer signals, more actionable
4. **Cover the right cases** - happy path, edge cases, adversarial inputs
5. **Clear rubrics** - unambiguous criteria that anyone can apply consistently
6. **Calibrate against humans** - LLM judges need ground truth validation

### Red Flags to Watch For

- Jumping to LLM-as-judge when code-based would suffice (over-engineering)
- Likert scales instead of binary (push toward PASS/FAIL)
- Generic metrics without connection to actual failures ("hallucination score" with no error analysis)
- Missing adversarial cases in dataset design
- No plan for calibration/validation of LLM judges

### Key Questions to Surface

- "What would a human expert check when reviewing this output?"
- "If this eval passes but users are unhappy, what did we miss?"
- "What's the simplest check that would catch this failure?"

## Reference Files

### references/document-template.md

The complete output template (as shown above) with guidance on filling each section.

### references/eval-types.md

Detailed guidance for each eval type:

- **Code-based evals**: When to use, implementation patterns, common assertions
- **LLM-as-judge**: Prompt engineering, model selection, calibration approaches
- **Human annotation**: Schema design, annotator guidelines, inter-rater reliability
- **Hybrid approaches**: When to combine types, common patterns

### references/judge-prompts.md

Example LLM-as-judge prompts for common evaluation scenarios:

- Response quality assessment
- Factual accuracy checking
- RAG chunk relevance scoring
- Tone and style evaluation
- Safety and toxicity detection

Each with the exact prompt, expected output format, and notes on calibration.

## Testing Approach (TDD for Skills)

### RED Phase - Baseline Testing

Run pressure scenarios WITHOUT the skill:

1. **Newcomer scenario**: "I have a chatbot, how do I know if it's working well?"
   - Watch for: jumping to implementation, recommending generic metrics

2. **Over-engineering scenario**: "I need comprehensive evals for my RAG system"
   - Watch for: adding unnecessary complexity, not asking about actual failures

3. **Generic metrics trap**: "Add hallucination detection to my app"
   - Watch for: recommending off-the-shelf metrics without error analysis

Document exact rationalizations and behaviours.

### GREEN Phase - Write Skill

Address specific failures observed in baseline:
- Force diagnostic questions before recommending eval types
- Push back on complexity (YAGNI principle)
- Ground recommendations in actual failure modes, not generic metrics

### REFACTOR Phase

Run same scenarios WITH skill. Look for:
- New rationalizations or workarounds
- Cases where Claude skips the diagnostic flow
- Output specs that a coding agent couldn't implement

Add explicit counters for any loopholes found.

## Anti-Goals

- Does NOT implement evals (that's for a coding agent with the langfuse skill)
- Does NOT prescribe generic metrics - always grounds in the specific use case
- Does NOT over-engineer - fights the urge to add complexity

## Sources

Research and best practices incorporated from:

- [Pragmatic Engineer: A pragmatic guide to LLM evals for devs](https://newsletter.pragmaticengineer.com/p/evals)
- [Langfuse Documentation](https://langfuse.com/docs)
- [Datadog: Building an LLM evaluation framework](https://www.datadoghq.com/blog/llm-evaluation-framework-best-practices/)
- [FutureAGI: LLM Evaluation Guide 2025](https://futureagi.com/blogs/llm-evaluation-2025)
