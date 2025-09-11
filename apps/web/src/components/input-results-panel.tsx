"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRight, Copy, Trash, Check, ChevronDown } from "lucide-react";

// Import types and utilities
import type { BaseType, ConversionResult } from "@/lib/base-conversions";
import { getBaseName, cleanFormattedValue } from "@/lib/base-conversions";

// Import formatting component
import { FormattedNumber } from "@/components/formatted-number";

/**
 * Props for the InputResultsPanel component
 */
interface InputResultsPanelProps {
  /** Current input value */
  input: string;
  /** Callback when input changes */
  onInputChange: (value: string) => void;
  /** Source base */
  fromBase: BaseType;
  /** Target base */
  toBase: BaseType;
  /** Conversion result */
  result: ConversionResult | null;
  /** Error message */
  error: string;
  /** Manual negative warning */
  manualNegativeWarning: string;
  /** Callback to handle conversion */
  onConvert: () => void;
  /** Callback to copy result */
  onCopyResult: () => void;
  /** Callback to clear all */
  onClearAll: () => void;
}

/**
 * Input and Results Panel component
 *
 * Features:
 * - Single input field for number entry
 * - Dual output display for cases like binary to decimal (signed/unsigned)
 * - Dynamic placeholder based on source base
 * - Error and warning handling
 * - Proper TypeScript typing
 */
export function InputResultsPanel({
  input,
  onInputChange,
  fromBase,
  toBase,
  result,
  error,
  manualNegativeWarning,
  onConvert,
  onCopyResult,
  onClearAll,
}: InputResultsPanelProps) {
  // Copy animation states - separate for each button
  const [copySuccessPrimary, setCopySuccessPrimary] = useState(false);
  const [copySuccessSecondary, setCopySuccessSecondary] = useState(false);
  /**
   * Handle keyboard events for input
   */
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      onConvert();
    }
  };

  /**
   * Handle copy with animation for primary result
   */
  const handleCopyPrimary = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccessPrimary(true);
      setTimeout(() => setCopySuccessPrimary(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  /**
   * Handle copy with animation for secondary result
   */
  const handleCopySecondary = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccessSecondary(true);
      setTimeout(() => setCopySuccessSecondary(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  /**
   * Get formatted result for copying (with or without spacing)
   */
  /**
   * Helper function to format value the same way as FormattedNumber component
   */
  const formatValueLikeFormattedNumber = (
    value: string,
    base: BaseType
  ): string => {
    // Remove any existing spaces for consistent formatting
    const cleanValue = value.replace(/[\s,]/g, "");

    switch (base) {
      case "binary": {
        if (!cleanValue) return cleanValue;
        const isNeg = cleanValue.startsWith("-");
        const unsigned = isNeg ? cleanValue.slice(1) : cleanValue;
        const [i = "", f = ""] = unsigned.split(".");
        const groupInt = (s: string, size: number) => {
          const out: string[] = [];
          let rem = s;
          while (rem.length > size) {
            out.unshift(rem.slice(-size));
            rem = rem.slice(0, -size);
          }
          if (rem.length) out.unshift(rem);
          return out.join(" ");
        };
        const groupFrac = (s: string, size: number) => {
          const out: string[] = [];
          for (let k = 0; k < s.length; k += size)
            out.push(s.slice(k, k + size));
          return out.join(" ");
        };
        if (!f) return `${isNeg ? "-" : ""}${groupInt(i, 4)}`;
        return `${isNeg ? "-" : ""}${groupInt(i, 4)}.${groupFrac(f, 4)}`;
      }

      case "octal": {
        if (!cleanValue) return cleanValue;
        const isNeg = cleanValue.startsWith("-");
        const unsigned = isNeg ? cleanValue.slice(1) : cleanValue;
        const [i = "", f = ""] = unsigned.split(".");
        const groupInt = (s: string, size: number) => {
          const out: string[] = [];
          let rem = s;
          while (rem.length > size) {
            out.unshift(rem.slice(-size));
            rem = rem.slice(0, -size);
          }
          if (rem.length) out.unshift(rem);
          return out.join(" ");
        };
        const groupFrac = (s: string, size: number) => {
          const out: string[] = [];
          for (let k = 0; k < s.length; k += size)
            out.push(s.slice(k, k + size));
          return out.join(" ");
        };
        if (!f) return `${isNeg ? "-" : ""}${groupInt(i, 3)}`;
        return `${isNeg ? "-" : ""}${groupInt(i, 3)}.${groupFrac(f, 3)}`;
      }

      case "hexadecimal": {
        if (!cleanValue) return cleanValue;
        const isNeg = cleanValue.startsWith("-");
        const unsigned = isNeg ? cleanValue.slice(1) : cleanValue;
        const [i = "", f = ""] = unsigned.split(".");
        const groupInt = (s: string, size: number) => {
          const out: string[] = [];
          let rem = s;
          while (rem.length > size) {
            out.unshift(rem.slice(-size));
            rem = rem.slice(0, -size);
          }
          if (rem.length) out.unshift(rem);
          return out.join(" ");
        };
        const groupFrac = (s: string, size: number) => {
          const out: string[] = [];
          for (let k = 0; k < s.length; k += size)
            out.push(s.slice(k, k + size));
          return out.join(" ");
        };
        // Match FormattedNumber display: hex groups of 2
        if (!f) return `${isNeg ? "-" : ""}${groupInt(i, 2)}`;
        return `${isNeg ? "-" : ""}${groupInt(i, 2)}.${groupFrac(f, 2)}`;
      }

      case "decimal":
        if (!cleanValue) {
          return cleanValue;
        }
        // Group only the integer part; leave fractional untouched
        const isNeg = cleanValue.startsWith("-");
        const unsigned = isNeg ? cleanValue.slice(1) : cleanValue;
        if (unsigned.includes(".")) {
          const [intPartRaw, fracPartRaw] = unsigned.split(".");
          const intFormatted = intPartRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          return `${isNeg ? "-" : ""}${intFormatted}.${fracPartRaw}`;
        }
        const intFormatted = unsigned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return `${isNeg ? "-" : ""}${intFormatted}`;

      default:
        return cleanValue;
    }
  };

  const getFormattedResultForCopy = (withSpacing: boolean = true): string => {
    if (!result) return "";

    const displayBase = needsDualResults()
      ? isBinaryInput(input)
        ? "decimal"
        : fromBase === "decimal" && toBase === "hexadecimal"
        ? "hexadecimal"
        : "binary"
      : toBase;

    // Primary (unsigned) display uses magnitude for decimal→binary,
    // and uses result.output otherwise
    const rawValue = needsDualResults()
      ? fromBase === "decimal" && toBase === "binary"
        ? `${getInputSign(input) ? "-" : ""}${result.magnitude || ""}`
        : fromBase === "decimal" && toBase === "hexadecimal"
        ? result.output || ""
        : isBinaryInput(input) && toBase === "decimal"
        ? result.output || ""
        : result.output || ""
      : result.output || "";

    const formatted = formatValueLikeFormattedNumber(rawValue, displayBase);
    return withSpacing ? formatted : formatted.replace(/[\s,]/g, "");
  };

  /**
   * Get formatted signed result for copying (matches FormattedNumber display)
   */
  const getFormattedSignedResultForCopy = (
    withSpacing: boolean = true
  ): string => {
    if (!result || !needsDualResults()) return "";

    // Use signed for decimal→binary, decimal→hexadecimal (C2), and binary→decimal
    const rawValue =
      (fromBase === "decimal" && toBase === "binary") ||
      (isBinaryInput(input) && toBase === "decimal")
        ? result.signedResult || result.output || ""
        : fromBase === "decimal" && toBase === "hexadecimal"
        ? result.twosComplementHex || result.output || ""
        : result.output || "";

    const formatted = formatValueLikeFormattedNumber(
      rawValue,
      isBinaryInput(input) && toBase === "decimal"
        ? "decimal"
        : toBase === "hexadecimal" && fromBase === "decimal"
        ? "hexadecimal"
        : "binary"
    );
    return withSpacing ? formatted : formatted.replace(/[\s,]/g, "");
  };

  /**
   * Get dynamic placeholder based on fromBase
   */
  const getDynamicPlaceholder = (): string => {
    switch (fromBase) {
      case "binary":
        return "Ej: 1010.101";
      case "octal":
        return "Ej: 157";
      case "hexadecimal":
        return "Ej: B5F";
      default:
        return "Ej: 2911 o 12.125";
    }
  };

  /**
   * Get formatted result for display (for single result cases)
   */
  const getFormattedResult = (): string => {
    if (!result) return "";

    // Simply return the conversion result - the conversion modules handle all the logic
    return result.output;
  };

  /**
   * Check if we need dual results (decimal to binary case)
   */
  const needsDualResults = (): boolean => {
    // Dual results for:
    // - decimal -> binary (unsigned + C2 when negative)
    // - binary -> decimal (unsigned + signed C2 when no explicit '-')
    return (
      (fromBase === "decimal" && toBase === "binary") ||
      (fromBase === "binary" && toBase === "decimal")
    );
  };

  /**
   * Detect if input is binary (contains only 0, 1, and optional minus)
   */
  const isBinaryInput = (input: string): boolean => {
    const cleanInput = input.replace(/\s/g, "").replace(/^-/, "");
    return /^[01]+(\.[01]+)?$/.test(cleanInput) && cleanInput.length > 0;
  };

  /**
   * Get the actual binary value from input (handles decimal input only for decimal-to-binary)
   */
  const getBinaryValue = (input: string): string => {
    const cleanInput = input.replace(/\s/g, "");
    // For decimal-to-binary conversion, always treat input as decimal
    const decimalValue = parseInt(cleanInput);
    return Math.abs(decimalValue).toString(2);
  };

  /**
   * Get the sign from input
   */
  const getInputSign = (input: string): boolean => {
    return input.trim().startsWith("-");
  };

  /**
   * Get unsigned binary result for decimal to binary
   */
  const getUnsignedResult = (): string => {
    if (!result || !needsDualResults()) return "";

    const isActuallyBinaryInput = isBinaryInput(input);

    if (isActuallyBinaryInput) {
      // For binary input, show the decimal result without scientific notation
      let output = result.output;
      if (output.includes("e") || output.includes("E")) {
        // Convert scientific notation to full decimal
        const num = parseFloat(output);
        output = num.toLocaleString("fullwide", { useGrouping: false });
      }
      return output;
    }

    // For decimal to binary, use the magnitude from the conversion result
    // If the input is negative, show the magnitude with a negative sign
    if (fromBase === "decimal" && toBase === "binary") {
      const isNegative = getInputSign(result.input);
      const magnitude = result.magnitude || result.output || "";
      return isNegative ? `-${magnitude}` : magnitude;
    }

    return result.output || "";
  };

  /**
   * Get bit length for unsigned result
   */
  const getUnsignedBitLength = (): number => {
    if (!result || !needsDualResults()) return 0;

    if (fromBase === "decimal" && toBase === "binary") {
      const isNegative = getInputSign(result.input);
      const magnitude = result.magnitude || result.output || "";
      return isNegative ? magnitude.length + 1 : magnitude.length;
    }

    return (result.output || "").length;
  };

  /**
   * Get two's complement binary result for decimal to binary
   */
  const getSignedResult = (): string => {
    if (!result || !needsDualResults()) return "";

    // For decimal to binary, use the signed result from the conversion
    if (fromBase === "decimal" && toBase === "binary") {
      return result.signedResult || result.output || "";
    }

    return result.output || "";
  };

  /**
   * Get bit length for signed result
   */
  const getSignedBitLength = (): number => {
    if (!result || !needsDualResults()) return 0;

    if (fromBase === "decimal" && toBase === "binary") {
      return (result.signedResult || result.output || "").length;
    }

    return (result.output || "").length;
  };

  const getUnsignedBitSpanLabel = (): string => {
    if (!result) return "";
    if (fromBase === "decimal" && toBase === "binary") {
      const magnitude = result.magnitude || result.output || "";
      const [intPart, fracPart = ""] = magnitude.split(".");
      const intLen = (intPart || "").length;
      const fracLen = (fracPart || "").length;
      return fracLen ? `${intLen}.${fracLen} bits` : `${intLen} bits`;
    }
    const len = (result.output || "").length;
    return `${len} caracteres`;
  };

  const getSignedBitSpanLabel = (): string => {
    if (!result) return "";
    if (fromBase === "decimal" && toBase === "binary") {
      const signed = result.signedResult || result.output || "";
      const [intPart, fracPart = ""] = signed.split(".");
      const intLen = (intPart || "").length;
      const fracLen = (fracPart || "").length;
      return fracLen ? `${intLen}.${fracLen} bits` : `${intLen} bits`;
    }
    const len = (result.output || "").length;
    return `${len} caracteres`;
  };

  // Determine common scenarios and when to show both outputs
  const isDecimalToBinary = fromBase === "decimal" && toBase === "binary";
  const isDecimalToHex = fromBase === "decimal" && toBase === "hexadecimal";
  const isBinaryToDecimal = fromBase === "binary" && toBase === "decimal";
  const isHexToDecimal = fromBase === "hexadecimal" && toBase === "decimal";
  const inputClean = input.replace(/\s/g, "");
  const hexHasFraction = isHexToDecimal && inputClean.includes(".");
  const decimalHasFraction = isDecimalToHex && inputClean.includes(".");
  const inputIsNegative = getInputSign(input);
  // Show secondary result when:
  // - decimal→binary and input is negative (C2)
  // - binary→decimal and no explicit '-' (interpret as unsigned and signed)
  // - decimal→hexadecimal always show both (unsigned + C2 if negative)
  const showSecondaryResult =
    (isDecimalToBinary && inputIsNegative) ||
    (isBinaryToDecimal && !inputIsNegative) ||
    (isHexToDecimal && !inputIsNegative && !hexHasFraction) ||
    (isDecimalToHex && !decimalHasFraction);

  // Primary result label, base and value
  const primaryLabel = (() => {
    if (isBinaryToDecimal || isHexToDecimal)
      return inputIsNegative ? "Decimal" : "Decimal sin signo";
    if (isDecimalToHex) return "Hexadecimal sin signo";
    if (isDecimalToBinary)
      return `Binario sin signo (${getUnsignedBitSpanLabel()})`;
    return "Resultado";
  })();
  const primaryBase: BaseType =
    isBinaryToDecimal || isHexToDecimal
      ? "decimal"
      : isDecimalToHex
      ? "hexadecimal"
      : isDecimalToBinary
      ? "binary"
      : toBase;
  const primaryValue = (() => {
    if (!result) return "";
    if (isDecimalToBinary) {
      return `${inputIsNegative ? "-" : ""}${result.magnitude || ""}`;
    }
    if (isBinaryToDecimal) {
      return inputIsNegative
        ? result.signedResult || result.output || ""
        : result.output || "";
    }
    if (isHexToDecimal) {
      return inputIsNegative
        ? result.signedResult || result.output || ""
        : result.output || "";
    }
    if (isDecimalToHex) {
      return result.output || "";
    }
    return result.output || "";
  })();

  // Secondary (signed) result label, base and value
  const secondaryLabel = (() => {
    if (isBinaryToDecimal || isHexToDecimal)
      return "Decimal con complemento a 2";
    if (isDecimalToHex) return "Hexadecimal con complemento a 2";
    return `Complemento a 2 (${getSignedBitSpanLabel()})`;
  })();
  const secondaryBase: BaseType =
    isBinaryToDecimal || isHexToDecimal
      ? "decimal"
      : isDecimalToHex
      ? "hexadecimal"
      : "binary";
  const secondaryValue = (() => {
    if (!result) return "";
    if (isDecimalToBinary) return result.signedResult || result.output || "";
    if (isBinaryToDecimal) return result.signedResult || result.output || "";
    if (isHexToDecimal) return result.signedResult || result.output || "";
    if (isDecimalToHex) return result.twosComplementHex || result.output || "";
    return result.output || "";
  })();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              Conversor de {getBaseName(fromBase)} a {getBaseName(toBase)}
            </h2>
          </div>

          {/* Input Section */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="input" className="text-sm font-medium">
                Entrada
              </Label>
              <Input
                id="input"
                value={input}
                onChange={(e) =>
                  onInputChange(e.target.value.replace(/\s/g, ""))
                }
                onKeyDown={onKeyDown}
                placeholder={getDynamicPlaceholder()}
                className="font-mono"
              />
            </div>
            <Button
              variant="outline"
              onClick={onClearAll}
              title="Limpiar entrada"
            >
              <Trash className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>

          {/* Primary Result Section */}
          {result && (
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <Label className="text-sm font-medium">{primaryLabel}</Label>
                <div className="font-mono bg-muted/30 border border-input rounded-md px-3 py-2 text-sm">
                  <FormattedNumber value={primaryValue} base={primaryBase} />
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="mt-5" asChild>
                  <Button
                    variant="outline"
                    title={
                      copySuccessPrimary ? "¡Copiado!" : "Copiar resultado"
                    }
                    className={`transition-colors w-32 justify-center ${
                      copySuccessPrimary ? "bg-green-50 border-green-200" : ""
                    }`}
                  >
                    {copySuccessPrimary ? (
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copySuccessPrimary ? "¡Copiado!" : "Copiar"}
                    {!copySuccessPrimary && (
                      <ChevronDown className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      handleCopyPrimary(
                        formatValueLikeFormattedNumber(
                          primaryValue,
                          primaryBase
                        )
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Con espaciado
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleCopyPrimary(
                        formatValueLikeFormattedNumber(
                          primaryValue,
                          primaryBase
                        ).replace(/[\s,]/g, "")
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Sin espaciado
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Secondary Result Section (Optional) */}
          {result && showSecondaryResult && (
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <Label className="text-sm font-medium">{secondaryLabel}</Label>
                <div className="font-mono bg-muted/30 border border-input rounded-md px-3 py-2 text-sm">
                  <FormattedNumber
                    value={secondaryValue}
                    base={secondaryBase}
                  />
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="mt-5" asChild>
                  <Button
                    variant="outline"
                    title={
                      copySuccessSecondary ? "¡Copiado!" : "Copiar resultado"
                    }
                    className={`transition-colors w-32 justify-center ${
                      copySuccessSecondary ? "bg-green-50 border-green-200" : ""
                    }`}
                  >
                    {copySuccessSecondary ? (
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copySuccessSecondary ? "¡Copiado!" : "Copiar"}
                    {!copySuccessSecondary && (
                      <ChevronDown className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      handleCopySecondary(
                        formatValueLikeFormattedNumber(
                          secondaryValue,
                          secondaryBase
                        )
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Con espaciado
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleCopySecondary(
                        formatValueLikeFormattedNumber(
                          secondaryValue,
                          secondaryBase
                        ).replace(/[\s,]/g, "")
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Sin espaciado
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Endianness tables for decimal→hexadecimal C2 */}
          {result && isDecimalToHex && result.twosComplementHex && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {(() => {
                const hex = (result.twosComplementHex || "").toUpperCase();
                const bytes = hex.match(/.{1,2}/g) || [];
                let start = 0;
                while (start < bytes.length - 1 && bytes[start] === "00")
                  start++;
                const trimmed = bytes.slice(start);
                const big = trimmed;
                const little = [...trimmed].reverse();
                const Table = ({
                  title,
                  arr,
                }: {
                  title: string;
                  arr: string[];
                }) => (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {title}
                    </div>
                    <table className="w-full border text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          {arr.map((_, idx) => (
                            <th key={idx} className="px-2 py-1 border">
                              {idx}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {arr.map((b, idx) => (
                            <td
                              key={idx}
                              className="px-2 py-1 border text-center font-mono"
                            >
                              {b}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
                return (
                  <div className="flex flex-col gap-4">
                    <Table title="Big endian" arr={big} />
                    <Table title="Little endian" arr={little} />
                  </div>
                );
              })()}
            </div>
          )}

          {/* Warnings Section */}
          {(error || manualNegativeWarning) && (
            <div className="space-y-2">
              {error && (
                <Badge className="w-full bg-red-400 text-white whitespace-normal justify-center py-2">
                  {error}
                </Badge>
              )}
              {manualNegativeWarning && (
                <Badge className="w-full bg-red-400 text-white whitespace-normal justify-center py-2">
                  {manualNegativeWarning}
                </Badge>
              )}
            </div>
          )}

          {/* Convert Button - Hidden since conversion happens automatically */}
          {/* <div className="flex justify-center">
            <Button
              onClick={onConvert}
              disabled={!input.trim()}
              className="px-8"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Convertir
            </Button>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
