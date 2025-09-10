"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { DecimalToHexadecimalSummary } from "./summary";
import { DecimalToHexadecimalAnalysis } from "./analysis";
import { DecimalToHexadecimalSteps } from "./steps";
import { DecimalToHexadecimalFinal } from "./final";

interface DecimalToHexadecimalResultsProps {
  result: ConversionResult;
}

export function DecimalToHexadecimalResults({
  result,
}: DecimalToHexadecimalResultsProps) {
  return (
    <div className="space-y-6">
      <DecimalToHexadecimalSummary result={result} />
      <DecimalToHexadecimalAnalysis result={result} />
      <DecimalToHexadecimalSteps result={result} />
      <DecimalToHexadecimalFinal result={result} />
    </div>
  );
}
