"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { BinaryToDecimalSummary } from "./summary";
import { BinaryToDecimalSteps } from "./steps";
import { BinaryToDecimalFinal } from "./final";

interface BinaryToDecimalResultsProps {
  result: ConversionResult;
  viewMode: "unsigned" | "signed";
}

export function BinaryToDecimalResults({
  result,
  viewMode,
}: BinaryToDecimalResultsProps) {
  return (
    <div className="space-y-6">
      <BinaryToDecimalSummary result={result} viewMode={viewMode} />
      <BinaryToDecimalSteps result={result} viewMode={viewMode} />
      <BinaryToDecimalFinal result={result} viewMode={viewMode} />
    </div>
  );
}
