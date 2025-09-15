"use client";

import { useState, useMemo } from "react";
import { NumberCard } from "@/components/number-card";
import { OperationBar } from "@/components/operation-bar";
import { ArithmeticPanel } from "@/components/arithmetic-panel";
import { BoothPanel } from "@/components/booth-panel";
import { FixedPointPanel } from "@/components/fixed-point-panel";
import { SidebarConfig } from "@/components/sidebar-config";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import type {
  NumberValue,
  FormatConfig,
  OperationType,
  RoundingMode,
} from "@/lib/types";
import { performArithmetic, decimalToBinary } from "@/lib/binary-math";

export default function OperacionesPage() {
  const [format, setFormat] = useState<FormatConfig>({
    totalBits: 8,
    integerBits: 8,
    fractionalBits: 0,
    name: "8.0",
  });
  const [roundingMode, setRoundingMode] = useState<RoundingMode>("nearest");
  const [operation, setOperation] = useState<OperationType>("+");
  const [operandA, setOperandA] = useState<NumberValue | null>(null);
  const [operandB, setOperandB] = useState<NumberValue | null>(null);
  const [showVerification, setShowVerification] = useState<boolean>(true);

  const handleFormatChange = (newFormat: FormatConfig) => {
    setFormat(newFormat);
    setOperandA(null);
    setOperandB(null);
  };

  const handleLoadExample = (example: any) => {
    let exampleFormat: FormatConfig;
    if (typeof example.format === "string") {
      const [int, frac] = example.format.split(".").map(Number);
      exampleFormat = {
        totalBits: int + (frac || 0),
        integerBits: int,
        fractionalBits: frac || 0,
        name: example.format,
      };
    } else {
      exampleFormat = example.format;
    }

    setFormat(exampleFormat);
    setOperation(example.operation);

    try {
      const numA = decimalToBinary(example.operandA, exampleFormat);
      const numB = decimalToBinary(example.operandB, exampleFormat);
      setOperandA(numA);
      setOperandB(numB);
    } catch (error) {
      console.error("Error loading example:", error);
    }
  };

  const arithmeticResult = useMemo(() => {
    if (!operandA || !operandB || operation === "×") return null;

    try {
      return performArithmetic(operandA, operandB);
    } catch (error) {
      console.error("Arithmetic error:", error);
      return null;
    }
  }, [operandA, operandB, operation]);

  return (
    <div className="min-h-screen h-fit bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SidebarConfig
              format={format}
              onFormatChange={handleFormatChange}
              onLoadExample={handleLoadExample}
              showVerification={showVerification}
              onToggleVerification={() => setShowVerification(!showVerification)}
              roundingMode={roundingMode}
              onRoundingModeChange={setRoundingMode}
              operandA={operandA}
              operandB={operandB}
              operation={operation}
              result={operation === "×" ? null : arithmeticResult}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberCard title="Operando A" value={operandA} format={format} onChange={setOperandA} />
              <NumberCard title="Operando B" value={operandB} format={format} onChange={setOperandB} />
            </div>

            <OperationBar operation={operation} format={format} onOperationChange={setOperation} />

            {operandA && operandB && (
              <>
                {operation !== "×" && arithmeticResult && (
                  <ArithmeticPanel
                    operandA={operandA}
                    operandB={operandB}
                    operation={operation}
                    result={arithmeticResult.result}
                    resultDecimal={arithmeticResult.resultDecimal}
                    carryMap={arithmeticResult.carryMap}
                    flags={arithmeticResult.flags}
                    showVerification={showVerification}
                  />
                )}

                {operation === "×" && format.fractionalBits === 0 && (
                  <BoothPanel operandA={operandA} operandB={operandB} />
                )}

                {operation === "×" && format.fractionalBits > 0 && (
                  <FixedPointPanel operandA={operandA} operandB={operandB} roundingMode={roundingMode} />
                )}
              </>
            )}

            {operandA && (
              <ConversionPanelV2 numberValue={operandA} label="primer operando" />
            )}

            {operandB && operation === "×" && (
              <ConversionPanelV2 numberValue={operandB} label="segundo operando" />
            )}

            {operandA && operandB && operation !== "×" && (
              <ConversionPanelV2 numberValue={operandB} label="segundo operando" />
            )}

            {!operandA && !operandB && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calculator className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Listo para convertir y operar</h3>
                  <p className="text-muted-foreground">
                    Ingresa operandos o carga un ejemplo para comenzar.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Local import deferred to avoid circular issues
import { ConversionPanelV2 } from "@/components/conversion-panel-v2";

