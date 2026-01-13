# Eval Types Reference

Detailed guidance for each evaluation approach. Use this to inform recommendations during the diagnostic conversation.

## Eval Type Selection

| Problem Type | Recommended Eval | Reasoning |
|--------------|------------------|-----------|
| Format validation (JSON, dates, structure) | Code-based | Deterministic, fast, cheap |
| Factual accuracy with known answers | Code-based + exact/fuzzy match | Ground truth exists |
| Tone, helpfulness, coherence | LLM-as-judge | Subjective, needs reasoning |
| Safety, toxicity | LLM-as-judge or classifier | Nuanced judgment required |
| RAG retrieval quality | LLM-as-judge per chunk | Needs context understanding |
| High-stakes decisions | Human annotation → LLM-judge | Calibrate before automating |
| Novel/unclear failure modes | Human annotation first | Need to understand before automating |

## Code-Based Evals

### When to Use

- Output has deterministic correctness criteria
- Ground truth exists or can be computed
- Speed and cost matter (high-volume evaluation)
- Failure is binary and unambiguous

### Common Patterns

**Format Validation:**
```python
def eval_json_format(output: str) -> bool:
    try:
        data = json.loads(output)
        return "required_field" in data
    except json.JSONDecodeError:
        return False
```

**Exact Match:**
```python
def eval_exact_match(output: str, expected: str) -> bool:
    return output.strip().lower() == expected.strip().lower()
```

**Fuzzy Match (for extraction):**
```python
def eval_contains_answer(output: str, expected_answer: str) -> bool:
    return expected_answer.lower() in output.lower()
```

**Regex Pattern:**
```python
def eval_date_format(output: str) -> bool:
    pattern = r'\d{4}-\d{2}-\d{2}'
    return bool(re.search(pattern, output))
```

**Length Constraints:**
```python
def eval_length(output: str, min_words: int, max_words: int) -> bool:
    word_count = len(output.split())
    return min_words <= word_count <= max_words
```

### Advantages

- Fast: Milliseconds per evaluation
- Cheap: No API calls
- Deterministic: Same input always gives same result
- CI-friendly: Can run on every commit

### Limitations

- Cannot assess subjective quality
- Brittle to format variations
- May miss semantic correctness (right answer, wrong format = fail)

## LLM-as-Judge Evals

### When to Use

- Subjective quality assessment (helpfulness, clarity, tone)
- No single "correct" answer exists
- Semantic understanding required
- Human judgment is the gold standard

### Design Principles

**Binary over Likert:** PASS/FAIL creates clearer signals than 1-5 scales.

Bad: "Rate helpfulness 1-5"
Good: "Does this response help the user accomplish their goal? PASS/FAIL"

**Specific Rubric:** Generic criteria produce inconsistent results.

Bad: "Is this response good?"
Good: "Does the response: (1) directly address the question, (2) provide actionable next steps, (3) avoid unnecessary hedging?"

**Structured Output:** JSON ensures parseable results.

```json
{
  "judgment": "PASS",
  "reasoning": "Response directly answers the question with specific code example"
}
```

### Model Selection

| Model | Best For | Trade-offs |
|-------|----------|------------|
| GPT-4o | General quality assessment | Highest quality, higher cost |
| Claude Sonnet | Nuanced reasoning, safety | Good balance of quality/cost |
| GPT-4o-mini | High-volume, simpler judgments | Lower cost, less nuanced |

### Calibration

Before deploying LLM-as-judge:
1. Create 20-30 examples with human labels
2. Run judge on same examples
3. Measure agreement rate (target: >85%)
4. Adjust prompt/rubric until calibrated
5. Re-calibrate periodically

### Common Failure Modes

- **Position bias:** Judge favours first/last option in comparisons
- **Verbosity bias:** Longer responses rated higher regardless of quality
- **Self-preference:** Model rates its own outputs higher
- **Rubric drift:** Criteria applied inconsistently across examples

Mitigations:
- Randomise position in comparisons
- Include length in rubric (penalise unnecessary verbosity)
- Use different model family for judge than evaluated model
- Include calibration examples in each batch

## Human Annotation

### When to Use

- High-stakes decisions requiring human judgment
- Novel failure modes not yet understood
- Calibrating LLM-as-judge evals
- Building golden datasets

### Schema Design

**Clear Labels:**
```yaml
labels:
  - PASS: Response fully answers the question
  - PARTIAL: Response addresses the question but missing key information
  - FAIL: Response doesn't answer the question or is incorrect
```

**Annotation Guidelines:**
- Definition for each label with examples
- Borderline case guidance
- What to do when uncertain

**Inter-Rater Reliability:**
- Have multiple annotators label same examples
- Target Cohen's kappa > 0.7
- If low agreement, clarify guidelines

### Workflow

1. Sample traces from Langfuse (prioritise signals of failure)
2. Export to annotation tool (or spreadsheet for small scale)
3. Multiple annotators label independently
4. Review disagreements, refine guidelines
5. Use agreed labels as ground truth

### Scaling

Human annotation doesn't scale, so use it strategically:
- Initial exploration: 50-100 examples to understand failure modes
- Calibration: 20-30 examples per LLM-as-judge eval
- Periodic validation: 10-20 examples monthly to check drift

## Hybrid Approaches

### Code Filter + LLM Judge

Use code-based eval as first pass, LLM-as-judge for edge cases:

```
Code check: Is response valid JSON with required fields?
  → FAIL: Immediate failure (no LLM call needed)
  → PASS: Continue to LLM judge for quality assessment
```

Benefits: Reduces LLM API costs, fast feedback on obvious failures

### LLM Judge + Human Escalation

LLM-as-judge handles routine cases, humans review uncertain ones:

```
LLM judge returns confidence:
  → High confidence PASS/FAIL: Accept judgment
  → Low confidence: Route to human review queue
```

Benefits: Scales while maintaining quality on edge cases

### Multi-Judge Ensemble

Multiple LLM judges vote, disagree → human review:

```
Run 3 judges (different prompts or models)
  → All agree: Accept consensus
  → Disagree: Route to human or flag for investigation
```

Benefits: Reduces single-judge bias, surfaces genuinely ambiguous cases
