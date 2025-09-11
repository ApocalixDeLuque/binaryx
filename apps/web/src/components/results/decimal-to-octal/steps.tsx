"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";
import BigNumber from "bignumber.js";

interface StepsProps {
  result: ConversionResult;
}

export function DecimalToOctalSteps({ result }: StepsProps) {
  const intSteps = result.integerSteps || [];
  const fracSteps = result.fractionalSteps || [];
  const explicitNegative = result.input.trim().startsWith("-");

  // Two-column table: Valor | ÷8 (remainder)
  // Header shows initial value
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
        .join("")
    : "0";

  // Fractional recap: use rounded magnitude's fractional part to match final output
  const magnitude = result.magnitude || "";
  const [, magFrac = ""] = magnitude.split(".");
  const fractionalDigitsFromTable = magFrac;
  const combinedFromTables = fractionalDigitsFromTable
    ? `${integerDigitsFromTable}.${fractionalDigitsFromTable}`
    : integerDigitsFromTable;
  const initialFractionalValue = fracSteps.length
    ? Number(fracSteps[0].value).toFixed(4)
    : undefined;
  const showFrac = fracSteps.length > 0;
  const showUnion = Boolean(fractionalDigitsFromTable);
  const applyNegStepNum = 1 + (showFrac ? 1 : 0) + (showUnion ? 1 : 0) + 1;

  return (
    <Section title="Conversión Decimal → Octal">
      <div className="text-sm text-muted-foreground mb-2">
        1) Parte entera (÷8):
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">
                Valor ({initialIntegerValue})
              </th>
              <th className="px-2 py-1 border">÷8</th>
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
                    {step.remainder}
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
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
          {integerDigitsFromTable}
        </code>
      </div>

      {fracSteps.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">
            2) Parte fraccionaria (×8):
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1 border">×8</th>
                  <th className="px-2 py-1 border">
                    Valor ({initialFractionalValue})
                  </th>
                </tr>
              </thead>
              <tbody>
                {fracSteps
                  .filter((_, idx) => idx > 0)
                  .slice(0, 20)
                  .map((s, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1 border text-center font-mono">
                        {s.bit}
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
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
              {fractionalDigitsFromTable || "0"}
            </code>
          </div>
        </div>
      )}

      {/* Recap: union of integer and fractional parts */}
      {fractionalDigitsFromTable && (
        <div className="mt-4 text-xs">
          <div className="text-sm text-muted-foreground mb-2">
            3) Unión de partes:
          </div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            {combinedFromTables}
          </code>
        </div>
      )}

      {explicitNegative && (
        <div className="mt-2 text-xs">
          <div className="text-sm text-muted-foreground mb-2">{`${applyNegStepNum}) Aplicar signo negativo:`}</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
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
