"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";

interface StepsProps {
  result: ConversionResult;
}

export function HexadecimalToBinarySteps({ result }: StepsProps) {
  const explicitNegative = result.input.trim().startsWith("-");

  const clean = result.input.replace(/\s/g, "").replace(/^-/, "");
  const [intRaw = "", fracRaw = ""] = clean.split(".");

  const toBin4 = (ch: string) =>
    parseInt(ch, 16).toString(2).padStart(4, "0").toUpperCase();

  const intPairs = intRaw
    .split("")
    .map((ch) => ({ ch: ch.toUpperCase(), bin: toBin4(ch) }));
  const fracPairs = fracRaw
    .split("")
    .map((ch) => ({ ch: ch.toUpperCase(), bin: toBin4(ch) }));

  // Recaps (use magnitude to avoid leading/trailing zero artifacts)
  const magnitude = result.magnitude || "";
  const [magInt = "", magFrac = ""] = magnitude.split(".");
  const showFrac = (magFrac || "").length > 0 || fracPairs.length > 0;
  const showUnion = Boolean(magFrac);
  const applyNegStepNum = 1 + (showFrac ? 1 : 0) + (showUnion ? 1 : 0) + 1;

  return (
    <Section title="Conversión Hexadecimal → Binario">
      <div className="text-sm text-muted-foreground mb-2">
        1) Parte entera (expandir cada dígito a 4 bits):
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">Hex</th>
              <th className="px-2 py-1 border">→ binario (4 bits)</th>
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
            2) Parte fraccionaria (expandir cada dígito a 4 bits):
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1 border">Hex</th>
                  <th className="px-2 py-1 border">→ binario (4 bits)</th>
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
          {/* make the code block and its inner text wrap */}
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            {magnitude}
          </code>
        </div>
      )}

      {explicitNegative && (
        <div className="mt-2 text-xs">
          <div className="text-sm text-muted-foreground mb-2">{`${applyNegStepNum}) Aplicar signo negativo:`}</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            -{magnitude}
          </code>
        </div>
      )}
    </Section>
  );
}
