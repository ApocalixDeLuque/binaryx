"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { OctalToHexadecimalSummary } from "./summary";
import { OctalToHexadecimalAnalysis } from "./analysis";
import { OctalToHexadecimalSteps } from "./steps";
import { OctalToHexadecimalFinal } from "./final";

interface OctalToHexadecimalResultsProps {
  result: ConversionResult;
}

export function OctalToHexadecimalResults({
  result,
}: OctalToHexadecimalResultsProps) {
  return (
    <div className="space-y-6">
      <OctalToHexadecimalSummary result={result} />
      <OctalToHexadecimalAnalysis result={result} />
      <OctalToHexadecimalSteps result={result} />
      <OctalToHexadecimalFinal result={result} />
    </div>
  );
}

