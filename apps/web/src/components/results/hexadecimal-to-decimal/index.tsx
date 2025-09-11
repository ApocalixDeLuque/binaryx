"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { HexadecimalToDecimalSummary } from "./summary";
import { HexadecimalToDecimalAnalysis } from "./analysis";
import { HexadecimalToDecimalSteps } from "./steps";
import { HexadecimalToDecimalFinal } from "./final";

interface HexadecimalToDecimalResultsProps {
  result: ConversionResult;
}

export function HexadecimalToDecimalResults({
  result,
}: HexadecimalToDecimalResultsProps) {
  return (
    <div className="space-y-6">
      <HexadecimalToDecimalSummary result={result} />
      <HexadecimalToDecimalAnalysis result={result} />
      <HexadecimalToDecimalSteps result={result} />
      <HexadecimalToDecimalFinal result={result} />
    </div>
  );
}

