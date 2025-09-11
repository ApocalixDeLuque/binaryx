"use client";

import React from "react";
import { Section } from "@/components/results/base/section";
import type { ConversionResult } from "@/lib/base-conversions";

interface AnalysisProps {
  result: ConversionResult;
}

export function OctalToHexadecimalAnalysis({ result }: AnalysisProps) {
  const isNegative = result.input.trim().startsWith("-");
  return (
    <Section title="Análisis de entrada">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Valor octal</div>
          <div className="font-mono break-all whitespace-pre-wrap">{result.input}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Base origen</div>
          <div className="font-mono">Octal (Base 8)</div>
        </div>
        <div>
          <div className="text-muted-foreground">Signo</div>
          <div className="font-mono">{isNegative ? "Negativo" : "Positivo"}</div>
        </div>
      </div>
    </Section>
  );
}

