"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { OctalToBinarySummary } from "./summary";
import { OctalToBinaryAnalysis } from "./analysis";
import { OctalToBinarySteps } from "./steps";
import { OctalToBinaryFinal } from "./final";

interface OctalToBinaryResultsProps {
  result: ConversionResult;
}

export function OctalToBinaryResults({ result }: OctalToBinaryResultsProps) {
  return (
    <div className="space-y-6">
      <OctalToBinarySummary result={result} />
      <OctalToBinaryAnalysis result={result} />
      <OctalToBinarySteps result={result} />
      <OctalToBinaryFinal result={result} />
    </div>
  );
}

