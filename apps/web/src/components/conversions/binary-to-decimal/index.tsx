import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ConversionResult } from "@/lib/base-conversions";
import { FormattedNumber } from "@/components/formatted-number";

interface BinaryToDecimalProps {
  input: string;
  result: ConversionResult | null;
  error: string | null;
  onInputChange: (value: string) => void;
  onClear: () => void;
  onCopy: (text: string) => void;
  copySuccess: boolean;
}

/**
 * Binary to Decimal Conversion Component
 */
export function BinaryToDecimal({
  input,
  result,
  error,
  onInputChange,
  onClear,
  onCopy,
  copySuccess,
}: BinaryToDecimalProps) {
  /**
   * Handle copy with or without formatting
   */
  const handleCopyWithPadding = (resultText: string, withPadding: boolean) => {
    const textToCopy = withPadding ? resultText : resultText.replace(/,/g, "");
    onCopy(textToCopy);
  };

  /**
   * Get formatted result for copy (with commas)
   */
  const getFormattedResultForCopy = (): string => {
    return result?.output || "";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              Conversor de Binario a Decimal
            </h2>
          </div>

          {/* Input Section */}
          <div className="space-y-2">
            <Label htmlFor="binary-input" className="text-sm font-medium">
              Entrada
            </Label>
            <div className="flex gap-2">
              <Input
                id="binary-input"
                type="text"
                placeholder="Ej: 101010"
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

          {/* Error Messages */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="space-y-4">
              {/* Decimal Result */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Resultado Decimal
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
                        Con formato
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleCopyWithPadding(
                            getFormattedResultForCopy(),
                            false
                          )
                        }
                      >
                        Sin formato
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="font-mono bg-muted/30 border border-input rounded-md px-3 py-2 text-sm">
                  <FormattedNumber value={result.output} base="decimal" />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
