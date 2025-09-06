"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NumberValue } from "@/lib/types";
import type { RoundingMode } from "@/lib/types";
import { fixedPointMultiply } from "@/lib/binary-math";
import { useMemo } from "react";

interface FixedPointPanelProps {
  operandA: NumberValue;
  operandB: NumberValue;
  roundingMode: RoundingMode;
}

export function FixedPointPanel({
  operandA,
  operandB,
  roundingMode,
}: FixedPointPanelProps) {
  const fixedPointResult = useMemo(() => {
    if (
      operandA.format.fractionalBits === 0 ||
      operandB.format.fractionalBits === 0
    )
      return null;
    // Map rounding modes to the expected function parameters
    const mappedRoundingMode =
      roundingMode === "half-away" ? "nearest" : roundingMode;
    return fixedPointMultiply(
      operandA.decimal,
      operandB.decimal,
      mappedRoundingMode as "nearest" | "trunc" | "floor"
    );
  }, [operandA, operandB, roundingMode]);

  if (!fixedPointResult) return null;

  const { Af, Bf, product32, shifted, saturated } = fixedPointResult;
  const scaleFactor = Math.pow(2, operandA.format.fractionalBits);
  const finalDecimal = shifted / scaleFactor;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          Multiplicación Punto Fijo Q8.8
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Operation Summary */}
        <div className="text-center p-4 border rounded">
          <div className="text-2xl font-mono mb-2">
            {operandA.decimal} × {operandB.decimal} = {finalDecimal.toFixed(5)}
          </div>
          <div className="text-sm text-muted-foreground">
            Multiplicación con escalado ×256 y redondeo {roundingMode}
          </div>
        </div>

        {/* Step by Step Process */}
        <div className="space-y-4">
          <h4 className="font-medium">Proceso paso a paso</h4>

          {/* Step 1: Convert to Q8.8 */}
          <div className="p-3 border rounded">
            <h5 className="font-medium mb-2">
              Paso 1: Convertir a Q8.8 (×256)
            </h5>
            <div className="space-y-1 text-sm">
              <div>
                <strong>A:</strong> {operandA.decimal} × 256 = {Af} (0x
                {Af.toString(16).toUpperCase().padStart(4, "0")})
              </div>
              <div>
                <strong>B:</strong> {operandB.decimal} × 256 = {Bf} (0x
                {Bf.toString(16).toUpperCase().padStart(4, "0")})
              </div>
            </div>
          </div>

          {/* Step 2: 32-bit product */}
          <div className="p-3 border rounded">
            <h5 className="font-medium mb-2">Paso 2: Producto de 32 bits</h5>
            <div className="space-y-1 text-sm">
              <div>
                <strong>Af × Bf:</strong> {Af} × {Bf} = {product32}
              </div>
              <div>
                <strong>Binario (32 bits):</strong>{" "}
                {product32.toString(2).padStart(32, "0")}
              </div>
              <div>
                <strong>Hex:</strong> 0x
                {product32.toString(16).toUpperCase().padStart(8, "0")}
              </div>
            </div>
          </div>

          {/* Step 3: Shift right by 8 */}
          <div className="p-3 border rounded">
            <h5 className="font-medium mb-2">
              Paso 3: Desplazamiento &gt;&gt; 8 con redondeo
            </h5>
            <div className="space-y-1 text-sm">
              <div>
                <strong>Producto / 256:</strong> {product32} ÷ 256 ={" "}
                {product32 / 256}
              </div>
              <div>
                <strong>Redondeo ({roundingMode}):</strong> {shifted}
              </div>
              {saturated && (
                <div className="text-red-600">
                  <strong>Saturación:</strong> Valor fuera de rango ±32767
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Convert back to decimal */}
          <div className="p-3 border rounded">
            <h5 className="font-medium mb-2">
              Paso 4: Convertir a decimal (/256)
            </h5>
            <div className="space-y-1 text-sm">
              <div>
                <strong>Resultado Q8.8 / 256:</strong> {shifted} ÷ 256 ={" "}
                {finalDecimal.toFixed(6)}
              </div>
              <div>
                <strong>Valor almacenado:</strong> {finalDecimal.toFixed(5)}
              </div>
            </div>
          </div>
        </div>

        {/* Rounding Mode Explanation */}
        <div className="p-4 border rounded">
          <h4 className="font-medium mb-2">Modo de redondeo: {roundingMode}</h4>
          <div className="text-sm text-muted-foreground">
            {roundingMode === "nearest" &&
              "Redondea al valor más cercano. Si hay empate, redondea hacia arriba."}
            {roundingMode === "trunc" &&
              "Trunca la parte decimal (hacia cero)."}
            {roundingMode === "floor" && "Redondea hacia abajo (hacia -∞)."}
          </div>
        </div>

        {/* Final Result */}
        <div className="p-4 border rounded">
          <h4 className="font-medium mb-2">Resultado final</h4>
          <div className="space-y-2">
            <div>
              <strong>Decimal:</strong> {finalDecimal.toFixed(5)}
            </div>
            <div>
              <strong>Q8.8 (16 bits):</strong>{" "}
              <code className="font-mono">
                {((shifted < 0 ? shifted + 65536 : shifted) >>> 0)
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
                {((shifted < 0 ? shifted + 65536 : shifted) >>> 0)
                  .toString(16)
                  .toUpperCase()
                  .padStart(4, "0")}
              </code>
            </div>
            {saturated && (
              <div className="text-sm">Saturación: valor limitado al rango</div>
            )}
          </div>
        </div>

        {/* Verification */}
        <div className="p-4 border rounded">
          <h4 className="font-medium mb-2">Verificación</h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Cálculo esperado:</strong> {operandA.decimal} ×{" "}
              {operandB.decimal} ={" "}
              {(operandA.decimal * operandB.decimal).toFixed(6)}
            </div>
            <div>
              <strong>Resultado obtenido:</strong> {finalDecimal.toFixed(6)}
            </div>
            <div>
              <strong>Diferencia:</strong>{" "}
              {Math.abs(
                finalDecimal - operandA.decimal * operandB.decimal
              ).toFixed(6)}
            </div>
            {Math.abs(finalDecimal - operandA.decimal * operandB.decimal) >
              0.01 && (
              <div className="text-sm">Diferencia significativa detectada</div>
            )}
            <div className="mt-2 text-xs text-muted-foreground">
              <strong>Nota:</strong> Las diferencias pueden deberse a redondeo
              en la conversión ×{Math.pow(2, operandA.format.fractionalBits)}.
              {saturated && " También hay saturación aplicada."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
