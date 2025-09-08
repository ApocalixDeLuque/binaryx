import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";

/**
 * Octal to Binary Conversion Component
 */
export function OctalToBinaryConversion({
  result,
}: {
  result: ConversionResult;
}) {
  if (!result) return null;

  return (
    <div className="mb-3">
      <div className="text-sm font-medium mb-2">Conversión binaria</div>
      <div className="text-sm text-muted-foreground mb-3">
        Convertir cada dígito octal a 3 dígitos binarios:
      </div>
      <table className="w-full border border-border text-sm mb-3">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-2 py-1 text-left border">Dígito Octal</th>
            <th className="px-2 py-1 text-left border">
              Dígitos Binarios (3 bits)
            </th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const hasNegative = result.input.startsWith("-");
            const cleanOctal = hasNegative
              ? result.input.slice(1).replace(/\s/g, "")
              : result.input.replace(/\s/g, "");
            return cleanOctal.split("").map((digit, index) => {
              const decimal = parseInt(digit, 8);
              const binary = decimal.toString(2).padStart(3, "0");
              return (
                <tr key={index}>
                  <td className="px-2 py-1 border font-mono text-center">
                    {digit}
                  </td>
                  <td className="px-2 py-1 border font-mono text-center">
                    {binary}
                  </td>
                </tr>
              );
            });
          })()}
        </tbody>
      </table>
      <div className="text-xs font-mono text-muted-foreground">
        Resultado: {result.output}
      </div>
    </div>
  );
}
