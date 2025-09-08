import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";

/**
 * Binary to Hexadecimal Conversion Component
 */
export function BinaryToHexadecimalConversion({
  result,
}: {
  result: ConversionResult;
}) {
  if (!result) return null;

  return (
    <div className="mb-3">
      <div className="text-sm font-medium mb-2">Conversión hexadecimal</div>
      <div className="text-sm text-muted-foreground mb-2">
        Convertir cada 4 dígitos binarios a dígito hexadecimal:
      </div>

      {/* Binary to Hex conversion table */}
      <div className="text-sm text-muted-foreground mb-2">
        Conversión paso a paso:
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">Grupo Binario (4 bits)</th>
              <th className="px-2 py-1 border">Valor Decimal</th>
              <th className="px-2 py-1 border">Dígito Hex</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              // Get the binary input without spaces
              let cleanBinary = result.input.replace(/\s/g, "");

              // Check for negative sign
              const hasNegativeSign = cleanBinary.startsWith("-");
              if (hasNegativeSign) {
                cleanBinary = cleanBinary.substring(1); // Remove the negative sign for processing
              }

              // Pad with zeros on the left to make length divisible by 4
              while (cleanBinary.length % 4 !== 0) {
                cleanBinary = "0" + cleanBinary;
              }

              // Group into 4-bit chunks
              const groups = [];
              for (let i = 0; i < cleanBinary.length; i += 4) {
                groups.push(cleanBinary.slice(i, i + 4));
              }

              return groups.map((group, index) => {
                const decimal = parseInt(group, 2);
                const hexChar = "0123456789ABCDEF"[decimal];
                return (
                  <tr key={index}>
                    <td className="px-2 py-1 border text-center font-mono">
                      {hasNegativeSign && index === 0 ? "-" + group : group}
                    </td>
                    <td className="px-2 py-1 border text-center">{decimal}</td>
                    <td className="px-2 py-1 border text-center font-mono bg-primary/10">
                      {hasNegativeSign && index === 0 ? "-" + hexChar : hexChar}
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
        Resultado final:{" "}
        <span className="font-mono">
          {(() => {
            // Calculate the correct hex result
            let cleanBinary = result.input.replace(/\s/g, "");
            const hasNegativeSign = cleanBinary.startsWith("-");

            if (hasNegativeSign) {
              cleanBinary = cleanBinary.substring(1);
            }

            // Pad with zeros on the left to make length divisible by 4
            while (cleanBinary.length % 4 !== 0) {
              cleanBinary = "0" + cleanBinary;
            }

            // Group into 4-bit chunks and convert to hex
            const groups = [];
            for (let i = 0; i < cleanBinary.length; i += 4) {
              groups.push(cleanBinary.slice(i, i + 4));
            }

            const hexChars = groups.map((group) => {
              const decimal = parseInt(group, 2);
              return "0123456789ABCDEF"[decimal];
            });

            // Group hex chars in pairs (2 chars per group)
            const hexGroups = [];
            for (let i = 0; i < hexChars.length; i += 2) {
              hexGroups.push(hexChars.slice(i, i + 2).join(""));
            }

            const hexResult = hexGroups.join(" ");
            return hasNegativeSign ? "-" + hexResult : hexResult;
          })()}
        </span>
      </div>
    </div>
  );
}
