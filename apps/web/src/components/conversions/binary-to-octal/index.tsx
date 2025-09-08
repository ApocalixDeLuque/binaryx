import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";

/**
 * Binary to Octal Conversion Component
 */
export function BinaryToOctalConversion({
  result,
}: {
  result: ConversionResult;
}) {
  if (!result) return null;

  return (
    <div className="mb-3">
      <div className="text-sm font-medium mb-2">Conversión octal</div>
      <div className="text-sm text-muted-foreground mb-2">
        Convertir cada 3 dígitos binarios a dígito octal:
      </div>

      {/* Binary to Octal conversion table */}
      <div className="text-sm text-muted-foreground mb-2">
        Conversión paso a paso:
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">Grupo Binario (3 bits)</th>
              <th className="px-2 py-1 border">Valor Decimal</th>
              <th className="px-2 py-1 border">Dígito Octal</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              // Get the binary input without spaces
              let cleanBinary = result.input.replace(/\s/g, "");

              // Pad with zeros on the left to make length divisible by 3
              while (cleanBinary.length % 3 !== 0) {
                cleanBinary = "0" + cleanBinary;
              }

              // Group into 3-bit chunks
              const groups = [];
              for (let i = 0; i < cleanBinary.length; i += 3) {
                groups.push(cleanBinary.slice(i, i + 3));
              }

              return groups.map((group, index) => {
                const decimal = parseInt(group, 2);
                const octalChar = decimal.toString();
                return (
                  <tr key={index}>
                    <td className="px-2 py-1 border text-center font-mono">
                      {group}
                    </td>
                    <td className="px-2 py-1 border text-center">{decimal}</td>
                    <td className="px-2 py-1 border text-center font-mono bg-primary/10">
                      {octalChar}
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-2 text-xs text-muted-foreground">
        Resultado final: <span className="font-mono">{result.output}</span>
      </div>
    </div>
  );
}
