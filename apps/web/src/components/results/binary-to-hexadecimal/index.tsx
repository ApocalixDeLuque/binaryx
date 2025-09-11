"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { BinaryToHexadecimalSummary } from "./summary";
import { BinaryToHexadecimalAnalysis } from "./analysis";
import { BinaryToHexadecimalSteps } from "./steps";
import { BinaryToHexadecimalFinal } from "./final";

interface BinaryToHexadecimalResultsProps {
  result: ConversionResult;
}

export function BinaryToHexadecimalResults({
  result,
}: BinaryToHexadecimalResultsProps) {
  return (
    <div className="space-y-6">
      <BinaryToHexadecimalSummary result={result} />
      <BinaryToHexadecimalAnalysis result={result} />
      <BinaryToHexadecimalSteps result={result} />
      <BinaryToHexadecimalFinal result={result} />
    </div>
  );
}

