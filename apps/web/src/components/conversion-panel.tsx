"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator } from "lucide-react";

// Import sidebar components
import {
  BaseSelection,
  ConfigurationPanel,
  ExamplesPanel,
  ExportPanel,
} from "@/components/sidebar";

// Import input/results component
import { InputResultsPanel } from "@/components/input-results-panel";

// Import results panel component
import { ConversionResultsPanel } from "@/components/conversion-results-panel";

// Import types and utilities
import type { BaseType, ConversionResult } from "@/lib/base-conversions";
import {
  convertBetweenBases,
  getBaseName,
  cleanFormattedValue,
} from "@/lib/base-conversions";
import type { FormatConfig, RoundingMode } from "@/lib/types";

/**
 * Main conversion panel component with organized layout
 * Layout structure:
 * 1 | 5
 * 2 | 6
 * 3
 * 4
 *
 * Where:
 * 1 = Base Selection, 2 = Configuration, 3 = Examples, 4 = Export/Share
 * 5 = Input/Convert section, 6 = Results section
 */
export function ConversionPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL parameters
  const getInitialFromBase = (): BaseType => {
    const from = searchParams.get("from");
    const validBases: BaseType[] = [
      "binary",
      "decimal",
      "octal",
      "hexadecimal",
    ];
    return validBases.includes(from as BaseType)
      ? (from as BaseType)
      : "decimal";
  };

  const getInitialToBase = (): BaseType => {
    const to = searchParams.get("to");
    const validBases: BaseType[] = [
      "binary",
      "decimal",
      "octal",
      "hexadecimal",
    ];
    return validBases.includes(to as BaseType) ? (to as BaseType) : "binary";
  };

  const getInitialInput = (): string => {
    return searchParams.get("input") || "";
  };

  // Core state
  const [input, setInput] = useState(getInitialInput());
  const [fromBase, setFromBase] = useState<BaseType>(getInitialFromBase());
  const [toBase, setToBase] = useState<BaseType>(getInitialToBase());
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string>("");

  // Configuration state
  const [roundingMode, setRoundingMode] = useState<RoundingMode>("nearest");
  const [showVerification, setShowVerification] = useState<boolean>(true);
  const [showFlags, setShowFlags] = useState<boolean>(true);
  const [useDigitGrouping, setUseDigitGrouping] = useState<boolean>(true);
  const [showSignedTwosComplement, setShowSignedTwosComplement] =
    useState<boolean>(true);

  // UI state
  const [manualNegativeWarning, setManualNegativeWarning] =
    useState<string>("");

  /**
   * Handles the conversion process
   */
  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      setError("Por favor ingresa un número");
      setResult(null);
      return;
    }

    try {
      const conversionResult = convertBetweenBases(
        input,
        fromBase,
        toBase,
        undefined,
        useDigitGrouping
      );

      setResult(conversionResult);
      setError("");

      // Check for manual negative sign in binary input
      const hasManualNegative =
        fromBase === "binary" &&
        toBase === "decimal" &&
        input.trim().startsWith("-");

      if (hasManualNegative) {
        setManualNegativeWarning(
          "La entrada ya tiene signo negativo explícito. Se interpretará como binario sin signo y los cálculos de complemento a dos no se aplicarán."
        );
      } else {
        setManualNegativeWarning("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setResult(null);
      setManualNegativeWarning("");
    }
  }, [input, fromBase, toBase, useDigitGrouping]);

  /**
   * Auto-convert when input or bases change
   */
  useEffect(() => {
    if (input.trim()) {
      handleConvert();
    } else {
      setResult(null);
      setError("");
    }
  }, [handleConvert]);

  /**
   * Update URL parameters
   */
  const updateUrl = useCallback(
    (newFromBase?: BaseType, newToBase?: BaseType, newInput?: string) => {
      const params = new URLSearchParams();
      const currentFromBase = newFromBase || fromBase;
      const currentToBase = newToBase || toBase;
      const currentInput = newInput !== undefined ? newInput : input;

      // Always include from and to parameters for clarity and consistency
      params.set("from", currentFromBase);
      params.set("to", currentToBase);
      if (currentInput.trim()) {
        params.set("input", currentInput.trim());
      }

      const query = params.toString();
      const url = query ? `/conversiones?${query}` : "/conversiones";
      router.replace(url as any, { scroll: false });
    },
    [fromBase, toBase, input, router]
  );

  /**
   * Handle base swapping
   */
  const handleSwapBases = () => {
    const temp = fromBase;
    setFromBase(toBase);
    setToBase(temp);
    setResult(null);
    setError("");
    updateUrl(toBase, fromBase);
  };

  /**
   * Handle clearing all inputs
   */
  const handleClearAll = () => {
    setInput("");
    setFromBase("decimal");
    setToBase("binary");
    setResult(null);
    setError("");
  };

  /**
   * Handle copying result to clipboard
   */
  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(cleanFormattedValue(result.output));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Sidebar - Components 1-4 */}
          <div className="xl:col-span-1 space-y-4">
            {/* Component 1: Base Selection */}
            <BaseSelection
              fromBase={fromBase}
              toBase={toBase}
              onFromBaseChange={(base) => {
                setFromBase(base);
                updateUrl(base);
              }}
              onToBaseChange={(base) => {
                setToBase(base);
                updateUrl(undefined, base);
              }}
              onSwapBases={handleSwapBases}
            />

            {/* Component 2: Configuration Panel */}
            {/* <ConfigurationPanel
              roundingMode={roundingMode}
              onRoundingModeChange={setRoundingMode}
              showFlags={showFlags}
              onShowFlagsChange={setShowFlags}
              showVerification={showVerification}
              onShowVerificationChange={setShowVerification}
              useDigitGrouping={useDigitGrouping}
              onUseDigitGroupingChange={setUseDigitGrouping}
              showSignedTwosComplement={showSignedTwosComplement}
              onShowSignedTwosComplementChange={setShowSignedTwosComplement}
            /> */}

            {/* Component 3: Examples (placeholder for now) */}
            {/* <ExamplesPanel /> */}

            {/* Component 4: Export/Share (placeholder for now) */}
            {/* <ExportPanel /> */}
          </div>

          {/* Main Content - Components 5-6 */}
          <div className="xl:col-span-2 space-y-4">
            {/* Component 5: Input and Results Panel */}
            <InputResultsPanel
              input={input}
              onInputChange={(value) => {
                setInput(value);
                updateUrl(undefined, undefined, value);
              }}
              fromBase={fromBase}
              toBase={toBase}
              result={result}
              error={error}
              manualNegativeWarning={manualNegativeWarning}
              onConvert={handleConvert}
              onCopyResult={handleCopyResult}
              onClearAll={handleClearAll}
            />

            {/* Component 6: Results Section */}
            {result ? (
              <ConversionResultsPanel
                result={result}
                showFlags={true}
                showSignedTwosComplement={true}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calculator className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    Listo para convertir
                  </h3>
                  <p className="text-muted-foreground">
                    Selecciona las bases, ingresa un número y haz clic en
                    "Convertir" para ver los resultados.
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
