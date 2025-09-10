"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";
import { FormattedNumber } from "@/components/formatted-number";

interface FinalProps {
  result: ConversionResult;
  viewMode: "unsigned" | "signed";
}

export function DecimalToBinaryFinal({ result, viewMode }: FinalProps) {
  const unsigned = `${result.input.trim().startsWith("-") ? "-" : ""}${
    result.magnitude || ""
  }`;
  const signed = result.signedResult || ""; // no explicit '-'

  return (
    <Section title="Resultado final">
      <div className="grid gap-2 text-sm">
        <div>
          <div className="text-muted-foreground">Entrada</div>
          <div className="font-mono break-all whitespace-pre-wrap">
            {result.input}
          </div>
          <div className="text-xs text-muted-foreground">Base Decimal</div>
        </div>
        <div className="mt-2">
          <div className="text-muted-foreground">Resultado directo</div>
          <div className="font-mono">
            <FormattedNumber
              value={viewMode === "unsigned" ? unsigned : signed}
              base="binary"
            />
          </div>
          <div className="text-xs text-muted-foreground">Base Binario</div>
        </div>
      </div>
    </Section>
  );
}
