import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ConversionResult } from "@/lib/base-conversions";
import { FormattedNumber } from "@/components/formatted-number";

interface DecimalToBinaryProps {
  input: string;
  result: ConversionResult | null;
  error: string | null;
  manualNegativeWarning: string | null;
  onInputChange: (value: string) => void;
  onClear: () => void;
  onCopy: (text: string) => void;
  copySuccess: boolean;
}

/**
 * Decimal to Binary Conversion Component
 * Handles the display and interaction for decimal to binary conversions
 */
export function DecimalToBinary({
  input,
  result,
  error,
  manualNegativeWarning,
  onInputChange,
  onClear,
  onCopy,
  copySuccess,
}: DecimalToBinaryProps) {
  /**
   * Get the unsigned binary result
   */
  const getUnsignedResult = (): string => {
    if (!result) return "";
    // Use conversion result fields directly
    // Unsigned = magnitude with explicit '-' handled at display/copy by parent panel
    const isNegative = result.input.startsWith("-");
    return isNegative ? `-${result.magnitude || ""}` : result.magnitude || "";
  };

  /**
   * Get the signed (two's complement) binary result
   */
  const getSignedResult = (): string => {
    if (!result) return "";
    // Use conversion result fields directly
    return result.signedResult || "";
  };

  /**
   * Get bit length for unsigned result
   */
  const getUnsignedBitLength = (): number => {
    if (!result) return 0;
    const magnitudeLen = (result.magnitude || "").length;
    const isNegative = result.input.startsWith("-");
    return isNegative ? magnitudeLen + 1 : magnitudeLen;
  };

  /**
   * Get bit length for signed result
   */
  const getSignedBitLength = (): number => {
    if (!result) return 0;
    return (result.signedResult || "").length;
  };

  /**
   * Handle copy with or without padding
   */
  const handleCopyWithPadding = (resultText: string, withPadding: boolean) => {
    const textToCopy = withPadding ? resultText : resultText.replace(/\s/g, "");
    onCopy(textToCopy);
  };

  /**
   * Get formatted result for copy (with spaces)
   */
  const getFormattedResultForCopy = (): string => {
    return getUnsignedResult();
  };

  /**
   * Get formatted signed result for copy (with spaces)
   */
  const getFormattedSignedResultForCopy = (): string => {
    return getSignedResult();
  };

  /**
   * Helper function to get binary value from input
   */
  const getBinaryValue = (_input: string): string => {
    // No longer needed; logic sourced from result
    return result?.magnitude || "";
  };

  /**
   * Render division-by-2 step table (integer part)
   */
  const renderDivisionByTwoTable = () => {
    if (!result || !result.integerSteps || result.integerSteps.length === 0) {
      return null;
    }
    return (
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1 pr-4">Dividendo</th>
              <th className="py-1 pr-4">Cociente</th>
              <th className="py-1 pr-4">Resto</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {(result.integerSteps || []).map((s, idx) => {
              const nextQ = (result.integerSteps || [])[idx + 1]?.quotient ?? 0;
              return (
                <tr key={idx} className="border-t">
                  <td className="py-1 pr-4">{String(s.quotient)}</td>
                  <td className="py-1 pr-4">{String(nextQ)}</td>
                  <td className="py-1 pr-4">{s.remainder}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  /**
   * Render fractional multiplication-by-2 steps if any
   */
  const renderFractionalSteps = () => {
    if (
      !result ||
      !result.fractionalSteps ||
      result.fractionalSteps.length === 0
    ) {
      return null;
    }
    return (
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1 pr-4">Valor</th>
              <th className="py-1 pr-4">Bit</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {result.fractionalSteps.map((s, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-1 pr-4">{s.value}</td>
                <td className="py-1 pr-4">{s.bit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /**
   * Helper function to get sign from input
   */
  const getInputSign = (input: string): boolean => {
    return input.startsWith("-");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              Conversor de Decimal a Binario
            </h2>
          </div>

          {/* Input Section */}
          <div className="space-y-2">
            <Label htmlFor="decimal-input" className="text-sm font-medium">
              Entrada
            </Label>
            <div className="flex gap-2">
              <Input
                id="decimal-input"
                type="text"
                placeholder="Ej: -323232122"
                value={input}
                onChange={(e) =>
                  onInputChange(e.target.value.replace(/\s/g, ""))
                }
                className="flex-1"
              />
              <Button variant="outline" onClick={onClear}>
                Limpiar
              </Button>
            </div>
          </div>

          {/* Error/Warning Messages */}
          {(error || manualNegativeWarning) && (
            <div className="space-y-2">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}
              {manualNegativeWarning && (
                <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  {manualNegativeWarning}
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          {result && (
            <Tabs defaultValue="unsigned" className="space-y-4">
              <TabsList>
                <TabsTrigger value="unsigned">Sin signo</TabsTrigger>
                <TabsTrigger value="signed">Con signo (C2)</TabsTrigger>
              </TabsList>

              <TabsContent value="unsigned">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Binario sin signo ({getUnsignedBitLength()} caracteres)
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`transition-colors ${
                            copySuccess
                              ? "bg-green-50 border-green-200 text-green-700"
                              : ""
                          }`}
                        >
                          {copySuccess ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {copySuccess ? "¡Copiado!" : "Copiar"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            handleCopyWithPadding(
                              getFormattedResultForCopy(),
                              true
                            )
                          }
                        >
                          Con espaciado
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleCopyWithPadding(
                              getFormattedResultForCopy(),
                              false
                            )
                          }
                        >
                          Sin espaciado
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="font-mono bg-muted/30 border border-input rounded-md px-3 py-2 text-sm">
                    <FormattedNumber
                      value={
                        result.input.startsWith("-")
                          ? `-${result.magnitude || ""}`
                          : result.magnitude || ""
                      }
                      base="binary"
                    />
                  </div>

                  <div className="pt-3 space-y-2">
                    <Label className="text-sm font-medium">
                      Proceso (División entre 2)
                    </Label>
                    {renderDivisionByTwoTable()}
                    {renderFractionalSteps()}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signed">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Complemento a 2 ({getSignedBitLength()} bits)
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`transition-colors ${
                            copySuccess
                              ? "bg-green-50 border-green-200 text-green-700"
                              : ""
                          }`}
                        >
                          {copySuccess ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {copySuccess ? "¡Copiado!" : "Copiar"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            handleCopyWithPadding(
                              getFormattedSignedResultForCopy(),
                              true
                            )
                          }
                        >
                          Con espaciado
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleCopyWithPadding(
                              getFormattedSignedResultForCopy(),
                              false
                            )
                          }
                        >
                          Sin espaciado
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="font-mono bg-muted/30 border border-input rounded-md px-3 py-2 text-sm">
                    <FormattedNumber
                      value={result.signedResult || ""}
                      base="binary"
                    />
                  </div>

                  <div className="pt-3 space-y-2">
                    <Label className="text-sm font-medium">
                      Cálculo de C2 (invertir y sumar 1)
                    </Label>
                    <div className="text-xs text-muted-foreground">
                      1) Invertir bits del magnitud (complemento a 1)
                      <br />
                      2) Sumar 1 al resultado para obtener C2
                      <br />
                      Ancho de bits usado: magnitud + 1
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
