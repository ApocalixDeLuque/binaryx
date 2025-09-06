"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NumberValue, FormatConfig } from "@/lib/types";
import { decimalToBinary } from "@/lib/binary-math";

interface VerificationPanelProps {
  operandA: NumberValue;
  operandB: NumberValue;
  operation: "+";
  actualResult: number;
  actualBinary: string;
  format: FormatConfig;
}

export function VerificationPanel({
  operandA,
  operandB,
  operation,
  actualResult,
  actualBinary,
  format,
}: VerificationPanelProps) {
  const verification = useMemo(() => {
    // Calculate expected result using decimal arithmetic
    const expectedDecimal = operandA.decimal + operandB.decimal;

    // Check if expected result fits in format
    const maxValue =
      Math.pow(2, format.integerBits - 1) -
      (format.fractionalBits > 0 ? 1 / Math.pow(2, format.fractionalBits) : 0);
    const expectedFits = Math.abs(expectedDecimal) <= maxValue;

    // Calculate what the expected result should be in this format
    let expectedInFormat: number;
    let expectedBinary: string;
    let overflow = false;

    if (expectedFits) {
      // Result fits, should match actual
      expectedInFormat = expectedDecimal;
      const expectedNumValue = decimalToBinary(expectedDecimal, format);
      expectedBinary = expectedNumValue.bin;
    } else {
      // Result doesn't fit - overflow occurred
      overflow = true;
      // For overflow, the result wraps around
      const scaledExpected =
        expectedDecimal * Math.pow(2, format.fractionalBits);
      const wrapped = scaledExpected & (Math.pow(2, format.totalBits) - 1);
      const wrappedSigned =
        wrapped >= Math.pow(2, format.totalBits - 1)
          ? wrapped - Math.pow(2, format.totalBits)
          : wrapped;
      expectedInFormat =
        format.fractionalBits === 0
          ? wrappedSigned
          : wrappedSigned / Math.pow(2, format.fractionalBits);
      expectedBinary = wrapped.toString(2).padStart(format.totalBits, "0");
    }

    // Check if actual matches expected
    const matches = Math.abs(actualResult - expectedInFormat) < 0.0001; // Allow small floating point differences

    return {
      expectedDecimal,
      expectedInFormat,
      expectedBinary,
      actualResult,
      actualBinary,
      matches,
      overflow,
      expectedFits,
      maxValue,
    };
  }, [operandA, operandB, operation, actualResult, actualBinary, format]);

  const formatBinary = (bin: string) => {
    if (format.fractionalBits === 0) {
      return bin.match(/.{4}/g)?.join(" ") || bin;
    } else {
      const integerPart = bin.slice(0, format.integerBits);
      const fractionalPart = bin.slice(format.integerBits);
      return `${integerPart.match(/.{4}/g)?.join(" ") || integerPart}.${
        fractionalPart.match(/.{4}/g)?.join(" ") || fractionalPart
      }`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Verificación de Resultados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expected vs Actual */}
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 text-left border">Tipo</th>
              <th className="px-2 py-1 text-left border">Decimal</th>
              <th className="px-2 py-1 text-left border">Binario</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 py-1 border">Esperado ({format.name})</td>
              <td className="px-2 py-1 border font-mono">
                {verification.expectedInFormat.toFixed(format.fractionalBits)}
              </td>
              <td className="px-2 py-1 border font-mono">
                {formatBinary(verification.expectedBinary)}
              </td>
            </tr>
            <tr>
              <td className="px-2 py-1 border">Obtenido</td>
              <td className="px-2 py-1 border font-mono">
                {verification.actualResult.toFixed(format.fractionalBits)}
              </td>
              <td className="px-2 py-1 border font-mono">
                {formatBinary(verification.actualBinary)}
              </td>
            </tr>
          </tbody>
        </table>

        {!verification.matches && (
          <div className="p-3 border rounded text-sm">
            <div className="font-medium mb-2">Análisis</div>
            {verification.overflow ? (
              <div className="space-y-1">
                <div>
                  La suma {operandA.decimal} + {operandB.decimal} ={" "}
                  {verification.expectedDecimal} excede el rango (±
                  {verification.maxValue.toFixed(format.fractionalBits)}).
                </div>
                <div>
                  En complemento a 2, el resultado se ajusta por módulo 2^
                  {format.totalBits}.
                </div>
                <div>
                  Resultado en formato:{" "}
                  {verification.expectedInFormat.toFixed(format.fractionalBits)}
                </div>
                <ul className="list-disc ml-5 mt-2">
                  <li>Usa un formato con más bits</li>
                  <li>Verifica rangos de entrada</li>
                  <li>Considera saturación si aplica</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-1">
                <div>
                  Diferencia:{" "}
                  {(
                    verification.actualResult - verification.expectedInFormat
                  ).toFixed(6)}
                </div>
                <ul className="list-disc ml-5 mt-2">
                  <li>Redondeo en fraccionales</li>
                  <li>Conversión binaria</li>
                  <li>Entradas incorrectas</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Educational Info */}
        <div className="p-3 border rounded text-sm">
          <div className="font-medium mb-2">Información</div>
          <div className="space-y-2 text-muted-foreground">
            <div>
              <strong>Operación:</strong> {operandA.decimal} +{" "}
              {operandB.decimal} = {verification.expectedDecimal}
            </div>

            {format.fractionalBits > 0 ? (
              <div>
                <strong>Escalado:</strong> Los valores se multiplican por{" "}
                {Math.pow(2, format.fractionalBits)} para trabajar con enteros
              </div>
            ) : (
              <div>
                <strong>Enteros:</strong> Trabajamos directamente con valores
                enteros
              </div>
            )}

            <div>
              <strong>Complemento a 2:</strong> Los números negativos se
              representan invirtiendo bits y sumando 1
            </div>

            {verification.overflow && (
              <div className="mt-2 text-xs">
                Nota: Siempre valida los rangos para evitar overflow.
              </div>
            )}
          </div>
        </div>

        {/* Range Information */}
        <div className="text-xs text-muted-foreground">
          <strong>Rango del formato {format.name}:</strong> ±
          {verification.maxValue.toFixed(format.fractionalBits)}(
          {format.integerBits} bits entero + {format.fractionalBits} bits
          fraccional = {format.totalBits} bits total)
        </div>
      </CardContent>
    </Card>
  );
}
