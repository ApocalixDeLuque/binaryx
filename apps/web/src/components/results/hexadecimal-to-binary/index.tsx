"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { HexadecimalToBinarySummary } from "./summary";
import { HexadecimalToBinaryAnalysis } from "./analysis";
import { HexadecimalToBinarySteps } from "./steps";
import { HexadecimalToBinaryFinal } from "./final";

interface HexadecimalToBinaryResultsProps {
  result: ConversionResult;
}

export function HexadecimalToBinaryResults({
  result,
}: HexadecimalToBinaryResultsProps) {
  return (
    <div className="space-y-6">
      <HexadecimalToBinarySummary result={result} />
      <HexadecimalToBinaryAnalysis result={result} />
      <HexadecimalToBinarySteps result={result} />
      <HexadecimalToBinaryFinal result={result} />
    </div>
  );
}

