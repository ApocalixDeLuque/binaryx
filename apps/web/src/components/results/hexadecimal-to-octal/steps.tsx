"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";

interface StepsProps {
  result: ConversionResult;
}

export function HexadecimalToOctalSteps({ result }: StepsProps) {
  const explicitNegative = result.input.trim().startsWith("-");
  const clean = result.input.replace(/\s/g, "").replace(/^-/, "");
  const [intHex = "", fracHex = ""] = clean.split(".");

  const toBin4 = (ch: string) => parseInt(ch, 16).toString(2).padStart(4, "0");

  const intPairs = intHex.split("").map((ch) => ({ ch: ch.toUpperCase(), bin: toBin4(ch) }));
  const fracPairs = fracHex.split("").map((ch) => ({ ch: ch.toUpperCase(), bin: toBin4(ch) }));

  // Build 3-bit regrouping for octal
  const magnitude = result.magnitude || "";
  const [octInt = "", octFrac = ""] = magnitude.split(".");

  // For display, reconstruct the grouped binary used for octal
  const intBin = intPairs.map((p) => p.bin).join("").replace(/^0+/, "") || "0";
  const fracBin = fracPairs.map((p) => p.bin).join("");
  const padLeft3 = (s: string) => (s.length % 3 === 0 ? s : s.padStart(s.length + (3 - (s.length % 3)), "0"));
  const padRight3 = (s: string) => (s.length % 3 === 0 ? s : s.padEnd(s.length + (3 - (s.length % 3)), "0"));
  const intGrouped = (padLeft3(intBin).match(/.{1,3}/g) as string[]) || [intBin];
  const fracGrouped = fracBin ? ((padRight3(fracBin).match(/.{1,3}/g) as string[]) || []) : [];

  const octIntDigits = (octInt || "0").split("");
  const octFracDigits = (octFrac || "").split("");

  return (
    <Section title="Conversión Hexadecimal → Octal (vía binario)">
      <div className="text-sm text-muted-foreground mb-2">1) Expandir Hex → Binario (4 bits por dígito):</div>
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
              <tr key={`ih-${i}`}>
                <td className="px-2 py-1 border text-center font-mono">{p.ch}</td>
                <td className="px-2 py-1 border text-center font-mono">{p.bin}</td>
              </tr>
            ))}
            {fracPairs.map((p, i) => (
              <tr key={`fh-${i}`}>
                <td className="px-2 py-1 border text-center font-mono">{p.ch}</td>
                <td className="px-2 py-1 border text-center font-mono">{p.bin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-muted-foreground my-3">2) Reagrupar en 3 bits → dígitos octales:</div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">Grupo binario</th>
              <th className="px-2 py-1 border">→ octal</th>
            </tr>
          </thead>
          <tbody>
            {intGrouped.map((g, i) => (
              <tr key={`ig-${i}`}>
                <td className="px-2 py-1 border text-center font-mono">{g}</td>
                <td className="px-2 py-1 border text-center font-mono">{octIntDigits[i] || parseInt(g, 2).toString(8)}</td>
              </tr>
            ))}
            {fracGrouped.map((g, i) => (
              <tr key={`fg-${i}`}>
                <td className="px-2 py-1 border text-center font-mono">{g}</td>
                <td className="px-2 py-1 border text-center font-mono">{octFracDigits[i] || parseInt(g, 2).toString(8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">Parte entera obtenida:</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1">{octInt || "0"}</code>
      </div>

      {octFrac && (
        <div className="mt-3 text-xs">
          <div className="text-muted-foreground">Parte fraccionaria obtenida:</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1">{octFrac}</code>
        </div>
      )}

      {octFrac && (
        <div className="mt-4 text-xs">
          <div className="text-muted-foreground">Unión de partes:</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1">{magnitude}</code>
        </div>
      )}

      {explicitNegative && (
        <div className="mt-2 text-xs">
          <div className="text-muted-foreground">Aplicar signo negativo:</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1">-{magnitude}</code>
        </div>
      )}
    </Section>
  );
}

