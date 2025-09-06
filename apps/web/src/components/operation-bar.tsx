"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { OperationType } from "@/lib/types";
import type { FormatConfig } from "@/lib/types";

interface OperationBarProps {
  operation: OperationType;
  format: FormatConfig;
  onOperationChange: (operation: OperationType) => void;
}

export function OperationBar({
  operation,
  format,
  onOperationChange,
}: OperationBarProps) {
  const operations: {
    value: OperationType;
    label: string;
    description: string;
  }[] = [
    {
      value: "+",
      label: "Suma",
      description: "A + B (automático para negativos)",
    },
    {
      value: "×",
      label: "Multiplicación",
      description:
        format.fractionalBits === 0
          ? "Booth (radix-2)"
          : "Punto fijo Q" + format.name,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Operación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {operations.map((op) => (
            <Button
              key={op.value}
              variant={operation === op.value ? "default" : "outline"}
              onClick={() => onOperationChange(op.value)}
              className="h-auto p-4 flex flex-col items-center gap-1"
            >
              <span className="text-2xl font-bold">{op.value}</span>
              <span className="text-sm font-medium">{op.label}</span>
              <span className="text-xs text-muted-foreground">
                {op.description}
              </span>
            </Button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Método utilizado:</h4>
          <p className="text-sm text-muted-foreground">
            {operation === "+" &&
              "Suma bit a bit con carry. Los números negativos se convierten automáticamente con Two's complement."}
            {operation === "×" &&
              format.fractionalBits === 0 &&
              "Algoritmo de Booth (radix-2) para enteros"}
            {operation === "×" &&
              format.fractionalBits > 0 &&
              `Multiplicación punto fijo Q${
                format.name
              } con escalado ×${Math.pow(2, format.fractionalBits)}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
