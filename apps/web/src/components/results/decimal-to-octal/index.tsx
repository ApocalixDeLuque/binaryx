"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { DecimalToOctalSummary } from "./summary";
import { DecimalToOctalSteps } from "./steps";
import { DecimalToOctalFinal } from "./final";
import { DecimalToOctalAnalysis } from "./analysis";

interface DecimalToOctalResultsProps {
  result: ConversionResult;
}

export function DecimalToOctalResults({ result }: DecimalToOctalResultsProps) {
  return (
    <div className="space-y-6">
      <DecimalToOctalSummary result={result} />
      <DecimalToOctalAnalysis result={result} />
      <DecimalToOctalSteps result={result} />
      <DecimalToOctalFinal result={result} />
    </div>
  );
}
