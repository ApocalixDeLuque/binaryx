"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NumberValue, Flags, FormatConfig } from "@/lib/types";
import { VerificationPanel } from "./verification-panel";

interface ArithmeticPanelProps {
  operandA: NumberValue;
  operandB: NumberValue;
  operation: "+";
  result: string;
  resultDecimal: number;
  carryMap: string;
  flags: Flags;
  showVerification: boolean;
}

export function ArithmeticPanel({
  operandA,
  operandB,
  operation,
  result,
  resultDecimal,
  carryMap,
  flags,
  showVerification = true,
}: ArithmeticPanelProps) {
  const format = operandA.format;
  const bitLength = format.totalBits;

  const formatBinaryDisplay = (bin: string) => {
    if (format.fractionalBits === 0) {
      return (
        bin
          .padStart(format.totalBits, "0")
          .match(/.{1,4}/g)
          ?.join(" ") || bin
      );
    } else {
      const padded = bin.padStart(format.totalBits, "0");
      const integerPart = padded.slice(0, format.integerBits);
      const fractionalPart = padded.slice(format.integerBits);
      return `${integerPart.match(/.{1,4}/g)?.join(" ") || integerPart}.${
        fractionalPart.match(/.{1,4}/g)?.join(" ") || fractionalPart
      }`;
    }
  };

  const renderBitsWithMarker = (bits: string[]) => {
    const cells: React.ReactNode[] = [];
    const intBits =
      format.fractionalBits > 0 ? format.integerBits : format.totalBits;
    for (let i = 0; i < format.totalBits; i++) {
      if (format.fractionalBits > 0 && i === intBits) {
        cells.push(
          <td key="marker" className="px-1 text-center font-mono">
            .
          </td>
        );
      }
      const addLeftDivider = i > 0 && i % 4 === 0;
      cells.push(
        <td
          key={i}
          className={`px-2 py-1 text-center border font-mono ${
            addLeftDivider ? "border-l-2" : ""
          }`}
        >
          {bits[i]}
        </td>
      );
    }
    return cells;
  };

  const getFlagDescription = (flag: keyof Flags) => {
    switch (flag) {
      case "Z":
        return flags.Z ? "Resultado = 0" : "Resultado ≠ 0";
      case "C":
        return flags.C ? "Hubo acarreo final" : "Sin acarreo final";
      case "N":
        return flags.N ? "Resultado negativo" : "Resultado positivo";
      case "V":
        return flags.V ? "Overflow con signo" : "Sin overflow";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Suma - Resultado paso a paso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Operation Summary */}
        <div className="text-center p-4 border rounded">
          <div className="text-2xl font-mono mb-2">
            {operandA.decimal} {operation} {operandB.decimal} = {resultDecimal}
          </div>
          <div className="text-sm text-muted-foreground">
            {format.fractionalBits === 0
              ? "Enteros con signo"
              : `Punto fijo Q${format.name}`}
          </div>
        </div>

        {/* Column Addition View */}
        <div>
          <h4 className="font-medium mb-3">Vista de columnas con acarreo</h4>
          <div className="overflow-x-auto">
            <table className="border-collapse mx-auto">
              <tbody>
                {/* Carry row */}
                <tr>
                  <td className="px-2 py-1 text-center font-medium">Carry</td>
                  {renderBitsWithMarker(
                    carryMap.padStart(bitLength, "0").split("")
                  )}
                </tr>
                {/* A row */}
                <tr>
                  <td className="px-2 py-1 text-center font-medium">A</td>
                  {renderBitsWithMarker(
                    operandA.bin.padStart(bitLength, "0").split("")
                  )}
                </tr>
                {/* B row */}
                <tr>
                  <td className="px-2 py-1 text-center font-medium">B</td>
                  {renderBitsWithMarker(
                    operandB.bin.padStart(bitLength, "0").split("")
                  )}
                </tr>
                <tr className="border-t-2">
                  <td className="px-2 py-1 text-center font-medium">
                    Resultado
                  </td>
                  {renderBitsWithMarker(
                    result.padStart(bitLength, "0").split("")
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Flags Panel */}
        <div>
          <h4 className="font-medium mb-3">Banderas (Flags)</h4>
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
              {(["Z", "C", "N", "V"] as const).map((flag) => {
                const value = flags[flag] ? 1 : 0;
                let why = "";
                if (flag === "Z") {
                  why = flags.Z ? "Resultado = 0" : "Resultado ≠ 0";
                } else if (flag === "C") {
                  why = flags.C
                    ? "Acarreo fuera del MSB"
                    : "No hubo acarreo final";
                } else if (flag === "N") {
                  why = flags.N
                    ? "MSB del resultado = 1"
                    : "MSB del resultado = 0";
                } else if (flag === "V") {
                  why = flags.V
                    ? "Overflow de signo (suma de signos iguales con signo distinto)"
                    : "No se detectó overflow";
                }
                return (
                  <tr key={flag}>
                    <td className="px-2 py-1 border font-mono">{flag}</td>
                    <td className="px-2 py-1 border">
                      {getFlagDescription(flag)}
                    </td>
                    <td className="px-2 py-1 border font-mono">{value}</td>
                    <td className="px-2 py-1 border">{why}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Verification Panel */}
        {showVerification && (
          <VerificationPanel
            operandA={operandA}
            operandB={operandB}
            operation={operation}
            actualResult={resultDecimal}
            actualBinary={result}
            format={format}
          />
        )}

        {/* Final Result */}
        <div className="p-4 border rounded">
          <h4 className="font-medium mb-2">Resultado final</h4>
          <div className="space-y-1">
            <div>
              <strong>Decimal:</strong> {resultDecimal}
            </div>
            <div>
              <strong>Binario:</strong>{" "}
              <code className="font-mono">{formatBinaryDisplay(result)}</code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
