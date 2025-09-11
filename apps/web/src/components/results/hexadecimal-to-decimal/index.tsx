"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { HexadecimalToDecimalSummary } from "./summary";
import { HexadecimalToDecimalAnalysis } from "./analysis";
import { HexadecimalToDecimalSteps } from "./steps";
import { HexadecimalToDecimalFinal } from "./final";

interface HexadecimalToDecimalResultsProps {
  result: ConversionResult;
  viewMode: "unsigned" | "signed";
}

export function HexadecimalToDecimalResults({
  result,
  viewMode,
}: HexadecimalToDecimalResultsProps) {
  return (
    <div className="space-y-6">
      <HexadecimalToDecimalSummary result={result} viewMode={viewMode} />
      <HexadecimalToDecimalAnalysis result={result} />
      <HexadecimalToDecimalSteps result={result} viewMode={viewMode} />
      <HexadecimalToDecimalFinal result={result} viewMode={viewMode} />
    </div>
  );
}
