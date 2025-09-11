"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";
import BigNumber from "bignumber.js";

interface StepsProps {
  result: ConversionResult;
  viewMode: "unsigned" | "signed";
}

export function DecimalToBinarySteps({ result, viewMode }: StepsProps) {
  const intSteps = result.integerSteps || [];
  const fracSteps = result.fractionalSteps || [];
  const isNegative = result.input.trim().startsWith("-");

  // Helpers for two's complement steps with fractional support
  const magnitude = result.magnitude || "";
  const [magInt, magFrac = ""] = magnitude.split(".");
  const paddedInt = isNegative
    ? magInt.padStart(magInt.length + 1, "0")
    : magInt;
  const paddedMagnitude =
    isNegative && magFrac ? `${paddedInt}.${magFrac}` : paddedInt;

  const invertBits = (bits: string) =>
    bits
      .split("")
      .map((b) => (b === "0" ? "1" : "0"))
      .join("");
  const invertedInt = invertBits(paddedInt);
  const invertedFrac = invertBits((magFrac || "").padEnd(8, "0").slice(0, 8));
  const inverted = magFrac ? `${invertedInt}.${invertedFrac}` : invertedInt;

  const addOneBinary = (bin: string): string => {
    // Add 1 to the least significant bit of the entire fixed-point word
    // If there is a fractional part, the LSB is the last fractional bit
    if (bin.includes(".")) {
      const [i, f] = bin.split(".");
      const intLen = i.length;
      const fracLen = f.length;
      const joined = (i + f).split("");
      let carry = 1;
      for (let k = joined.length - 1; k >= 0 && carry; k--) {
        if (joined[k] === "0") {
          joined[k] = "1";
          carry = 0;
        } else {
          joined[k] = "0";
        }
      }
      const newInt = joined.slice(0, intLen).join("");
      const newFrac = joined.slice(intLen, intLen + fracLen).join("");
      return `${newInt}.${newFrac}`;
    }
    let carry = 1;
    const arr = bin.split("");
    for (let k = arr.length - 1; k >= 0 && carry; k--) {
      if (arr[k] === "0") {
        arr[k] = "1";
        carry = 0;
      } else {
        arr[k] = "0";
      }
    }
    return arr.join("");
  };

  const c2 = addOneBinary(inverted);

  // Grouping: integer 4s from right-to-left; fractional 4s from left-to-right
  const groupBinary4 = (bin: string) => {
    const groupInt = (s: string) => {
      const groups: string[] = [];
      let r = s;
      while (r.length > 4) {
        groups.unshift(r.slice(-4));
        r = r.slice(0, -4);
      }
      if (r.length) groups.unshift(r);
      return groups.join(" ");
    };
    const groupFrac = (s: string) => {
      const groups: string[] = [];
      for (let i = 0; i < s.length; i += 4) groups.push(s.slice(i, i + 4));
      return groups.join(" ");
    };
    if (!bin.includes(".")) return groupInt(bin);
    const [i, f] = bin.split(".");
    return `${groupInt(i)}.${groupFrac(f)}`;
  };

  // Derived recap values from tables
  const integerBitsFromTable = intSteps.length
    ? intSteps
        .map((s) => s.remainder)
        .slice()
        .reverse()
        .join("")
    : "0";
  const fractionalBitsFromTable = fracSteps.length
    ? fracSteps
        .filter((_, idx) => idx > 0)
        .map((s) => String(s.bit))
        .join("")
    : "";
  const combinedFromTables = fractionalBitsFromTable
    ? `${integerBitsFromTable}.${fractionalBitsFromTable}`
    : integerBitsFromTable;

  // Initial values for headers
  const initialIntegerValue = intSteps.length
    ? typeof intSteps[0].quotient === "object"
      ? (intSteps[0].quotient as any as BigNumber).toString()
      : String(intSteps[0].quotient)
    : "0";
  const initialFractionalValue = fracSteps.length
    ? Number(fracSteps[0].value).toFixed(4)
    : undefined;

  return (
    <Section title="Conversión Decimal → Binario">
      <div className="text-sm text-muted-foreground mb-2">
        1) Parte entera (÷2):
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">
                Valor ({initialIntegerValue})
              </th>
              <th className="px-2 py-1 border">÷2</th>
            </tr>
          </thead>
          <tbody>
            {intSteps.map((step, index) => {
              const nextQuotient =
                index < intSteps.length - 1 ? intSteps[index + 1].quotient : 0;
              const displayValue =
                typeof nextQuotient === "object"
                  ? (nextQuotient as any as BigNumber).toString()
                  : String(nextQuotient);
              return (
                <tr key={index}>
                  <td className="px-2 py-1 border text-center font-mono">
                    {displayValue}
                  </td>
                  <td className="px-2 py-1 border text-center font-mono">
                    {step.remainder}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recap: integer bits from table */}
      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">Parte entera obtenida:</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
          {integerBitsFromTable}
        </code>
      </div>

      {fracSteps.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">
            2) Parte fraccionaria (×2):
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1 border">×2</th>
                  <th className="px-2 py-1 border">
                    Valor ({initialFractionalValue})
                  </th>
                </tr>
              </thead>
              <tbody>
                {fracSteps
                  .filter((_, idx) => idx > 0)
                  .slice(0, 8)
                  .map((s, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1 border text-center font-mono">
                        {s.bit}
                      </td>
                      <td className="px-2 py-1 border text-center font-mono">
                        {Number(s.value).toFixed(4)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Recap: fractional bits from table */}
          <div className="mt-3 text-xs">
            <div className="text-muted-foreground">
              Parte fraccionaria obtenida:
            </div>
            <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
              {fractionalBitsFromTable || "0"}
            </code>
          </div>
        </div>
      )}

      {/* Recap: union of integer and fractional parts (only when fraction exists) */}
      {fractionalBitsFromTable && (
        <div className="mt-4 text-xs">
          <div className="text-sm text-muted-foreground mb-2">
            3) Unión de partes:
          </div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            {combinedFromTables}
          </code>
        </div>
      )}

      {/* If negative and unsigned view, show applying the negative sign */}
      {isNegative && viewMode === "unsigned" && (
        <div className="mt-2 text-xs">
          {(() => {
            const showFrac = fractionalBitsFromTable.length > 0;
            const showUnion = Boolean(fractionalBitsFromTable);
            const applyNegStepNum = 1 + (showFrac ? 1 : 0) + (showUnion ? 1 : 0) + 1;
            return (
              <div className="text-sm text-muted-foreground mb-2">{`${applyNegStepNum}) Aplicar signo negativo:`}</div>
            );
          })()}
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            -
            {fractionalBitsFromTable
              ? combinedFromTables
              : integerBitsFromTable}
          </code>
        </div>
      )}

      {isNegative && viewMode === "signed" && (
        <div className="mt-6 space-y-2 text-xs">
          <div className="text-sm font-medium">
            Proceso para complemento a dos (C2)
          </div>
          <div>
            1) Magnitud sin signo:
            <code className="ml-2 font-mono border rounded px-2 py-1 inline-block">
              {groupBinary4(magnitude)}
            </code>
          </div>
          <div>
            2) Añadir un bit de padding:
            <code className="ml-2 font-mono border rounded px-2 py-1 inline-block">
              {groupBinary4(paddedMagnitude)}
            </code>
          </div>
          <div>
            3) Invertir bits (C1):
            <code className="ml-2 font-mono border rounded px-2 py-1 inline-block">
              {groupBinary4(inverted)}
            </code>
          </div>
          <div>
            4) Sumar 1 → C2:
            <code className="ml-2 font-mono border rounded px-2 py-1 inline-block">
              {groupBinary4(c2)}
            </code>
          </div>
        </div>
      )}
    </Section>
  );
}
