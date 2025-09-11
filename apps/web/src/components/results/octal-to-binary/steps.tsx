"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";

interface StepsProps {
  result: ConversionResult;
}

export function OctalToBinarySteps({ result }: StepsProps) {
  const explicitNegative = result.input.trim().startsWith("-");

  const clean = result.input.replace(/\s/g, "").replace(/^-/, "");
  const [intOct = "", fracOct = ""] = clean.split(".");

  const toBin3 = (ch: string) => parseInt(ch, 8).toString(2).padStart(3, "0");

  const intPairs = intOct.split("").map((ch) => ({ ch, bin: toBin3(ch) }));
  const fracPairs = fracOct.split("").map((ch) => ({ ch, bin: toBin3(ch) }));

  // Recap values (use magnitude so fractional matches final truncation/trim)
  const magnitude = result.magnitude || "";
  const [magInt = "", magFrac = ""] = magnitude.split(".");

  return (
    <Section title="Conversión Octal → Binario">
      <div className="text-sm text-muted-foreground mb-2">
        1) Parte entera (expandir 3 bits por dígito):
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">Octal</th>
              <th className="px-2 py-1 border">→ binario (3 bits)</th>
            </tr>
          </thead>
          <tbody>
            {intPairs.map((p, i) => (
              <tr key={i}>
                <td className="px-2 py-1 border text-center font-mono">
                  {p.ch}
                </td>
                <td className="px-2 py-1 border text-center font-mono">
                  {p.bin}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">Parte entera obtenida:</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
          {magInt}
        </code>
      </div>

      {fracPairs.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">
            2) Parte fraccionaria (expandir 3 bits por dígito):
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1 border">Octal</th>
                  <th className="px-2 py-1 border">→ binario (3 bits)</th>
                </tr>
              </thead>
              <tbody>
                {fracPairs.map((p, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 border text-center font-mono">
                      {p.ch}
                    </td>
                    <td className="px-2 py-1 border text-center font-mono">
                      {p.bin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs">
            <div className="text-muted-foreground">
              Parte fraccionaria obtenida:
            </div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
              {magFrac || "0"}
            </code>
          </div>
        </div>
      )}

      {magFrac && (
        <div className="mt-4 text-xs">
          <div className="text-sm text-muted-foreground mb-2">
            3) Unión de partes:
          </div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            {magnitude}
          </code>
        </div>
      )}

      {explicitNegative && (
        <div className="mt-2 text-xs">
          <div className="text-sm text-muted-foreground mb-2">
            4) Aplicar signo negativo:
          </div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            -{magnitude}
          </code>
        </div>
      )}
    </Section>
  );
}
