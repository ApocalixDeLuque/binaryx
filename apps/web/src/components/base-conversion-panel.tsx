"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import type { ConversionResult, BaseType } from "@/lib/base-conversions";
import {
  getBaseName,
  getBaseNumber,
  formatDisplayValue,
} from "@/lib/base-conversions";

interface BaseConversionPanelProps {
  result: ConversionResult;
  error?: string;
  showFlags?: boolean;
  showSignedTwosComplement?: boolean;
}

export function BaseConversionPanel({
  result,
  error,
  showFlags = true,
  showSignedTwosComplement = true,
}: BaseConversionPanelProps) {
  if (error) {
    return (
      <Card className="w-full p-0">
        <CardContent className="p-0">
          <div className="text-center p-12 text-destructive">
            <p className="text-lg font-medium">Error en la conversión</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatBinaryDisplay = (bin: string) => {
    if (!bin.includes(".")) {
      return bin.match(/.{1,4}/g)?.join(" ") || bin;
    } else {
      const [integerPart, fractionalPart] = bin.split(".");
      return `${integerPart.match(/.{1,4}/g)?.join(" ") || integerPart}·${
        fractionalPart.match(/.{1,4}/g)?.join(" ") || fractionalPart
      }`;
    }
  };

  const isNegative = result.isNegative || false;
  const intSteps = result.integerSteps || [];
  const fracSteps = result.fractionalSteps || [];
  const initialInt = intSteps.length > 1 ? intSteps[1].quotient : 0;
  const initialFrac = fracSteps.length > 0 ? fracSteps[0].value : 0;
  const intRemainders = intSteps.slice(1).map((s) => s.remainder);
  const intBinaryMagnitude = intRemainders.length
    ? intRemainders.slice().reverse().join("")
    : "0";
  const fracBitsSeq = fracSteps
    .slice(1)
    .map((s) => String(s.bit))
    .join("");
  const combinedMagnitude =
    intBinaryMagnitude + (fracBitsSeq ? "." + fracBitsSeq : "");

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ChevronDown className="h-5 w-5" />
          Conversión: {getBaseName(result.inputBase)} →{" "}
          {getBaseName(result.outputBase)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Result */}
        <div className="p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Entrada</div>
                <div className="font-mono text-lg">{result.input}</div>
                <div className="text-xs text-muted-foreground">
                  Base {getBaseName(result.inputBase)}
                </div>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div>
                <div className="text-sm text-muted-foreground">Resultado</div>
                <div className="font-mono text-lg">
                  {(() => {
                    if (
                      result.inputBase === "binary" &&
                      result.outputBase === "decimal"
                    ) {
                      const hasManualNegative = result.input
                        .trim()
                        .startsWith("-");
                      const cleanBinary = result.input
                        .replace(/\s/g, "")
                        .replace(/^-/, "");
                      const unsignedValue = parseInt(cleanBinary, 2);
                      return hasManualNegative ? -unsignedValue : unsignedValue;
                    }
                    if (
                      result.inputBase === "binary" &&
                      result.outputBase === "hexadecimal"
                    ) {
                      // Handle binary to hex conversion properly
                      let cleanBinary = result.input.replace(/\s/g, "");
                      const hasNegativeSign = cleanBinary.startsWith("-");
                      if (hasNegativeSign) {
                        cleanBinary = cleanBinary.substring(1);
                      }

                      while (cleanBinary.length % 4 !== 0) {
                        cleanBinary = "0" + cleanBinary;
                      }

                      const groups = [];
                      for (let i = 0; i < cleanBinary.length; i += 4) {
                        groups.push(cleanBinary.slice(i, i + 4));
                      }

                      const hexChars = groups.map((group) => {
                        const decimal = parseInt(group, 2);
                        return "0123456789ABCDEF"[decimal];
                      });

                      // Group hex chars in pairs (2 chars per group)
                      const hexGroups = [];
                      for (let i = 0; i < hexChars.length; i += 2) {
                        hexGroups.push(hexChars.slice(i, i + 2).join(""));
                      }

                      const hexResult = hexGroups.join(" ");
                      return hasNegativeSign ? "-" + hexResult : hexResult;
                    }
                    return result.output;
                  })()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Base {getBaseName(result.outputBase)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step by Step Breakdown */}
        <div className="space-y-4">
          {/* Step 1: Input Analysis */}
          <div className="border rounded-lg">
            <div className="px-4 py-3 border-b bg-muted/50">
              <h3 className="text-sm font-medium">1. Análisis de entrada</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="border rounded p-2">
                    <div className="text-muted-foreground">
                      Valor {getBaseName(result.inputBase).toLowerCase()}
                    </div>
                    <div className="font-mono">{result.input}</div>
                  </div>
                  <div className="border rounded p-2">
                    <div className="text-muted-foreground">Base origen</div>
                    <div className="font-mono">
                      {getBaseName(result.inputBase)} (Base{" "}
                      {getBaseNumber(result.inputBase)})
                    </div>
                  </div>
                  <div className="border rounded p-2">
                    <div className="text-muted-foreground">Signo</div>
                    <div className="font-mono">
                      {isNegative ? "Negativo" : "Positivo"}
                    </div>
                  </div>
                  <div className="border rounded p-2">
                    <div className="text-muted-foreground">Base destino</div>
                    <div className="font-mono">
                      {getBaseName(result.outputBase)} (Base{" "}
                      {getBaseNumber(result.outputBase)})
                    </div>
                  </div>
                </div>

                {/* Separate cards for unsigned and signed values for binary to decimal */}
                {result.inputBase === "binary" &&
                  result.outputBase === "decimal" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border rounded p-2">
                        <div className="text-muted-foreground">
                          Valor decimal (sin signo)
                        </div>
                        <div className="font-mono">
                          {(() => {
                            const hasManualNegative = result.input
                              .trim()
                              .startsWith("-");
                            const cleanBinary = result.input
                              .replace(/\s/g, "")
                              .replace(/^-/, "");
                            const unsignedValue = parseInt(cleanBinary, 2);
                            return hasManualNegative
                              ? -unsignedValue
                              : unsignedValue;
                          })()}
                        </div>
                      </div>
                      <div className="border rounded p-2">
                        <div className="text-muted-foreground">
                          Valor decimal (con signo)
                        </div>
                        <div className="font-mono">
                          {(() => {
                            const hasManualNegative = result.input
                              .trim()
                              .startsWith("-");
                            const cleanBinary = result.input
                              .replace(/\s/g, "")
                              .replace(/^-/, "");
                            const unsignedValue = parseInt(cleanBinary, 2);
                            const bitLength = cleanBinary.length;
                            const signedValue =
                              unsignedValue >= Math.pow(2, bitLength - 1)
                                ? unsignedValue - Math.pow(2, bitLength)
                                : unsignedValue;
                            return hasManualNegative
                              ? -unsignedValue
                              : signedValue;
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                {/* For non-binary-to-decimal conversions */}
                {!(
                  result.inputBase === "binary" &&
                  result.outputBase === "decimal"
                ) && (
                  <div className="border rounded p-2">
                    <div className="text-muted-foreground">
                      Valor {getBaseName(result.outputBase).toLowerCase()}
                    </div>
                    {/* Direct decimal result - separate container */}
                    <div className="border rounded p-3 mb-3">
                      <div className="text-sm font-medium mb-2">
                        Resultado decimal directo
                      </div>
                      <div className="font-mono text-lg">
                        {(() => {
                          if (
                            result.inputBase === "binary" &&
                            result.outputBase === "hexadecimal"
                          ) {
                            // Handle binary to hex conversion properly
                            let cleanBinary = result.input.replace(/\s/g, "");
                            const hasNegativeSign = cleanBinary.startsWith("-");
                            if (hasNegativeSign) {
                              cleanBinary = cleanBinary.substring(1);
                            }

                            while (cleanBinary.length % 4 !== 0) {
                              cleanBinary = "0" + cleanBinary;
                            }

                            const groups = [];
                            for (let i = 0; i < cleanBinary.length; i += 4) {
                              groups.push(cleanBinary.slice(i, i + 4));
                            }

                            const hexChars = groups.map((group) => {
                              const decimal = parseInt(group, 2);
                              return "0123456789ABCDEF"[decimal];
                            });

                            // Group hex chars in pairs (2 chars per group)
                            const hexGroups = [];
                            for (let i = 0; i < hexChars.length; i += 2) {
                              hexGroups.push(hexChars.slice(i, i + 2).join(""));
                            }

                            const hexResult = hexGroups.join(" ");
                            return hasNegativeSign
                              ? "-" + hexResult
                              : hexResult;
                          }
                          return result.output;
                        })()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Conversión directa sin interpretación de signo
                      </div>
                    </div>

                    {/* Signed 2's complement for hex to decimal - separate container */}
                    {result.inputBase === "hexadecimal" &&
                      result.outputBase === "decimal" &&
                      !result.input.startsWith("-") && (
                        <div className="border rounded p-3">
                          <div className="text-sm font-medium mb-2">
                            Interpretación complemento a dos (signed)
                          </div>
                          <div className="font-mono text-lg">
                            {(() => {
                              const hasExplicitNegative =
                                result.input.startsWith("-");
                              const cleanHex = hasExplicitNegative
                                ? result.input.slice(1).replace(/\s/g, "")
                                : result.input.replace(/\s/g, "");

                              // Convert hex to binary
                              let binary = "";
                              for (let i = 0; i < cleanHex.length; i++) {
                                const decimal = parseInt(cleanHex[i], 16);
                                const binary4bit = decimal
                                  .toString(2)
                                  .padStart(4, "0");
                                binary += binary4bit;
                              }

                              const msb = binary[0];
                              const isNegative = msb === "1";

                              if (isNegative) {
                                const inverted = binary
                                  .split("")
                                  .map((bit) => (bit === "0" ? "1" : "0"))
                                  .join("");
                                const decimalValue = parseInt(inverted, 2) + 1;
                                return "-" + decimalValue.toLocaleString();
                              } else {
                                return (
                                  parseInt(binary, 2).toLocaleString() +
                                  " (positivo)"
                                );
                              }
                            })()}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Basado en el bit más significativo (MSB)
                          </div>
                        </div>
                      )}
                  </div>
                )}
                {result.flags &&
                  (result.inputBase === "binary" ||
                    result.outputBase === "binary") && (
                    <>
                      {result.inputBase === "binary" &&
                      result.outputBase === "decimal" ? (
                        // Show flags for both unsigned and signed for binary to decimal
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium mb-2">
                              Banderas (sin signo):
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="border rounded p-2">
                                <div className="text-muted-foreground">
                                  Flag Zero
                                </div>
                                <div className="font-mono">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const finalUnsigned = hasManualNegative
                                      ? -unsignedValue
                                      : unsignedValue;
                                    return finalUnsigned === 0 ? "1" : "0";
                                  })()}
                                </div>
                              </div>
                              <div className="border rounded p-2">
                                <div className="text-muted-foreground">
                                  Flag Signo
                                </div>
                                <div className="font-mono">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const finalUnsigned = hasManualNegative
                                      ? -unsignedValue
                                      : unsignedValue;
                                    return finalUnsigned < 0 ? "1" : "0";
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-2">
                              Banderas (con signo):
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="border rounded p-2">
                                <div className="text-muted-foreground">
                                  Flag Zero
                                </div>
                                <div className="font-mono">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const bitLength = cleanBinary.length;
                                    const signedValue =
                                      unsignedValue >=
                                      Math.pow(2, bitLength - 1)
                                        ? unsignedValue - Math.pow(2, bitLength)
                                        : unsignedValue;
                                    const finalSigned = hasManualNegative
                                      ? -unsignedValue
                                      : signedValue;
                                    return finalSigned === 0 ? "1" : "0";
                                  })()}
                                </div>
                              </div>
                              <div className="border rounded p-2">
                                <div className="text-muted-foreground">
                                  Flag Signo
                                </div>
                                <div className="font-mono">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const bitLength = cleanBinary.length;
                                    const signedValue =
                                      unsignedValue >=
                                      Math.pow(2, bitLength - 1)
                                        ? unsignedValue - Math.pow(2, bitLength)
                                        : unsignedValue;
                                    const finalSigned = hasManualNegative
                                      ? -unsignedValue
                                      : signedValue;
                                    return finalSigned < 0 ? "1" : "0";
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Original flag cards for other conversions
                        <>
                          <div className="border rounded p-2">
                            <div className="text-muted-foreground">
                              Flag Zero
                            </div>
                            <div className="font-mono">
                              {result.flags.zero ? "1" : "0"}
                            </div>
                          </div>
                          <div className="border rounded p-2">
                            <div className="text-muted-foreground">
                              Flag Signo
                            </div>
                            <div className="font-mono">
                              {result.flags.sign ? "1" : "0"}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
              </div>
            </div>
          </div>

          {/* Step 2: Conversion */}
          <div className="border rounded-lg">
            <div className="px-4 py-3 border-b bg-muted/50">
              <h3 className="text-sm font-medium">
                2. Conversión {getBaseName(result.inputBase)} →{" "}
                {getBaseName(result.outputBase)}
              </h3>
            </div>
            <div className="p-4">
              {/* Decimal to Octal/Hex/Binary with specific table format */}
              {result.inputBase === "decimal" &&
                ["octal", "hexadecimal", "binary"].includes(
                  result.outputBase
                ) &&
                intSteps.length > 1 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-3">
                      Pasos de cálculo para conversión{" "}
                      {getBaseName(result.inputBase)} →{" "}
                      {getBaseName(result.outputBase)}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Dividir por la base {getBaseNumber(result.outputBase)}{" "}
                      para obtener los dígitos desde los restos:
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border text-xs">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-2 py-1 border">
                              División por {getBaseNumber(result.outputBase)}
                            </th>
                            <th className="px-2 py-1 border">Cociente</th>
                            <th className="px-2 py-1 border">Resto (Dígito)</th>
                            <th className="px-2 py-1 border">Dígito #</th>
                          </tr>
                        </thead>
                        <tbody>
                          {intSteps.map((step, i) => (
                            <tr key={i}>
                              <td className="px-2 py-1 border text-center font-mono">
                                ({step.quotient})/
                                {getBaseNumber(result.outputBase)}
                              </td>
                              <td className="px-2 py-1 border text-center font-mono">
                                {Math.floor(
                                  step.quotient /
                                    getBaseNumber(result.outputBase)
                                )}
                              </td>
                              <td className="px-2 py-1 border text-center font-mono">
                                {step.remainder}
                              </td>
                              <td className="px-2 py-1 border text-center font-mono">
                                {intSteps.length - 1 - i}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 text-xs">
                      <div className="text-muted-foreground">
                        Resultado de la tabla (antes del complemento):
                      </div>
                      <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
                        {result.integerSteps
                          ?.map((step) => step.remainder)
                          .reverse()
                          .join("") || result.output}
                      </code>
                    </div>

                    {/* Formatted result step */}
                    <div className="mt-3 text-xs">
                      <div className="text-muted-foreground">
                        Acomodo con formato requerido:
                      </div>
                      <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
                        {formatDisplayValue(
                          result.magnitude ||
                            result.integerSteps
                              ?.map((step) => step.remainder)
                              .reverse()
                              .join("") ||
                            result.output,
                          result.outputBase
                        )}
                      </code>
                    </div>

                    {/* Format adaptation note for negative binary conversions */}
                    {result.inputBase === "decimal" &&
                      result.outputBase === "binary" &&
                      result.isNegative && (
                        <div className="mt-4">
                          <div className="text-sm text-muted-foreground">
                            Para números negativos, se adapta al formato de
                            complemento a dos requerido.
                          </div>
                        </div>
                      )}

                    {/* Endian information for hexadecimal conversions */}
                    {result.inputBase === "decimal" &&
                      result.outputBase === "hexadecimal" && (
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-3">
                            Cálculo de Endianness
                          </div>

                          {/* Step-by-step endianness calculation */}
                          <div className="mb-4">
                            <div className="text-xs text-muted-foreground mb-2">
                              Pasos para calcular la representación en memoria:
                            </div>
                            <div className="space-y-2 text-xs">
                              {(() => {
                                const hexValue = result.isNegative
                                  ? result.twosComplementHex ||
                                    result.signedResult ||
                                    result.output
                                  : result.magnitude || result.output;
                                const hexLength = (hexValue || "0").length;
                                const numBytes = hexLength / 2;
                                const paddedHex = (hexValue || "0").padStart(
                                  hexLength,
                                  "0"
                                );

                                return (
                                  <>
                                    {result.isNegative ? (
                                      <>
                                        <div className="flex justify-between items-center">
                                          <span>
                                            1. Valor decimal original:
                                          </span>
                                          <code className="font-mono bg-background px-2 py-1 rounded border">
                                            {result.input}
                                          </code>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>
                                            2. Convertir a hexadecimal:
                                          </span>
                                          <code className="font-mono bg-background px-2 py-1 rounded border">
                                            {Math.abs(
                                              parseInt(
                                                result.input.replace(/,/g, "")
                                              )
                                            )
                                              .toString(16)
                                              .toUpperCase()}
                                          </code>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="flex justify-between items-center">
                                            <span>
                                              3. Aplicar complemento a dos:
                                            </span>
                                          </div>
                                          <div className="ml-4 space-y-1 text-xs">
                                            <div className="flex justify-between items-center">
                                              <span>
                                                3a. Restar cada dígito de 15
                                                (F):
                                              </span>
                                              <code className="font-mono bg-background px-2 py-1 rounded border">
                                                {(() => {
                                                  const absHex = Math.abs(
                                                    parseInt(
                                                      result.input.replace(
                                                        /,/g,
                                                        ""
                                                      )
                                                    )
                                                  )
                                                    .toString(16)
                                                    .toUpperCase();
                                                  const inverted = absHex
                                                    .split("")
                                                    .map((digit) => {
                                                      const val = parseInt(
                                                        digit,
                                                        16
                                                      );
                                                      return (15 - val)
                                                        .toString(16)
                                                        .toUpperCase();
                                                    })
                                                    .join("");
                                                  return inverted;
                                                })()}
                                              </code>
                                            </div>
                                            <div className="mt-2">
                                              <div className="text-xs text-muted-foreground mb-1">
                                                Tabla de conversión:
                                              </div>
                                              <div className="overflow-x-auto">
                                                <table className="w-full border text-xs">
                                                  <thead>
                                                    <tr className="bg-muted/50">
                                                      <th className="px-2 py-1 border">
                                                        Dígito Original
                                                      </th>
                                                      <th className="px-2 py-1 border">
                                                        Valor Decimal
                                                      </th>
                                                      <th className="px-2 py-1 border">
                                                        15 - Valor
                                                      </th>
                                                      <th className="px-2 py-1 border">
                                                        Resultado Hex
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {(() => {
                                                      const absHex = Math.abs(
                                                        parseInt(
                                                          result.input.replace(
                                                            /,/g,
                                                            ""
                                                          )
                                                        )
                                                      )
                                                        .toString(16)
                                                        .toUpperCase();
                                                      return absHex
                                                        .split("")
                                                        .map((digit, i) => {
                                                          const val = parseInt(
                                                            digit,
                                                            16
                                                          );
                                                          const result = (
                                                            15 - val
                                                          )
                                                            .toString(16)
                                                            .toUpperCase();
                                                          return (
                                                            <tr key={i}>
                                                              <td className="px-2 py-1 border text-center font-mono">
                                                                {digit}
                                                              </td>
                                                              <td className="px-2 py-1 border text-center">
                                                                {val}
                                                              </td>
                                                              <td className="px-2 py-1 border text-center">
                                                                15 - {val} ={" "}
                                                                {15 - val}
                                                              </td>
                                                              <td className="px-2 py-1 border text-center font-mono">
                                                                {result}
                                                              </td>
                                                            </tr>
                                                          );
                                                        });
                                                    })()}
                                                  </tbody>
                                                </table>
                                              </div>
                                              <div className="mt-2 text-xs">
                                                <div className="flex justify-between items-center">
                                                  <span>
                                                    Resultado completo:
                                                  </span>
                                                  <code className="font-mono bg-background px-2 py-1 rounded border">
                                                    {(() => {
                                                      const absHex = Math.abs(
                                                        parseInt(
                                                          result.input.replace(
                                                            /,/g,
                                                            ""
                                                          )
                                                        )
                                                      )
                                                        .toString(16)
                                                        .toUpperCase();
                                                      const inverted = absHex
                                                        .split("")
                                                        .map((digit) => {
                                                          const val = parseInt(
                                                            digit,
                                                            16
                                                          );
                                                          return (15 - val)
                                                            .toString(16)
                                                            .toUpperCase();
                                                        })
                                                        .join("");
                                                      return inverted;
                                                    })()}
                                                  </code>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                              <span>
                                                3b. Sumar 1 al resultado:
                                              </span>
                                              <code className="font-mono bg-background px-2 py-1 rounded border">
                                                {hexValue}
                                              </code>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>
                                            4. Rellenar a {hexLength}{" "}
                                            caracteres:
                                          </span>
                                          <code className="font-mono bg-background px-2 py-1 rounded border">
                                            {paddedHex}
                                          </code>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>
                                            5. Dividir en {numBytes} bytes:
                                          </span>
                                          <code className="font-mono bg-background px-2 py-1 rounded border">
                                            {Array.from(
                                              { length: numBytes },
                                              (_, i) =>
                                                paddedHex.slice(
                                                  i * 2,
                                                  (i + 1) * 2
                                                )
                                            ).join(" ")}
                                          </code>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>
                                            6. Little Endian (LSB primero):
                                          </span>
                                          <code className="font-mono bg-background px-2 py-1 rounded border">
                                            {Array.from(
                                              { length: numBytes },
                                              (_, i) =>
                                                paddedHex.slice(
                                                  i * 2,
                                                  (i + 1) * 2
                                                )
                                            )
                                              .reverse()
                                              .join(" ")}
                                          </code>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>
                                            7. Big Endian (MSB primero):
                                          </span>
                                          <code className="font-mono bg-background px-2 py-1 rounded border">
                                            {Array.from(
                                              { length: numBytes },
                                              (_, i) =>
                                                paddedHex.slice(
                                                  i * 2,
                                                  (i + 1) * 2
                                                )
                                            ).join(" ")}
                                          </code>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="flex justify-between items-center">
                                          <span>1. Valor decimal:</span>
                                          <code className="font-mono bg-background px-2 py-1 rounded border">
                                            {result.input}
                                          </code>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>
                                            2. Convertir a hexadecimal:
                                          </span>
                                          <code className="font-mono bg-background px-2 py-1 rounded border">
                                            {parseInt(
                                              result.input.replace(/,/g, "")
                                            )
                                              .toString(16)
                                              .toUpperCase()}
                                          </code>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>
                                            3. Rellenar a {hexLength}{" "}
                                            caracteres:
                                          </span>
                                          <code className="font-mono bg-background px-2 py-1 rounded border">
                                            {paddedHex}
                                          </code>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>
                                            4. Dividir en {numBytes} bytes:
                                          </span>
                                          <code className="font-mono bg-background px-2 py-1 rounded border">
                                            {Array.from(
                                              { length: numBytes },
                                              (_, i) =>
                                                paddedHex.slice(
                                                  i * 2,
                                                  (i + 1) * 2
                                                )
                                            ).join(" ")}
                                          </code>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>
                                            5. Little Endian (LSB primero):
                                          </span>
                                          <code className="font-mono bg-background px-2 py-1 rounded border">
                                            {Array.from(
                                              { length: numBytes },
                                              (_, i) =>
                                                paddedHex.slice(
                                                  i * 2,
                                                  (i + 1) * 2
                                                )
                                            )
                                              .reverse()
                                              .join(" ")}
                                          </code>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>
                                            6. Big Endian (MSB primero):
                                          </span>
                                          <code className="font-mono bg-background px-2 py-1 rounded border">
                                            {Array.from(
                                              { length: numBytes },
                                              (_, i) =>
                                                paddedHex.slice(
                                                  i * 2,
                                                  (i + 1) * 2
                                                )
                                            ).join(" ")}
                                          </code>
                                        </div>
                                      </>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          <div className="text-sm font-medium mb-3">
                            Representación en memoria (Endianness)
                          </div>
                          <div className="text-xs text-muted-foreground mb-3">
                            {result.isNegative
                              ? (() => {
                                  const hexValue =
                                    result.twosComplementHex ||
                                    result.signedResult ||
                                    result.output;
                                  const hexLength = (hexValue || "0").length;
                                  const bitWidth = hexLength * 4; // Each hex char = 4 bits
                                  return `Basado en complemento a dos (${bitWidth} bits)`;
                                })()
                              : "Representación directa en hexadecimal"}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <div className="font-medium mb-2">
                                Little Endian
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full border text-xs">
                                  <thead>
                                    <tr className="bg-muted/50">
                                      <th className="px-2 py-1 border">
                                        Address
                                      </th>
                                      {(() => {
                                        const hexValue = result.isNegative
                                          ? result.twosComplementHex ||
                                            result.signedResult ||
                                            result.output
                                          : result.magnitude || result.output;
                                        const hexLength = (hexValue || "0")
                                          .length;
                                        const numBytes = hexLength / 2; // Each byte is 2 hex characters
                                        return Array.from(
                                          { length: numBytes },
                                          (_, i) => (
                                            <th
                                              key={i}
                                              className="px-2 py-1 border text-center"
                                            >
                                              {i}
                                            </th>
                                          )
                                        );
                                      })()}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className="px-2 py-1 border font-medium">
                                        Data
                                      </td>
                                      {(() => {
                                        const hexValue = result.isNegative
                                          ? result.twosComplementHex ||
                                            result.signedResult ||
                                            result.output
                                          : result.magnitude || result.output;
                                        const hexLength = (hexValue || "0")
                                          .length;
                                        const paddedHex = (
                                          hexValue || "0"
                                        ).padStart(hexLength, "0");
                                        const bytes = [];
                                        const numBytes = hexLength / 2; // Each byte is 2 hex characters
                                        for (let i = 0; i < numBytes; i++) {
                                          const byte = paddedHex.slice(
                                            i * 2,
                                            (i + 1) * 2
                                          );
                                          bytes.push(byte);
                                        }
                                        return bytes.map((byte, i) => (
                                          <td
                                            key={i}
                                            className="px-2 py-1 border text-center font-mono"
                                          >
                                            {byte}
                                          </td>
                                        ));
                                      })()}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            <div>
                              <div className="font-medium mb-2">Big Endian</div>
                              <div className="overflow-x-auto">
                                <table className="w-full border text-xs">
                                  <thead>
                                    <tr className="bg-muted/50">
                                      <th className="px-2 py-1 border">
                                        Address
                                      </th>
                                      {(() => {
                                        const hexValue = result.isNegative
                                          ? result.twosComplementHex ||
                                            result.signedResult ||
                                            result.output
                                          : result.magnitude || result.output;
                                        const hexLength = (hexValue || "0")
                                          .length;
                                        const numBytes = hexLength / 2; // Each byte is 2 hex characters
                                        return Array.from(
                                          { length: numBytes },
                                          (_, i) => (
                                            <th
                                              key={i}
                                              className="px-2 py-1 border text-center"
                                            >
                                              {i}
                                            </th>
                                          )
                                        );
                                      })()}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className="px-2 py-1 border font-medium">
                                        Data
                                      </td>
                                      {(() => {
                                        const hexValue = result.isNegative
                                          ? result.twosComplementHex ||
                                            result.signedResult ||
                                            result.output
                                          : result.magnitude || result.output;
                                        const hexLength = (hexValue || "0")
                                          .length;
                                        const paddedHex = (
                                          hexValue || "0"
                                        ).padStart(hexLength, "0");
                                        const bytes = [];
                                        const numBytes = hexLength / 2; // Each byte is 2 hex characters
                                        for (let i = 0; i < numBytes; i++) {
                                          const byte = paddedHex.slice(
                                            i * 2,
                                            (i + 1) * 2
                                          );
                                          bytes.push(byte);
                                        }
                                        return bytes
                                          .reverse()
                                          .map((byte, i) => (
                                            <td
                                              key={i}
                                              className="px-2 py-1 border text-center font-mono"
                                            >
                                              {byte}
                                            </td>
                                          ));
                                      })()}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}

              {/* Binary to Decimal - Enhanced with signed/unsigned */}
              {result.inputBase === "binary" &&
                result.outputBase === "decimal" && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-2">
                      Conversión decimal
                    </div>

                    {/* Main result - Unsigned interpretation */}
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground mb-2">
                        Interpretación sin signo (unsigned):
                      </div>
                      <div className="text-xs font-mono mb-2">
                        Decimal sin signo:{" "}
                        <span className="font-bold">
                          {(() => {
                            const hasManualNegative = result.input
                              .trim()
                              .startsWith("-");
                            const cleanBinary = result.input
                              .replace(/\s/g, "")
                              .replace(/^-/, "");
                            return hasManualNegative
                              ? -parseInt(cleanBinary, 2)
                              : parseInt(cleanBinary, 2);
                          })()}
                        </span>
                      </div>
                    </div>

                    {/* Unsigned calculation table */}
                    <div className="text-sm text-muted-foreground mb-2">
                      Cálculo paso a paso (interpretación sin signo):
                    </div>
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full border text-xs">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-2 py-1 border">Posición (bit)</th>
                            <th className="px-2 py-1 border">Dígito Binario</th>
                            <th className="px-2 py-1 border">Peso</th>
                            <th className="px-2 py-1 border">Contribución</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const hasManualNegative = result.input
                              .trim()
                              .startsWith("-");
                            const binary = result.input
                              .replace(/\s/g, "")
                              .replace(/^-/, "");
                            const bitLength = binary.length;

                            return binary
                              .split("")
                              .reverse()
                              .map((bit, i) => {
                                const weight = Math.pow(2, i);
                                const contribution = parseInt(bit) * weight;
                                return (
                                  <tr key={i}>
                                    <td className="px-2 py-1 border text-center font-mono">
                                      {i}
                                    </td>
                                    <td className="px-2 py-1 border text-center font-mono">
                                      {bit}
                                    </td>
                                    <td className="px-2 py-1 border text-center font-mono">
                                      2^{i}
                                    </td>
                                    <td className="px-2 py-1 border text-center font-mono">
                                      {bit} × 2^{i} = {contribution}
                                    </td>
                                  </tr>
                                );
                              });
                          })()}
                        </tbody>
                        <tfoot>
                          <tr className="bg-muted/30">
                            <td
                              colSpan={3}
                              className="px-2 py-1 border text-right font-medium"
                            >
                              Total:
                            </td>
                            <td className="px-2 py-1 border text-center font-mono font-bold">
                              {(() => {
                                const hasManualNegative = result.input
                                  .trim()
                                  .startsWith("-");
                                const cleanBinary = result.input
                                  .replace(/\s/g, "")
                                  .replace(/^-/, "");
                                const unsignedValue = parseInt(cleanBinary, 2);
                                return hasManualNegative
                                  ? -unsignedValue
                                  : unsignedValue;
                              })()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Two's complement interpretation (only if no manual negative sign) */}
                    {(() => {
                      const hasManualNegative = result.input
                        .trim()
                        .startsWith("-");
                      const binary = result.input
                        .replace(/\s/g, "")
                        .replace(/^-/, "");
                      const isNegative =
                        binary.startsWith("1") && binary.length > 1;

                      if (hasManualNegative) {
                        return null; // Don't show two's complement if manual negative
                      }

                      return (
                        <>
                          {/* Secondary result - Signed interpretation (two's complement) */}
                          <div className="mb-4">
                            <div className="text-sm text-muted-foreground mb-2">
                              Interpretación con signo (two's complement):
                            </div>
                            <div className="text-xs font-mono mb-2">
                              Decimal con signo:{" "}
                              <span className="font-bold">{result.output}</span>
                            </div>
                          </div>

                          {/* Method 1: Invert and Add One */}
                          {isNegative && (
                            <div className="mb-4">
                              <div className="text-sm text-muted-foreground mb-2">
                                Método 1: Invertir y Sumar Uno (para números
                                negativos)
                              </div>
                              <div className="text-xs space-y-1 mb-2">
                                {(() => {
                                  const inverted = binary
                                    .split("")
                                    .map((bit) => (bit === "0" ? "1" : "0"))
                                    .join("");
                                  const invertedPlusOne = (
                                    parseInt(inverted, 2) + 1
                                  )
                                    .toString(2)
                                    .padStart(binary.length, "0");
                                  return (
                                    <>
                                      <div>
                                        1. Invertir bits: {binary} → {inverted}
                                      </div>
                                      <div>
                                        2. Sumar 1: {inverted} + 1 ={" "}
                                        {invertedPlusOne}
                                      </div>
                                      <div>
                                        3. Convertir a decimal:{" "}
                                        {invertedPlusOne} ={" "}
                                        {parseInt(invertedPlusOne, 2)}
                                      </div>
                                      <div>
                                        4. Aplicar signo negativo: -
                                        {parseInt(invertedPlusOne, 2)}
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          )}

                          {/* Method 2: Direct Calculation */}
                          <div className="mb-4">
                            <div className="text-sm text-muted-foreground mb-2">
                              Método 2: Cálculo Directo (para ambos positivos y
                              negativos)
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full border text-xs">
                                <thead>
                                  <tr className="bg-muted/50">
                                    <th className="px-2 py-1 border">
                                      Posición (bit)
                                    </th>
                                    <th className="px-2 py-1 border">
                                      Dígito Binario
                                    </th>
                                    <th className="px-2 py-1 border">Peso</th>
                                    <th className="px-2 py-1 border">
                                      Contribución
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(() => {
                                    return binary
                                      .split("")
                                      .reverse()
                                      .map((bit, i) => {
                                        let weight = Math.pow(2, i);
                                        let contribution =
                                          parseInt(bit) * weight;

                                        // For MSB in two's complement, treat as negative
                                        if (
                                          isNegative &&
                                          i === binary.length - 1
                                        ) {
                                          weight = -Math.pow(2, i);
                                          contribution = parseInt(bit) * weight;
                                        }

                                        return (
                                          <tr key={i}>
                                            <td className="px-2 py-1 border text-center font-mono">
                                              {i}
                                            </td>
                                            <td className="px-2 py-1 border text-center font-mono">
                                              {bit}
                                            </td>
                                            <td className="px-2 py-1 border text-center font-mono">
                                              {i === binary.length - 1 &&
                                              isNegative
                                                ? `-${Math.pow(2, i)}`
                                                : `2^${i}`}
                                            </td>
                                            <td className="px-2 py-1 border text-center font-mono">
                                              {bit} ×{" "}
                                              {i === binary.length - 1 &&
                                              isNegative
                                                ? `-${Math.pow(2, i)}`
                                                : `2^${i}`}{" "}
                                              = {contribution}
                                            </td>
                                          </tr>
                                        );
                                      });
                                  })()}
                                </tbody>
                                <tfoot>
                                  <tr className="bg-muted/30">
                                    <td
                                      colSpan={3}
                                      className="px-2 py-1 border text-right font-medium"
                                    >
                                      Total:
                                    </td>
                                    <td className="px-2 py-1 border text-center font-mono font-bold">
                                      {result.output}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        </>
                      );
                    })()}

                    {/* Summary */}
                    <div className="mt-2 text-xs text-muted-foreground">
                      {(() => {
                        const hasManualNegative = result.input
                          .trim()
                          .startsWith("-");
                        const cleanBinary = result.input
                          .replace(/\s/g, "")
                          .replace(/^-/, "");
                        const unsignedValue = parseInt(cleanBinary, 2);
                        const finalValue = hasManualNegative
                          ? -unsignedValue
                          : unsignedValue;
                        return hasManualNegative
                          ? `Resultado final (manual negativo): ${finalValue}`
                          : `Resultado final (unsigned): ${finalValue}`;
                      })()}
                    </div>
                  </div>
                )}

              {/* Binary to Octal */}
              {result.inputBase === "binary" &&
                result.outputBase === "octal" && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-2">
                      Conversión octal
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Convertir cada 3 dígitos binarios a dígito octal:
                    </div>

                    {/* Binary to Octal conversion table */}
                    <div className="text-sm text-muted-foreground mb-2">
                      Conversión paso a paso:
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border text-xs">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-2 py-1 border">
                              Grupo Binario (3 bits)
                            </th>
                            <th className="px-2 py-1 border">Valor Decimal</th>
                            <th className="px-2 py-1 border">Dígito Octal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            // Get the binary input without spaces
                            let cleanBinary = result.input.replace(/\s/g, "");

                            // Pad with zeros on the left to make length divisible by 3
                            while (cleanBinary.length % 3 !== 0) {
                              cleanBinary = "0" + cleanBinary;
                            }

                            // Group into 3-bit chunks
                            const groups = [];
                            for (let i = 0; i < cleanBinary.length; i += 3) {
                              groups.push(cleanBinary.slice(i, i + 3));
                            }

                            return groups.map((group, index) => {
                              const decimal = parseInt(group, 2);
                              const octalChar = decimal.toString();
                              return (
                                <tr key={index}>
                                  <td className="px-2 py-1 border text-center font-mono">
                                    {group}
                                  </td>
                                  <td className="px-2 py-1 border text-center">
                                    {decimal}
                                  </td>
                                  <td className="px-2 py-1 border text-center font-mono bg-primary/10">
                                    {octalChar}
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary */}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Resultado final:{" "}
                      <span className="font-mono">{result.output}</span>
                    </div>
                  </div>
                )}

              {/* Binary to Hex */}
              {result.inputBase === "binary" &&
                result.outputBase === "hexadecimal" && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-2">
                      Conversión hexadecimal
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Convertir cada 4 dígitos binarios a dígito hexadecimal:
                    </div>
                    {/* Binary to Hex conversion table */}
                    <div className="text-sm text-muted-foreground mb-2">
                      Conversión paso a paso:
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border text-xs">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-2 py-1 border">
                              Grupo Binario (4 bits)
                            </th>
                            <th className="px-2 py-1 border">Valor Decimal</th>
                            <th className="px-2 py-1 border">Dígito Hex</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            // Get the binary input without spaces
                            let cleanBinary = result.input.replace(/\s/g, "");

                            // Check for negative sign
                            const hasNegativeSign = cleanBinary.startsWith("-");
                            if (hasNegativeSign) {
                              cleanBinary = cleanBinary.substring(1); // Remove the negative sign for processing
                            }

                            // Pad with zeros on the left to make length divisible by 4
                            while (cleanBinary.length % 4 !== 0) {
                              cleanBinary = "0" + cleanBinary;
                            }

                            // Group into 4-bit chunks
                            const groups = [];
                            for (let i = 0; i < cleanBinary.length; i += 4) {
                              groups.push(cleanBinary.slice(i, i + 4));
                            }

                            return groups.map((group, index) => {
                              const decimal = parseInt(group, 2);
                              const hexChar = "0123456789ABCDEF"[decimal];
                              return (
                                <tr key={index}>
                                  <td className="px-2 py-1 border text-center font-mono">
                                    {hasNegativeSign && index === 0
                                      ? "-" + group
                                      : group}
                                  </td>
                                  <td className="px-2 py-1 border text-center">
                                    {decimal}
                                  </td>
                                  <td className="px-2 py-1 border text-center font-mono bg-primary/10">
                                    {hasNegativeSign && index === 0
                                      ? "-" + hexChar
                                      : hexChar}
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary */}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Resultado final:{" "}
                      <span className="font-mono">
                        {(() => {
                          // Calculate the correct hex result
                          let cleanBinary = result.input.replace(/\s/g, "");
                          const hasNegativeSign = cleanBinary.startsWith("-");

                          if (hasNegativeSign) {
                            cleanBinary = cleanBinary.substring(1);
                          }

                          // Pad with zeros on the left to make length divisible by 4
                          while (cleanBinary.length % 4 !== 0) {
                            cleanBinary = "0" + cleanBinary;
                          }

                          // Group into 4-bit chunks and convert to hex
                          const groups = [];
                          for (let i = 0; i < cleanBinary.length; i += 4) {
                            groups.push(cleanBinary.slice(i, i + 4));
                          }

                          const hexChars = groups.map((group) => {
                            const decimal = parseInt(group, 2);
                            return "0123456789ABCDEF"[decimal];
                          });

                          // Group hex chars in pairs (2 chars per group)
                          const hexGroups = [];
                          for (let i = 0; i < hexChars.length; i += 2) {
                            hexGroups.push(hexChars.slice(i, i + 2).join(""));
                          }

                          const hexResult = hexGroups.join(" ");
                          return hasNegativeSign ? "-" + hexResult : hexResult;
                        })()}
                      </span>
                    </div>
                  </div>
                )}

              {/* Octal to Binary */}
              {result.inputBase === "octal" &&
                result.outputBase === "binary" && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-2">
                      Conversión binaria
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Convertir cada dígito octal a 3 dígitos binarios:
                    </div>
                    <table className="w-full border border-border text-sm mb-3">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-2 py-1 text-left border">
                            Dígito Octal
                          </th>
                          <th className="px-2 py-1 text-left border">
                            Dígitos Binarios (3 bits)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const hasNegative = result.input.startsWith("-");
                          const cleanOctal = hasNegative
                            ? result.input.slice(1).replace(/\s/g, "")
                            : result.input.replace(/\s/g, "");
                          return cleanOctal.split("").map((digit, index) => {
                            const decimal = parseInt(digit, 8);
                            const binary = decimal.toString(2).padStart(3, "0");
                            return (
                              <tr key={index}>
                                <td className="px-2 py-1 border font-mono text-center">
                                  {digit}
                                </td>
                                <td className="px-2 py-1 border font-mono text-center">
                                  {binary}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                    <div className="text-xs font-mono text-muted-foreground">
                      Resultado: {result.output}
                    </div>
                  </div>
                )}

              {/* Octal to Decimal */}
              {result.inputBase === "octal" &&
                result.outputBase === "decimal" && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-2">
                      Cálculo decimal
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Cada dígito octal se multiplica por 8 elevado a su
                      posición:
                    </div>
                    <table className="w-full border border-border text-sm mb-3">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-2 py-1 text-left border">
                            Posición
                          </th>
                          <th className="px-2 py-1 text-left border">
                            Dígito Octal
                          </th>
                          <th className="px-2 py-1 text-left border">
                            Cálculo
                          </th>
                          <th className="px-2 py-1 text-left border">
                            Contribución
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const hasNegative = result.input.startsWith("-");
                          const cleanOctal = hasNegative
                            ? result.input.slice(1).replace(/\s/g, "")
                            : result.input.replace(/\s/g, "");
                          const digits = cleanOctal.split("").reverse();

                          return digits.map((digit, index) => {
                            const power = index;
                            const contribution =
                              parseInt(digit, 8) * Math.pow(8, power);
                            const calculation = `(${digit} × 8^${power})`;

                            return (
                              <tr key={index}>
                                <td className="px-2 py-1 border font-mono text-center">
                                  {power}
                                </td>
                                <td className="px-2 py-1 border font-mono text-center">
                                  {digit}
                                </td>
                                <td className="px-2 py-1 border font-mono text-center">
                                  {calculation}
                                </td>
                                <td className="px-2 py-1 border font-mono text-center">
                                  {contribution.toLocaleString()}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/30">
                          <td
                            colSpan={3}
                            className="px-2 py-2 border font-medium text-right"
                          >
                            Total:
                          </td>
                          <td className="px-2 py-2 border font-mono font-medium text-center">
                            {(() => {
                              const hasNegative = result.input.startsWith("-");
                              const cleanDecimal = hasNegative
                                ? result.output.slice(1).replace(/,/g, "")
                                : result.output.replace(/,/g, "");
                              return hasNegative
                                ? "-" + cleanDecimal
                                : cleanDecimal;
                            })()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

              {/* Octal to Hex */}
              {result.inputBase === "octal" &&
                result.outputBase === "hexadecimal" && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-2">
                      Conversión hexadecimal
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Convertir cada dígito octal a 3 bits binarios, luego
                      agrupar en 4 bits y convertir a hexadecimal:
                    </div>

                    {/* Step 1: Octal to 3-bit Binary */}
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2 text-muted-foreground">
                        Paso 1: Convertir dígitos octales a 3 bits binarios
                      </div>
                      <table className="w-full border border-border text-sm mb-3">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-2 py-1 text-left border">
                              Dígito Octal
                            </th>
                            <th className="px-2 py-1 text-left border">
                              Binario (3 bits)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const hasNegative = result.input.startsWith("-");
                            const cleanOctal = hasNegative
                              ? result.input.slice(1).replace(/\s/g, "")
                              : result.input.replace(/\s/g, "");
                            return cleanOctal.split("").map((digit, index) => {
                              const decimal = parseInt(digit, 8);
                              const binary = decimal
                                .toString(2)
                                .padStart(3, "0");
                              return (
                                <tr key={index}>
                                  <td className="px-2 py-1 border font-mono text-center">
                                    {digit}
                                  </td>
                                  <td className="px-2 py-1 border font-mono text-center">
                                    {binary}
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                      <div className="text-xs font-mono text-muted-foreground mb-3">
                        Binario completo:{" "}
                        {(() => {
                          const hasNegative = result.input.startsWith("-");
                          const cleanOctal = hasNegative
                            ? result.input.slice(1).replace(/\s/g, "")
                            : result.input.replace(/\s/g, "");
                          const binary = cleanOctal
                            .split("")
                            .map((digit) => {
                              const decimal = parseInt(digit, 8);
                              return decimal.toString(2).padStart(3, "0");
                            })
                            .join(" ");
                          return hasNegative ? "-" + binary : binary;
                        })()}
                      </div>
                    </div>

                    {/* Step 2: Group into 4-bit chunks */}
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2 text-muted-foreground">
                        Paso 2: Agrupar en chunks de 4 bits
                      </div>
                      <table className="w-full border border-border text-sm mb-3">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-2 py-1 text-left border">
                              Binario (4 bits)
                            </th>
                            <th className="px-2 py-1 text-left border">
                              Valor Decimal
                            </th>
                            <th className="px-2 py-1 text-left border">
                              Dígito Hexadecimal
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const hasNegative = result.input.startsWith("-");
                            const cleanOctal = hasNegative
                              ? result.input.slice(1).replace(/\s/g, "")
                              : result.input.replace(/\s/g, "");
                            const binaryString = cleanOctal
                              .split("")
                              .map((digit) => {
                                const decimal = parseInt(digit, 8);
                                return decimal.toString(2).padStart(3, "0");
                              })
                              .join("");

                            // Group into 4-bit chunks from right to left
                            const chunks = [];
                            for (let i = binaryString.length; i > 0; i -= 4) {
                              const start = Math.max(0, i - 4);
                              const chunk = binaryString.slice(start, i);
                              chunks.unshift(chunk.padStart(4, "0"));
                            }

                            return chunks
                              .map((chunk, index) => {
                                const decimal = parseInt(chunk, 2);
                                const hex = decimal.toString(16).toUpperCase();
                                return (
                                  <tr key={index}>
                                    <td className="px-2 py-1 border font-mono text-center">
                                      {chunk}
                                    </td>
                                    <td className="px-2 py-1 border font-mono text-center">
                                      {decimal}
                                    </td>
                                    <td className="px-2 py-1 border font-mono text-center font-medium">
                                      {hex}
                                    </td>
                                  </tr>
                                );
                              })
                              .filter((row, index) => {
                                // Don't show the first row if it's just padding zeros
                                return !(
                                  index === 0 &&
                                  row.props.children[0].props.children ===
                                    "0000"
                                );
                              });
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Final Result */}
                    <div className="text-xs text-muted-foreground">
                      <strong>Resultado final:</strong>{" "}
                      <code className="font-mono bg-background px-2 py-1 rounded border">
                        {result.output}
                      </code>
                    </div>
                  </div>
                )}

              {/* Hex to Binary */}
              {result.inputBase === "hexadecimal" &&
                result.outputBase === "binary" && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-2">
                      Conversión binaria
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Convertir cada dígito hexadecimal a 4 dígitos binarios:
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border text-xs">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-2 py-1 border">
                              Dígito hexadecimal
                            </th>
                            <th className="px-2 py-1 border">
                              Conversión binaria
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.input.split("").map((hexDigit, i) => (
                            <tr key={i}>
                              <td className="px-2 py-1 border text-center font-mono">
                                {hexDigit}
                              </td>
                              <td className="px-2 py-1 border text-center font-mono">
                                {parseInt(hexDigit, 16)
                                  .toString(2)
                                  .padStart(4, "0")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 text-xs">
                      <div className="text-muted-foreground">Resultado:</div>
                      <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
                        {result.input} = {result.input.split("").join(" ")} ={" "}
                        {result.output}
                      </code>
                    </div>
                  </div>
                )}

              {/* Hex to Decimal */}
              {result.inputBase === "hexadecimal" &&
                result.outputBase === "decimal" && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-2">
                      Cálculo decimal
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Cada dígito hexadecimal se multiplica por 16 elevado a su
                      posición:
                    </div>
                    <table className="w-full border border-border text-sm mb-3">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-2 py-1 text-left border">
                            Posición
                          </th>
                          <th className="px-2 py-1 text-left border">
                            Dígito Hexadecimal
                          </th>
                          <th className="px-2 py-1 text-left border">
                            Valor Decimal
                          </th>
                          <th className="px-2 py-1 text-left border">
                            Cálculo
                          </th>
                          <th className="px-2 py-1 text-left border">
                            Contribución
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const hasNegative = result.input.startsWith("-");
                          const cleanHex = hasNegative
                            ? result.input.slice(1).replace(/\s/g, "")
                            : result.input.replace(/\s/g, "");
                          const digits = cleanHex.split("").reverse();

                          return digits.map((digit, index) => {
                            const power = index;
                            const decimal = parseInt(digit, 16);
                            const contribution = decimal * Math.pow(16, power);
                            const calculation = `(${decimal} × 16${
                              power === 0 ? "" : `^${power}`
                            })`;

                            return (
                              <tr key={index}>
                                <td className="px-2 py-1 border font-mono text-center">
                                  {power}
                                </td>
                                <td className="px-2 py-1 border font-mono text-center">
                                  {digit.toUpperCase()}
                                </td>
                                <td className="px-2 py-1 border font-mono text-center">
                                  {decimal}
                                </td>
                                <td className="px-2 py-1 border font-mono text-center">
                                  {calculation}
                                </td>
                                <td className="px-2 py-1 border font-mono text-center">
                                  {contribution.toLocaleString()}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/30">
                          <td
                            colSpan={4}
                            className="px-2 py-2 border font-medium text-right"
                          >
                            Total:
                          </td>
                          <td className="px-2 py-2 border font-mono font-medium text-center">
                            {(() => {
                              const hasNegative = result.input.startsWith("-");
                              const cleanDecimal = hasNegative
                                ? result.output.slice(1).replace(/,/g, "")
                                : result.output.replace(/,/g, "");
                              return hasNegative
                                ? "-" + cleanDecimal
                                : cleanDecimal;
                            })()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                    {/* Signed 2's Complement Calculation */}
                    {!result.input.startsWith("-") && (
                      <div className="mt-6">
                        <div className="text-sm font-medium mb-3">
                          Interpretación complemento a dos (signed):
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">
                          Determinar si el número es positivo o negativo
                          basándose en el bit más significativo:
                        </div>

                        {(() => {
                          const hasExplicitNegative =
                            result.input.startsWith("-");
                          const cleanHex = hasExplicitNegative
                            ? result.input.slice(1).replace(/\s/g, "")
                            : result.input.replace(/\s/g, "");

                          // Convert hex to binary
                          let binary = "";
                          for (let i = 0; i < cleanHex.length; i++) {
                            const decimal = parseInt(cleanHex[i], 16);
                            const binary4bit = decimal
                              .toString(2)
                              .padStart(4, "0");
                            binary += binary4bit;
                          }

                          const msb = binary[0];
                          const isNegative = msb === "1";

                          return (
                            <div className="space-y-4">
                              {/* Step 1: Hex to Binary */}
                              <div className="border rounded p-3">
                                <div className="text-sm font-medium mb-2">
                                  Paso 1: Convertir hexadecimal a binario
                                </div>
                                <div className="text-xs text-muted-foreground mb-2">
                                  Cada dígito hexadecimal se convierte a 4 bits
                                  binarios:
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full border text-xs">
                                    <thead>
                                      <tr className="bg-muted/50">
                                        <th className="px-2 py-1 border">
                                          Dígito Hex
                                        </th>
                                        <th className="px-2 py-1 border">
                                          Valor Decimal
                                        </th>
                                        <th className="px-2 py-1 border">
                                          Binario (4 bits)
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {cleanHex
                                        .split("")
                                        .map((digit, index) => {
                                          const decimal = parseInt(digit, 16);
                                          const binary4bit = decimal
                                            .toString(2)
                                            .padStart(4, "0");
                                          return (
                                            <tr key={index}>
                                              <td className="px-2 py-1 border text-center font-mono">
                                                {digit.toUpperCase()}
                                              </td>
                                              <td className="px-2 py-1 border text-center font-mono">
                                                {decimal}
                                              </td>
                                              <td className="px-2 py-1 border text-center font-mono">
                                                {binary4bit}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="mt-2 text-xs font-mono text-muted-foreground">
                                  Binario completo:{" "}
                                  {binary.match(/.{1,4}/g)?.join(" ") || binary}
                                </div>
                              </div>

                              {/* Step 2: Determine sign */}
                              <div className="border rounded p-3">
                                <div className="text-sm font-medium mb-2">
                                  Paso 2: Determinar el signo
                                </div>
                                <div className="text-xs text-muted-foreground mb-2">
                                  Revisar el bit más significativo (MSB):
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">MSB:</span>{" "}
                                    <code className="font-mono bg-background px-2 py-1 rounded border">
                                      {msb}
                                    </code>
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Interpretación:
                                    </span>{" "}
                                    {isNegative ? (
                                      <span className="font-medium">
                                        Negativo (MSB = 1)
                                      </span>
                                    ) : (
                                      <span className="font-medium">
                                        Positivo (MSB = 0)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Step 3: Apply 2's complement if negative */}
                              {isNegative && (
                                <div className="border rounded p-3">
                                  <div className="text-sm font-medium mb-2">
                                    Paso 3: Aplicar complemento a dos
                                  </div>
                                  <div className="space-y-3">
                                    {/* 1's Complement */}
                                    <div>
                                      <div className="text-xs text-muted-foreground mb-1">
                                        Complemento a uno (invertir bits):
                                      </div>
                                      <div className="font-mono text-sm bg-background p-2 rounded border">
                                        {binary
                                          .split("")
                                          .map((bit) =>
                                            bit === "0" ? "1" : "0"
                                          )
                                          .join("")
                                          .match(/.{1,4}/g)
                                          ?.join(" ") || ""}
                                      </div>
                                    </div>

                                    {/* Add 1 */}
                                    <div>
                                      <div className="text-xs text-muted-foreground mb-1">
                                        Sumar 1:
                                      </div>
                                      <div className="font-mono text-sm bg-background p-2 rounded border">
                                        {(() => {
                                          const inverted = binary
                                            .split("")
                                            .map((bit) =>
                                              bit === "0" ? "1" : "0"
                                            )
                                            .join("");
                                          const decimalValue =
                                            parseInt(inverted, 2) + 1;
                                          const twosComplementBinary =
                                            decimalValue.toString(2);
                                          return (
                                            twosComplementBinary
                                              .match(/.{1,4}/g)
                                              ?.join(" ") ||
                                            twosComplementBinary
                                          );
                                        })()}
                                      </div>
                                    </div>

                                    {/* Convert to decimal */}
                                    <div>
                                      <div className="text-xs text-muted-foreground mb-1">
                                        Convertir a decimal y agregar signo
                                        negativo:
                                      </div>
                                      <div className="font-mono text-lg font-medium">
                                        {(() => {
                                          const inverted = binary
                                            .split("")
                                            .map((bit) =>
                                              bit === "0" ? "1" : "0"
                                            )
                                            .join("");
                                          const decimalValue =
                                            parseInt(inverted, 2) + 1;
                                          return (
                                            "-" + decimalValue.toLocaleString()
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Final Result */}
                              <div className="border rounded p-3 bg-muted/30">
                                <div className="text-sm font-medium mb-2">
                                  Resultado complemento a dos:
                                </div>
                                <div className="text-lg font-mono font-medium">
                                  {isNegative ? (
                                    <span>
                                      {(() => {
                                        const inverted = binary
                                          .split("")
                                          .map((bit) =>
                                            bit === "0" ? "1" : "0"
                                          )
                                          .join("");
                                        const decimalValue =
                                          parseInt(inverted, 2) + 1;
                                        return (
                                          "-" + decimalValue.toLocaleString()
                                        );
                                      })()}
                                    </span>
                                  ) : (
                                    <span>
                                      {parseInt(binary, 2).toLocaleString()}{" "}
                                      (positivo)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

              {/* Hex to Octal */}
              {result.inputBase === "hexadecimal" &&
                result.outputBase === "octal" && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-2">
                      Conversión octal
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Convertir cada dígito hexadecimal a 4 dígitos binarios,
                      luego agrupar en grupos de 3 bits para octal:
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border text-xs">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-2 py-1 border">
                              Dígito hexadecimal
                            </th>
                            <th className="px-2 py-1 border">
                              Binario (4 bits)
                            </th>
                            <th className="px-2 py-1 border">
                              Agrupación octal
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-2 py-1 border text-center font-mono">
                              {result.input.split("").join(" ")}
                            </td>
                            <td className="px-2 py-1 border text-center font-mono">
                              {result.input
                                .split("")
                                .map((d) =>
                                  parseInt(d, 16).toString(2).padStart(4, "0")
                                )
                                .join(" ")}
                            </td>
                            <td className="px-2 py-1 border text-center font-mono">
                              {result.input
                                .split("")
                                .map((d) =>
                                  parseInt(d, 16).toString(2).padStart(4, "0")
                                )
                                .join("")
                                .match(/.{1,3}/g)
                                ?.join(" ") || ""}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 text-xs">
                      <div className="text-muted-foreground">Resultado:</div>
                      <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
                        {result.input} → binario → {result.output}
                      </code>
                    </div>
                  </div>
                )}

              {/* Endian information for octal conversions */}
              {result.inputBase === "decimal" &&
                result.outputBase === "octal" && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-3">
                      Cálculo de Endianness
                    </div>

                    {/* Step-by-step endianness calculation for octal */}
                    <div className="mb-4">
                      <div className="text-xs text-muted-foreground mb-2">
                        Pasos para calcular la representación en memoria:
                      </div>
                      <div className="space-y-2 text-xs">
                        {(() => {
                          const octalValue = result.isNegative
                            ? result.magnitude || result.output
                            : result.magnitude || result.output;
                          const octalLength = (octalValue || "0").length;
                          // For octal, we need to convert to hex first for endianness
                          const decimalValue = parseInt(octalValue, 8);
                          const hexValue = decimalValue
                            .toString(16)
                            .toUpperCase();
                          const hexLength = Math.max(8, hexValue.length); // Use at least 32-bit
                          const paddedHex = hexValue.padStart(hexLength, "0");
                          const numBytes = hexLength / 2;

                          return (
                            <>
                              <div className="flex justify-between items-center">
                                <span>1. Valor decimal original:</span>
                                <code className="font-mono bg-background px-2 py-1 rounded border">
                                  {result.input}
                                </code>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>2. Convertir a octal:</span>
                                <code className="font-mono bg-background px-2 py-1 rounded border">
                                  {octalValue}
                                </code>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>3. Convertir octal a decimal:</span>
                                <code className="font-mono bg-background px-2 py-1 rounded border">
                                  {decimalValue}
                                </code>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>4. Convertir decimal a hexadecimal:</span>
                                <code className="font-mono bg-background px-2 py-1 rounded border">
                                  {hexValue}
                                </code>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>
                                  5. Rellenar a {hexLength} caracteres:
                                </span>
                                <code className="font-mono bg-background px-2 py-1 rounded border">
                                  {paddedHex}
                                </code>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>6. Dividir en {numBytes} bytes:</span>
                                <code className="font-mono bg-background px-2 py-1 rounded border">
                                  {Array.from({ length: numBytes }, (_, i) =>
                                    paddedHex.slice(i * 2, (i + 1) * 2)
                                  ).join(" ")}
                                </code>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>7. Little Endian (LSB primero):</span>
                                <code className="font-mono bg-background px-2 py-1 rounded border">
                                  {Array.from({ length: numBytes }, (_, i) =>
                                    paddedHex.slice(i * 2, (i + 1) * 2)
                                  )
                                    .reverse()
                                    .join(" ")}
                                </code>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>8. Big Endian (MSB primero):</span>
                                <code className="font-mono bg-background px-2 py-1 rounded border">
                                  {Array.from({ length: numBytes }, (_, i) =>
                                    paddedHex.slice(i * 2, (i + 1) * 2)
                                  ).join(" ")}
                                </code>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="text-sm font-medium mb-3">
                      Representación en memoria (Endianness)
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      {result.isNegative
                        ? "Basado en complemento a dos (32 bits)"
                        : "Representación directa en octal convertida a hexadecimal"}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="font-medium mb-2">Little Endian</div>
                        <div className="overflow-x-auto">
                          <table className="w-full border text-xs">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="px-2 py-1 border">Address</th>
                                {Array.from({ length: 4 }, (_, i) => (
                                  <th
                                    key={i}
                                    className="px-2 py-1 border text-center"
                                  >
                                    {i}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-2 py-1 border font-medium">
                                  Data
                                </td>
                                {(() => {
                                  const octalValue =
                                    result.magnitude || result.output;
                                  const decimalValue = parseInt(octalValue, 8);
                                  const hexValue = decimalValue
                                    .toString(16)
                                    .toUpperCase()
                                    .padStart(8, "0");
                                  const bytes = [];
                                  for (let i = 0; i < 4; i++) {
                                    const byte = hexValue.slice(
                                      i * 2,
                                      (i + 1) * 2
                                    );
                                    bytes.push(byte);
                                  }
                                  return bytes.reverse().map((byte, i) => (
                                    <td
                                      key={i}
                                      className="px-2 py-1 border text-center font-mono"
                                    >
                                      {byte}
                                    </td>
                                  ));
                                })()}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-2">Big Endian</div>
                        <div className="overflow-x-auto">
                          <table className="w-full border text-xs">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="px-2 py-1 border">Address</th>
                                {Array.from({ length: 4 }, (_, i) => (
                                  <th
                                    key={i}
                                    className="px-2 py-1 border text-center"
                                  >
                                    {i}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-2 py-1 border font-medium">
                                  Data
                                </td>
                                {(() => {
                                  const octalValue =
                                    result.magnitude || result.output;
                                  const decimalValue = parseInt(octalValue, 8);
                                  const hexValue = decimalValue
                                    .toString(16)
                                    .toUpperCase()
                                    .padStart(8, "0");
                                  const bytes = [];
                                  for (let i = 0; i < 4; i++) {
                                    const byte = hexValue.slice(
                                      i * 2,
                                      (i + 1) * 2
                                    );
                                    bytes.push(byte);
                                  }
                                  return bytes.map((byte, i) => (
                                    <td
                                      key={i}
                                      className="px-2 py-1 border text-center font-mono"
                                    >
                                      {byte}
                                    </td>
                                  ));
                                })()}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Other conversions - fallback to original format */}
              {!(
                (result.inputBase === "decimal" &&
                  ["octal", "hexadecimal", "binary"].includes(
                    result.outputBase
                  )) ||
                (result.inputBase === "binary" &&
                  ["decimal", "octal", "hexadecimal"].includes(
                    result.outputBase
                  )) ||
                (result.inputBase === "octal" &&
                  ["binary", "decimal", "hexadecimal"].includes(
                    result.outputBase
                  )) ||
                (result.inputBase === "hexadecimal" &&
                  ["binary", "decimal", "octal"].includes(result.outputBase))
              ) && (
                <>
                  {/* Integer division table */}
                  {intSteps.length > 1 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-2">
                        Parte entera (÷{getBaseNumber(result.outputBase)})
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border text-xs">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="px-2 py-1 border">Paso</th>
                              <th className="px-2 py-1 border">Cociente</th>
                              <th className="px-2 py-1 border">Bit/Dígito</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-2 py-1 border text-center font-mono">
                                0
                              </td>
                              <td className="px-2 py-1 border text-center font-mono">
                                {initialInt}
                              </td>
                              <td className="px-2 py-1 border text-center font-mono">
                                ÷{getBaseNumber(result.outputBase)}
                              </td>
                            </tr>
                            {intSteps.slice(1).map((step, i) => (
                              <tr key={i}>
                                <td className="px-2 py-1 border text-center font-mono">
                                  {i + 1}
                                </td>
                                <td className="px-2 py-1 border text-center font-mono">
                                  {step.quotient}
                                </td>
                                <td className="px-2 py-1 border text-center font-mono">
                                  {step.remainder}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-3 text-xs">
                        <div className="text-muted-foreground">
                          Resultado (de abajo hacia arriba):
                        </div>
                        <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
                          {intBinaryMagnitude}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* Fractional multiplication table */}
                  {fracSteps.length > 1 && (
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Parte fraccional (×{getBaseNumber(result.outputBase)})
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border text-xs">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="px-2 py-1 border">Paso</th>
                              <th className="px-2 py-1 border">Valor</th>
                              <th className="px-2 py-1 border">Bit/Dígito</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-2 py-1 border text-center font-mono">
                                0
                              </td>
                              <td className="px-2 py-1 border text-center font-mono">
                                {initialFrac.toFixed(6)}
                              </td>
                              <td className="px-2 py-1 border text-center font-mono">
                                ×{getBaseNumber(result.outputBase)}
                              </td>
                            </tr>
                            {fracSteps.slice(1).map((step, i) => (
                              <tr key={i}>
                                <td className="px-2 py-1 border text-center font-mono">
                                  {i + 1}
                                </td>
                                <td className="px-2 py-1 border text-center font-mono">
                                  {step.value.toFixed(6)}
                                </td>
                                <td className="px-2 py-1 border text-center font-mono">
                                  {step.bit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-3 text-xs">
                        <div className="text-muted-foreground">
                          Resultado (de arriba hacia abajo):
                        </div>
                        <code className="font-mono border rounded px-2 py-1 inline-block mt-1">
                          {fracBitsSeq}
                        </code>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Step 3: Signed representation (if applicable) */}
          {/* Skip Step 3 for octal to binary conversions */}
          {!(
            result.inputBase === "octal" && result.outputBase === "binary"
          ) && (
            <div className="border rounded-lg">
              <div className="px-4 py-3 border-b bg-muted/50">
                <h3 className="text-sm font-medium">
                  3. Representación con signo
                </h3>
              </div>
              <div className="p-4">
                {result.inputBase === "binary" || result.outputBase === "binary"
                  ? // Binary conversions - show complement steps
                    (() => {
                      // For binary conversions, check both result.isNegative and manual negative signs
                      const hasManualNegative =
                        result.inputBase === "binary" &&
                        result.input.trim().startsWith("-");
                      const effectiveIsNegative =
                        isNegative || hasManualNegative;

                      // If there's a manual negative sign, don't show two's complement (it's already signed)
                      if (hasManualNegative) {
                        return (
                          <div className="text-xs text-muted-foreground">
                            No aplica complemento a dos - ya tiene signo
                            explícito.
                          </div>
                        );
                      }

                      return effectiveIsNegative ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>Magnitud binaria</span>
                            <code className="font-mono bg-background px-2 py-1 rounded border">
                              {formatBinaryDisplay(
                                result.magnitude || combinedMagnitude
                              )}
                            </code>
                          </div>
                          <div className="flex justify-between">
                            <span>Complemento a 1 (invertir bits)</span>
                            <code className="font-mono bg-background px-2 py-1 rounded border">
                              {formatBinaryDisplay(
                                (result.magnitude || combinedMagnitude)
                                  .replace(".", "")
                                  .split("")
                                  .map((bit) => (bit === "0" ? "1" : "0"))
                                  .join("")
                                  .padStart(
                                    (
                                      result.signedResult || result.output
                                    ).replace(".", "").length,
                                    "1"
                                  )
                              )}
                            </code>
                          </div>
                          <div className="flex justify-between">
                            <span>Complemento a 2 (+1)</span>
                            <code className="font-mono bg-background px-2 py-1 rounded border">
                              {formatBinaryDisplay(
                                result.signedResult || result.output
                              )}
                            </code>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          No aplica para valores positivos.
                        </div>
                      );
                    })()
                  : // Non-binary conversions - show sign handling
                    (() => {
                      // For non-binary conversions, check for negative signs in input or output
                      const effectiveIsNegative =
                        isNegative ||
                        result.input.trim().startsWith("-") ||
                        (result.output &&
                          typeof result.output === "string" &&
                          result.output.startsWith("-"));
                      return effectiveIsNegative ? (
                        <div className="space-y-3 text-xs">
                          {/* Direct hex with negative sign */}
                          <div>
                            <div className="text-muted-foreground mb-2">
                              Representación directa con signo negativo:
                            </div>
                            <code className="font-mono bg-background px-2 py-1 rounded border block">
                              {result.output}
                            </code>
                          </div>

                          {/* Two's complement (if enabled) */}
                          {showSignedTwosComplement &&
                            result.twosComplementHex && (
                              <div>
                                <div className="text-muted-foreground mb-2">
                                  Representación en complemento a dos:
                                </div>
                                <code className="font-mono bg-background px-2 py-1 rounded border block">
                                  {result.twosComplementHex
                                    ? result.twosComplementHex
                                        .match(/.{1,2}/g)
                                        ?.join(" ") || result.twosComplementHex
                                    : ""}
                                </code>
                              </div>
                            )}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          No aplica para valores positivos.
                        </div>
                      );
                    })()}
              </div>
            </div>
          )}

          {/* Step 4: Final Result */}
          <div className="border rounded-lg">
            <div className="px-4 py-3 border-b bg-muted/50">
              <h3 className="text-sm font-medium">4. Resultado final</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3 text-sm">
                {/* Input */}
                <div className="border rounded p-2">
                  <div className="text-muted-foreground">Entrada</div>
                  <div className="font-mono">{result.input}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Base {getBaseName(result.inputBase)}
                  </div>
                </div>

                {/* Results for binary to decimal - separate cards */}
                {result.inputBase === "binary" &&
                  result.outputBase === "decimal" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border rounded p-2">
                        <div className="text-muted-foreground">
                          Resultado (sin signo)
                        </div>
                        <div className="font-mono">
                          {(() => {
                            const hasManualNegative = result.input
                              .trim()
                              .startsWith("-");
                            const cleanBinary = result.input
                              .replace(/\s/g, "")
                              .replace(/^-/, "");
                            const unsignedValue = parseInt(cleanBinary, 2);
                            return hasManualNegative
                              ? -unsignedValue
                              : unsignedValue;
                          })()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Base {getBaseName(result.outputBase)}
                        </div>
                      </div>
                      <div className="border rounded p-2">
                        <div className="text-muted-foreground">
                          Resultado (con signo)
                        </div>
                        <div className="font-mono">
                          {(() => {
                            const hasManualNegative = result.input
                              .trim()
                              .startsWith("-");
                            const cleanBinary = result.input
                              .replace(/\s/g, "")
                              .replace(/^-/, "");
                            const unsignedValue = parseInt(cleanBinary, 2);
                            const bitLength = cleanBinary.length;
                            const signedValue =
                              unsignedValue >= Math.pow(2, bitLength - 1)
                                ? unsignedValue - Math.pow(2, bitLength)
                                : unsignedValue;
                            return hasManualNegative
                              ? -unsignedValue
                              : signedValue;
                          })()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Base {getBaseName(result.outputBase)}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Single result for non-binary-to-decimal conversions */}
                {!(
                  result.inputBase === "binary" &&
                  result.outputBase === "decimal"
                ) && (
                  <div className="border rounded p-2">
                    <div className="text-muted-foreground">Resultado</div>
                    {/* Direct decimal result - separate container */}
                    <div className="border rounded p-3 mb-3">
                      <div className="text-sm font-medium mb-2">
                        Resultado decimal directo
                      </div>
                      <div className="font-mono text-lg">
                        {(() => {
                          if (
                            result.inputBase === "binary" &&
                            result.outputBase === "hexadecimal"
                          ) {
                            // Handle binary to hex conversion properly
                            let cleanBinary = result.input.replace(/\s/g, "");
                            const hasNegativeSign = cleanBinary.startsWith("-");
                            if (hasNegativeSign) {
                              cleanBinary = cleanBinary.substring(1);
                            }

                            while (cleanBinary.length % 4 !== 0) {
                              cleanBinary = "0" + cleanBinary;
                            }

                            const groups = [];
                            for (let i = 0; i < cleanBinary.length; i += 4) {
                              groups.push(cleanBinary.slice(i, i + 4));
                            }

                            const hexChars = groups.map((group) => {
                              const decimal = parseInt(group, 2);
                              return "0123456789ABCDEF"[decimal];
                            });

                            // Group hex chars in pairs (2 chars per group)
                            const hexGroups = [];
                            for (let i = 0; i < hexChars.length; i += 2) {
                              hexGroups.push(hexChars.slice(i, i + 2).join(""));
                            }

                            const hexResult = hexGroups.join(" ");
                            return hasNegativeSign
                              ? "-" + hexResult
                              : hexResult;
                          }
                          return result.output;
                        })()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Conversión directa sin interpretación de signo
                      </div>
                    </div>

                    {/* Signed 2's complement for hex to decimal - separate container */}
                    {result.inputBase === "hexadecimal" &&
                      result.outputBase === "decimal" &&
                      !result.input.startsWith("-") && (
                        <div className="border rounded p-3">
                          <div className="text-sm font-medium mb-2">
                            Interpretación complemento a dos (signed)
                          </div>
                          <div className="font-mono text-lg">
                            {(() => {
                              const hasExplicitNegative =
                                result.input.startsWith("-");
                              const cleanHex = hasExplicitNegative
                                ? result.input.slice(1).replace(/\s/g, "")
                                : result.input.replace(/\s/g, "");

                              // Convert hex to binary
                              let binary = "";
                              for (let i = 0; i < cleanHex.length; i++) {
                                const decimal = parseInt(cleanHex[i], 16);
                                const binary4bit = decimal
                                  .toString(2)
                                  .padStart(4, "0");
                                binary += binary4bit;
                              }

                              const msb = binary[0];
                              const isNegative = msb === "1";

                              if (isNegative) {
                                const inverted = binary
                                  .split("")
                                  .map((bit) => (bit === "0" ? "1" : "0"))
                                  .join("");
                                const decimalValue = parseInt(inverted, 2) + 1;
                                return "-" + decimalValue.toLocaleString();
                              } else {
                                return (
                                  parseInt(binary, 2).toLocaleString() +
                                  " (positivo)"
                                );
                              }
                            })()}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Basado en el bit más significativo (MSB)
                          </div>
                        </div>
                      )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Base {getBaseName(result.outputBase)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Flags Table - Only for binary conversions */}
            {result.flags &&
              showFlags &&
              (result.inputBase === "binary" ||
                result.outputBase === "binary") && (
                <div className="border rounded-lg">
                  <div className="px-4 py-3 border-b bg-muted/50">
                    <h3 className="text-sm font-medium">Banderas (Flags)</h3>
                  </div>
                  <div className="p-4">
                    {result.inputBase === "binary" &&
                    result.outputBase === "decimal" ? (
                      // Show flags for both unsigned and signed interpretations
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Interpretación sin signo:
                            {(() => {
                              const hasManualNegative = result.input
                                .trim()
                                .startsWith("-");
                              const cleanBinary = result.input
                                .replace(/\s/g, "")
                                .replace(/^-/, "");
                              const unsignedValue = parseInt(cleanBinary, 2);
                              const finalUnsigned = hasManualNegative
                                ? -unsignedValue
                                : unsignedValue;
                              return ` (${finalUnsigned})`;
                            })()}
                          </h4>
                          <table className="w-full border border-border text-sm">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="px-2 py-1 text-left border">
                                  Flag
                                </th>
                                <th className="px-2 py-1 text-left border">
                                  Descripción
                                </th>
                                <th className="px-2 py-1 text-left border">
                                  Valor
                                </th>
                                <th className="px-2 py-1 text-left border">
                                  Explicación
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-2 py-1 border font-mono">
                                  Z
                                </td>
                                <td className="px-2 py-1 border">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const finalUnsigned = hasManualNegative
                                      ? -unsignedValue
                                      : unsignedValue;
                                    return finalUnsigned === 0
                                      ? "Resultado = 0"
                                      : "Resultado ≠ 0";
                                  })()}
                                </td>
                                <td className="px-2 py-1 border font-mono">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const finalUnsigned = hasManualNegative
                                      ? -unsignedValue
                                      : unsignedValue;
                                    return finalUnsigned === 0 ? "1" : "0";
                                  })()}
                                </td>
                                <td className="px-2 py-1 border">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const finalUnsigned = hasManualNegative
                                      ? -unsignedValue
                                      : unsignedValue;
                                    return finalUnsigned === 0
                                      ? "El resultado es cero"
                                      : "El resultado no es cero";
                                  })()}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-2 py-1 border font-mono">
                                  N
                                </td>
                                <td className="px-2 py-1 border">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const finalUnsigned = hasManualNegative
                                      ? -unsignedValue
                                      : unsignedValue;
                                    return finalUnsigned < 0
                                      ? "Resultado negativo"
                                      : "Resultado positivo";
                                  })()}
                                </td>
                                <td className="px-2 py-1 border font-mono">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const finalUnsigned = hasManualNegative
                                      ? -unsignedValue
                                      : unsignedValue;
                                    return finalUnsigned < 0 ? "1" : "0";
                                  })()}
                                </td>
                                <td className="px-2 py-1 border">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const finalUnsigned = hasManualNegative
                                      ? -unsignedValue
                                      : unsignedValue;
                                    return finalUnsigned < 0
                                      ? "El número es negativo"
                                      : "El número es positivo";
                                  })()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Interpretación con signo:
                            {(() => {
                              const hasManualNegative = result.input
                                .trim()
                                .startsWith("-");
                              const cleanBinary = result.input
                                .replace(/\s/g, "")
                                .replace(/^-/, "");
                              const unsignedValue = parseInt(cleanBinary, 2);
                              const bitLength = cleanBinary.length;
                              const signedValue =
                                unsignedValue >= Math.pow(2, bitLength - 1)
                                  ? unsignedValue - Math.pow(2, bitLength)
                                  : unsignedValue;
                              const finalSigned = hasManualNegative
                                ? -unsignedValue
                                : signedValue;
                              return ` (${finalSigned})`;
                            })()}
                          </h4>
                          <table className="w-full border border-border text-sm">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="px-2 py-1 text-left border">
                                  Flag
                                </th>
                                <th className="px-2 py-1 text-left border">
                                  Descripción
                                </th>
                                <th className="px-2 py-1 text-left border">
                                  Valor
                                </th>
                                <th className="px-2 py-1 text-left border">
                                  Explicación
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-2 py-1 border font-mono">
                                  Z
                                </td>
                                <td className="px-2 py-1 border">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const bitLength = cleanBinary.length;
                                    const signedValue =
                                      unsignedValue >=
                                      Math.pow(2, bitLength - 1)
                                        ? unsignedValue - Math.pow(2, bitLength)
                                        : unsignedValue;
                                    const finalSigned = hasManualNegative
                                      ? -unsignedValue
                                      : signedValue;
                                    return finalSigned === 0
                                      ? "Resultado = 0"
                                      : "Resultado ≠ 0";
                                  })()}
                                </td>
                                <td className="px-2 py-1 border font-mono">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const bitLength = cleanBinary.length;
                                    const signedValue =
                                      unsignedValue >=
                                      Math.pow(2, bitLength - 1)
                                        ? unsignedValue - Math.pow(2, bitLength)
                                        : unsignedValue;
                                    const finalSigned = hasManualNegative
                                      ? -unsignedValue
                                      : signedValue;
                                    return finalSigned === 0 ? "1" : "0";
                                  })()}
                                </td>
                                <td className="px-2 py-1 border">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const bitLength = cleanBinary.length;
                                    const signedValue =
                                      unsignedValue >=
                                      Math.pow(2, bitLength - 1)
                                        ? unsignedValue - Math.pow(2, bitLength)
                                        : unsignedValue;
                                    const finalSigned = hasManualNegative
                                      ? -unsignedValue
                                      : signedValue;
                                    return finalSigned === 0
                                      ? "El resultado es cero"
                                      : "El resultado no es cero";
                                  })()}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-2 py-1 border font-mono">
                                  N
                                </td>
                                <td className="px-2 py-1 border">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const bitLength = cleanBinary.length;
                                    const signedValue =
                                      unsignedValue >=
                                      Math.pow(2, bitLength - 1)
                                        ? unsignedValue - Math.pow(2, bitLength)
                                        : unsignedValue;
                                    const finalSigned = hasManualNegative
                                      ? -unsignedValue
                                      : signedValue;
                                    return finalSigned < 0
                                      ? "Resultado negativo"
                                      : "Resultado positivo";
                                  })()}
                                </td>
                                <td className="px-2 py-1 border font-mono">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const bitLength = cleanBinary.length;
                                    const signedValue =
                                      unsignedValue >=
                                      Math.pow(2, bitLength - 1)
                                        ? unsignedValue - Math.pow(2, bitLength)
                                        : unsignedValue;
                                    const finalSigned = hasManualNegative
                                      ? -unsignedValue
                                      : signedValue;
                                    return finalSigned < 0 ? "1" : "0";
                                  })()}
                                </td>
                                <td className="px-2 py-1 border">
                                  {(() => {
                                    const hasManualNegative = result.input
                                      .trim()
                                      .startsWith("-");
                                    const cleanBinary = result.input
                                      .replace(/\s/g, "")
                                      .replace(/^-/, "");
                                    const unsignedValue = parseInt(
                                      cleanBinary,
                                      2
                                    );
                                    const bitLength = cleanBinary.length;
                                    const signedValue =
                                      unsignedValue >=
                                      Math.pow(2, bitLength - 1)
                                        ? unsignedValue - Math.pow(2, bitLength)
                                        : unsignedValue;
                                    const finalSigned = hasManualNegative
                                      ? -unsignedValue
                                      : signedValue;
                                    return finalSigned < 0
                                      ? "El número es negativo"
                                      : "El número es positivo";
                                  })()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      // Original flags table for non-binary-to-decimal conversions
                      <table className="w-full border border-border text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-2 py-1 text-left border">Flag</th>
                            <th className="px-2 py-1 text-left border">
                              Descripción
                            </th>
                            <th className="px-2 py-1 text-left border">
                              Valor
                            </th>
                            <th className="px-2 py-1 text-left border">
                              Explicación
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-2 py-1 border font-mono">Z</td>
                            <td className="px-2 py-1 border">
                              {result.flags.zero
                                ? "Resultado = 0"
                                : "Resultado ≠ 0"}
                            </td>
                            <td className="px-2 py-1 border font-mono">
                              {result.flags.zero ? "1" : "0"}
                            </td>
                            <td className="px-2 py-1 border">
                              {result.flags.zero
                                ? "El resultado es cero"
                                : "El resultado no es cero"}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2 py-1 border font-mono">N</td>
                            <td className="px-2 py-1 border">
                              {result.flags.sign
                                ? "Resultado negativo"
                                : "Resultado positivo"}
                            </td>
                            <td className="px-2 py-1 border font-mono">
                              {result.flags.sign ? "1" : "0"}
                            </td>
                            <td className="px-2 py-1 border">
                              {result.flags.sign
                                ? "El número es negativo"
                                : "El número es positivo"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
