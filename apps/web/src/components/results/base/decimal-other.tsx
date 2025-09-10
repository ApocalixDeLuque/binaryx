"use client";

import React from "react";
import BigNumber from "bignumber.js";
import type { ConversionResult } from "@/lib/base-conversions";
import {
  getBaseName,
  getBaseNumber,
  formatDisplayValue,
} from "@/lib/base-conversions";

interface DecimalOtherConversionProps {
  result: ConversionResult;
}

export function DecimalOtherConversion({
  result,
}: DecimalOtherConversionProps) {
  const intSteps = result.integerSteps || [];

  if (
    !(
      result.inputBase === "decimal" &&
      ["octal", "hexadecimal"].includes(result.outputBase) &&
      intSteps.length > 1
    )
  ) {
    return null;
  }

  return (
    <div className="mb-3">
      <div className="text-sm font-medium mb-3">
        Pasos de cálculo para conversión {getBaseName(result.inputBase)} →{" "}
        {getBaseName(result.outputBase)}
      </div>
      <div className="text-sm text-muted-foreground mb-2">
        Dividir por la base {getBaseNumber(result.outputBase)} para obtener los
        dígitos desde los restos:
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">
                División por {getBaseNumber(result.outputBase)}
              </th>
              <th className="px-2 py-1 border">Cociente</th>
              <th className="px-2 py-1 border">Resto (Dígito)</th>
              <th className="px-2 py-1 border">Dígito #</th>
            </tr>
          </thead>
          <tbody>
            {intSteps.map((step, i) => (
              <tr key={i}>
                <td className="px-2 py-1 border text-center font-mono">
                  (
                  {typeof step.quotient === "object"
                    ? step.quotient.toString()
                    : step.quotient}
                  )/
                  {getBaseNumber(result.outputBase)}
                </td>
                <td className="px-2 py-1 border text-center font-mono">
                  {typeof step.quotient === "object"
                    ? step.quotient
                        .div(getBaseNumber(result.outputBase))
                        .integerValue(BigNumber.ROUND_DOWN)
                        .toString()
                    : Math.floor(
                        step.quotient / getBaseNumber(result.outputBase)
                      )}
                </td>
                <td className="px-2 py-1 border text-center font-mono">
                  {step.remainder}
                </td>
                <td className="px-2 py-1 border text-center font-mono">
                  {intSteps.length - 1 - i}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">
          Resultado de la tabla (antes del complemento):
        </div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
          {result.integerSteps
            ?.map((step) => step.remainder)
            .reverse()
            .join("") || result.output}
        </code>
      </div>

      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">
          Acomodo con formato requerido:
        </div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
          {formatDisplayValue(
            result.magnitude ||
              result.integerSteps
                ?.map((step) => step.remainder)
                .reverse()
                .join("") ||
              result.output,
            result.outputBase
          )}
        </code>
      </div>
    </div>
  );
}
