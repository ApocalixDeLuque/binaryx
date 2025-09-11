"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";
import { FormattedNumber } from "@/components/formatted-number";

interface FinalProps {
  result: ConversionResult;
  viewMode: "unsigned" | "signed";
}

export function DecimalToHexadecimalFinal({ result, viewMode }: FinalProps) {
  const isNeg = result.input.trim().startsWith("-");
  const unsigned = `${isNeg ? "-" : ""}${result.magnitude || result.output}`;
  const signed = (result.twosComplementHex || "").toUpperCase();
  const hasC2 = Boolean(signed) && !(result.magnitude || "").includes(".");
  const bytes: string[] = hasC2 ? (signed.match(/.{1,2}/g) || []) : [];
  // Trim leading 00 bytes to focus on the significant representation
  let start = 0;
  while (start < bytes.length - 1 && bytes[start] === "00") start++;
  const trimmed = bytes.slice(start);
  const big = trimmed;
  const little = [...trimmed].reverse();
  return (
    <Section title="Resultado final">
      <div className="grid gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Entrada</div>
          <div className="font-mono break-all whitespace-pre-wrap">
            {result.input}
          </div>
          <div className="text-xs text-muted-foreground">Base Decimal</div>
        </div>
        <div>
          <div className="text-muted-foreground">Resultado directo</div>
          <div className="font-mono">
            <FormattedNumber
              value={viewMode === "unsigned" ? unsigned : signed}
              base="hexadecimal"
            />
          </div>
          <div className="text-xs text-muted-foreground">Base Hexadecimal</div>
        </div>

        {hasC2 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              Representación por endianness (bytes)
            </div>
            {/* Compact byte-order summaries */}
            <div className="space-y-1">
              <div className="text-muted-foreground">Big endian</div>
              <code className="font-mono border rounded px-2 py-1 inline-block whitespace-pre-wrap break-words">
                {big.join(" ")}
              </code>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Little endian</div>
              <code className="font-mono border rounded px-2 py-1 inline-block whitespace-pre-wrap break-words">
                {little.join(" ")}
              </code>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
