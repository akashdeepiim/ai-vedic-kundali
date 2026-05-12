# Optional Module Rubric

Use this rubric for module flows managed by `components/OptionalModulesTabs.tsx` and `POST /api/modules/calculate`.

## Required Product Behaviors

Each module must:

- Exist as an independent flow.
- Collect all details it needs without relying on main birth-chart state.
- Resolve location behind the scenes.
- Hide latitude, longitude, timezone, and internal calculation scope from primary UI.
- Return structured output with summary, score/insights, next steps, and limitations.
- Explain results in layperson-friendly language.
- Avoid deterministic fear or unsupported precision.

## Module-Specific Expectations

### Kundli Matching

- Requires both people birth details.
- Uses compatibility score as a screen, not a decision engine.
- Explains low-scoring areas as topics for review.
- Does not imply marriage approval/rejection by score alone.

### Panchang & Muhurat

- Requires activity, date window, city, and country.
- Date-window result is a shortlist, not a final exact muhurta.
- Does not claim local sunrise lagna windows unless implemented.

### Dosha Analysis

- Screens Manglik, Kaal Sarp, and Sade Sati conservatively.
- Uses non-fatalistic language.
- Avoids fear-based remedies or deterministic outcomes.

### More Varga Charts

- Allows requested divisional charts.
- Explains that divisional charts support the main chart.
- Does not overclaim full tradition-specific judgement.

### Yoga Detection

- Reports candidates, not guaranteed events.
- Explains activation depends on strength, dasha, and supporting charts.

### Shadbala / Ashtakavarga

- Clearly frames output as a strength screen unless full bindu tables are implemented.
- Does not claim exact Shadbala or BAV/SAV bindus without deterministic support.

## Scoring

| Dimension | Pass Criteria |
| --- | --- |
| Input independence | Module can run from its own form alone. |
| Validation | Missing required fields are shown inline and block execution. |
| Calculation honesty | Result does not exceed deterministic scope. |
| Plain language | A non-expert can understand what the result means. |
| Next steps | Output includes practical review/follow-up guidance. |
| Mobile UX | Inputs and result cards do not overflow. |

All dimensions must pass before a module is considered production-ready.
