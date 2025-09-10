"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";
import BigNumber from "bignumber.js";

interface StepsProps {
  result: ConversionResult;
}

export function DecimalToHexadecimalSteps({ result }: StepsProps) {
  const intSteps = result.integerSteps || [];
  const fracSteps = result.fractionalSteps || [];
  const explicitNegative = result.input.trim().startsWith("-");

  const initialIntegerValue = intSteps.length
    ? typeof intSteps[0].quotient === "object"
      ? (intSteps[0].quotient as any as BigNumber).toString()
      : String(intSteps[0].quotient)
    : "0";

  const integerDigitsFromTable = intSteps.length
    ? intSteps
        .map((s) => s.remainder)
        .slice()
        .reverse()
        .map((n) => n.toString(16).toUpperCase())
        .join("")
    : "0";

  const hexDigit = (n: number) => n.toString(16).toUpperCase();

  // Use the rounded magnitude's fractional part so recap matches final output
  const magnitude = result.magnitude || "";
  const [, magFrac = ""] = magnitude.split(".");
  const fractionalDigitsFromTable = magFrac;

  const combinedFromTables = fractionalDigitsFromTable
    ? `${integerDigitsFromTable}.${fractionalDigitsFromTable}`
    : integerDigitsFromTable;

  const initialFractionalValue = fracSteps.length
    ? Number(fracSteps[0].value).toFixed(4)
    : undefined;

  // Build display rows based on the rounded magnitude fractional length
  const displayDigits = magFrac.split("");
  const allFracRows = fracSteps.filter((_, idx) => idx > 0);
  const maxRows = Math.min(displayDigits.length, allFracRows.length);
  const rows = allFracRows.slice(0, maxRows);

  return (
    <Section title="Conversión Decimal → Hexadecimal">
      <div className="text-sm text-muted-foreground mb-2">Parte entera:</div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">
                Valor ({initialIntegerValue})
              </th>
              <th className="px-2 py-1 border">÷16</th>
            </tr>
          </thead>
          <tbody>
            {intSteps.map((step, index) => {
              const nextQuotient =
                index < intSteps.length - 1 ? intSteps[index + 1].quotient : 0;
              const nextValue =
                typeof nextQuotient === "object"
                  ? (nextQuotient as any as BigNumber).toString()
                  : String(nextQuotient);
              return (
                <tr key={index}>
                  <td className="px-2 py-1 border text-center font-mono">
                    {nextValue}
                  </td>
                  <td className="px-2 py-1 border text-center font-mono">
                    {hexDigit(step.remainder)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recap: integer digits from table */}
      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">Parte entera obtenida:</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
          {integerDigitsFromTable}
        </code>
      </div>

      {fracSteps.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">
            Parte fraccionaria:
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1 border">×16</th>
                  <th className="px-2 py-1 border">
                    Valor ({initialFractionalValue})
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1 border text-center font-mono">
                      {(displayDigits[idx] || hexDigit(s.bit)).toUpperCase()}
                    </td>
                    <td className="px-2 py-1 border text-center font-mono">
                      {Number(s.value).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recap: fractional digits from table */}
          <div className="mt-3 text-xs">
            <div className="text-muted-foreground">
              Parte fraccionaria obtenida:
            </div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
              {fractionalDigitsFromTable || "0"}
            </code>
          </div>
        </div>
      )}

      {/* Recap: union of integer and fractional parts */}
      {fractionalDigitsFromTable && (
        <div className="mt-4 text-xs">
          <div className="text-muted-foreground">Unión de partes:</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
            {combinedFromTables}
          </code>
        </div>
      )}

      {explicitNegative && (
        <div className="mt-2 text-xs">
          <div className="text-muted-foreground">Aplicar signo negativo:</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
            -
            {fractionalDigitsFromTable
              ? combinedFromTables
              : integerDigitsFromTable}
          </code>
        </div>
      )}
    </Section>
  );
}
