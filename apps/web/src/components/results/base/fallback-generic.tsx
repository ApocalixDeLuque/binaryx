"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { getBaseNumber } from "@/lib/base-conversions";

interface FallbackGenericProps {
  result: ConversionResult;
}

export function FallbackGeneric({ result }: FallbackGenericProps) {
  const intSteps = result.integerSteps || [];

  const shouldShow = !(
    (result.inputBase === "decimal" &&
      ["octal", "hexadecimal", "binary"].includes(result.outputBase)) ||
    (result.inputBase === "binary" &&
      ["decimal", "octal", "hexadecimal"].includes(result.outputBase))
  );

  if (!shouldShow) {
    return null;
  }

  const initialInt =
    intSteps.length > 1
      ? typeof intSteps[1].quotient === "object"
        ? intSteps[1].quotient.toString()
        : (intSteps[1] as any).quotient
      : 0;

  const intBinaryMagnitude = intSteps.slice(1).map((s) => s.remainder).length
    ? intSteps
        .slice(1)
        .map((s) => s.remainder)
        .slice()
        .reverse()
        .join("")
    : "0";

  return (
    <>
      {intSteps.length > 1 && (
        <div className="mb-3">
          <div className="text-sm font-medium mb-2">
            Parte entera (÷{getBaseNumber(result.outputBase)})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1 border">Paso</th>
                  <th className="px-2 py-1 border">Cociente</th>
                  <th className="px-2 py-1 border">Bit/Dígito</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1 border text-center font-mono">0</td>
                  <td className="px-2 py-1 border text-center font-mono">
                    {initialInt}
                  </td>
                  <td className="px-2 py-1 border text-center font-mono">
                    ÷{getBaseNumber(result.outputBase)}
                  </td>
                </tr>
                {intSteps.slice(1).map((step, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 border text-center font-mono">
                      {i + 1}
                    </td>
                    <td className="px-2 py-1 border text-center font-mono">
                      {typeof step.quotient === "object"
                        ? step.quotient.toString()
                        : step.quotient}
                    </td>
                    <td className="px-2 py-1 border text-center font-mono">
                      {step.remainder}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs">
            <div className="text-muted-foreground">
              Resultado (de abajo hacia arriba):
            </div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
              {intBinaryMagnitude}
            </code>
          </div>
        </div>
      )}
    </>
  );
}
