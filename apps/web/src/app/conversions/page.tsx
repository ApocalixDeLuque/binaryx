"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowRight,
  Shuffle,
  BookOpen,
  Calculator,
  RefreshCcw,
  Copy,
  ChevronDown,
  Settings,
  Trash,
} from "lucide-react";
import { BaseConversionPanel } from "@/components/base-conversion-panel";
import {
  convertBetweenBases,
  getBaseName,
  cleanFormattedValue,
  type BaseType,
  type ConversionResult,
} from "@/lib/base-conversions";
import type { FormatConfig, RoundingMode } from "@/lib/types";

const baseOptions: { value: BaseType; label: string; description: string }[] = [
  { value: "decimal", label: "Decimal", description: "Base 10 (0-9)" },
  { value: "binary", label: "Binario", description: "Base 2 (0-1)" },
  { value: "octal", label: "Octal", description: "Base 8 (0-7)" },
  {
    value: "hexadecimal",
    label: "Hexadecimal",
    description: "Base 16 (0-9,A-F)",
  },
];

const examples = [
  {
    input: "14",
    from: "decimal" as BaseType,
    to: "binary" as BaseType,
    description: "Decimal a Binario",
  },
  {
    input: "10011",
    from: "binary" as BaseType,
    to: "decimal" as BaseType,
    description: "Binario a Decimal",
  },
  {
    input: "12.123",
    from: "decimal" as BaseType,
    to: "binary" as BaseType,
    description: "Decimal fraccionario a Binario",
  },
  {
    input: "1010.101",
    from: "binary" as BaseType,
    to: "decimal" as BaseType,
    description: "Binario fraccionario a Decimal",
  },
  {
    input: "125",
    from: "decimal" as BaseType,
    to: "octal" as BaseType,
    description: "Decimal a Octal",
  },
  {
    input: "244",
    from: "octal" as BaseType,
    to: "decimal" as BaseType,
    description: "Octal a Decimal",
  },
  {
    input: "2911",
    from: "decimal" as BaseType,
    to: "hexadecimal" as BaseType,
    description: "Decimal a Hexadecimal",
  },
  {
    input: "3FCA1",
    from: "hexadecimal" as BaseType,
    to: "decimal" as BaseType,
    description: "Hexadecimal a Decimal",
  },
  {
    input: "1101011110111",
    from: "binary" as BaseType,
    to: "octal" as BaseType,
    description: "Binario a Octal",
  },
  {
    input: "15367",
    from: "octal" as BaseType,
    to: "binary" as BaseType,
    description: "Octal a Binario",
  },
  {
    input: "10101011110111",
    from: "binary" as BaseType,
    to: "hexadecimal" as BaseType,
    description: "Binario a Hexadecimal",
  },
  {
    input: "2AF7",
    from: "hexadecimal" as BaseType,
    to: "binary" as BaseType,
    description: "Hexadecimal a Binario",
  },
];

export default function ConversionsPage() {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState<BaseType>("decimal");
  const [toBase, setToBase] = useState<BaseType>("binary");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string>("");
  const [showAllConversions, setShowAllConversions] = useState<boolean>(false);

  // Configuration states
  const [roundingMode, setRoundingMode] = useState<RoundingMode>("nearest");
  const [showVerification, setShowVerification] = useState<boolean>(true);
  const [showFlags, setShowFlags] = useState<boolean>(true);
  const [useDigitGrouping, setUseDigitGrouping] = useState<boolean>(true);
  const [showSignedTwosComplement, setShowSignedTwosComplement] =
    useState<boolean>(true);
  const [configOpen, setConfigOpen] = useState<boolean>(false);

  // Bit length states
  const [decimalToBinaryBits, setDecimalToBinaryBits] = useState<number>(8);
  const [binaryToDecimalBits, setBinaryToDecimalBits] = useState<number>(8);
  const [bitLengthWarning, setBitLengthWarning] = useState<string>("");
  const [bitRequirementsMet, setBitRequirementsMet] = useState<boolean>(true);
  const [manualNegativeWarning, setManualNegativeWarning] =
    useState<string>("");

  const dynamicPlaceholder = (() => {
    switch (fromBase) {
      case "binary":
        return "Ej: 1010.101";
      case "octal":
        return "Ej: 157";
      case "hexadecimal":
        return "Ej: B5F";
      default:
        return "Ej: 2911 o 12.125";
    }
  })();

  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      setError("Por favor ingresa un número");
      setResult(null);
      return;
    }

    try {
      const conversionResult = convertBetweenBases(
        input,
        fromBase,
        toBase,
        undefined,
        useDigitGrouping,
        fromBase === "decimal" && toBase === "binary"
          ? decimalToBinaryBits
          : undefined,
        fromBase === "binary" && toBase === "decimal"
          ? binaryToDecimalBits
          : undefined
      );
      setResult(conversionResult);
      setError("");
      setBitLengthWarning(conversionResult.bitLengthWarning || "");
      setBitRequirementsMet(!conversionResult.bitLengthWarning);

      // Check for manual negative sign in binary input (only for binary to decimal)
      const hasManualNegative =
        fromBase === "binary" &&
        toBase === "decimal" &&
        input.trim().startsWith("-");
      if (hasManualNegative) {
        setManualNegativeWarning(
          "***ADVERTENCIA: La entrada ya tiene signo negativo manual. Se interpretará como unsigned (sin signo). Los cálculos de complemento a dos no se aplicarán."
        );
      } else {
        setManualNegativeWarning("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setResult(null);
      setBitLengthWarning("");
      setBitRequirementsMet(true);
      setManualNegativeWarning("");
    }
  }, [
    input,
    fromBase,
    toBase,
    useDigitGrouping,
    decimalToBinaryBits,
    binaryToDecimalBits,
  ]);

  // Auto-convert when input or bases change
  useEffect(() => {
    if (input.trim()) {
      handleConvert();
    } else {
      setResult(null);
      setError("");
    }
  }, [handleConvert]);

  // Reset bit requirements status when bit length inputs change
  useEffect(() => {
    setBitRequirementsMet(true);
    setBitLengthWarning("");
  }, []);

  const handleSwapBases = () => {
    const temp = fromBase;
    setFromBase(toBase);
    setToBase(temp);
    setResult(null);
    setError("");
  };

  const loadExample = (example: (typeof examples)[0]) => {
    setInput(example.input);
    setFromBase(example.from);
    setToBase(example.to);
    setResult(null);
    setError("");
  };

  const clearAll = () => {
    setInput("");
    setFromBase("decimal");
    setToBase("binary");
    setResult(null);
    setError("");
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(cleanFormattedValue(result.output));
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      handleConvert();
    }
  };

  const reset = () => {
    setInput("");
    setFromBase("decimal");
    setToBase("binary");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen h-fit bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Base Selection */}
          <div className="xl:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Seleccionar bases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* From Base */}
                  <div className="flex flex-col space-y-2">
                    <Label className="text-sm self-center font-medium">
                      Desde
                    </Label>
                    <div className="space-y-2">
                      {baseOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={
                            fromBase === option.value ? "default" : "outline"
                          }
                          className="!h-fit w-full justify-start p-2"
                          onClick={() => {
                            setFromBase(option.value);
                          }}
                        >
                          <div className="text-left">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs opacity-70">
                              {option.description}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* To Base */}
                  <div className="flex flex-col space-y-2">
                    <Label className="text-sm self-center font-medium">
                      Hacia
                    </Label>
                    <div className="space-y-2">
                      {baseOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={
                            toBase === option.value ? "default" : "outline"
                          }
                          className="!h-fit w-full justify-start p-2"
                          onClick={() => {
                            setToBase(option.value);
                          }}
                        >
                          <div className="text-left">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs opacity-70">
                              {option.description}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center mb-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const temp = fromBase;
                      setFromBase(toBase);
                      setToBase(temp);
                      // Swap input and output, removing spaces from digit grouping
                      if (result?.output) {
                        setInput(cleanFormattedValue(result.output));
                        setResult(null);
                      }
                    }}
                    className="px-4 w-full"
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Intercambiar
                  </Button>
                </div>

                {/* Bit Length Configuration */}
                {(fromBase === "decimal" && toBase === "binary") ||
                (fromBase === "binary" && toBase === "decimal") ? (
                  <div
                    className={`space-y-3 p-4 border rounded-lg bg-muted/20 ${
                      !bitRequirementsMet ? "border-red-500 bg-red-50/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <Label className="text-sm font-medium">
                        Configuración de bits
                      </Label>
                    </div>

                    {fromBase === "decimal" && toBase === "binary" ? (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Longitud de bits para Decimal → Binario
                          (predeterminado: 8)
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="64"
                          value={decimalToBinaryBits}
                          onChange={(e) =>
                            setDecimalToBinaryBits(
                              Math.max(1, parseInt(e.target.value) || 8)
                            )
                          }
                          className="w-full"
                          placeholder="8"
                        />
                        <p className="text-xs text-muted-foreground">
                          Si el número requiere más bits de los especificados,
                          se ajustará automáticamente con una advertencia.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Longitud de bits para Binario → Decimal
                          (predeterminado: 8)
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="64"
                          value={binaryToDecimalBits}
                          onChange={(e) =>
                            setBinaryToDecimalBits(
                              Math.max(1, parseInt(e.target.value) || 8)
                            )
                          }
                          className="w-full"
                          placeholder="8"
                        />
                        <p className="text-xs text-muted-foreground">
                          Si la entrada binaria no coincide con los bits
                          especificados, se ajustará automáticamente con una
                          advertencia.
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rounding Mode */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Redondeo
                  </Label>
                  <RadioGroup
                    value={roundingMode}
                    onValueChange={(value) =>
                      setRoundingMode(value as RoundingMode)
                    }
                    className="grid grid-cols-2 gap-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="nearest"
                        id="nearest"
                        className="h-3 w-3"
                      />
                      <Label htmlFor="nearest" className="text-xs">
                        Cercano
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="trunc"
                        id="trunc"
                        className="h-3 w-3"
                      />
                      <Label htmlFor="trunc" className="text-xs">
                        Truncar
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="floor"
                        id="floor"
                        className="h-3 w-3"
                      />
                      <Label htmlFor="floor" className="text-xs">
                        Abajo
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="half-away"
                        id="half-away"
                        className="h-3 w-3"
                      />
                      <Label htmlFor="half-away" className="text-xs">
                        Half away
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Display Options */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-flags" className="text-xs">
                      Banderas
                    </Label>
                    <Switch
                      id="show-flags"
                      checked={showFlags}
                      onCheckedChange={setShowFlags}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-verification" className="text-xs">
                      Verificación
                    </Label>
                    <Switch
                      id="show-verification"
                      checked={showVerification}
                      onCheckedChange={setShowVerification}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="digit-grouping" className="text-xs">
                      Agrupar dígitos
                    </Label>
                    <Switch
                      id="digit-grouping"
                      checked={useDigitGrouping}
                      onCheckedChange={setUseDigitGrouping}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-signed-twos" className="text-xs">
                      Complemento a 2
                    </Label>
                    <Switch
                      id="show-signed-twos"
                      checked={showSignedTwosComplement}
                      onCheckedChange={setShowSignedTwosComplement}
                      className="scale-75"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Examples */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Ejemplos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {examples.map((example) => (
                    <Button
                      key={`${example.input}-${example.from}-${example.to}`}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => loadExample(example)}
                    >
                      <div>
                        <div className="font-mono text-sm">{example.input}</div>
                        <div className="text-xs text-muted-foreground">
                          {example.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Conversion Area */}
          <div className="xl:col-span-2 space-y-4">
            {/* Input and Convert */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="input" className="text-base font-medium">
                      Número a convertir
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {dynamicPlaceholder}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="input">Entrada</Label>
                      <Input
                        id="input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder={`Ingresa un número en base ${getBaseName(
                          fromBase
                        ).toLowerCase()}`}
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="output">Resultado</Label>
                      <Input
                        id="output"
                        value={(() => {
                          if (
                            result &&
                            fromBase === "binary" &&
                            toBase === "decimal"
                          ) {
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
                          }
                          if (
                            result &&
                            fromBase === "binary" &&
                            toBase === "hexadecimal"
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
                          return result?.output || "";
                        })()}
                        readOnly
                        placeholder="Resultado aparecerá aquí"
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleConvert}
                      disabled={!input.trim()}
                      className="px-6"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Convertir
                    </Button>

                    {result && (
                      <Button
                        variant="outline"
                        onClick={copyResult}
                        title="Copiar resultado"
                      >
                        <Copy className="h-4 w-4" /> Copiar
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={clearAll}
                      title="Limpiar"
                    >
                      <Trash className="h-4 w-4" /> Limpiar
                    </Button>
                  </div>

                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded border border-destructive/30">
                      {error}
                    </div>
                  )}

                  {manualNegativeWarning && (
                    <Badge
                      variant="destructive"
                      className="w-full h-fit p-2 mb-2 !text-wrap"
                    >
                      {manualNegativeWarning}
                    </Badge>
                  )}

                  {bitLengthWarning && (
                    <Badge variant="destructive" className="w-full h-fit p-2">
                      {bitLengthWarning}
                    </Badge>
                  )}

                  {/* Ver más conversiones */}
                  <div className="mt-4 border rounded-lg p-4">
                    <Collapsible
                      open={showAllConversions}
                      onOpenChange={setShowAllConversions}
                    >
                      <CollapsibleTrigger
                        className="border-none shadow-none"
                        asChild
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <span>Ver más conversiones</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <div className="flex flex-col gap-3">
                          {baseOptions
                            .filter(
                              (option) =>
                                option.value !== fromBase &&
                                option.value !== toBase
                            )
                            .map((toOption) => {
                              const conversion =
                                result && toOption.value !== toBase
                                  ? (() => {
                                      try {
                                        return convertBetweenBases(
                                          input,
                                          fromBase,
                                          toOption.value,
                                          undefined,
                                          useDigitGrouping,
                                          fromBase === "decimal" &&
                                            toOption.value === "binary"
                                            ? decimalToBinaryBits
                                            : undefined,
                                          fromBase === "binary" &&
                                            toOption.value === "decimal"
                                            ? binaryToDecimalBits
                                            : undefined
                                        );
                                      } catch {
                                        return null;
                                      }
                                    })()
                                  : null;

                              return (
                                <button
                                  type="button"
                                  key={toOption.value}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer w-full text-left"
                                  onClick={() => {
                                    setToBase(toOption.value);
                                    // Only change the target base, don't modify input or other settings
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="text-sm font-medium">
                                      {getBaseName(fromBase)} →{" "}
                                      {getBaseName(toOption.value)}
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {toOption.label}
                                    </Badge>
                                  </div>
                                  <div className="text-sm font-mono">
                                    {conversion ? conversion.output : "..."}
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {result ? (
              <BaseConversionPanel
                result={result}
                showFlags={showFlags}
                showSignedTwosComplement={showSignedTwosComplement}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calculator className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    Listo para convertir
                  </h3>
                  <p className="text-muted-foreground">
                    Selecciona las bases, ingresa un número y haz clic en
                    "Convertir" para ver los pasos detallados de la conversión.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
