"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";

interface StepsProps {
  result: ConversionResult;
}

export function BinaryToHexadecimalSteps({ result }: StepsProps) {
  const explicitNegative = result.input.trim().startsWith("-");

  const clean = result.input.replace(/\s/g, "").replace(/^-/, "");
  const [intRaw = "", fracRaw = ""] = clean.split(".");

  const padLeft = (s: string) =>
    s.length % 4 === 0 ? s : s.padStart(s.length + (4 - (s.length % 4)), "0");
  const padRight = (s: string) =>
    s.length % 4 === 0 ? s : s.padEnd(s.length + (4 - (s.length % 4)), "0");

  const intPadded = padLeft(intRaw || "0");
  const fracPadded = fracRaw ? padRight(fracRaw) : "";

  const intGroups: string[] = [];
  for (let i = 0; i < intPadded.length; i += 4)
    intGroups.push(intPadded.slice(i, i + 4));
  const fracGroups: string[] = [];
  for (let i = 0; i < fracPadded.length; i += 4)
    fracGroups.push(fracPadded.slice(i, i + 4));

  const toHex = (g: string) => parseInt(g, 2).toString(16).toUpperCase();
  const intDigits = intGroups.map(toHex);
  const fracDigits = fracGroups.map(toHex);

  const integerDigitsFromTable = intDigits.join("").replace(/^0+/, "") || "0";
  const fractionalDigitsFromTable = fracDigits.join("");
  const combinedFromTables = fractionalDigitsFromTable
    ? `${integerDigitsFromTable}.${fractionalDigitsFromTable}`
    : integerDigitsFromTable;
  const showFrac = fracGroups.length > 0;
  const showUnion = Boolean(fractionalDigitsFromTable);
  const applyNegStepNum = 1 + (showFrac ? 1 : 0) + (showUnion ? 1 : 0) + 1;

  return (
    <Section title="Conversión Binario → Hexadecimal">
      <div className="text-sm text-muted-foreground mb-2">
        1) Parte entera (agrupar en 4 bits):
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">Grupo binario</th>
              <th className="px-2 py-1 border">→ hexadecimal</th>
            </tr>
          </thead>
          <tbody>
            {intGroups.map((g, i) => (
              <tr key={i}>
                <td className="px-2 py-1 border text-center font-mono">{g}</td>
                <td className="px-2 py-1 border text-center font-mono">
                  {toHex(g)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">Parte entera obtenida:</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
          {integerDigitsFromTable}
        </code>
      </div>

      {fracGroups.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">
            2) Parte fraccionaria (agrupar en 4 bits):
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1 border">Grupo binario</th>
                  <th className="px-2 py-1 border">→ hexadecimal</th>
                </tr>
              </thead>
              <tbody>
                {fracGroups.map((g, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 border text-center font-mono">
                      {g}
                    </td>
                    <td className="px-2 py-1 border text-center font-mono">
                      {toHex(g)}
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
              {fractionalDigitsFromTable || "0"}
            </code>
          </div>
        </div>
      )}

      {fractionalDigitsFromTable && (
        <div className="mt-4 text-xs">
          <div className="text-sm text-muted-foreground mb-2">
            3) Unión de partes:
          </div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            {combinedFromTables}
          </code>
        </div>
      )}

      {explicitNegative && (
        <div className="mt-2 text-xs">
          <div className="text-sm text-muted-foreground mb-2">{`${applyNegStepNum}) Aplicar signo negativo:`}</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            -{combinedFromTables}
          </code>
        </div>
      )}
    </Section>
  );
}
