# Evals

This directory defines the intended evaluation harness for Vedic Astra. The current files are structured fixtures and rubrics that can be wired into an automated runner when the test framework is added.

## Directory Structure

```text
evals/
  README.md
  cases/
    analysis-report.cases.json
    optional-modules.cases.json
    safety.cases.json
  rubrics/
    report-rubric.md
    module-rubric.md
```

## Harness Design

The future harness should run three layers:

1. **Deterministic assertions**
   - API accepts/rejects expected inputs.
   - Astrology calculations return expected sign/house/nakshatra/dasha invariants.
   - Optional modules return stable schema and bounded scores.

2. **Contract assertions**
   - `/api/analyze` output has every required key.
   - Timelines are arrays.
   - Every report section has chart basis and usable insight before UI transformation.
   - No forbidden claims appear in generated text.

3. **Rubric scoring**
   - Grounding.
   - Usefulness.
   - Safety.
   - Age appropriateness.
   - No unsupported precision.
   - No past-event hallucination.

## Fixture Format

Each eval case should include:

- `id` - stable machine-readable case name.
- `category` - one of `analysis_report`, `optional_module`, `safety`, `golden_calculation`, `ui`.
- `description` - what the case protects.
- `input` - minimal input payload or user flow.
- `expected` - deterministic assertions.
- `forbidden` - strings/patterns/behaviors that must not appear.
- `rubric` - scoring dimensions where human or model judgement is needed.

## Recommended Runner Contract

When implemented, a local eval runner should support:

```bash
npm run evals
npm run evals:golden
npm run evals:llm
npm run evals:ui
```

Suggested output:

```json
{
  "runId": "2026-05-12T10:00:00Z-local",
  "gitSha": "abc123",
  "suite": "analysis_report",
  "passed": 12,
  "failed": 0,
  "warnings": 1,
  "failures": []
}
```

## Model Baseline

The current production model baseline is `gpt-4o-mini` for:

- Full birth-chart analysis via `/api/analyze`.
- Chat follow-up responses via `/api/chat`.

Any model change should update this file, the main product docs, prompt baselines, and any model-graded eval snapshots in the same pull request.

## Mobile UI Regression Checks

For layout or interaction changes, the harness should include a mobile viewport pass that verifies:

- Landing-page reading selection renders as a compact mobile control.
- Reading/module selection does not overlay, clip, or crowd the birth form on small screens.
- Birth-form spacing keeps the primary CTA reachable without excessive scrolling.
- `/kundali` chart-style selection uses the mobile select control.
- Analysis setup and chat panels fit within the viewport width without horizontal scrolling.

## Data Hygiene

- Do not commit real user birth data without consent.
- Prefer synthetic or public benchmark cases.
- If exact birth data is used as a golden case, document its source and permission.
- Do not store OpenAI API keys, raw prompts with secrets, or production traces in this directory.

## Merge Bar

Before relying on the harness for release decisions:

- Add a test runner.
- Add golden cases from trusted sources.
- Pin model versions for model-graded evals.
- Store prompt versions and calculation versions in eval outputs.
- Pass mobile UI regression checks for the landing page, optional modules, chart layout selection, analysis setup, and chat.
