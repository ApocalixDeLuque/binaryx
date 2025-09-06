"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FormatConfig } from "@/lib/types";
import type { OperationType } from "@/lib/types";

interface Example {
  name: string;
  description: string;
  format: FormatConfig;
  operation: OperationType;
  operandA: number;
  operandB: number;
  expectedResult?: number;
  tags: string[];
}

interface ExamplesListProps {
  onLoadExample: (example: Example) => void;
}

const examples: Example[] = [
  // 8.0 Examples
  {
    name: "Suma básica 8.0",
    description: "45 + 88 (con overflow)",
    format: { totalBits: 8, integerBits: 8, fractionalBits: 0, name: "8.0" },
    operation: "+",
    operandA: 45,
    operandB: 88,
    expectedResult: 133,
    tags: ["suma", "overflow", "V=1"],
  },
  {
    name: "Números negativos automáticos",
    description: "-19.36 (Two's complement automático)",
    format: { totalBits: 16, integerBits: 8, fractionalBits: 8, name: "8.8" },
    operation: "+",
    operandA: -19.36,
    operandB: 0,
    expectedResult: -19.36,
    tags: ["negativo", "two's complement", "automático"],
  },
  {
    name: "Multiplicación Booth",
    description: "-18 × 54",
    format: { totalBits: 8, integerBits: 8, fractionalBits: 0, name: "8.0" },
    operation: "×",
    operandA: -18,
    operandB: 54,
    expectedResult: -972,
    tags: ["booth", "negativo"],
  },

  // 8.8 Examples
  {
    name: "Suma con fracciones",
    description: "14.017 + 21.041",
    format: { totalBits: 16, integerBits: 8, fractionalBits: 8, name: "8.8" },
    operation: "+",
    operandA: 14.017,
    operandB: 21.041,
    expectedResult: 35.058,
    tags: ["8.8", "suma", "punto-fijo"],
  },
  {
    name: "Multiplicación 8.8",
    description: "-0.537 × 25.147",
    format: { totalBits: 16, integerBits: 8, fractionalBits: 8, name: "8.8" },
    operation: "×",
    operandA: -0.537,
    operandB: 25.147,
    expectedResult: -13.504,
    tags: ["8.8", "multiplicación", "escalado"],
  },
  {
    name: "Número grande personalizado",
    description: "1234.567 (requiere formato 16.8)",
    format: { totalBits: 24, integerBits: 16, fractionalBits: 8, name: "16.8" },
    operation: "+",
    operandA: 1234.567,
    operandB: 0,
    expectedResult: 1234.567,
    tags: ["grande", "personalizado", "16.8"],
  },
  {
    name: "Precisión alta 16.16",
    description: "3.14159 + 2.71828",
    format: {
      totalBits: 32,
      integerBits: 16,
      fractionalBits: 16,
      name: "16.16",
    },
    operation: "+",
    operandA: 3.14159,
    operandB: 2.71828,
    expectedResult: 5.85987,
    tags: ["precisión", "16.16", "alta-resolución"],
  },
];

export function ExamplesList({ onLoadExample }: ExamplesListProps) {
  const groupedExamples = examples.reduce((acc, example) => {
    const formatKey = example.format.name;
    if (!acc[formatKey]) {
      acc[formatKey] = [];
    }
    acc[formatKey].push(example);
    return acc;
  }, {} as Record<string, Example[]>);

  return (
    <Card className="w-full p-0 m-0 border-none shadow-none">
      <CardContent className="space-y-4 p-0">
        {Object.entries(groupedExamples).map(([format, formatExamples]) => (
          <div key={format} className="space-y-2">
            <h4 className="font-medium text-sm">Formato {format}</h4>
            <div className="grid gap-2">
              {formatExamples.map((example, index) => (
                <div
                  key={index}
                  className="p-3 border rounded hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{example.name}</h5>
                      <p className="text-xs text-muted-foreground mb-2">
                        {example.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {example.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onLoadExample(example)}
                      className="shrink-0"
                    >
                      Cargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
