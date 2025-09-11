"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";

interface StepsProps {
  result: ConversionResult;
}

export function HexadecimalToDecimalSteps({ result }: StepsProps) {
  const explicitNegative = result.input.trim().startsWith("-");

  const clean = result.input.replace(/\s/g, "").replace(/^-/, "");
  const [intRaw = "", fracRaw = ""
  ] = clean.split(".");

  // Build integer positional contributions (digit * 16^position)
  const intRows = intRaw
    .split("")
    .reverse()
    .map((ch, idx) => ({
      ch: ch.toUpperCase(),
      power: idx,
      contrib: parseInt(ch, 16) * Math.pow(16, idx),
    }))
    .reverse();

  // Build fractional positional contributions (digit * 16^-position)
  const fracRows = fracRaw.split("").map((ch, idx) => ({
    ch: ch.toUpperCase(),
    power: -(idx + 1),
    contrib: parseInt(ch, 16) * Math.pow(16, -(idx + 1)),
  }));

  const intSum = intRows.reduce((s, r) => s + r.contrib, 0);
  const fracSum = fracRows.reduce((s, r) => s + r.contrib, 0);
  const union = intSum + fracSum;

  return (
    <Section title="Desglose Hexadecimal → Decimal">
      <div className="text-sm text-muted-foreground mb-2">Parte entera: dígito × 16^n</div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">Hex</th>
              <th className="px-2 py-1 border">Potencia</th>
              <th className="px-2 py-1 border">Contribución</th>
            </tr>
          </thead>
          <tbody>
            {intRows.map((r, i) => (
              <tr key={i}>
                <td className="px-2 py-1 border text-center font-mono">{r.ch}</td>
                <td className="px-2 py-1 border text-center font-mono">16^{r.power}</td>
                <td className="px-2 py-1 border text-center font-mono">{r.contrib}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">Parte entera obtenida:</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1">{intSum}</code>
      </div>

      {fracRows.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">Parte fraccionaria: dígito × 16^-n</div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1 border">Hex</th>
                  <th className="px-2 py-1 border">Potencia</th>
                  <th className="px-2 py-1 border">Contribución</th>
                </tr>
              </thead>
              <tbody>
                {fracRows.map((r, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 border text-center font-mono">{r.ch}</td>
                    <td className="px-2 py-1 border text-center font-mono">16^{r.power}</td>
                    <td className="px-2 py-1 border text-center font-mono">{r.contrib.toFixed(12)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs">
            <div className="text-muted-foreground">Parte fraccionaria obtenida:</div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1">{fracSum}</code>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs">
        <div className="text-muted-foreground">Unión de partes:</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1">{union}</code>
      </div>
      {explicitNegative && (
        <div className="mt-2 text-xs">
          <div className="text-muted-foreground">Aplicar signo negativo:</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1">-{union}</code>
        </div>
      )}
    </Section>
  );
}

