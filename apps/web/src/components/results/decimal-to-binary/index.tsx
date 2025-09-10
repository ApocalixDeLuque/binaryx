"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { DecimalToBinarySummary } from "./summary";
import { DecimalToBinaryAnalysis } from "./analysis";
import { DecimalToBinarySteps } from "./steps";
import { DecimalToBinaryFinal } from "./final";
import { DecimalToBinaryFlags } from "./flags";

interface DecimalToBinaryResultsProps {
  result: ConversionResult;
  viewMode: "unsigned" | "signed";
  showFlags?: boolean;
}

export function DecimalToBinaryResults({
  result,
  viewMode,
  showFlags = true,
}: DecimalToBinaryResultsProps) {
  const isNegative = result.input.trim().startsWith("-");
  return (
    <div className="space-y-6">
      <DecimalToBinarySummary
        result={result}
        viewMode={isNegative ? viewMode : "unsigned"}
      />
      <DecimalToBinaryAnalysis result={result} />
      <DecimalToBinarySteps
        result={result}
        viewMode={isNegative ? viewMode : "unsigned"}
      />
      <DecimalToBinaryFinal
        result={result}
        viewMode={isNegative ? viewMode : "unsigned"}
      />
      <DecimalToBinaryFlags
        result={result}
        viewMode={isNegative ? viewMode : "unsigned"}
        showFlags={showFlags}
      />
    </div>
  );
}
