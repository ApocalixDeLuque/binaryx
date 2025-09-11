"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { NumberValue } from "@/lib/types";
import { ChevronDown } from "lucide-react";

interface ConversionPanelV2Props {
  numberValue: NumberValue;
  label?: string; // e.g., "primer operando", "segundo operando"
}

export function ConversionPanelV2({
  numberValue,
  label,
}: ConversionPanelV2Props) {
  const format = numberValue.format;

  const formatBinaryDisplay = (bin: string) => {
    if (format.fractionalBits === 0) {
      return bin.match(/.{1,4}/g)?.join(" ") || bin;
    } else {
      const integerPart = bin.slice(0, format.integerBits);
      const fractionalPart = bin.slice(format.integerBits);
      return `${integerPart.match(/.{1,4}/g)?.join(" ") || integerPart}·${
        fractionalPart.match(/.{1,4}/g)?.join(" ") || fractionalPart
      }`;
    }
  };

  const isNegative = numberValue.decimal < 0;
  const intSteps = numberValue.tables.integerDiv || [];
  const fracSteps = numberValue.tables.fracMul || [];
  const initialInt = intSteps.length
    ? intSteps[0].quotient * 2 + intSteps[0].remainder
    : Math.abs(Math.trunc(numberValue.decimal));
  const initialFrac =
    Math.abs(numberValue.decimal) - Math.floor(Math.abs(numberValue.decimal));
  const intRemainders = intSteps.map((s) => s.remainder);
  const intBinaryMagnitude = intRemainders.length
    ? intRemainders.slice().reverse().join("")
    : "0";
  const intBinaryPadded = intBinaryMagnitude.padStart(format.integerBits, "0");
  const fracBitsSeq = fracSteps.map((s) => String(s.bit)).join("");
  const fracBinaryPadded = fracBitsSeq.padEnd(format.fractionalBits, "0");
  const combinedMagnitude = intBinaryPadded + fracBinaryPadded;

  return (
    <Card className="w-full p-0">
      <CardContent className="p-0">
        {label && (
          <div className="px-3 pt-3 text-sm text-muted-foreground">
            Desarrollo del {label}
          </div>
        )}
        <Accordion type="multiple" className="divide-y">
          {/* Step 1 */}
          <AccordionItem value="input" className="px-3">
            <AccordionTrigger className="py-3 text-sm">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <span>1. Análisis de entrada</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="border rounded p-2">
                  <div className="text-muted-foreground">Decimal</div>
                  <div className="font-mono">{numberValue.decimal}</div>
                </div>
                <div className="border rounded p-2">
                  <div className="text-muted-foreground">Formato</div>
                  <div className="font-mono">
                    {format.name} ({format.totalBits} bits)
                  </div>
                </div>
                <div className="border rounded p-2">
                  <div className="text-muted-foreground">Signo</div>
                  <div className="font-mono">
                    {isNegative ? "Negativo" : "Positivo"}
                  </div>
                </div>
                <div className="border rounded p-2">
                  <div className="text-muted-foreground">Rango</div>
                  <div className="font-mono">
                    ±
                    {(
                      Math.pow(2, format.integerBits - 1) -
                      (format.fractionalBits > 0
                        ? 1 / Math.pow(2, format.fractionalBits)
                        : 0)
                    ).toFixed(format.fractionalBits)}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Step 2 */}
          <AccordionItem value="conversion" className="px-3">
            <AccordionTrigger className="py-3 text-sm">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <span>2. Conversión a binario</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              {/* Integer division table */}
              {intSteps.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-2">
                    Parte entera (÷2)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-2 py-1 border">Paso</th>
                          <th className="px-2 py-1 border">Cociente</th>
                          <th className="px-2 py-1 border">Bit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* starting row */}
                        <tr>
                          <td className="px-2 py-1 border text-center font-mono">
                            0
                          </td>
                          <td className="px-2 py-1 border text-center font-mono">
                            {initialInt}
                          </td>
                          <td className="px-2 py-1 border text-center font-mono">
                            ÷2
                          </td>
                        </tr>
                        {intSteps.map((step, i) => (
                          <tr key={i}>
                            <td className="px-2 py-1 border text-center font-mono">
                              {i + 1}
                            </td>
                            <td className="px-2 py-1 border text-center font-mono">
                              {step.quotient}
                            </td>
                            <td className="px-2 py-1 border text-center font-mono">
                              {step.remainder}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-xs">
                    <div className="text-muted-foreground">
                      Resultado (de abajo hacia arriba):
                    </div>
                    <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
                      {intBinaryMagnitude}
                    </code>
                    <div className="mt-2 text-muted-foreground">
                      Adaptado al formato (entero):
                    </div>
                    <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
                      {intBinaryPadded.match(/.{1,4}/g)?.join(" ") ||
                        intBinaryPadded}
                    </code>
                  </div>
                </div>
              )}

              {/* Fractional *2 table */}
              {format.fractionalBits > 0 && fracSteps.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">
                    Parte fraccional (×2)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-2 py-1 border">Paso</th>
                          <th className="px-2 py-1 border">Valor</th>
                          <th className="px-2 py-1 border">Bit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 py-1 border text-center font-mono">
                            0
                          </td>
                          <td className="px-2 py-1 border text-center font-mono">
                            {initialFrac.toFixed(6)}
                          </td>
                          <td className="px-2 py-1 border text-center font-mono">
                            ×2
                          </td>
                        </tr>
                        {fracSteps.map((step, i) => (
                          <tr key={i}>
                            <td className="px-2 py-1 border text-center font-mono">
                              {i + 1}
                            </td>
                            <td className="px-2 py-1 border text-center font-mono">
                              {step.value.toFixed(6)}
                            </td>
                            <td className="px-2 py-1 border text-center font-mono">
                              {step.bit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-xs">
                    <div className="text-muted-foreground">
                      Resultado (de arriba hacia abajo):
                    </div>
                    <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
                      {fracBitsSeq}
                    </code>
                    <div className="mt-2 text-muted-foreground">
                      Adaptado al formato (fracción):
                    </div>
                    <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
                      {fracBinaryPadded.match(/.{1,4}/g)?.join(" ") ||
                        fracBinaryPadded}
                    </code>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs">
                <div className="text-muted-foreground">
                  Combinado (entero + fracción) ajustado al formato:
                </div>
                <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
                  {intBinaryPadded.match(/.{1,4}/g)?.join(" ") ||
                    intBinaryPadded}
                  {format.fractionalBits > 0 ? " · " : ""}
                  {format.fractionalBits > 0
                    ? fracBinaryPadded.match(/.{1,4}/g)?.join(" ") ||
                      fracBinaryPadded
                    : ""}
                </code>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Step 3 */}
          <AccordionItem value="twos" className="px-3">
            <AccordionTrigger className="py-3 text-sm">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <span>3. Two's complement</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              {isNegative ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Binario positivo</span>
                    <code className="font-mono bg-background px-2 py-1 rounded border">
                      {formatBinaryDisplay(
                        Math.abs(numberValue.rawInt)
                          .toString(2)
                          .padStart(format.totalBits, "0")
                      )}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span>A1 (invertir)</span>
                    <code className="font-mono bg-background px-2 py-1 rounded border">
                      {formatBinaryDisplay(numberValue.A1 || "")}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span>A2 (+1)</span>
                    <code className="font-mono bg-background px-2 py-1 rounded border">
                      {formatBinaryDisplay(numberValue.A2 || "")}
                    </code>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  No aplica para valores positivos.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Step 4 */}
          <AccordionItem value="final" className="px-3">
            <AccordionTrigger className="py-3 text-sm">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <span>4. Resultado</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="border rounded p-2">
                  <div className="text-muted-foreground">Decimal</div>
                  <div className="font-mono">
                    {numberValue.decimal.toFixed(format.fractionalBits)}
                  </div>
                </div>
                <div className="border rounded p-2 md:col-span-2">
                  <div className="text-muted-foreground">Binario (A2)</div>
                  <div className="font-mono bg-background p-2 rounded border mt-1">
                    {formatBinaryDisplay(numberValue.bin)}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
