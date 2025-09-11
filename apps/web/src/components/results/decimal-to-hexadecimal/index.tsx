"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { DecimalToHexadecimalSummary } from "./summary";
import { DecimalToHexadecimalAnalysis } from "./analysis";
import { DecimalToHexadecimalSteps } from "./steps";
import { DecimalToHexadecimalFinal } from "./final";

interface DecimalToHexadecimalResultsProps {
  result: ConversionResult;
  viewMode: "unsigned" | "signed";
}

export function DecimalToHexadecimalResults({
  result,
  viewMode,
}: DecimalToHexadecimalResultsProps) {
  return (
    <div className="space-y-6">
      <DecimalToHexadecimalSummary result={result} viewMode={viewMode} />
      <DecimalToHexadecimalAnalysis result={result} />
      <DecimalToHexadecimalSteps result={result} viewMode={viewMode} />
      <DecimalToHexadecimalFinal result={result} viewMode={viewMode} />
    </div>
  );
}
