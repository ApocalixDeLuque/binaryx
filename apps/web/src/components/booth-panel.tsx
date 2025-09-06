"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NumberValue } from "@/lib/types";
import { boothMultiply } from "@/lib/binary-math";
import { useMemo } from "react";

interface BoothPanelProps {
  operandA: NumberValue;
  operandB: NumberValue;
}

export function BoothPanel({ operandA, operandB }: BoothPanelProps) {
  const boothResult = useMemo(() => {
    if (
      operandA.format.fractionalBits !== 0 ||
      operandB.format.fractionalBits !== 0
    )
      return null;
    return boothMultiply(operandA.rawInt, operandB.rawInt);
  }, [operandA, operandB]);

  if (!boothResult) return null;

  const { result, steps } = boothResult;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          Multiplicación Booth (radix-2)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Operation Summary */}
        <div className="text-center p-4 border rounded">
          <div className="text-2xl font-mono mb-2">
            {operandA.decimal} × {operandB.decimal} = {result}
          </div>
          <div className="text-sm text-muted-foreground">
            Algoritmo de Booth con 8 iteraciones
          </div>
        </div>

        {/* Booth Trace Table */}
        <div>
          <h4 className="font-medium mb-3">Tabla de seguimiento Booth</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border px-3 py-2 text-left">
                    i
                  </th>
                  <th className="border border-border px-3 py-2 text-left">
                    Q₀
                  </th>
                  <th className="border border-border px-3 py-2 text-left">
                    Q₋₁
                  </th>
                  <th className="border border-border px-3 py-2 text-left">
                    Operación
                  </th>
                  <th className="border border-border px-3 py-2 text-left">
                    A (8 bits)
                  </th>
                  <th className="border border-border px-3 py-2 text-left">
                    Q (8 bits)
                  </th>
                  <th className="border border-border px-3 py-2 text-left">
                    Q₋₁
                  </th>
                  <th className="border border-border px-3 py-2 text-left">
                    Desplazamiento
                  </th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step) => (
                  <tr key={step.i}>
                    <td className="border border-border px-3 py-2 font-mono">
                      {step.i}
                    </td>
                    <td className="border border-border px-3 py-2 font-mono">
                      {step.Q0}
                    </td>
                    <td className="border border-border px-3 py-2 font-mono">
                      {step.Qm1}
                    </td>
                    <td className="border border-border px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          step.operation === "A=A+M"
                            ? "bg-green-100 text-green-800"
                            : step.operation === "A=A-M"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {step.operation}
                      </span>
                    </td>
                    <td className="border border-border px-3 py-2 font-mono">
                      {step.A.match(/.{1,4}/g)?.join(" ") || step.A}
                    </td>
                    <td className="border border-border px-3 py-2 font-mono">
                      {step.Q.match(/.{1,4}/g)?.join(" ") || step.Q}
                    </td>
                    <td className="border border-border px-3 py-2 font-mono">
                      {step.Qm1_new}
                    </td>
                    <td className="border border-border px-3 py-2 text-sm text-muted-foreground">
                      A,Q,Q₋₁ ≫ 1
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Algorithm Explanation */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Cómo funciona el algoritmo:</h4>
          <ol className="text-sm space-y-1 text-muted-foreground">
            <li>
              <strong>Paso 1:</strong> Examinar Q₀ y Q₋₁
            </li>
            <li>
              <strong>Paso 2:</strong> Si Q₀Q₋₁ = 10 → A = A - M
            </li>
            <li>
              <strong>Paso 3:</strong> Si Q₀Q₋₁ = 01 → A = A + M
            </li>
            <li>
              <strong>Paso 4:</strong> Si Q₀Q₋₁ = 00 o 11 → No hacer nada
            </li>
            <li>
              <strong>Paso 5:</strong> Desplazamiento aritmético: [A|Q|Q₋₁] ≫ 1
            </li>
            <li>
              <strong>Paso 6:</strong> Repetir por 8 iteraciones
            </li>
          </ol>
        </div>

        {/* Verification */}
        <div className="p-4 border rounded">
          <h4 className="font-medium mb-2">Verificación</h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Cálculo esperado:</strong> {operandA.decimal} ×{" "}
              {operandB.decimal} ={" "}
              {(operandA.decimal * operandB.decimal).toFixed(0)}
            </div>
            <div>
              <strong>Resultado obtenido:</strong> {result}
            </div>
            <div>
              <strong>Diferencia:</strong>{" "}
              {Math.abs(result - operandA.decimal * operandB.decimal)}
            </div>
            {Math.abs(result - operandA.decimal * operandB.decimal) > 1 && (
              <div className="text-sm">Diferencia significativa detectada</div>
            )}
            <div className="mt-2 text-xs text-muted-foreground">
              <strong>Nota:</strong> Booth es exacto para enteros. Cualquier
              diferencia indica un error en la implementación.
            </div>
          </div>
        </div>

        {/* Final Result */}
        <div className="p-4 border rounded">
          <h4 className="font-medium mb-2">Resultado final</h4>
          <div className="space-y-2">
            <div>
              <strong>Producto decimal:</strong> {result}
            </div>
            <div>
              <strong>Binario (16 bits):</strong>{" "}
              <code className="font-mono">
                {((result < 0 ? result + 65536 : result) >>> 0)
                  .toString(2)
                  .padStart(16, "0")
                  .match(/.{1,4}/g)
                  ?.join(" ") || ""}
              </code>
            </div>
            <div>
              <strong>Hex:</strong>{" "}
              <code className="font-mono">
                0x
                {((result < 0 ? result + 65536 : result) >>> 0)
                  .toString(16)
                  .toUpperCase()
                  .padStart(4, "0")}
              </code>
            </div>
            {Math.abs(result) > 32767 && (
              <div className="text-red-600 font-medium">
                ⚠️ Overflow: Resultado fuera del rango de 16 bits con signo
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
