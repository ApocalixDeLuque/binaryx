<!-- prettier-ignore-start -->
<p align="center">
  <img src="apps/web/public/favicon/binaryx.png" alt="binaryx logo" width="96" height="96">
</p>

<h1 align="center">binaryx — Base conversion & binary math</h1>

<p align="center">
  Minimal, precise, and explanatory tools for working with numbers across bases.
  Includes step-by-step conversions, fraction support, base-aware rounding,
  two's complement (C2) when appropriate, and endianness views.
</p>

<p align="center">
  <a href="#license"><img alt="License: AGPL-3.0" src="https://img.shields.io/badge/License-AGPL--3.0-blue.svg"></a>
  <a href="https://github.com/ApocalixDeLuque/binaryx/issues"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
  <a href="#status"><img alt="Status: active" src="https://img.shields.io/badge/status-active-success.svg"></a>
</p>

<p align="center">
  <a href="README.es.md">🇪🇸 Versión en Español</a>
</p>
<!-- prettier-ignore-end -->

> [!NOTE]
> **Status: active.** This project aims to grow with the community (digital logic, more operations, visualizations, etc.).

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Routes](#routes)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Install](#install)
  - [Develop](#develop)
  - [Build \& Run](#build--run)
  - [Tests](#tests)
- [Model \& Architecture](#model--architecture)
  - [Relevant Structure](#relevant-structure)
  - [Conversion Flow](#conversion-flow)
- [Converters \& Rules](#converters--rules)
  - [Decimal → Binary](#decimal--binary)
  - [Binary → Decimal](#binary--decimal)
  - [Decimal → Octal](#decimal--octal)
  - [Decimal → Hex](#decimal--hex)
  - [Binary → Octal / Hex](#binary--octal--hex)
  - [Hex ↔ Binary](#hex--binary)
  - [Octal ↔ Binary / Decimal / Hex](#octal--binary--decimal--hex)
- [Two’s Complement (C2)](#twos-complement-c2)
  - [When it applies](#when-it-applies)
  - [Minimum width in Decimal → Hex](#minimum-width-in-decimal--hex)
  - [Signed interpretation in Hex → Decimal](#signed-interpretation-in-hex--decimal)
  - [Endianness](#endianness)
- [Precision \& Rounding](#precision--rounding)
- [Code Standards](#code-standards)
- [Contributing](#contributing)
- [Bug Reports \& Support](#bug-reports--support)
- [Security](#security)
- [Source link (AGPL §13)](#source-link-agpl-13)
- [Status](#status)
- [License](#license)

---

## Features

- Stepwise base conversions (separate integer/fraction tables, recap & join).
- Fraction support with fixed 20 decimal digits in decimal outputs.
- **Base-aware rounding** (e.g., in hex round if next digit ≥ 8).
- **Two’s complement (C2)** only when appropriate (see rules), with **minimum byte width** for negative dec→hex.
- **Endianness** views by byte (Big/Little) for C2 representations.
- Clean, responsive UI; **“Signed”** toggle appears only when it makes sense.
- Modular code and BigNumber precision for large integers & fractions.

## Routes

- `/` — Landing page with CTA and features.
- `/conversiones` — Conversion panel with input, results, and steps.
- `/operaciones` — Operations & visualizations (sums/subtractions, Booth for integers, fixed-point for fractional).

---

## Getting Started

### Requirements

- **Bun 1.1+** (recommended) or **Node.js 18.18+**
- `pnpm` or `npm` if you don’t use Bun

### Install

```bash
bun install
# or
pnpm install
```

### Develop

```bash
# from repo root
bun run dev:web
# or
cd apps/web && bun run dev
```

Open http://localhost:3001

### Build & Run

```bash
# build all (turborepo)
bun run build

# run only the web app
cd apps/web
bun run start
```

### Tests

Vitest config lives in `apps/web/vitest.config.ts`:

```bash
cd apps/web
bunx vitest
```

---

## Model & Architecture

- Framework: **Next.js 15 (App Router)** + **React 19**
- Precision: **BigNumber** (fractions & large integers)
- UI: modular conversion components + a results orchestrator

### Relevant Structure

```
apps/web/src/app/
  page.tsx
  (routes)/conversiones/page.tsx
  (routes)/operaciones/page.tsx

apps/web/src/components/
  conversion-results-panel.tsx   # orchestrates result views
  input-results-panel.tsx        # input + results
  results/<conv>/{summary,analysis,steps,final}.tsx
  theme-switch.tsx
  LetterGlitch.tsx

apps/web/src/lib/
  base-conversions.ts            # conversion core
  utils/*                        # types, helpers, formatting, etc.
```

### Conversion Flow

1. Input validation by base.
2. Conversion with pure functions (integer/fraction split when applicable).
3. Produce a `ConversionResult` with:
   - `magnitude` (unsigned), `output` (string), `signedResult?`, `twosComplementHex?`
   - steps `integerSteps?` / `fractionalSteps?`
4. UI decides whether to show “Unsigned/Signed” and endianness based on rules.

---

## Converters & Rules

### Decimal → Binary

- Integers: successive division by 2, reverse remainders.
- Fractions: multiply by 2 storing bits; compute 20+1 bits to decide rounding (if next bit is `1`, round; carry into integer if needed).
- Signs:
  - Positive or negative (explicit sign): **Unsigned** view only prepends `-` to magnitude.
  - **“Signed (C2)”** only for explicit negatives.

### Binary → Decimal

- Positional: `bit × 2^n` for integer; `bit × 2^-k` for fractions with BigNumber.
- **“Signed (C2)”** view available when:
  - No explicit `-` **and** the integer MSB is `1` (signed interpretation).

### Decimal → Octal

- Integer: divide by 8; fraction: multiply by 8 (+ base-8 rounding if next digit ≥ 4).
- Signs: only prepend `-` in unsigned view; **no C2 in octal**.

### Decimal → Hex

- Integer: divide by 16; fraction: multiply by 16 with base-16 rounding (next digit ≥ 8).
- Signs:
  - Positives & fractions: **no C2**.
  - **Negative integers**: compute **C2** with minimum **byte** width (power of 2; **min 16 bits**). C2 output is uppercase.
- Endianness: Big/Little-endian by bytes (**display omits leading `00` rows** for clarity; actual value remains unchanged).

### Binary → Octal / Hex

- Grouping: 3 bits → octal, 4 bits → hex. For fractions, group to the right.

### Hex ↔ Binary

- Expand/contract by nibbles (4 bits per hex digit). Trim leading/trailing zeros where appropriate.

### Octal ↔ Binary / Decimal / Hex

- Via 3-bit grouping (octal) or powers of 8 for decimal.

---

## Two’s Complement (C2)

### When it applies

- **Never** for positives.
- **Never** for fractions.
- Applies in:
  - **Decimal → Hex** when the decimal is **negative** and **integer**.
  - **Hex → Decimal** (“Signed” mode) when there’s **no explicit `-`**, it’s **integer**, and the **MS nibble ≥ 8**.

### Minimum width in Decimal → Hex

- Use the **smallest byte width (power of 2)** that can represent `|N|` in C2; **min 16 bits**.
- Examples:
  - `-20` → `FFEC`
  - `-276` → `FEEC`
  - `-2076` → `F7E4`
  - `-9999` → `D8F1`
  - `-999999` → `FFF0BDC1`

### Signed interpretation in Hex → Decimal

- If MS nibble ≥ 8 (and input is integer without `-`), **Signed (C2)** does:
  1. subtract 1
  2. invert nibbles (`15 − digit`)
  3. conceptually add 1 → magnitude
  4. convert to decimal, then prefix `-`
- UI shows the inversion table explicitly.

### Endianness

- When showing C2 (dec→hex negative), render byte tables for Big/Little endian.
- Omit **superfluous** leading `00` rows (value itself is unchanged).

---

## Precision & Rounding

- BigNumber avoids scientific notation and preserves high precision.
- Decimal fractions: **fixed 20 digits** for visual stability.
- Base-aware rounding:
  - base-2: next bit `1` rounds the last kept position (carry to integer if needed)
  - base-8: next digit ≥ 4
  - base-16: next digit ≥ 8

---

## Code Standards

- Strict TypeScript, React 19, Next.js 15.
- Pure logic separated from UI.
- Clear names; avoid cryptic abbreviations.
- Grouping/formatting of digits is a **UI** task (not core logic).

---

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md). We follow **Conventional Commits** and welcome:

- Bug reports with minimal repro
- Feat proposals with clear use-cases
- Docs and tests

> [!TIP]
> Good places to contribute: rounding edge cases, C2 gating, large magnitudes, visualization components.

---

## Bug Reports & Support

When opening an issue, include:

- Conversion path (from → to), exact input (with/without `-`, with/without fraction)
- Expected vs. actual (and why)
- Browser/OS + screenshots/logs if helpful
- Minimal steps to reproduce

Feature requests: describe use case, scope, and impact.

---

## Security

Please **do not** disclose exploitable details in public issues. Follow [SECURITY](SECURITY.md) for private reporting.

---

## Source link (AGPL §13)

If you deploy binaryx as a network service, expose a visible **“Source”** link in the UI pointing to this repository (and ideally the current commit).

Minimal example for a footer component:

```tsx
// apps/web/src/components/SourceLink.tsx
"use client";
export default function SourceLink() {
  const sha = process.env.NEXT_PUBLIC_GIT_SHA ?? "main";
  return (
    <a
      href={`https://github.com/ApocalixDeLuque/binaryx/tree/${sha}`}
      target="_blank"
      rel="noreferrer"
      className="underline hover:no-underline"
      aria-label="View source code on GitHub"
    >
      Source
    </a>
  );
}
```

---

## Status

**Active** — roadmap includes BCD/Gray/base-N, overflow viz, bit-flip timelines, and digital logic (gates, truth tables, circuits).

---

## License

**AGPL-3.0**. See [LICENSE](LICENSE).
