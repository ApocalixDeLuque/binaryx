"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";
import { FormattedNumber } from "@/components/formatted-number";

interface FinalProps {
  result: ConversionResult;
}

export function OctalToDecimalFinal({ result }: FinalProps) {
  return (
    <Section title="Resultado final">
      <div className="grid gap-2 text-sm">
        <div>
          <div className="text-muted-foreground">Entrada</div>
          <div className="font-mono break-all whitespace-pre-wrap">{result.input}</div>
          <div className="text-xs text-muted-foreground">Base Octal</div>
        </div>
        <div className="mt-2">
          <div className="text-muted-foreground">Resultado directo</div>
          <div className="font-mono">
            <FormattedNumber value={result.output} base="decimal" />
          </div>
          <div className="text-xs text-muted-foreground">Base Decimal</div>
        </div>
      </div>
    </Section>
  );
}

