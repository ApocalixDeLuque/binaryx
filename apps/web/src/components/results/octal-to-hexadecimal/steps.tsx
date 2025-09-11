"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";

interface StepsProps {
  result: ConversionResult;
}

export function OctalToHexadecimalSteps({ result }: StepsProps) {
  const explicitNegative = result.input.trim().startsWith("-");

  const clean = result.input.replace(/\s/g, "").replace(/^-/, "");
  const [intOct = "", fracOct = ""] = clean.split(".");

  const toBin3 = (ch: string) => parseInt(ch, 8).toString(2).padStart(3, "0");
  const toHex = (n: number) => n.toString(16).toUpperCase();

  // Stage 1: Octal → Binary (separate entero/fracción)
  const intPairs = intOct.split("").map((ch) => ({ ch, bin: toBin3(ch) }));
  const fracPairs = fracOct.split("").map((ch) => ({ ch, bin: toBin3(ch) }));

  // Stage 2: Regroup binary into 4-bit nibbles → Hex
  const magnitude = result.magnitude || "";
  const [hexInt = "", hexFrac = ""] = magnitude.split(".");

  // Full binary sequences from the tables
  const intBinFull = intPairs.map((p) => p.bin).join("");
  const fracBinFull = fracPairs.map((p) => p.bin).join("");

  // Trimmed integer binary for regrouping (remove leading zeros but keep at least one)
  const intBin = intBinFull.replace(/^0+/, "") || "0";
  const padLeft4 = (s: string) =>
    s.length % 4 === 0 ? s : s.padStart(s.length + (4 - (s.length % 4)), "0");
  const padRight4 = (s: string) =>
    s.length % 4 === 0 ? s : s.padEnd(s.length + (4 - (s.length % 4)), "0");

  const intGrouped = (padLeft4(intBin).match(/.{1,4}/g) as string[]) || [
    intBin,
  ];
  const fracGroupedBase = fracBinFull
    ? (padRight4(fracBinFull).match(/.{1,4}/g) as string[]) || []
    : [];

  const hexIntDigits = (hexInt || "0").split("");
  const hexFracDigits = (hexFrac || "").split("");

  return (
    <Section title="Conversión Octal → Hexadecimal (vía binario)">
      {/* Parte entera */}
      <div className="text-sm text-muted-foreground mb-2">
        1) Parte entera: Octal → Binario (3 bits por dígito)
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
              <tr key={`io-${i}`}>
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

      {/* Recap: full integer binary from the table */}
      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">
          Parte entera (binario) obtenida:
        </div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
          {intBinFull || "0"}
        </code>
      </div>

      <div className="text-sm text-muted-foreground my-3">
        2) Parte entera: Reagrupar en 4 bits → dígitos hexadecimales
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">Grupo binario</th>
              <th className="px-2 py-1 border">→ hex</th>
            </tr>
          </thead>
          <tbody>
            {intGrouped.map((g, i) => (
              <tr key={`ig-${i}`}>
                <td className="px-2 py-1 border text-center font-mono">{g}</td>
                <td className="px-2 py-1 border text-center font-mono">
                  {hexIntDigits[i] || toHex(parseInt(g, 2))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">Parte entera obtenida:</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
          {hexInt || "0"}
        </code>
      </div>

      {/* Parte fraccionaria */}
      {fracPairs.length > 0 && (
        <>
          <div className="mt-4 text-sm text-muted-foreground mb-2">
            3) Parte fraccionaria: Octal → Binario (3 bits por dígito)
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
                  <tr key={`fo-${i}`}>
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

          {/* Recap: full fractional binary from the table */}
          <div className="mt-3 text-xs">
            <div className="text-muted-foreground">
              Parte fraccionaria (binario) obtenida:
            </div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
              {fracBinFull || "0"}
            </code>
          </div>

          <div className="text-sm text-muted-foreground my-3">
            4) Parte fraccionaria: Reagrupar en 4 bits → dígitos hexadecimales
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1 border">Grupo binario</th>
                  <th className="px-2 py-1 border">→ hex</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const groups: string[] = [];
                  for (let i = 0; i < hexFracDigits.length; i++) {
                    if (i < fracGroupedBase.length) {
                      groups.push(fracGroupedBase[i]);
                    } else {
                      // Beyond direct regrouping, synthesize nibble from hex digit to display full conversion
                      const nibble = parseInt(hexFracDigits[i], 16)
                        .toString(2)
                        .padStart(4, "0");
                      groups.push(nibble);
                    }
                  }
                  return groups.map((g, i) => (
                    <tr key={`fg-${i}`}>
                      <td className="px-2 py-1 border text-center font-mono">
                        {g}
                      </td>
                      <td className="px-2 py-1 border text-center font-mono">
                        {hexFracDigits[i]}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-xs">
            <div className="text-muted-foreground">
              Parte fraccionaria obtenida:
            </div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
              {hexFrac}
            </code>
          </div>

          <div className="mt-4 text-xs">
            <div className="text-sm text-muted-foreground mb-2">
              5) Unión de partes:
            </div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
              {magnitude}
            </code>
          </div>
        </>
      )}

      {explicitNegative && (
        <div className="mt-2 text-xs">
          <div className="text-sm text-muted-foreground mb-2">
            6) Aplicar signo negativo:
          </div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            -{magnitude}
          </code>
        </div>
      )}
    </Section>
  );
}
