"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";

interface StepsProps {
  result: ConversionResult;
}

export function OctalToDecimalSteps({ result }: StepsProps) {
  const explicitNegative = result.input.trim().startsWith("-");

  const clean = result.input.replace(/\s/g, "").replace(/^-/, "");
  const [intRaw = "", fracRaw = ""] = clean.split(".");

  // Use final output to derive accurate fractional/union displays (matches conversion precision)
  const outClean = (result.output || "").replace(/[\s,]/g, "");
  const outUnsigned = outClean.startsWith("-") ? outClean.slice(1) : outClean;
  const [outIntStr = "", outFracStr = ""] = outUnsigned.split(".");

  // Build integer positional contributions (digit * 8^position)
  const intRows = intRaw
    .split("")
    .reverse()
    .map((ch, idx) => ({
      ch,
      power: idx,
      contrib: parseInt(ch || "0", 8) * Math.pow(8, idx),
    }))
    .reverse();

  // Build fractional positional contributions (digit * 8^-position)
  const fracRows = fracRaw.split("").map((ch, idx) => ({
    ch,
    power: -(idx + 1),
    contrib: parseInt(ch || "0", 8) * Math.pow(8, -(idx + 1)),
  }));

  const intSum = intRows.reduce((s, r) => s + r.contrib, 0);
  const fracSum = fracRows.reduce((s, r) => s + r.contrib, 0);
  // Build human-readable sum expressions (omit zero contributions)
  const intSumExpr = intRows
    .map((r) => r.contrib)
    .filter((v) => v !== 0)
    .join(" + ");
  const formatContribution = (v: number): string => {
    if (v === 0) return "0";
    const abs = Math.abs(v);
    if (abs < 1e-12) return v.toExponential(3);
    const s = v.toFixed(12).replace(/0+$/g, "").replace(/\.$/, "");
    return s || "0";
  };
  const fracSumExpr = fracRows
    .map((r) => r.contrib)
    .filter((v) => v !== 0)
    .map(formatContribution)
    .join(" + ");
  // Display values derived from precise final output
  const fracSumDisplay = outFracStr ? `0.${outFracStr}` : "0";
  const unionDisplay = outUnsigned || (intSum + fracSum).toString();

  return (
    <Section title="Desglose Octal → Decimal">
      <div className="text-sm text-muted-foreground mb-2">
        1) Parte entera (dígito × 8^n):
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">Octal</th>
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
                  8^{r.power}
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
          {outIntStr || intSum}
        </code>
      </div>

      {fracRows.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">
            2) Parte fraccionaria (dígito × 8^-n):
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1 border">Octal</th>
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
                      8^{r.power}
                    </td>
                    <td className="px-2 py-1 border text-center font-mono">
                      {formatContribution(r.contrib)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Explicit step: sum contributions (fractional) */}
          <div className="mt-3 text-xs">
            <div className="text-muted-foreground">
              Suma de contribuciones (parte fraccionaria):
            </div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
              {fracSumExpr || "0"}
            </code>
          </div>
          <div className="mt-3 text-xs">
            <div className="text-muted-foreground">
              Parte fraccionaria obtenida:
            </div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
              {fracSumDisplay}
            </code>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs">
        <div className="text-sm text-muted-foreground mb-2">
          3) Unión de partes:
        </div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
          {unionDisplay}
        </code>
      </div>
      {explicitNegative && (
        <div className="mt-2 text-xs">
          <div className="text-sm text-muted-foreground mb-2">
            4) Aplicar signo negativo:
          </div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            -{unionDisplay}
          </code>
        </div>
      )}
    </Section>
  );
}
