"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";

interface StepsProps {
  result: ConversionResult;
  viewMode: "unsigned" | "signed";
}

export function BinaryToDecimalSteps({ result, viewMode }: StepsProps) {
  const clean =
    result.magnitude || result.input.replace(/\s/g, "").replace(/^-/, "");
  const [rawIntPart = "", rawFracPart = ""] = clean.split(".");
  const explicitNegative = result.input.trim().startsWith("-");

  // For signed view (without explicit '-'), undo two's complement to obtain magnitude bits
  let intPart = rawIntPart;
  let fracPart = rawFracPart;
  let c2Original = clean;
  let c1Inverted = "";
  let plusOne = "";
  let magnitudeBits = clean;

  if (viewMode === "signed" && !explicitNegative) {
    const totalWord = rawIntPart + rawFracPart; // no dot
    const inverted = totalWord
      .split("")
      .map((b) => (b === "0" ? "1" : "0"))
      .join("");
    let arr = inverted.split("");
    let carry = 1;
    for (let k = arr.length - 1; k >= 0 && carry; k--) {
      if (arr[k] === "0") {
        arr[k] = "1";
        carry = 0;
      } else {
        arr[k] = "0";
      }
    }
    const added = arr.join("");
    const magInt = added.slice(0, rawIntPart.length);
    const magFrac = added.slice(
      rawIntPart.length,
      rawIntPart.length + rawFracPart.length
    );

    intPart = magInt;
    fracPart = rawFracPart ? magFrac : "";
    c1Inverted =
      inverted.slice(0, rawIntPart.length) +
      (rawFracPart ? "." : "") +
      inverted.slice(rawIntPart.length);
    plusOne =
      added.slice(0, rawIntPart.length) +
      (rawFracPart ? "." : "") +
      added.slice(rawIntPart.length);
    magnitudeBits = magInt + (rawFracPart ? "." + magFrac : "");
  }

  // Build integer positional contributions (bit * 2^position)
  const intRows = intPart
    .split("")
    .reverse()
    .map((bit, idx) => ({
      bit,
      power: idx,
      contrib: Number(bit) * Math.pow(2, idx),
    }))
    .reverse();

  // Build fractional positional contributions (bit * 2^-position)
  const fracRows = fracPart.split("").map((bit, idx) => ({
    bit,
    power: -(idx + 1),
    contrib: Number(bit) * Math.pow(2, -(idx + 1)),
  }));

  const intSum = intRows.reduce((s, r) => s + r.contrib, 0);
  const fracSum = fracRows.reduce((s, r) => s + r.contrib, 0);
  const union = intSum + fracSum;
  const intBitLen = intPart.length;
  const signedUnion = intPart.startsWith("1")
    ? union - Math.pow(2, intBitLen)
    : union;

  return (
    <Section title="Desglose Binario → Decimal">
      {viewMode === "signed" && !explicitNegative && (
        <div className="text-xs mb-3 space-y-1">
          <div className="text-sm font-medium">
            Proceso para magnitud (deshacer C2)
          </div>
          <div>
            1) Original (C2):
            <code className="ml-2 font-mono border rounded px-2 py-1 inline-block">
              {c2Original}
            </code>
          </div>
          <div>
            2) Invertir bits (C1):
            <code className="ml-2 font-mono border rounded px-2 py-1 inline-block">
              {c1Inverted}
            </code>
          </div>
          <div>
            3) Sumar 1:
            <code className="ml-2 font-mono border rounded px-2 py-1 inline-block">
              {plusOne}
            </code>
          </div>
          <div>
            4) Magnitud obtenida:
            <code className="ml-2 font-mono border rounded px-2 py-1 inline-block">
              {magnitudeBits}
            </code>
          </div>
        </div>
      )}
      <div className="text-sm text-muted-foreground mb-2">
        Parte entera: bit × 2^n
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">Bit</th>
              <th className="px-2 py-1 border">Potencia</th>
              <th className="px-2 py-1 border">Contribución</th>
            </tr>
          </thead>
          <tbody>
            {intRows.map((r, i) => (
              <tr key={i}>
                <td className="px-2 py-1 border text-center font-mono">
                  {r.bit}
                </td>
                <td className="px-2 py-1 border text-center font-mono">
                  2^{r.power}
                </td>
                <td className="px-2 py-1 border text-center font-mono">
                  {r.contrib}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">Parte entera obtenida:</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
          {intSum}
        </code>
      </div>

      {fracRows.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">
            Parte fraccionaria: bit × 2^-n
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1 border">Bit</th>
                  <th className="px-2 py-1 border">Potencia</th>
                  <th className="px-2 py-1 border">Contribución</th>
                </tr>
              </thead>
              <tbody>
                {fracRows.map((r, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 border text-center font-mono">
                      {r.bit}
                    </td>
                    <td className="px-2 py-1 border text-center font-mono">
                      2^{r.power}
                    </td>
                    <td className="px-2 py-1 border text-center font-mono">
                      {r.contrib.toFixed(10)}
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
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
              {fracSum}
            </code>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs">
        <div className="text-muted-foreground">Unión de partes:</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
          {union}
        </code>
      </div>
      {viewMode === "signed" && !explicitNegative && (
        <div className="mt-2 text-xs">
          <div className="text-muted-foreground">Aplicar signo negativo:</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
            -{union}
          </code>
        </div>
      )}
      {explicitNegative && (
        <div className="mt-2 text-xs">
          <div className="text-muted-foreground">Aplicar signo negativo:</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
            -{union}
          </code>
        </div>
      )}
    </Section>
  );
}
