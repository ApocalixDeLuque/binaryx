"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { HexadecimalToOctalSummary } from "./summary";
import { HexadecimalToOctalAnalysis } from "./analysis";
import { HexadecimalToOctalSteps } from "./steps";
import { HexadecimalToOctalFinal } from "./final";

interface HexadecimalToOctalResultsProps {
  result: ConversionResult;
}

export function HexadecimalToOctalResults({
  result,
}: HexadecimalToOctalResultsProps) {
  return (
    <div className="space-y-6">
      <HexadecimalToOctalSummary result={result} />
      <HexadecimalToOctalAnalysis result={result} />
      <HexadecimalToOctalSteps result={result} />
      <HexadecimalToOctalFinal result={result} />
    </div>
  );
}

