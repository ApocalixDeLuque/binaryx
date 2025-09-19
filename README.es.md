<!-- prettier-ignore-start -->
<p align="center">
  <img src="apps/web/public/favicon/binaryx.png" alt="binaryx logo" width="96" height="96">
</p>

<h1 align="center">binaryx — Conversión de bases y aritmética binaria</h1>

<p align="center">
  Herramientas minimalistas, precisas y explicativas para trabajar con números en distintas bases:
  pasos detallados, soporte de fracciones, redondeo por base, complemento a dos (C2) cuando corresponde,
  y vistas de endianness.
</p>

<p align="center">
  <a href="#licencia"><img alt="License: AGPL-3.0" src="https://img.shields.io/badge/Licencia-AGPL--3.0-blue.svg"></a>
  <a href="https://github.com/ApocalixDeLuque/binaryx/issues"><img alt="PRs bienvenidos" src="https://img.shields.io/badge/PRs-bienvenidos-brightgreen.svg"></a>
  <a href="#estado"><img alt="Estado: activo" src="https://img.shields.io/badge/estado-activo-success.svg"></a>
</p>

<p align="center">
  <a href="README.md">🇬🇧 English Version</a>
</p>
<!-- prettier-ignore-end -->

> [!NOTE] > **Estado: activo.** Este proyecto busca crecer en comunidad (lógica digital, más operaciones, visualizaciones, etc.).

---

## Índice

- [Índice](#índice)
- [Características](#características)
- [Rutas](#rutas)
- [Cómo correrlo](#cómo-correrlo)
  - [Requisitos](#requisitos)
  - [Instalación](#instalación)
  - [Desarrollo](#desarrollo)
  - [Build y ejecución](#build-y-ejecución)
  - [Pruebas](#pruebas)
- [Modelo y arquitectura](#modelo-y-arquitectura)
  - [Estructura relevante](#estructura-relevante)
  - [Flujo de conversión](#flujo-de-conversión)
- [Conversores y reglas](#conversores-y-reglas)
  - [Decimal → Binario](#decimal--binario)
  - [Binario → Decimal](#binario--decimal)
  - [Decimal → Octal](#decimal--octal)
  - [Decimal → Hexadecimal](#decimal--hexadecimal)
  - [Binario → Octal / Hexadecimal](#binario--octal--hexadecimal)
  - [Hexadecimal ↔ Binario](#hexadecimal--binario)
  - [Octal ↔ Binario / Decimal / Hex](#octal--binario--decimal--hex)
- [Precisión y redondeo](#precisión-y-redondeo)
- [Estándares de código](#estándares-de-código)
- [Contribuir](#contribuir)
- [Reporte de bugs y soporte](#reporte-de-bugs-y-soporte)
- [Seguridad](#seguridad)
- [Enlace a código fuente (AGPL §13)](#enlace-a-código-fuente-agpl-13)
- [Estado](#estado)
- [Licencia](#licencia)

---

## Características

- Conversión entre bases con pasos explicados (tablas entero/fracción, recap y unión).
- Soporte de fracciones con **20 dígitos** fijos en salidas decimales.
- **Redondeo por base** (p. ej., en hex se redondea si el siguiente dígito ≥ 8).
- **Complemento a dos (C2)** sólo cuando corresponde, con **ancho mínimo en bytes** para dec→hex negativo.
- **Endianness** por bytes (Big/Little) para representaciones C2.
- UI clara y responsiva; el selector **“Con signo”** aparece sólo cuando tiene sentido.
- Código modular y precisión con BigNumber para fracciones e enteros grandes.

## Rutas

- `/` — Landing con CTA y características.
- `/conversiones` — Panel de conversiones con entrada, resultados y pasos.
- `/operaciones` — Operaciones y visualizaciones (sumas/restas, Booth para enteros, punto fijo para fraccionarios).

---

## Cómo correrlo

### Requisitos

- **Bun 1.1+** (recomendado) o **Node.js 18.18+**
- `pnpm` o `npm` si no usas Bun

### Instalación

```bash
bun install
# o
pnpm install
```

### Desarrollo

```bash
# desde la raíz
bun run dev:web
# o
cd apps/web && bun run dev
```

Abre http://localhost:3001

### Build y ejecución

```bash
# build de todo (turborepo)
bun run build

# iniciar sólo la app web
cd apps/web
bun run start
```

### Pruebas

Config de Vitest en `apps/web/vitest.config.ts`:

```bash
cd apps/web
bunx vitest
```

---

## Modelo y arquitectura

- Framework: **Next.js 15 (App Router)** + **React 19**
- Precisión: **BigNumber** (fracciones y enteros grandes)
- UI: componentes modulares por conversión + orquestador de resultados

### Estructura relevante

```
apps/web/src/app/
  page.tsx
  (routes)/conversiones/page.tsx
  (routes)/operaciones/page.tsx

apps/web/src/components/
  conversion-results-panel.tsx
  input-results-panel.tsx
  results/<conv>/{summary,analysis,steps,final}.tsx
  theme-switch.tsx
  LetterGlitch.tsx

apps/web/src/lib/
  base-conversions.ts
  utils/*
```

### Flujo de conversión

1. Validación de entrada por base.
2. Conversión con funciones puras (entero/fracción por separado cuando aplica).
3. `ConversionResult` con:
   - `magnitude` (sin signo), `output` (string), `signedResult?`, `twosComplementHex?`
   - `integerSteps?` / `fractionalSteps?`
4. La UI decide mostrar “Sin signo/Con signo” y endianness según reglas.

---

## Conversores y reglas

_(Idéntico a la versión en inglés; se mantiene la misma semántica y ejemplos.)_

### Decimal → Binario

- Enteros: división sucesiva entre 2 (restos invertidos).
- Fracciones: multiplicación por 2 guardando bits; 20+1 bits para definir redondeo (si el siguiente bit es `1`, redondea; acarreo al entero si aplica).
- Signos:
  - Positivo/negativo explícito: la vista **Sin signo** sólo antepone `-` a la magnitud.
  - **“Con signo (C2)”** sólo para negativos explícitos.

### Binario → Decimal

- Posicional con BigNumber para fracciones.
- **“Con signo (C2)”** disponible si **no** hay `-` explícito y el MSB del entero es `1`.

### Decimal → Octal

- Entero: división por 8; fracción: multiplicación por 8 (redondeo base-8 si siguiente dígito ≥ 4).
- Sin C2 en octal.

### Decimal → Hexadecimal

- Entero: división por 16; fracción: multiplicación por 16 (redondeo base-16 si siguiente dígito ≥ 8).
- Positivos y fracciones: **sin C2**.
- Negativos enteros: **C2** con **mínimo ancho en bytes** (potencia de 2; **mínimo 16 bits**).

### Binario → Octal / Hexadecimal

- Agrupación por bloques (3 bits → octal; 4 bits → hex). En fracciones, agrupación hacia la derecha.

### Hexadecimal ↔ Binario

- Expansión/contracción por nibbles (4 bits por dígito).

### Octal ↔ Binario / Decimal / Hex

- Vía agrupación a 3 bits o posición en potencias de 8.

---

## Precisión y redondeo

- BigNumber con decimales altos, sin notación científica.
- Fracciones decimales: **20 dígitos** fijos.
- Redondeo por base:
  - base-2: siguiente bit `1`
  - base-8: siguiente dígito ≥ 4
  - base-16: siguiente dígito ≥ 8

---

## Estándares de código

- TypeScript estricto, React 19, Next 15.
- Lógica pura separada de la UI.
- Nombres claros; sin abreviaturas crípticas.
- Agrupado/formato de dígitos en la **UI** (no en la lógica).

---

## Contribuir

Consulta [CONTRIBUYENDO](CONTRIBUYENDO.md). Usamos **Conventional Commits** y aceptamos:

- Reportes de error con repro mínimo
- Propuestas de función con caso de uso claro
- Documentación y pruebas

---

## Reporte de bugs y soporte

Incluye:

- Ruta de conversión (de → a), entrada exacta (con/sin `-`, con/sin fracción)
- Esperado vs. obtenido (y por qué)
- Navegador/SO + capturas/logs
- Pasos mínimos para reproducir

---

## Seguridad

No publiques detalles explotables en issues públicos. Sigue [SEGURIDAD](SEGURIDAD.md) para reportar en privado.

---

## Enlace a código fuente (AGPL §13)

Si despliegas binaryx como servicio en red, muestra un enlace visible **“Source”** en la UI que apunte a este repositorio (y de preferencia al commit actual).

---

## Estado

**Activo** — roadmap: BCD/Gray/base-N, visualizaciones de overflow, timelines de bit-flip y lógica digital.

---

## Licencia

**AGPL-3.0**. Ver [LICENSE](LICENSE).
