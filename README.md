# binaryx — Conversión de bases y aritmética binaria

Herramientas minimalistas, precisas y explicativas para trabajar con números en distintas bases. Incluye pasos detallados de cada conversión, soporte de fracciones, reglas de redondeo por base, complemento a dos (C2) cuando corresponde, y representación por endianness.

> Estado: activo. Este proyecto está pensado para crecer en comunidad (lógica digital, más operaciones, visualizaciones, etc.).

---

## Índice

- [binaryx — Conversión de bases y aritmética binaria](#binaryx--conversión-de-bases-y-aritmética-binaria)
  - [Índice](#índice)
  - [Características](#características)
  - [Rutas y navegación](#rutas-y-navegación)
  - [Cómo correrlo localmente](#cómo-correrlo-localmente)
    - [Requisitos](#requisitos)
    - [Instalación](#instalación)
    - [Desarrollo](#desarrollo)
    - [Build y producción](#build-y-producción)
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
    - [Octal ↔ Binario / Decimal / Hexadecimal](#octal--binario--decimal--hexadecimal)
  - [Complemento a dos (C2)](#complemento-a-dos-c2)
    - [Cuándo aplica](#cuándo-aplica)
    - [Ancho mínimo en Decimal → Hexadecimal](#ancho-mínimo-en-decimal--hexadecimal)
    - [Interpretación firmada en Hexadecimal → Decimal](#interpretación-firmada-en-hexadecimal--decimal)
    - [Endianness](#endianness)
  - [Precisión y redondeo](#precisión-y-redondeo)
  - [Estándares de código](#estándares-de-código)
  - [Contribuir](#contribuir)
    - [Sugerencias de mejora](#sugerencias-de-mejora)
  - [Reporte de bugs y soporte](#reporte-de-bugs-y-soporte)
  - [Seguridad](#seguridad)
  - [Licencia](#licencia)

---

## Características

- Conversión entre bases con pasos explicados (tablas para entero/fracción, recap y unión).
- Soporte de fracciones con 20 dígitos decimales fijos en salidas decimales.
- Redondeo por dígito siguiente basado en la base (p. ej., en hex se redondea si el próximo dígito es ≥ 8).
- Complemento a dos (C2) con reglas correctas (solo cuando corresponde) y con ancho mínimo en dec→hex negativo.
- Endianness por bytes (Big/Little) para representaciones C2.
- UI clara y responsiva. Selector “Con signo” aparece solo cuando tiene sentido.
- Código abierto, modular y con precisión (BigNumber) para fracciones y enteros grandes.

## Rutas y navegación

- `/` — Landing page, CTA y secciones de características.
- `/conversiones` — Panel de conversiones con entrada, resultados y pasos.
- `/operaciones` — Operaciones y visualizaciones (sumas/restas, Booth para enteros, punto fijo para fraccionarios).

---

## Cómo correrlo localmente

### Requisitos

- Bun 1.1+ (recomendado) o Node.js 18.18+
- pnpm o npm si no usas Bun

### Instalación

Clona el repo y instala dependencias (monorepo con Turbo):

```bash
bun install
# o
pnpm install
```

### Desarrollo

Ejecuta solo la app web (Next.js) en modo dev:

```bash
# desde la raíz
bun run dev:web
# o
cd apps/web && bun run dev
```

Abre http://localhost:3001

### Build y producción

```bash
# build de todo (turborepo)
bun run build

# iniciar solo la app web
cd apps/web
bun run start
```

### Pruebas

La configuración de Vitest está en `apps/web/vitest.config.ts`.

```bash
cd apps/web
bunx vitest
```

---

## Modelo y arquitectura

- Framework: Next.js 15 (App Router) + React 19
- Precisión: BigNumber (fracciones y enteros grandes)
- UI: componentes modulares por conversión, y un orquestador de resultados

### Estructura relevante

```
apps/web/src/app/
  page.tsx                 # Landing
  (routes)/conversiones/page.tsx
  (routes)/operaciones/page.tsx

apps/web/src/components/
  conversion-results-panel.tsx   # Orquesta vistas de resultados
  input-results-panel.tsx        # Entrada + resultados
  results/<conv>/{summary,analysis,steps,final}.tsx
  theme-switch.tsx               # Conmutador claro/oscuro/sistema
  LetterGlitch.tsx               # Fondo animado del hero

apps/web/src/lib/
  base-conversions.ts            # Núcleo de conversiones
  utils/*                        # tipos, helpers, formateo, etc.
```

### Flujo de conversión

1. Validación de entrada por base.
2. Conversión con funciones puras (entero/fracción por separado cuando aplica).
3. Generación de `ConversionResult` con:
   - `magnitude` (sin signo), `output` (string), `signedResult?`, `twosComplementHex?`
   - pasos `integerSteps?`/`fractionalSteps?`
4. La UI decide mostrar “Sin signo/Con signo” y endianness según reglas.

---

## Conversores y reglas

### Decimal → Binario

- Enteros: división sucesiva entre 2, remainders invertidos al final.
- Fracciones: multiplicación por 2 guardando el bit; se computan 20+1 bits para definir redondeo (si el siguiente bit es 1, se redondea; acarrea al entero si corresponde).
- Signos:
  - Positivo o negativo con signo explícito: la vista “Sin signo” solo antepone `-` a la magnitud.
  - “Con signo (C2)” sólo para negativos explícitos.

### Binario → Decimal

- Posicional: suma de `bit × 2^n` para entero; para fracciones, `bit × 2^-k` con BigNumber.
- Vista “Con signo (C2)” disponible cuando:
  - No hay `-` explícito y el MSB del entero es `1` (intepretación firmada).

### Decimal → Octal

- Entero: división sucesiva por 8; fracción: multiplicación por 8 (+ redondeo base‑8 si el siguiente dígito ≥ 4).
- Signos: solo se antepone `-` en la vista sin signo; no hay C2 en octal.

### Decimal → Hexadecimal

- Entero: división por 16; fracción: multiplicación por 16 con redondeo base‑16 (siguiente dígito ≥ 8).
- Signos:
  - Positivos y fracciones: NO se calcula C2.
  - Negativos enteros: se calcula C2 con ancho mínimo necesario en bytes (múltiplo de 8 y potencia de 2; mínimo 16 bits). El resultado C2 se muestra en mayúsculas.
- Endianness: tabla Big/Little endian por bytes (sin `00` líderes superfluos en la tabla).

### Binario → Octal / Hexadecimal

- Agrupación por bloques: 3 bits → octal, 4 bits → hex. Para fracciones se agrupa hacia la derecha.

### Hexadecimal ↔ Binario

- Expansión/contracción por nibbles (4 bits por dígito hex). Recorta ceros líderes/trailing según corresponda.

### Octal ↔ Binario / Decimal / Hexadecimal

- Vía agrupación a 3 bits o posición en potencias de 8 para decimal.

---

## Complemento a dos (C2)

### Cuándo aplica

- Nunca para positivos.
- Nunca para fracciones.
- Aplica en:
  - Decimal → Hexadecimal si el decimal es negativo y entero.
  - Hexadecimal → Decimal (modo “Con signo”) si NO hay `-` explícito, es entero y el nibble más significativo (MS) ≥ 8.

### Ancho mínimo en Decimal → Hexadecimal

- Se usa el menor ancho en bytes (potencia de 2) que puede representar `|N|` en C2; mínimo 16 bits.
- Ejemplos:
  - `-20` → `FFEC`
  - `-276` → `FEEC`
  - `-2076` → `F7E4`
  - `-9999` → `D8F1`
  - `-999999` → `FFF0BDC1`

### Interpretación firmada en Hexadecimal → Decimal

- Si el MS nibble ≥ 8 (y la entrada es entera sin `-`), el modo “Con signo (C2)” realiza:
  1. `-1` a la palabra
  2. Invertir nibbles (15 − dígito)
  3. Sumar 1 (conceptualmente) → magnitud
  4. Convertir a decimal y aplicar `-` a la magnitud resultante
- Los pasos en UI muestran explícitamente la tabla de inversión.

### Endianness

- Cuando se presenta C2 (dec→hex negativo), se muestran bytes en Big y Little endian.
- Se omiten bytes `00` líderes en la tabla para claridad (no se alteran los bytes reales del valor C2 publicado).

---

## Precisión y redondeo

- BigNumber configura decimales altos y evita notación científica.
- Fracciones en decimal: 20 dígitos fijos para estabilidad visual.
- Redondeo por base:
  - base‑2: siguiente bit `1` redondea la última posición guardada (con acarreo al entero si aplica)
  - base‑8: siguiente dígito ≥ 4
  - base‑16: siguiente dígito ≥ 8

---

## Estándares de código

- TypeScript estricto, React 19, Next 15.
- Lógica pura sin efectos colaterales y separada de la UI.
- Nombres claros; evita abreviaturas crípticas.
- Formateo y agrupado de dígitos en la UI (no en la lógica).

---

## Contribuir

¡Contribuciones bienvenidas! Algunas pautas:

- **Commits**: usa Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- **PRs**: explica problema, solución, impacto y añade pruebas/capturas si aplica.
- **Pruebas**: cubre límites (C2, redondeo, grandes magnitudes). No rompas el “gating” de C2.
- **Estilo**: respeta decisiones de precisión, UX y reglas de C2 (positivos y fracciones no llevan C2).

### Sugerencias de mejora

- Más familias de conversión (BCD, Gray, base‑N arbitraria)
- Visualizaciones (overflow, timelines de acarreo, bit‑flip)
- Lógica digital (puertas, tablas de verdad, circuitos)
- Internacionalización de la UI

---

## Reporte de bugs y soporte

Abre un issue incluyendo:

- Conversión (de → a), entrada exacta, si hay `-`, si hay fracción
- Resultado esperado vs. obtenido (y por qué)
- Navegador/SO y capturas/logs si ayudan
- Pasos mínimos para reproducir

Para solicitudes de funcionalidad: explica el caso de uso, alcance e impacto.

---

## Seguridad

No publiques detalles explotables en issues públicos. Si encuentras un problema de seguridad, por favor notifícalo por un canal privado (email o mensaje directo) para coordinar una respuesta responsable.

---

## Licencia

Este proyecto es open source. La elección de licencia está pendiente de confirmación (MIT o Apache‑2.0 son opciones comunes). Si deseas que se publique una licencia específica, abre un issue o PR.

---

¿Dudas o ideas? ¡Abre un issue y conversemos!
