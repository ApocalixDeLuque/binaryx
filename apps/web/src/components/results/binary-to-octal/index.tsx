"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { BinaryToOctalSummary } from "./summary";
import { BinaryToOctalAnalysis } from "./analysis";
import { BinaryToOctalSteps } from "./steps";
import { BinaryToOctalFinal } from "./final";

interface BinaryToOctalResultsProps {
  result: ConversionResult;
}

export function BinaryToOctalResults({ result }: BinaryToOctalResultsProps) {
  return (
    <div className="space-y-6">
      <BinaryToOctalSummary result={result} />
      <BinaryToOctalAnalysis result={result} />
      <BinaryToOctalSteps result={result} />
      <BinaryToOctalFinal result={result} />
    </div>
  );
}

