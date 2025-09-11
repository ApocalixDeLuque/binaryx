"use client";

import React from "react";
import type { ConversionResult } from "@/lib/base-conversions";
import { Section } from "@/components/results/base/section";
import BigNumber from "bignumber.js";

interface StepsProps {
  result: ConversionResult;
  viewMode: "unsigned" | "signed";
}

export function DecimalToHexadecimalSteps({ result, viewMode }: StepsProps) {
  const intSteps = result.integerSteps || [];
  const fracSteps = result.fractionalSteps || [];
  const explicitNegative = result.input.trim().startsWith("-");

  const initialIntegerValue = intSteps.length
    ? typeof intSteps[0].quotient === "object"
      ? (intSteps[0].quotient as any as BigNumber).toString()
      : String(intSteps[0].quotient)
    : "0";

  const integerDigitsFromTable = intSteps.length
    ? intSteps
        .map((s) => s.remainder)
        .slice()
        .reverse()
        .map((n) => n.toString(16).toUpperCase())
        .join("")
    : "0";

  const hexDigit = (n: number) => n.toString(16).toUpperCase();

  // Use the rounded magnitude's fractional part so recap matches final output
  const magnitude = result.magnitude || "";
  const [, magFrac = ""] = magnitude.split(".");
  const fractionalDigitsFromTable = magFrac;

  const combinedFromTables = fractionalDigitsFromTable
    ? `${integerDigitsFromTable}.${fractionalDigitsFromTable}`
    : integerDigitsFromTable;

  const initialFractionalValue = fracSteps.length
    ? Number(fracSteps[0].value).toFixed(4)
    : undefined;

  // Build display rows based on the rounded magnitude fractional length
  const displayDigits = magFrac.split("");
  const allFracRows = fracSteps.filter((_, idx) => idx > 0);
  const maxRows = Math.min(displayDigits.length, allFracRows.length);
  const rows = allFracRows.slice(0, maxRows);
  const showFrac = fracSteps.length > 0;
  const showUnion = Boolean(fractionalDigitsFromTable);
  const applyNegStepNum = 1 + (showFrac ? 1 : 0) + (showUnion ? 1 : 0) + 1;

  return (
    <Section title="Conversión Decimal → Hexadecimal">
      <div className="text-sm text-muted-foreground mb-2">
        1) Parte entera (÷16):
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1 border">
                Valor ({initialIntegerValue})
              </th>
              <th className="px-2 py-1 border">÷16</th>
            </tr>
          </thead>
          <tbody>
            {intSteps.map((step, index) => {
              const nextQuotient =
                index < intSteps.length - 1 ? intSteps[index + 1].quotient : 0;
              const nextValue =
                typeof nextQuotient === "object"
                  ? (nextQuotient as any as BigNumber).toString()
                  : String(nextQuotient);
              return (
                <tr key={index}>
                  <td className="px-2 py-1 border text-center font-mono">
                    {nextValue}
                  </td>
                  <td className="px-2 py-1 border text-center font-mono">
                    {hexDigit(step.remainder)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recap: integer digits from table */}
      <div className="mt-3 text-xs">
        <div className="text-muted-foreground">Parte entera obtenida:</div>
        <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
          {integerDigitsFromTable}
        </code>
      </div>

      {fracSteps.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">
            2) Parte fraccionaria (×16):
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1 border">×16</th>
                  <th className="px-2 py-1 border">
                    Valor ({initialFractionalValue})
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1 border text-center font-mono">
                      {(displayDigits[idx] || hexDigit(s.bit)).toUpperCase()}
                    </td>
                    <td className="px-2 py-1 border text-center font-mono">
                      {Number(s.value).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recap: fractional digits from table */}
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

      {/* Recap: union of integer and fractional parts */}
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

      {explicitNegative && viewMode === "unsigned" && (
        <div className="mt-2 text-xs">
          <div className="text-sm text-muted-foreground mb-2">{`${applyNegStepNum}) Aplicar signo negativo:`}</div>
          <code className="font-mono border rounded px-2 py-1 inline-block mt-1 whitespace-pre-wrap w-full break-words">
            -
            {fractionalDigitsFromTable
              ? combinedFromTables
              : integerDigitsFromTable}
          </code>
        </div>
      )}

      {/* Two's complement process for signed view (integer only) */}
      {viewMode === "signed" &&
        !magnitude.includes(".") &&
        result.twosComplementHex && (
          <div className="mt-6 space-y-2 text-xs">
            <div className="text-sm font-medium">
              Proceso para complemento a dos (C2)
            </div>
            {(() => {
              // Magnitude in hex (uppercase)
              const magHex = (result.magnitude || "").toUpperCase();
              const widthDigits = (result.twosComplementHex || "").length;
              const paddedMag = magHex.padStart(widthDigits, "0");
              // Ones' complement (C1) by nibble inversion
              const inv = paddedMag
                .split("")
                .map((ch) => {
                  const v = parseInt(ch, 16);
                  const c = (15 - v).toString(16).toUpperCase();
                  return c;
                })
                .join("");
              // Add 1 to C1
              const addOne = (hexStr: string): string => {
                const arr = hexStr.split("");
                let carry = 1;
                for (let i = arr.length - 1; i >= 0 && carry; i--) {
                  const val = parseInt(arr[i], 16) + carry;
                  arr[i] = (val & 0xf).toString(16).toUpperCase();
                  carry = val >> 4;
                }
                return arr.join("");
              };
              const c2 = addOne(inv);
              return (
                <>
                  <div>
                    1) Magnitud sin signo (hex):
                    <code className="ml-2 font-mono border rounded px-2 py-1 inline-block">
                      {magHex}
                    </code>
                  </div>
                  <div>
                    2) Seleccionar ancho y rellenar (ancho = {widthDigits * 4}{" "}
                    bits):
                    <code className="ml-2 font-mono border rounded px-2 py-1 inline-block">
                      {paddedMag}
                    </code>
                  </div>
                  <div>3) Invertir nibbles (C1):</div>
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      Tabla de inversión (15 − dígito):
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border text-xs">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-2 py-1 border">Dígito</th>
                            <th className="px-2 py-1 border">Decimal</th>
                            <th className="px-2 py-1 border">15 − Decimal</th>
                            <th className="px-2 py-1 border">Hex</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paddedMag.split("").map((d, i) => {
                            const dec = parseInt(d, 16);
                            const invDec = 15 - dec;
                            const invHex = invDec.toString(16).toUpperCase();
                            return (
                              <tr key={i}>
                                <td className="px-2 py-1 border text-center font-mono">
                                  {d}
                                </td>
                                <td className="px-2 py-1 border text-center">
                                  {dec}
                                </td>
                                <td className="px-2 py-1 border text-center">
                                  15 − {dec} = {invDec}
                                </td>
                                <td className="px-2 py-1 border text-center font-mono">
                                  {invHex}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    Resultado de la inversión:
                    <code className="ml-2 font-mono border rounded px-2 py-1 inline-block">
                      {inv}
                    </code>
                  </div>
                  <div>
                    4) Sumar 1 → C2:
                    <code className="ml-2 font-mono border rounded px-2 py-1 inline-block">
                      {c2}
                    </code>
                  </div>
                </>
              );
            })()}
          </div>
        )}

      {viewMode === "signed" &&
        !magnitude.includes(".") &&
        result.twosComplementHex && (
          <div className="mt-6 text-xs space-y-2">
            <div className="text-sm font-medium">
              Representación por endianness (bytes)
            </div>
            {(() => {
              const hex = result.twosComplementHex || "";
              const bytes: string[] = hex.match(/.{1,2}/g) || [];
              let start = 0;
              while (start < bytes.length - 1 && bytes[start] === "00") start++;
              const trimmed = bytes.slice(start);
              const big = trimmed;
              const little = [...trimmed].reverse();
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground mb-1">Big endian</div>
                    <table className="w-full border text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-2 py-1 border">Address</th>
                          <th className="px-2 py-1 border">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {big.map((b, idx) => (
                          <tr key={idx}>
                            <td className="px-2 py-1 border text-center">
                              {idx}
                            </td>
                            <td className="px-2 py-1 border text-center font-mono">
                              {b}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">
                      Little endian
                    </div>
                    <table className="w-full border text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-2 py-1 border">Address</th>
                          <th className="px-2 py-1 border">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {little.map((b, idx) => (
                          <tr key={idx}>
                            <td className="px-2 py-1 border text-center">
                              {idx}
                            </td>
                            <td className="px-2 py-1 border text-center font-mono">
                              {b}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
    </Section>
  );
}
