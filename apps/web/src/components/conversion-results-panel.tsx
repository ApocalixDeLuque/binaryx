"use client";

import BigNumber from "bignumber.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import type { ConversionResult, BaseType } from "@/lib/base-conversions";
import {
  getBaseName,
  getBaseNumber,
  formatDisplayValue,
} from "@/lib/base-conversions";
import { DecimalToBinary } from "./conversions/decimal-to-binary/index";
import { BinaryToOctalConversion } from "./conversions/binary-to-octal";
import { OctalToBinaryConversion } from "./conversions/octal-to-binary";
import { BinaryToHexadecimalConversion } from "./conversions/binary-to-hexadecimal";
import { StepHeader } from "./ui/step-header";

interface ConversionResultsPanelProps {
  result: ConversionResult;
  showFlags?: boolean;
  showSignedTwosComplement?: boolean;
}

export function ConversionResultsPanel({
  result,
  showFlags = true,
  showSignedTwosComplement = true,
}: ConversionResultsPanelProps) {
  /**
   * Determine if step 3 (Signed Representation) should be shown
   * Step 3 is only shown when:
   * 1. There's no explicit negative sign in the input (no manual negative)
   * 2. We're converting TO binary (because two's complement is for binary representation)
   */
  const shouldShowStep3 = (): boolean => {
    const hasExplicitNegative = result.input.trim().startsWith("-");
    const convertingToBinary = result.outputBase === "binary";
    return !hasExplicitNegative && convertingToBinary;
  };

  /**
   * Get the step number for the final result step
   * If step 3 is not shown, then step 4 becomes step 3
   */
  const getFinalResultStepNumber = (): number => {
    return shouldShowStep3() ? 4 : 3;
  };

  /**
   * Export helper functions for testing
   */
  const testHelpers = {
    shouldShowStep3: (result: ConversionResult) => {
      const hasExplicitNegative = result.input.trim().startsWith("-");
      const convertingToBinary = result.outputBase === "binary";
      return !hasExplicitNegative && convertingToBinary;
    },
    getFinalResultStepNumber: (result: ConversionResult) => {
      const hasExplicitNegative = result.input.trim().startsWith("-");
      const convertingToBinary = result.outputBase === "binary";
      const shouldShowStep3 = !hasExplicitNegative && convertingToBinary;
      return shouldShowStep3 ? 4 : 3;
    },
  };
  if (!result) {
    return (
      <Card className="w-full">
        <CardContent className="p-12">
          <div className="text-center text-muted-foreground">
            No hay resultados para mostrar
          </div>
        </CardContent>
      </Card>
    );
  }

  const isNegative = result.isNegative || false;
  const intSteps = result.integerSteps || [];
  const fracSteps = result.fractionalSteps || [];
  const initialInt =
    intSteps.length > 1
      ? typeof intSteps[1].quotient === "object"
        ? intSteps[1].quotient.toString()
        : intSteps[1].quotient
      : 0;
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

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ChevronDown className="h-5 w-5" />
          Resultados de la Conversión: {getBaseName(result.inputBase)} →{" "}
          {getBaseName(result.outputBase)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Result Summary */}
        <div className="p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0 flex-1">
                <div className="text-sm text-muted-foreground">Entrada</div>
                <div className="font-mono text-sm break-all overflow-wrap-anywhere max-w-full whitespace-pre-wrap">
                  {result.input}
                </div>
                <div className="text-xs text-muted-foreground">
                  Base {getBaseName(result.inputBase)}
                </div>
              </div>
              <div className="text-2xl text-muted-foreground flex-shrink-0">
                →
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-muted-foreground">Resultado</div>
                <div className="font-mono text-sm break-all overflow-wrap-anywhere max-w-full whitespace-pre-wrap">
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

        {/* Step 1: Input Analysis */}
        <div className="border rounded-lg">
          <StepHeader stepNumber={1} title="Análisis de entrada" />
          <div className="p-4">
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="border rounded p-2">
                  <div className="text-muted-foreground">
                    Valor {getBaseName(result.inputBase).toLowerCase()}
                  </div>
                  <div className="font-mono text-sm break-all overflow-wrap-anywhere max-w-full whitespace-pre-wrap bg-white dark:bg-gray-800 p-2 rounded border">
                    {result.input}
                  </div>
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

              {/* For binary to decimal - show both unsigned and signed values */}
              {result.inputBase === "binary" &&
                result.outputBase === "decimal" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border rounded p-2">
                      <div className="text-muted-foreground">
                        Valor decimal (sin signo)
                      </div>
                      <div className="font-mono text-sm break-all overflow-wrap-anywhere max-w-full whitespace-pre-wrap bg-white dark:bg-gray-800 p-2 rounded border">
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
                      <div className="font-mono text-sm break-all overflow-wrap-anywhere max-w-full whitespace-pre-wrap bg-white dark:bg-gray-800 p-2 rounded border">
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
                result.inputBase === "binary" && result.outputBase === "decimal"
              ) && (
                <div className="border rounded p-2">
                  <div className="text-muted-foreground">
                    Valor {getBaseName(result.outputBase).toLowerCase()}
                  </div>
                  <div className="border rounded p-3 mb-3">
                    <div className="text-sm font-medium mb-2">
                      Resultado directo
                    </div>
                    <div className="font-mono text-sm break-all overflow-wrap-anywhere max-w-full whitespace-pre-wrap bg-white dark:bg-gray-800 p-3 rounded border">
                      {(() => {
                        if (
                          result.inputBase === "binary" &&
                          result.outputBase === "hexadecimal"
                        ) {
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
                    <div className="text-xs text-muted-foreground mt-1">
                      Conversión directa sin interpretación de signo
                    </div>
                  </div>
                </div>
              )}

              {/* Flags section - only show for binary conversions */}
              {result.flags && showFlags && result.outputBase === "binary" && (
                <>
                  <div className="border rounded p-2">
                    <div className="text-muted-foreground">Flag Zero</div>
                    <div className="font-mono">
                      {result.flags.zero ? "1" : "0"}
                    </div>
                  </div>
                  <div className="border rounded p-2">
                    <div className="text-muted-foreground">Flag Signo</div>
                    <div className="font-mono">
                      {result.flags.sign ? "1" : "0"}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Conversion Process */}
        <div className="border rounded-lg">
          <StepHeader
            stepNumber={2}
            title={`Conversión ${getBaseName(result.inputBase)} → ${getBaseName(
              result.outputBase
            )}`}
          />
          <div className="p-4">
            {/* Use dedicated components for different conversions */}
            {result.inputBase === "decimal" &&
              result.outputBase === "binary" && (
                <DecimalToBinary
                  result={result}
                  input={result.input}
                  error={null}
                  manualNegativeWarning={null}
                  onInputChange={() => {}}
                  onClear={() => {}}
                  onCopy={() => {}}
                  copySuccess={false}
                />
              )}

            {result.inputBase === "binary" && result.outputBase === "octal" && (
              <BinaryToOctalConversion result={result} />
            )}

            {result.inputBase === "octal" && result.outputBase === "binary" && (
              <OctalToBinaryConversion result={result} />
            )}

            {result.inputBase === "binary" &&
              result.outputBase === "hexadecimal" && (
                <BinaryToHexadecimalConversion result={result} />
              )}

            {/* Other decimal conversions (octal/hex) with original logic */}
            {result.inputBase === "decimal" &&
              ["octal", "hexadecimal"].includes(result.outputBase) &&
              intSteps.length > 1 && (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-3">
                    Pasos de cálculo para conversión{" "}
                    {getBaseName(result.inputBase)} →{" "}
                    {getBaseName(result.outputBase)}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Dividir por la base {getBaseNumber(result.outputBase)} para
                    obtener los dígitos desde los restos:
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
                              (
                              {typeof step.quotient === "object"
                                ? step.quotient.toString()
                                : step.quotient}
                              )/
                              {getBaseNumber(result.outputBase)}
                            </td>
                            <td className="px-2 py-1 border text-center font-mono">
                              {typeof step.quotient === "object"
                                ? step.quotient
                                    .div(getBaseNumber(result.outputBase))
                                    .integerValue(BigNumber.ROUND_DOWN)
                                    .toString()
                                : Math.floor(
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
                </div>
              )}

            {/* Fallback for other conversions */}
            {!(
              (result.inputBase === "decimal" &&
                ["octal", "hexadecimal", "binary"].includes(
                  result.outputBase
                )) ||
              (result.inputBase === "binary" &&
                ["decimal", "octal", "hexadecimal"].includes(result.outputBase))
            ) && (
              <>
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
                                {typeof step.quotient === "object"
                                  ? step.quotient.toString()
                                  : step.quotient}
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
              </>
            )}
          </div>
        </div>

        {/* Step 3: Signed Representation (Conditional) */}
        {shouldShowStep3() && (
          <div className="border rounded-lg">
            <StepHeader stepNumber={3} title="Representación con signo" />
            <div className="p-4">
              {result.inputBase === "binary" || result.outputBase === "binary"
                ? (() => {
                    const hasManualNegative =
                      result.inputBase === "binary" &&
                      result.input.trim().startsWith("-");
                    const effectiveIsNegative = isNegative || hasManualNegative;

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
                : (() => {
                    const effectiveIsNegative =
                      isNegative ||
                      result.input.trim().startsWith("-") ||
                      (result.output &&
                        typeof result.output === "string" &&
                        result.output.startsWith("-"));
                    return effectiveIsNegative ? (
                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="text-muted-foreground mb-2">
                            Representación directa con signo negativo:
                          </div>
                          <code className="font-mono bg-background px-2 py-1 rounded border block">
                            {result.output}
                          </code>
                        </div>

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

        {/* Step 4/3: Final Result */}
        <div className="border rounded-lg">
          <StepHeader
            stepNumber={getFinalResultStepNumber()}
            title="Resultado final"
          />
          <div className="p-4">
            <div className="space-y-3 text-sm">
              <div className="border rounded p-2">
                <div className="text-muted-foreground">Entrada</div>
                <div className="font-mono">{result.input}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Base {getBaseName(result.inputBase)}
                </div>
              </div>

              <div className="border rounded p-2">
                <div className="text-muted-foreground">Resultado</div>
                <div className="border rounded p-3 mb-3">
                  <div className="text-sm font-medium mb-2">
                    Resultado directo
                  </div>
                  <div className="font-mono text-lg">
                    {(() => {
                      if (
                        result.inputBase === "binary" &&
                        result.outputBase === "hexadecimal"
                      ) {
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
                  <div className="text-xs text-muted-foreground mt-1">
                    Base {getBaseName(result.outputBase)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flags Table - Only for binary conversions */}
        {result.flags && showFlags && result.outputBase === "binary" && (
          <div className="border rounded-lg">
            <div className="px-4 py-3 border-b bg-muted/50">
              <h3 className="text-sm font-medium">Banderas (Flags)</h3>
            </div>
            <div className="p-4">
              <table className="w-full border border-border text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-2 py-1 text-left border">Flag</th>
                    <th className="px-2 py-1 text-left border">Descripción</th>
                    <th className="px-2 py-1 text-left border">Valor</th>
                    <th className="px-2 py-1 text-left border">Explicación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-1 border font-mono">Z</td>
                    <td className="px-2 py-1 border">
                      {result.flags.zero ? "Resultado = 0" : "Resultado ≠ 0"}
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
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
