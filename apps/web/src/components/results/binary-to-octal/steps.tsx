"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";

interface StepsProps {
  result: ConversionResult;
}

export function BinaryToOctalSteps({ result }: StepsProps) {
  const explicitNegative = result.input.trim().startsWith("-");

  const clean = result.input.replace(/\s/g, "").replace(/^-/, "");
  const [intRaw = "", fracRaw = ""] = clean.split(".");

  const padLeft = (s: string) => (s.length % 3 === 0 ? s : s.padStart(s.length + (3 - (s.length % 3)), "0"));
  const padRight = (s: string) => (s.length % 3 === 0 ? s : s.padEnd(s.length + (3 - (s.length % 3)), "0"));

  const intPadded = padLeft(intRaw || "0");
  const fracPadded = fracRaw ? padRight(fracRaw) : "";

  const intGroups: string[] = [];
  for (let i = 0; i < intPadded.length; i += 3) intGroups.push(intPadded.slice(i, i + 3));
  const fracGroups: string[] = [];
  for (let i = 0; i < fracPadded.length; i += 3) fracGroups.push(fracPadded.slice(i, i + 3));

  const intDigits = intGroups.map((g) => parseInt(g, 2).toString(8));
  const fracDigits = fracGroups.map((g) => parseInt(g, 2).toString(8));

  const integerDigitsFromTable = (intDigits.join("").replace(/^0+/, "") || "0");
  const fractionalDigitsFromTable = fracDigits.join("");
  const combinedFromTables = fractionalDigitsFromTable
    ? `${integerDigitsFromTable}.${fractionalDigitsFromTable}`
    : integerDigitsFromTable;

  return (
    <Section title="Conversión Binario → Octal">
      <div className="text-sm text-muted-foreground mb-2">Parte entera (agrupar en 3 bits):</div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">Grupo binario</th>
              <th className="px-2 py-1 border">→ octal</th>
            </tr>
          </thead>
          <tbody>
            {intGroups.map((g, i) => (
              <tr key={i}>
                <td className="px-2 py-1 border text-center font-mono">{g}</td>
                <td className="px-2 py-1 border text-center font-mono">
                  {parseInt(g, 2).toString(8)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">Parte entera obtenida:</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
          {integerDigitsFromTable}
        </code>
      </div>

      {fracGroups.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">Parte fraccionaria (agrupar en 3 bits):</div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1 border">Grupo binario</th>
                  <th className="px-2 py-1 border">→ octal</th>
                </tr>
              </thead>
              <tbody>
                {fracGroups.map((g, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 border text-center font-mono">{g}</td>
                    <td className="px-2 py-1 border text-center font-mono">
                      {parseInt(g, 2).toString(8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs">
            <div className="text-muted-foreground">Parte fraccionaria obtenida:</div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
              {fractionalDigitsFromTable || "0"}
            </code>
          </div>
        </div>
      )}

      {fractionalDigitsFromTable && (
        <div className="mt-4 text-xs">
          <div className="text-muted-foreground">Unión de partes:</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
            {combinedFromTables}
          </code>
        </div>
      )}

      {explicitNegative && (
        <div className="mt-2 text-xs">
          <div className="text-muted-foreground">Aplicar signo negativo:</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
            -{combinedFromTables}
          </code>
        </div>
      )}
    </Section>
  );
}

