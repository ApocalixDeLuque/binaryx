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
    const cleanValue = value.replace(/\s/g, "");

    switch (base) {
      case "binary":
        if (!cleanValue || cleanValue === "0") {
          return cleanValue;
        }
        // Group binary digits in 4-bit groups from right to left
        const groups: string[] = [];
        let remaining = cleanValue;

        while (remaining.length > 4) {
          const group = remaining.slice(-4);
          groups.unshift(group);
          remaining = remaining.slice(0, -4);
        }

        if (remaining.length > 0) {
          groups.unshift(remaining);
        }

        return groups.join(" ");

      case "octal":
        if (!cleanValue || cleanValue === "0") {
          return cleanValue;
        }
        // Group octal digits in 3-digit groups from right to left
        const octalGroups: string[] = [];
        let octalRemaining = cleanValue;

        while (octalRemaining.length > 3) {
          const group = octalRemaining.slice(-3);
          octalGroups.unshift(group);
          octalRemaining = octalRemaining.slice(0, -3);
        }

        if (octalRemaining.length > 0) {
          octalGroups.unshift(octalRemaining);
        }

        return octalGroups.join(" ");

      case "hexadecimal":
        if (!cleanValue || cleanValue === "0") {
          return cleanValue;
        }
        // Group hexadecimal digits in 4-digit groups from right to left
        const hexGroups: string[] = [];
        let hexRemaining = cleanValue;

        while (hexRemaining.length > 4) {
          const group = hexRemaining.slice(-4);
          hexGroups.unshift(group);
          hexRemaining = hexRemaining.slice(0, -4);
        }

        if (hexRemaining.length > 0) {
          hexGroups.unshift(hexRemaining);
        }

        return hexGroups.join(" ");

      case "decimal":
        if (!cleanValue || cleanValue === "0") {
          return cleanValue;
        }
        // Add commas every 3 digits from right to left
        return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      default:
        return cleanValue;
    }
  };

  const getFormattedResultForCopy = (withSpacing: boolean = true): string => {
    if (!result) return "";

    const displayBase = needsDualResults()
      ? isBinaryInput(input)
        ? "decimal"
        : "binary"
      : toBase;

    // Primary (unsigned) display uses magnitude for decimal→binary,
    // and uses result.output otherwise
    const rawValue = needsDualResults()
      ? fromBase === "decimal" && toBase === "binary"
        ? `${getInputSign(input) ? "-" : ""}${result.magnitude || ""}`
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

    // Secondary (signed two's complement) display uses result.signedResult for decimal→binary
    const rawValue =
      fromBase === "decimal" && toBase === "binary"
        ? result.signedResult || result.output || ""
        : result.output || "";

    const formatted = formatValueLikeFormattedNumber(rawValue, "binary");
    return withSpacing ? formatted : formatted.replace(/\s/g, "");
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
    // Show dual results for decimal to binary OR when binary input is detected
    const isActuallyBinaryInput = isBinaryInput(input);
    return (
      (fromBase === "decimal" && toBase === "binary") ||
      (isActuallyBinaryInput && toBase === "decimal")
    );
  };

  /**
   * Detect if input is binary (contains only 0, 1, and optional minus)
   */
  const isBinaryInput = (input: string): boolean => {
    const cleanInput = input.replace(/\s/g, "").replace(/^-/, "");
    return /^[01]+$/.test(cleanInput) && cleanInput.length > 0;
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

  // Determine if we should show the secondary (signed/C2) result
  const isDecimalToBinary = fromBase === "decimal" && toBase === "binary";
  const isBinaryToDecimal = isBinaryInput(input) && toBase === "decimal";
  const showSecondaryResult =
    (isDecimalToBinary && getInputSign(input)) || isBinaryToDecimal;

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

          {/* Warnings Section */}
          {(error || manualNegativeWarning) && (
            <div className="space-y-2">
              {error && (
                <Badge
                  variant="destructive"
                  className="w-full justify-center py-2"
                >
                  {error}
                </Badge>
              )}
              {manualNegativeWarning && (
                <Badge
                  variant="destructive"
                  className="w-full justify-center py-2"
                >
                  {manualNegativeWarning}
                </Badge>
              )}
            </div>
          )}

          {/* Primary Result Section */}
          {result && (
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <Label className="text-sm font-medium">
                  {needsDualResults()
                    ? isBinaryInput(input)
                      ? `Decimal sin signo`
                      : `Binario sin signo (${getUnsignedBitSpanLabel()})`
                    : "Resultado"}
                </Label>
                <div className="font-mono bg-muted/30 border border-input rounded-md px-3 py-2 text-sm">
                  {needsDualResults() ? (
                    <FormattedNumber
                      value={
                        fromBase === "decimal" && toBase === "binary"
                          ? `${getInputSign(input) ? "-" : ""}${
                              result.magnitude || ""
                            }`
                          : result.output || ""
                      }
                      base={isBinaryInput(input) ? "decimal" : "binary"}
                    />
                  ) : (
                    <FormattedNumber value={result.output} base={toBase} />
                  )}
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
                      handleCopyPrimary(getFormattedResultForCopy(true))
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Con espaciado
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleCopyPrimary(getFormattedResultForCopy(false))
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
          {result && needsDualResults() && showSecondaryResult && (
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <Label className="text-sm font-medium">
                  {isBinaryInput(input)
                    ? `Decimal con complemento a 2`
                    : `Complemento a 2 (${getSignedBitSpanLabel()})`}
                </Label>
                <div className="font-mono bg-muted/30 border border-input rounded-md px-3 py-2 text-sm">
                  <FormattedNumber
                    value={
                      fromBase === "decimal" && toBase === "binary"
                        ? result.signedResult || result.output || ""
                        : result.output || ""
                    }
                    base={isBinaryInput(input) ? "decimal" : "binary"}
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
                      handleCopySecondary(getFormattedSignedResultForCopy(true))
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Con espaciado
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleCopySecondary(
                        getFormattedSignedResultForCopy(false)
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
