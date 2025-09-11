"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";
import { FormattedNumber } from "@/components/formatted-number";

interface SummaryProps {
  result: ConversionResult;
  viewMode: "unsigned" | "signed";
}

export function HexadecimalToDecimalSummary({ result, viewMode }: SummaryProps) {
  const explicitNegative = result.input.trim().startsWith("-");
  const canSigned = !result.hasFractionalPart && !explicitNegative;
  return (
    <Section title="Resumen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Entrada</div>
          <div className="font-mono text-sm break-all whitespace-pre-wrap">
            {result.input}
          </div>
          <div className="text-xs text-muted-foreground">Base Hexadecimal</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Resultado</div>
          <div className="font-mono text-sm break-all whitespace-pre-wrap">
            <FormattedNumber
              value={
                canSigned && viewMode === "signed"
                  ? result.signedResult || result.output
                  : result.output
              }
              base="decimal"
            />
          </div>
          <div className="text-xs text-muted-foreground">Base Decimal</div>
        </div>
      </div>
    </Section>
  );
}
