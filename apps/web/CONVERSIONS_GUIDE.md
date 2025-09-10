## Conversions Architecture & Quickstart

This project separates conversion logic (pure functions) from UI (panels and result components). Decimal → Binary is the reference implementation; use it as a template for new conversions.

### High-level structure

- Backend/pure logic (calculation only):

  - `apps/web/src/lib/conversions/` → one file per conversion family (e.g., `decimal-to-binary.ts`).
  - Exposes pure functions that return a `ConversionResult` from `src/lib/utils/conversion-types.ts`.

- UI composition (panels and results):
  - Input workflow and main panel: `apps/web/src/components/input-results-panel.tsx` and page-level panels under `components/*panel*.tsx`.
  - Modular results UI: `apps/web/src/components/results/<conversion>/`
    - e.g., `results/decimal-to-binary/{summary,analysis,steps,final,flags}.tsx`
    - An `index.tsx` aggregates these pieces and receives `result` and any view state (`viewMode`).
  - Shared building blocks: `apps/web/src/components/results/base/*` (e.g., `selector.tsx`, generic tables/components reused across conversions).

### Data model

- Types live in `apps/web/src/lib/utils/conversion-types.ts`:
  - `ConversionResult` is the contract between logic and UI. Include:
    - `input`, `inputBase`, `output`, `outputBase`
    - `integerSteps?` and `fractionalSteps?` for step tables
    - `magnitude?`, `signedResult?` for decimal→binary, and analogous fields for other conversions as needed
    - `flags?` with `sign`, `zero`, `overflow?`

Keep the shape consistent across conversions so shared UI can work with multiple types.

### Where each concern lives

- Pure math/conversion:

  - Implement in `src/lib/conversions/<from>-to-<to>.ts`.
  - No React imports. No formatting concerns. Return a fully-populated `ConversionResult`.

- UI formatting and layout:

  - Under `src/components/results/<conversion>/` for conversion-specific presentation:
    - `summary.tsx` – compact overview of input/output.
    - `analysis.tsx` – optional explanations and hints.
    - `steps.tsx` – integer/fractional tables and recaps. Should render from `integerSteps`/`fractionalSteps`.
    - `final.tsx` – final formatted answer.
    - `flags.tsx` – optional flags block (only when relevant and toggled).
    - `index.tsx` – orchestrates the above pieces.
  - Shared/generic components go under `src/components/results/base/`.

- Global panels (routing-level containers):
  - `src/components/conversion-results-panel.tsx` chooses which modular result component to mount based on `result.inputBase`/`result.outputBase`.
  - `src/components/input-results-panel.tsx` provides the inline input + results experience.

### Conventions

- Signed vs Unsigned (when applicable):

  - Only show signed (e.g., two's complement) UI for negative inputs where it applies.
  - Drive signed/unsigned display via a simple `viewMode` prop in the results index (e.g., `"unsigned" | "signed"`).
  - Expose the signed representation in `ConversionResult` (e.g., `signedResult`) if the math requires it.

- Step tables:

  - Integer division table headers include initial value in header text; rows start at the first division output.
  - Fractional multiplication table headers include initial fractional value; rows show subsequent ×2 steps.
  - Provide recap blocks: integer bits, fractional bits, and union (only if a fractional part exists). For negative, unsigned flow can show an extra small step applying the minus sign.

- Formatting:
  - UI should use `FormattedNumber` for base-aware grouping.
  - Keep display grouping in the UI; logic functions must return raw strings (no spaces) for precision and reuse.

### Adding a new conversion (quickstart)

1. Implement math in `src/lib/conversions/<from>-to-<to>.ts`:

```ts
export function fromXToY(/* inputs */): ConversionResult {
  // 1) Parse/validate input
  // 2) Compute integer and fractional parts
  // 3) Populate integerSteps/fractionalSteps for tables
  // 4) Build `output`, optionally `magnitude`, `signedResult`, `flags`
  return {
    /* ... per ConversionResult ... */
  };
}
```

2. Create UI folder `src/components/results/<conversion>/`:

- `summary.tsx`, `steps.tsx`, `final.tsx`, `analysis.tsx` (optional), `flags.tsx` (optional)
- `index.tsx` that composes them:

```tsx
export function XtoYResults({ result }: { result: ConversionResult }) {
  return (
    <div className="space-y-6">
      <Summary result={result} />
      <Analysis result={result} />
      <Steps result={result} />
      <Final result={result} />
      {/* Flags if applicable */}
    </div>
  );
}
```

3. Wire into router-level panel:

- In `src/components/conversion-results-panel.tsx`, add conditionals to render your new `XtoYResults` based on `result.inputBase` and `result.outputBase`.

4. Reuse shared components:

- If you have generic tables (e.g., decimal→octal/hex division tables), implement them once in `results/base/` and reuse.

### Guidelines for correctness and UX

- Logic correctness first: ensure edge cases (zero, negative, fractional) produce correct `ConversionResult`.
- Only compute signed representations when necessary (negative inputs), and gate the UI accordingly.
- Keep `ConversionResult` fields stable; if you add fields for a specific conversion, prefer optional fields with clear names.
- Maintain consistent Spanish labels and tone.

### Testing

- Unit test conversion functions in `src/lib/conversions/__tests__/` or alongside the module.
- UI smoke tests can verify key conditional rendering (signed vs unsigned visibility, flags rendering).

### Example references

- Math: `src/lib/conversions/decimal-to-binary.ts`
- UI: `src/components/results/decimal-to-binary/*` and usage in `conversion-results-panel.tsx`.

