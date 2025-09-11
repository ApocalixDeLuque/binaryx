"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";

interface StepsProps {
  result: ConversionResult;
  viewMode?: "unsigned" | "signed";
}

export function HexadecimalToDecimalSteps({
  result,
  viewMode = "unsigned",
}: StepsProps) {
  const explicitNegative = result.input.trim().startsWith("-");

  const clean = result.input.replace(/\s/g, "").replace(/^-/, "");
  const [intRaw = "", fracRaw = ""] = clean.split(".");

  // Use final output to derive accurate fractional/union displays (matches conversion precision)
  const outClean = (result.output || "").replace(/[\s,]/g, "");
  const outUnsigned = outClean.startsWith("-") ? outClean.slice(1) : outClean;
  const [outIntStr = "", outFracStr = ""] = outUnsigned.split(".");

  // Detect if we should interpret as signed two's complement (only for integers, no explicit '-')
  const msNibble = (intRaw || "0")[0] || "0";
  const msVal = parseInt(msNibble, 16);
  const isSignedC2 =
    !explicitNegative &&
    viewMode === "signed" &&
    fracRaw.length === 0 &&
    msVal >= 8;

  // Undo C2 to get magnitude (hex) when signed view is active
  const hexMinusOne = (() => {
    if (!isSignedC2) return "";
    const w = (intRaw || "0").length || 1;
    try {
      const v = BigInt("0x" + (intRaw || "0")) - BigInt(1);
      return v.toString(16).toUpperCase().padStart(w, "0");
    } catch {
      // Manual fallback
      const arr = (intRaw || "0").toUpperCase().split("");
      for (let i = arr.length - 1; i >= 0; i--) {
        const d = parseInt(arr[i], 16);
        if (d > 0) {
          arr[i] = (d - 1).toString(16).toUpperCase();
          break;
        } else {
          arr[i] = "F";
        }
      }
      return arr.join("");
    }
  })();

  const magnitudeHex = (() => {
    if (!isSignedC2) return intRaw.toUpperCase();
    const src = hexMinusOne || intRaw.toUpperCase();
    return src
      .split("")
      .map((ch) => (15 - parseInt(ch, 16)).toString(16).toUpperCase())
      .join("");
  })();

  // Build integer positional contributions (digit * 16^position)
  const intRows = (magnitudeHex || "0")
    .split("")
    .reverse()
    .map((ch, idx) => ({
      ch: ch.toUpperCase(),
      power: idx,
      contrib: parseInt(ch, 16) * Math.pow(16, idx),
    }))
    .reverse();

  // Build fractional positional contributions (digit * 16^-position)
  const fracRows = fracRaw.split("").map((ch, idx) => ({
    ch: ch.toUpperCase(),
    power: -(idx + 1),
    contrib: parseInt(ch, 16) * Math.pow(16, -(idx + 1)),
  }));
  // Formatter for tiny contributions: scientific notation if |v| < 1e-12
  const formatContribution = (v: number): string => {
    if (v === 0) return "0";
    const abs = Math.abs(v);
    if (abs < 1e-12) return v.toExponential(3);
    const s = v.toFixed(12).replace(/0+$/g, "").replace(/\.$/, "");
    return s || "0";
  };

  const intSum = intRows.reduce((s, r) => s + r.contrib, 0);
  const fracSum = fracRows.reduce((s, r) => s + r.contrib, 0);
  const intSumExpr = intRows
    .map((r) => r.contrib)
    .filter((v) => v !== 0)
    .join(" + ");
  const union = intSum + fracSum;

  // Step numbering offset if we show the C2 undoing steps
  const preSteps = isSignedC2 ? 2 : 0;
  const intTitleStepNum = 1 + preSteps;
  const fracTitleStepNum = 2 + preSteps;
  const unionStepNum = 3 + preSteps;
  const applyNegStepNum = unionStepNum + 1;

  return (
    <Section title="Desglose Hexadecimal → Decimal">
      {isSignedC2 && (
        <div className="space-y-2 text-xs mb-2">
          <div className="text-sm text-muted-foreground">
            1) Deshacer C2 (restar 1):
            <code className="ml-2 font-mono border rounded px-2 py-1 inline-block">
              {hexMinusOne}
            </code>
          </div>
          <div className="text-sm text-muted-foreground">
            2) Invertir nibbles (15 − dígito) → magnitud:
          </div>
          <div className="mt-2">
            <div className="text-xs text-muted-foreground mb-1">
              Tabla de inversión (15 − dígito):
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-2 py-1 border">Dígito (x−1)</th>
                    <th className="px-2 py-1 border">Decimal</th>
                    <th className="px-2 py-1 border">15 − Decimal</th>
                    <th className="px-2 py-1 border">Hex</th>
                  </tr>
                </thead>
                <tbody>
                  {(hexMinusOne || "").split("").map((d, i) => {
                    const dec = parseInt(d || "0", 16);
                    const invDec = 15 - dec;
                    const invHex = invDec.toString(16).toUpperCase();
                    return (
                      <tr key={i}>
                        <td className="px-2 py-1 border text-center font-mono">
                          {(d || "0").toUpperCase()}
                        </td>
                        <td className="px-2 py-1 border text-center">{dec}</td>
                        <td className="px-2 py-1 border text-center">
                          15 − {dec} = {invDec}
                        </td>
                        <td className="px-2 py-1 border text-center font-mono">
                          {invHex}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-3 text-xs">
            <div className="text-muted-foreground">Magnitud obtenida:</div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
              {magnitudeHex}
            </code>
          </div>
        </div>
      )}
      <div className="text-sm text-muted-foreground mb-2">
        {intTitleStepNum}) Parte entera (dígito × 16^n):
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">Hex</th>
              <th className="px-2 py-1 border">Potencia</th>
              <th className="px-2 py-1 border">Contribución</th>
            </tr>
          </thead>
          <tbody>
            {intRows.map((r, i) => (
              <tr key={i}>
                <td className="px-2 py-1 border text-center font-mono">
                  {r.ch}
                </td>
                <td className="px-2 py-1 border text-center font-mono">
                  16^{r.power}
                </td>
                <td className="px-2 py-1 border text-center font-mono">
                  {r.contrib}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Explicit step: sum contributions (integer) */}
      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">
          Suma de contribuciones (parte entera):
        </div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
          {intSumExpr || "0"}
        </code>
      </div>
      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">Parte entera obtenida:</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
          {isSignedC2 ? intSum : outIntStr || intSum}
        </code>
      </div>

      {fracRows.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">
            {fracTitleStepNum}) Parte fraccionaria (dígito × 16^-n):
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1 border">Hex</th>
                  <th className="px-2 py-1 border">Potencia</th>
                  <th className="px-2 py-1 border">Contribución</th>
                </tr>
              </thead>
              <tbody>
                {fracRows.map((r, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 border text-center font-mono">
                      {r.ch}
                    </td>
                    <td className="px-2 py-1 border text-center font-mono">
                      16^{r.power}
                    </td>
                    <td className="px-2 py-1 border text-center font-mono">
                      {formatContribution(r.contrib)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs">
            <div className="text-muted-foreground">
              Parte fraccionaria obtenida:
            </div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
              {outFracStr ? `0.${outFracStr}` : "0"}
            </code>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs">
        <div className="text-sm text-muted-foreground mb-2">
          {unionStepNum}) Unión de partes:
        </div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words max-w-full">
          {isSignedC2 ? union : outUnsigned || union}
        </code>
      </div>
      {(explicitNegative || isSignedC2) && (
        <div className="mt-2 text-xs">
          <div className="text-sm text-muted-foreground mb-2">{`${applyNegStepNum}) Aplicar signo negativo:`}</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            -{isSignedC2 ? union : outUnsigned || union}
          </code>
        </div>
      )}
    </Section>
  );
}
