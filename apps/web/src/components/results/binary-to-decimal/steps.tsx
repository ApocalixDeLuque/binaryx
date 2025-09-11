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
  // Dynamic step numbering
  const hasFraction = rawFracPart.length > 0;
  const hasC2Block = viewMode === "signed" && !explicitNegative;
  const intStepNum = hasC2Block ? 2 : 1;
  const fracStepNum = intStepNum + 1;
  const unionStepNum = hasFraction ? intStepNum + 2 : intStepNum + 1;
  const applyNegStepNum = unionStepNum + 1;
  // Use final output to display precise fractional and union values
  const outClean = (result.output || "").replace(/[\s,]/g, "");
  const outUnsigned = outClean.startsWith("-") ? outClean.slice(1) : outClean;
  const [outIntStr = "", outFracStr = ""] = outUnsigned.split(".");

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
  // Formatter: if |value| < 1e-12, use scientific notation; otherwise show up to 10 decimals
  const formatContribution = (v: number): string => {
    if (v === 0) return "0";
    const abs = Math.abs(v);
    if (abs < 1e-12) return v.toExponential(3);
    const s = v.toFixed(10);
    return s;
  };

  const intSum = intRows.reduce((s, r) => s + r.contrib, 0);
  const fracSum = fracRows.reduce((s, r) => s + r.contrib, 0);
  const intSumExpr = intRows
    .map((r) => r.contrib)
    .filter((v) => v !== 0)
    .join(" + ");
  const fracSumExpr = fracRows
    .map((r) => r.contrib)
    .filter((v) => v !== 0)
    .map(formatContribution)
    .join(" + ");
  const union = intSum + fracSum;
  const intBitLen = intPart.length;
  const signedUnion = intPart.startsWith("1")
    ? union - Math.pow(2, intBitLen)
    : union;

  return (
    <Section title="Desglose Binario → Decimal">
      {viewMode === "signed" && !explicitNegative && (
        <div className="text-xs mb-3 space-y-1">
          <div className="text-sm text-muted-foreground mb-2">
            1) Proceso para magnitud (deshacer C2)
          </div>
          <div>
            1) Original (C2):
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap max-w-full break-words">
              {c2Original}
            </code>
          </div>
          <div>
            2) Invertir bits (C1):
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap max-w-full break-words">
              {c1Inverted}
            </code>
          </div>
          <div>
            3) Sumar 1:
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap max-w-full break-words">
              {plusOne}
            </code>
          </div>
          <div>
            4) Magnitud obtenida:
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap max-w-full break-words">
              {magnitudeBits}
            </code>
          </div>
        </div>
      )}
      <div className="text-sm text-muted-foreground mb-2">{`${intStepNum}) Parte entera (bit × 2^n):`}</div>
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
      {/* Explicit step: sum contributions (integer) */}
      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">
          Suma de contribuciones (parte entera):
        </div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
          {intSumExpr || "0"}
        </code>
      </div>
      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">Parte entera obtenida:</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
          {outIntStr || intSum}
        </code>
      </div>

      {fracRows.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">{`${fracStepNum}) Parte fraccionaria (bit × 2^-n):`}</div>
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
                    <td className="px-2 py-1 border text-center font-mono">{formatContribution(r.contrib)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Explicit step: sum contributions (fractional) */}
          <div className="mt-3 text-xs">
            <div className="text-muted-foreground">
              Suma de contribuciones (parte fraccionaria):
            </div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
              {fracSumExpr || "0"}
            </code>
          </div>
          <div className="mt-3 text-xs">
            <div className="text-muted-foreground">
              Parte fraccionaria obtenida:
            </div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
              {outFracStr ? `0.${outFracStr}` : fracSum}
            </code>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs">
        <div className="text-sm text-muted-foreground mb-2">{`${unionStepNum}) Unión de partes:`}</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
          {outUnsigned || union}
        </code>
      </div>
      {viewMode === "signed" && !explicitNegative && (
        <div className="mt-2 text-xs">
          <div className="text-sm text-muted-foreground mb-2">{`${applyNegStepNum}) Aplicar signo negativo:`}</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            -{outUnsigned || union}
          </code>
        </div>
      )}
      {explicitNegative && (
        <div className="mt-2 text-xs">
          <div className="text-sm text-muted-foreground mb-2">{`${applyNegStepNum}) Aplicar signo negativo:`}</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            -{outUnsigned || union}
          </code>
        </div>
      )}
    </Section>
  );
}
