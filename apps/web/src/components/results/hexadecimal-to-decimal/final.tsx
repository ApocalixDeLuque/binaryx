"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";
import { FormattedNumber } from "@/components/formatted-number";

interface FinalProps {
  result: ConversionResult;
  viewMode: "unsigned" | "signed";
}

export function HexadecimalToDecimalFinal({ result, viewMode }: FinalProps) {
  const explicitNegative = result.input.trim().startsWith("-");
  const canSigned = !result.hasFractionalPart && !explicitNegative;
  return (
    <Section title="Resultado final">
      <div className="grid gap-2 text-sm">
        <div>
          <div className="text-muted-foreground">Entrada</div>
          <div className="font-mono break-all whitespace-pre-wrap">{result.input}</div>
          <div className="text-xs text-muted-foreground">Base Hexadecimal</div>
        </div>
        <div className="mt-2">
          <div className="text-muted-foreground">Resultado directo</div>
          <div className="font-mono">
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
