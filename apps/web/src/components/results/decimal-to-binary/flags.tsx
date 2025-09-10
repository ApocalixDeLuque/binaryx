"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";

interface DecimalToBinaryFlagsProps {
  result: ConversionResult;
  viewMode: "unsigned" | "signed";
  showFlags?: boolean;
}

export function DecimalToBinaryFlags({
  result,
  viewMode,
  showFlags = true,
}: DecimalToBinaryFlagsProps) {
  const isNegative = result.input.trim().startsWith("-");
  if (
    !result.flags ||
    !showFlags ||
    result.outputBase !== "binary" ||
    viewMode !== "signed" ||
    !isNegative
  ) {
    return null;
  }

  return (
    <div className="border rounded-lg">
      <div className="px-4 py-3 border-b bg-muted/50">
        <h3 className="text-sm font-medium">Banderas (Flags)</h3>
      </div>
      <div className="p-4">
        <table className="w-full border border-border text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 text-left border">Flag</th>
              <th className="px-2 py-1 text-left border">Descripción</th>
              <th className="px-2 py-1 text-left border">Valor</th>
              <th className="px-2 py-1 text-left border">Explicación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 py-1 border font-mono">Z</td>
              <td className="px-2 py-1 border">
                {result.flags.zero ? "Resultado = 0" : "Resultado ≠ 0"}
              </td>
              <td className="px-2 py-1 border font-mono">
                {result.flags.zero ? "1" : "0"}
              </td>
              <td className="px-2 py-1 border">
                {result.flags.zero
                  ? "El resultado es cero"
                  : "El resultado no es cero"}
              </td>
            </tr>
            <tr>
              <td className="px-2 py-1 border font-mono">N</td>
              <td className="px-2 py-1 border">
                {result.flags.sign
                  ? "Resultado negativo"
                  : "Resultado positivo"}
              </td>
              <td className="px-2 py-1 border font-mono">
                {result.flags.sign ? "1" : "0"}
              </td>
              <td className="px-2 py-1 border">
                {result.flags.sign
                  ? "El número es negativo"
                  : "El número es positivo"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
