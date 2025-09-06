"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NumberValue } from "@/lib/types";

interface ConversionPanelProps {
  numberValue: NumberValue;
}

export function ConversionPanel({ numberValue }: ConversionPanelProps) {
  const formatBinaryDisplay = (bin: string, format: NumberValue["format"]) => {
    if (format.fractionalBits === 0) {
      return bin.match(/.{1,4}/g)?.join(" ") || bin;
    } else {
      const integerPart = bin.slice(0, format.integerBits);
      const fractionalPart = bin.slice(format.integerBits);
      return `${integerPart.match(/.{1,4}/g)?.join(" ") || integerPart}•${
        fractionalPart.match(/.{1,4}/g)?.join(" ") || fractionalPart
      }`;
    }
  };

  const isNegative = numberValue.decimal < 0;
  const magnitudeValue = Math.abs(numberValue.decimal);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🔢 Conversión Detallada
          <span className="text-sm font-normal text-muted-foreground">
            {numberValue.format.name}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Input Analysis */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h4 className="font-medium">Análisis de Entrada</h4>
          </div>

          <div className="ml-10 space-y-3">
            <div className="p-3 bg-muted rounded">
              <div className="text-sm">
                <strong>Entrada decimal:</strong> {numberValue.decimal}
              </div>
            </div>

            <div className="p-3 bg-muted rounded">
              <div className="text-sm">
                <strong>¿Es negativo?</strong>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs ${
                    isNegative
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {isNegative ? "Sí" : "No"} ({numberValue.decimal}{" "}
                  {isNegative ? "<" : "≥"} 0)
                </span>
              </div>
            </div>

            <div className="p-3 bg-muted rounded">
              <div className="text-sm">
                <strong>Valor absoluto:</strong> {magnitudeValue}
              </div>
            </div>
          </div>
        </div>
        {/* Step 2: Binary Conversion */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h4 className="font-medium">Conversión a Binario</h4>
          </div>

          <div className="ml-10 space-y-3">
            {numberValue.tables.integerDiv.length > 0 && (
              <div className="p-3 border rounded">
                <div className="text-sm mb-2">
                  <strong>Parte Entera - Algoritmo de División por 2:</strong>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border text-xs">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border px-2 py-1">Paso</th>
                        <th className="border border-border px-2 py-1">
                          Cociente
                        </th>
                        <th className="border border-border px-2 py-1">×2</th>
                        <th className="border border-border px-2 py-1">Bit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {numberValue.tables.integerDiv.map((step, index) => (
                        <tr key={index}>
                          <td className="border border-border px-2 py-1 font-mono text-center">
                            {index + 1}
                          </td>
                          <td className="border border-border px-2 py-1 font-mono text-center">
                            {step.quotient}
                          </td>
                          <td className="border border-border px-2 py-1 font-mono text-center">
                            {step.quotient * 2}
                          </td>
                          <td className="border border-border px-2 py-1 font-mono text-center bg-blue-50">
                            {step.remainder}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {numberValue.format.fractionalBits > 0 &&
              numberValue.tables.fracMul.length > 0 && (
                <div className="p-3 border rounded">
                  <div className="text-sm mb-2">
                    <strong>
                      Parte Fraccional - Algoritmo de Multiplicación por 2:
                    </strong>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border text-xs">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border px-2 py-1">
                            Paso
                          </th>
                          <th className="border border-border px-2 py-1">
                            Valor × 2
                          </th>
                          <th className="border border-border px-2 py-1">
                            Bit
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {numberValue.tables.fracMul.map((step, index) => (
                          <tr key={index}>
                            <td className="border border-border px-2 py-1 font-mono text-center">
                              {index + 1}
                            </td>
                            <td className="border border-border px-2 py-1 font-mono text-center">
                              {step.value.toFixed(6)}
                            </td>
                            <td className="border border-border px-2 py-1 font-mono text-center bg-green-50">
                              {step.bit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            <div className="p-3 bg-green-50 rounded">
              <div className="text-sm">
                <strong>Resultado Binario (Magnitud):</strong>
                <div className="mt-1">
                  <code className="font-mono bg-white px-2 py-1 rounded border">
                    {formatBinaryDisplay(
                      numberValue.A1
                        ? numberValue.A1.split("")
                            .map((bit) => (bit === "0" ? "1" : "0"))
                            .join("")
                        : numberValue.bin,
                      numberValue.format
                    )}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Two's Complement (if negative) */}
        {isNegative && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold">
                3
              </div>
              <h4 className="font-medium">
                Complemento a 2 (Two's Complement)
              </h4>
            </div>

            <div className="ml-10 space-y-3">
              <div className="p-3 bg-red-50 rounded">
                <div className="text-sm">
                  <strong>Paso A1 - Invertir todos los bits:</strong>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-muted-foreground">
                        Binario original:
                      </span>
                      <code className="ml-2 font-mono bg-white px-2 py-1 rounded border">
                        {formatBinaryDisplay(
                          numberValue.A1
                            ? numberValue.A1.split("")
                                .map((bit) => (bit === "0" ? "1" : "0"))
                                .join("")
                            : numberValue.bin,
                          numberValue.format
                        )}
                      </code>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Invertido (A1):
                      </span>
                      <code className="ml-2 font-mono bg-white px-2 py-1 rounded border">
                        {formatBinaryDisplay(
                          numberValue.A1 || "",
                          numberValue.format
                        )}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-red-50 rounded">
                <div className="text-sm">
                  <strong>Paso A2 - Sumar 1 al resultado de A1:</strong>
                  <div className="mt-2">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between items-center">
                        <span>A1:</span>
                        <code className="font-mono bg-white px-2 py-1 rounded border">
                          {formatBinaryDisplay(
                            numberValue.A1 || "",
                            numberValue.format
                          )}
                        </code>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>+1:</span>
                        <code className="font-mono bg-white px-2 py-1 rounded border">
                          0000 0000 0000 0001
                        </code>
                      </div>
                      <div className="border-t pt-2 flex justify-between items-center">
                        <span className="font-medium">A2 (Final):</span>
                        <code className="font-mono bg-green-100 px-2 py-1 rounded border border-green-300">
                          {formatBinaryDisplay(
                            numberValue.A2 || "",
                            numberValue.format
                          )}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Final Result */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
              4
            </div>
            <h4 className="font-medium">Resultado Final</h4>
          </div>

          <div className="ml-10 space-y-3">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-purple-800">
                    {numberValue.decimal}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Valor decimal final
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      <strong>Binario Two's Complement:</strong>
                    </span>
                    <code className="font-mono bg-white px-3 py-1 rounded border text-sm">
                      {formatBinaryDisplay(numberValue.bin, numberValue.format)}
                    </code>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      <strong>Valor raw interno:</strong>
                    </span>
                    <code className="font-mono bg-white px-3 py-1 rounded border text-sm">
                      {numberValue.rawInt}
                    </code>
                  </div>
                </div>

                {numberValue.validation?.error && (
                  <div className="p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                    <strong>Advertencia:</strong> {numberValue.validation.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
