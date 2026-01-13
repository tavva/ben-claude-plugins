# Eval Design Document Template

Use this template to structure eval design outputs. Each section maps to Langfuse primitives for implementation.

## Template

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

---

## Section Guidance

### Overview Section

**Objective** should answer: "Why does this eval exist? What user problem does it catch?"

Bad: "Measures response quality"
Good: "Catches responses that fail to answer the user's actual question, even when they contain relevant information"

**Eval Type** selection:
- LLM-as-judge: Subjective quality, tone, coherence, nuanced judgment
- Code-based: Format validation, exact matches, deterministic checks
- Human annotation: High-stakes, novel failure modes, calibration
- Hybrid: e.g., code-based filter + LLM-as-judge for edge cases

**Failure Mode** should be specific and observable:

Bad: "Poor quality responses"
Good: "Response contains correct facts but doesn't answer the question asked"

### Success Criteria Section

Prefer binary PASS/FAIL over Likert scales. If a numeric threshold is needed, justify it.

Binary criteria example:
- PASS: Response directly answers the question asked
- FAIL: Response contains relevant info but doesn't answer the actual question

Threshold example:
- PASS: ≥3 of 5 retrieved chunks are relevant to the query
- Justification: Based on error analysis, queries with <3 relevant chunks have 80% user complaint rate

### Implementation Section

**LLM-as-Judge prompts** should be complete and testable:
- Include all placeholders the implementation needs
- Specify exact output format (JSON preferred)
- Include rubric inline, not by reference

**Code-based logic** should be implementable without interpretation:
- Pseudocode or actual code
- Input/output examples for edge cases
- Error handling requirements

**Human annotation schemas** should be unambiguous:
- Clear definitions for each label/score
- Examples of borderline cases
- Inter-rater reliability target

### Dataset Requirements Section

Minimum recommendations:
- Happy path: 10-20 cases covering common scenarios
- Edge cases: 5-10 cases for boundaries and unusual inputs
- Adversarial: 3-5 cases designed to break the eval

Sources:
- Production traces: Sample from Langfuse, filter by failure signals
- Synthetic: Generate with LLM, validate manually
- Manual: Hand-craft for specific edge cases

### Integration Section

CI integration: Run on every PR/commit that touches relevant code
Production sampling: Percentage-based or triggered by signals
Batch: Scheduled runs for trend analysis

Alert conditions should be actionable:
- "Pass rate drops below 95%" (baseline established)
- "3 consecutive failures on same failure mode"
- Not: "Quality degrades" (unmeasurable)
