"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { OctalToDecimalSummary } from "./summary";
import { OctalToDecimalAnalysis } from "./analysis";
import { OctalToDecimalSteps } from "./steps";
import { OctalToDecimalFinal } from "./final";

interface OctalToDecimalResultsProps {
  result: ConversionResult;
}

export function OctalToDecimalResults({ result }: OctalToDecimalResultsProps) {
  return (
    <div className="space-y-6">
      <OctalToDecimalSummary result={result} />
      <OctalToDecimalAnalysis result={result} />
      <OctalToDecimalSteps result={result} />
      <OctalToDecimalFinal result={result} />
    </div>
  );
}

