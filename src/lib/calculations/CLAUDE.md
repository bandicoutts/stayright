# Absence engine

File: `src/lib/calculations/absenceEngine.ts`
Tests: `src/lib/calculations/absenceEngine.test.ts`

## The formula — cannot be changed

```
absence_days = (return_date − departure_date) − 1
```

Neither the departure day nor the return day counts as absence. This is the ILR standard interpretation (DECISION-002). Every function in this file must respect this invariant.

## Rules that must never be violated

- **Never store calculated values** — DB holds raw trip dates only; always compute on read (DECISION-005).
- **Pure functions only** — no side effects, no DB calls, no network calls (DECISION-018).
- **No mutations** — always return new objects/arrays.

## Edge cases already decided

| Case | Behaviour | Decision |
|---|---|---|
| `return_date` is null (currently abroad) | Use `today` as provisional end date | DECISION-042 |
| Crown Dependencies (Jersey, Guernsey, IoM) | 0 absence days — count as UK presence | DECISION-011 |
| British Overseas Territories (Gibraltar, Bermuda, etc.) | Full absence days | DECISION-011 |
| Crown Dependency matching | Exact string match only (not substring) | DECISION-042 |
| `calculateWhatIf` — future trip projection | Use `return_date` as the `today` parameter | DECISION-022 |

## Risk thresholds

Defined in `src/lib/riskConfig.ts` — do not inline these values.

| Band | Days |
|---|---|
| SAFE | ≤ 120 |
| WARNING | 121–150 |
| DANGER | 151–170 |
| BREACH | > 180 |

## Adding new functions

- Must be pure (no IO)
- Must have unit tests in `absenceEngine.test.ts`
- Must not store results — callers pass results to the DB or UI
