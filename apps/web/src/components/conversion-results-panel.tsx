"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConversionResult, BaseType } from "@/lib/base-conversions";
import { BinaryToOctalResults } from "@/components/results/binary-to-octal";
import { OctalToBinaryResults } from "@/components/results/octal-to-binary";
import { OctalToHexadecimalResults } from "@/components/results/octal-to-hexadecimal";
import { BinaryToHexadecimalResults } from "@/components/results/binary-to-hexadecimal";
import { HexadecimalToBinaryResults } from "@/components/results/hexadecimal-to-binary";
import { HexadecimalToDecimalResults } from "@/components/results/hexadecimal-to-decimal";
import { HexadecimalToOctalResults } from "@/components/results/hexadecimal-to-octal";
import { DecimalToBinaryResults } from "@/components/results/decimal-to-binary";
import { BinaryToDecimalResults } from "@/components/results/binary-to-decimal";
import { DecimalToOctalResults } from "@/components/results/decimal-to-octal";
import { DecimalToHexadecimalResults } from "@/components/results/decimal-to-hexadecimal";
import { OctalToDecimalResults } from "@/components/results/octal-to-decimal";
import React from "react";
import { ResultSelector } from "./results/base/selector";

interface ConversionResultsPanelProps {
  result: ConversionResult;
  showFlags?: boolean;
  showSignedTwosComplement?: boolean;
}

export function ConversionResultsPanel({
  result,
  showFlags = true,
  showSignedTwosComplement = true,
}: ConversionResultsPanelProps) {
  const [viewMode, setViewMode] = React.useState<"unsigned" | "signed">(
    "unsigned"
  );
  /**
   * Determine if step 3 (Signed Representation) should be shown
   * Step 3 is only shown when:
   * 1. There's no explicit negative sign in the input (no manual negative)
   * 2. We're converting TO binary (because two's complement is for binary representation)
   */
  const shouldShowStep3 = (): boolean => {
    const hasExplicitNegative = result.input.trim().startsWith("-");
    const convertingToBinary = result.outputBase === "binary";
    return !hasExplicitNegative && convertingToBinary;
  };

  /**
   * Get the step number for the final result step
   * If step 3 is not shown, then step 4 becomes step 3
   */
  const getFinalResultStepNumber = (): number => {
    return shouldShowStep3() ? 4 : 3;
  };

  /**
   * Export helper functions for testing
   */
  const testHelpers = {
    shouldShowStep3: (result: ConversionResult) => {
      const hasExplicitNegative = result.input.trim().startsWith("-");
      const convertingToBinary = result.outputBase === "binary";
      return !hasExplicitNegative && convertingToBinary;
    },
    getFinalResultStepNumber: (result: ConversionResult) => {
      const hasExplicitNegative = result.input.trim().startsWith("-");
      const convertingToBinary = result.outputBase === "binary";
      const shouldShowStep3 = !hasExplicitNegative && convertingToBinary;
      return shouldShowStep3 ? 4 : 3;
    },
  };
  if (!result) {
    return (
      <Card className="w-full">
        <CardContent className="p-12">
          <div className="text-center text-muted-foreground">
            No hay resultados para mostrar
          </div>
        </CardContent>
      </Card>
    );
  }

  const isNegative = result.isNegative || false;
  const intSteps = result.integerSteps || [];
  const fracSteps = result.fractionalSteps || [];
  const initialInt =
    intSteps.length > 1
      ? typeof intSteps[1].quotient === "object"
        ? intSteps[1].quotient.toString()
        : intSteps[1].quotient
      : 0;
  const initialFrac = fracSteps.length > 0 ? fracSteps[0].value : 0;
  const intRemainders = intSteps.slice(1).map((s) => s.remainder);
  const intBinaryMagnitude = intRemainders.length
    ? intRemainders.slice().reverse().join("")
    : "0";
  const fracBitsSeq = fracSteps
    .slice(1)
    .map((s) => String(s.bit))
    .join("");
  const combinedMagnitude =
    intBinaryMagnitude + (fracBitsSeq ? "." + fracBitsSeq : "");

  const formatBinaryDisplay = (bin: string) => {
    if (!bin.includes(".")) {
      return bin.match(/.{1,4}/g)?.join(" ") || bin;
    } else {
      const [integerPart, fractionalPart] = bin.split(".");
      return `${integerPart.match(/.{1,4}/g)?.join(" ") || integerPart}·${
        fractionalPart.match(/.{1,4}/g)?.join(" ") || fractionalPart
      }`;
    }
  };

  // Build unsigned/signed displays
  const unsignedDisplay =
    result.inputBase === "decimal" && result.outputBase === "binary"
      ? `${result.input.trim().startsWith("-") ? "-" : ""}${
          result.magnitude || ""
        }`
      : result.output;
  const signedDisplay =
    result.inputBase === "decimal" && result.outputBase === "binary"
      ? result.signedResult || ""
      : result.output;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            Desglose de la Conversión:
          </CardTitle>
          {result.inputBase === "decimal" &&
            result.outputBase === "binary" &&
            result.input.trim().startsWith("-") && (
              <ResultSelector
                value={viewMode}
                onChange={(v) => setViewMode(v as "unsigned" | "signed")}
              />
            )}

          {result.inputBase === "binary" &&
            result.outputBase === "decimal" &&
            !result.input.trim().startsWith("-") && (
              <ResultSelector
                value={viewMode}
                onChange={(v) => setViewMode(v as "unsigned" | "signed")}
              />
            )}

          {result.inputBase === "decimal" &&
            result.outputBase === "hexadecimal" &&
            result.input.trim().startsWith("-") && (
              <ResultSelector
                value={viewMode}
                onChange={(v) => setViewMode(v as "unsigned" | "signed")}
              />
            )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Decimal → Binary: new modular results UI */}
        {result.inputBase === "decimal" && result.outputBase === "binary" && (
          <DecimalToBinaryResults
            result={result}
            viewMode={
              result.input.trim().startsWith("-") ? viewMode : "unsigned"
            }
            showFlags={showFlags}
          />
        )}

        {result.inputBase === "binary" && result.outputBase === "decimal" && (
          <BinaryToDecimalResults
            result={result}
            viewMode={
              result.input.trim().startsWith("-")
                ? "signed"
                : (viewMode as "unsigned" | "signed")
            }
          />
        )}

        {result.inputBase === "decimal" && result.outputBase === "octal" && (
          <DecimalToOctalResults result={result} />
        )}

        {result.inputBase === "decimal" &&
          result.outputBase === "hexadecimal" && (
            <DecimalToHexadecimalResults result={result} viewMode={viewMode} />
          )}

        {result.inputBase === "binary" && result.outputBase === "octal" && (
          <BinaryToOctalResults result={result} />
        )}

        {result.inputBase === "octal" && result.outputBase === "binary" && (
          <OctalToBinaryResults result={result} />
        )}

        {result.inputBase === "octal" &&
          result.outputBase === "hexadecimal" && (
            <OctalToHexadecimalResults result={result} />
          )}

        {result.inputBase === "octal" && result.outputBase === "decimal" && (
          <OctalToDecimalResults result={result} />
        )}

        {result.inputBase === "binary" &&
          result.outputBase === "hexadecimal" && (
            <BinaryToHexadecimalResults result={result} />
          )}

        {result.inputBase === "hexadecimal" &&
          result.outputBase === "binary" && (
            <HexadecimalToBinaryResults result={result} />
          )}

        {result.inputBase === "hexadecimal" &&
          result.outputBase === "decimal" && (
            <HexadecimalToDecimalResults result={result} />
          )}

        {result.inputBase === "hexadecimal" &&
          result.outputBase === "octal" && (
            <HexadecimalToOctalResults result={result} />
          )}
      </CardContent>
    </Card>
  );
}
