"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { NumberValue, FormatConfig } from "@/lib/types";
import { decimalToBinary, binaryToDecimal } from "@/lib/binary-math";

interface NumberCardProps {
  title: string;
  value: NumberValue | null;
  format: FormatConfig;
  onChange: (value: NumberValue) => void;
}

export function NumberCard({
  title,
  value,
  format,
  onChange,
}: NumberCardProps) {
  const [decimalInput, setDecimalInput] = useState(
    value?.decimal.toString() || ""
  );
  const [binaryInput, setBinaryInput] = useState(value?.bin || "");
  const [activeTab, setActiveTab] = useState<"decimal" | "binary">("decimal");
  const [binaryInputType, setBinaryInputType] = useState<
    "signed" | "a1" | "a2"
  >("signed");
  const [error, setError] = useState<string | null>(null);

  const getMaxValue = () => {
    const maxInt = Math.pow(2, format.integerBits - 1) - 1;
    const maxFrac =
      format.fractionalBits > 0
        ? (Math.pow(2, format.fractionalBits) - 1) /
          Math.pow(2, format.fractionalBits)
        : 0;
    return maxInt + maxFrac;
  };

  const handleDecimalChange = (decimalStr: string) => {
    setDecimalInput(decimalStr);
    setError(null);

    if (decimalStr.trim() === "") return;

    const decimal = parseFloat(decimalStr);
    if (isNaN(decimal)) {
      setError("Valor decimal inválido. Use formato numérico válido.");
      return;
    }

    // Check for obvious out of range
    const maxValue = getMaxValue();
    if (Math.abs(decimal) > maxValue * 2) {
      // Allow some tolerance
      setError(
        `Valor muy grande. Máximo recomendado: ±${maxValue.toFixed(
          format.fractionalBits
        )}`
      );
      return;
    }

    try {
      const numberValue = decimalToBinary(decimal, format);
      setBinaryInput(numberValue.bin);

      // Check if the conversion was successful
      if (!numberValue.validation.isValid) {
        setError(numberValue.validation.error || "Error de validación");
        // Still show the result but with warning
      }

      onChange(numberValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conversión");
    }
  };

  const handleBinaryChange = (binaryStr: string) => {
    setBinaryInput(binaryStr);
    setError(null);

    if (binaryStr.trim() === "") return;

    // Validate binary format
    const expectedLength = format.totalBits;
    if (binaryStr.length !== expectedLength || !/^[01]+$/.test(binaryStr)) {
      setError(`Debe ser exactamente ${expectedLength} bits (solo 0s y 1s)`);
      return;
    }

    try {
      let processedBinary = binaryStr;
      let decimal: number;

      switch (binaryInputType) {
        case "signed":
          decimal = binaryToDecimal(binaryStr, format).decimal;
          break;
        case "a1":
          processedBinary = binaryStr
            .split("")
            .map((bit) => (bit === "0" ? "1" : "0"))
            .join("");
          decimal = binaryToDecimal(processedBinary, format).decimal;
          break;
        case "a2":
          decimal = binaryToDecimal(binaryStr, format).decimal;
          break;
        default:
          decimal = binaryToDecimal(binaryStr, format).decimal;
      }

      const numberValue = decimalToBinary(decimal, format);
      setDecimalInput(numberValue.decimal.toString());
      onChange(numberValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conversión");
    }
  };

  const formatBinaryDisplay = (bin: string, format: FormatConfig) => {
    if (format.fractionalBits === 0) {
      // Integer only
      return bin.match(/.{1,4}/g)?.join(" ") || bin;
    } else {
      // Fixed point: integer bits, dot, fractional bits
      const integerPart = bin.slice(0, format.integerBits);
      const fractionalPart = bin.slice(format.integerBits);
      return `${integerPart.match(/.{1,4}/g)?.join(" ") || integerPart}.${
        fractionalPart.match(/.{1,4}/g)?.join(" ") || fractionalPart
      }`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Format Info */}
        <div className="flex items-center justify-between">
          <Badge variant="outline">{format.name}</Badge>
          <span className="text-xs text-muted-foreground">
            Rango: ±{getMaxValue().toFixed(format.fractionalBits)}
          </span>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Validation Warning */}
        {value?.validation?.error && !error && (
          <Alert>
            <AlertDescription>
              <strong>Advertencia:</strong> {value.validation.error}
              {value.validation.recommendedFormat && (
                <div className="mt-2">
                  <strong>Recomendado:</strong>{" "}
                  {value.validation.recommendedFormat.name}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "decimal" | "binary")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="decimal">Decimal</TabsTrigger>
            <TabsTrigger value="binary">Binario</TabsTrigger>
          </TabsList>

          <TabsContent value="decimal" className="space-y-2">
            <Label htmlFor={`${title}-decimal`}>Valor decimal</Label>
            <Input
              id={`${title}-decimal`}
              type="number"
              step={
                format.fractionalBits > 0
                  ? Math.pow(10, -format.fractionalBits)
                  : 1
              }
              value={decimalInput}
              onChange={(e) => handleDecimalChange(e.target.value)}
              placeholder={`Ej: ${value?.isNegative ? "-" : ""}123${
                format.fractionalBits > 0 ? ".456" : ""
              }`}
              className={error ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">
              {format.fractionalBits > 0
                ? `${format.integerBits} bits entero + ${format.fractionalBits} bits fraccional`
                : `${format.integerBits} bits entero (incluye signo)`}
            </p>
          </TabsContent>

          <TabsContent value="binary" className="space-y-2">
            <div className="space-y-3">
              <Label htmlFor={`${title}-binary`}>Binario</Label>

              {/* Binary Input Type Selector */}
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`px-3 py-1 text-xs rounded ${
                    binaryInputType === "signed"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => setBinaryInputType("signed")}
                >
                  Signed
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 text-xs rounded ${
                    binaryInputType === "a1"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => setBinaryInputType("a1")}
                >
                  A1
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 text-xs rounded ${
                    binaryInputType === "a2"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => setBinaryInputType("a2")}
                >
                  A2
                </button>
              </div>

              <Input
                id={`${title}-binary`}
                value={binaryInput}
                onChange={(e) => handleBinaryChange(e.target.value)}
                placeholder={`${format.totalBits} bits (ej: ${"0".repeat(
                  format.totalBits
                )})`}
                className={`font-mono ${error ? "border-destructive" : ""}`}
                maxLength={format.totalBits}
              />

              <div className="text-xs text-muted-foreground">
                {binaryInputType === "signed" &&
                  "Binario normal con bit de signo"}
                {binaryInputType === "a1" && "Bits invertidos (A1)"}
                {binaryInputType === "a2" && "Two's complement (A2)"}
              </div>

              {value && (
                <div className="text-xs text-muted-foreground">
                  Resultado: {value.decimal.toFixed(format.fractionalBits)}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Result Display */}
        {value && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Resultado:</span>
              <Badge variant={value.isNegative ? "destructive" : "default"}>
                {value.isNegative ? "Negativo" : "Positivo"}
              </Badge>
            </div>

            <div className="font-mono text-sm bg-background p-2 rounded border">
              {activeTab === "binary"
                ? value.decimal.toFixed(format.fractionalBits)
                : formatBinaryDisplay(value.bin, format)}
            </div>

            {value.isNegative && value.A1 && value.A2 && (
              <div className="space-y-2 text-xs">
                <div className="text-muted-foreground">
                  <strong>Proceso Two's Complement:</strong>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex justify-between">
                    <span>Binario positivo:</span>
                    <code className="font-mono bg-background px-1 rounded">
                      {formatBinaryDisplay(
                        Math.abs(value.rawInt)
                          .toString(2)
                          .padStart(format.totalBits, "0"),
                        format
                      )}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span>A1 (invertir):</span>
                    <code className="font-mono bg-background px-1 rounded">
                      {formatBinaryDisplay(value.A1, format)}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span>A2 (+1):</span>
                    <code className="font-mono bg-background px-1 rounded">
                      {formatBinaryDisplay(value.A2, format)}
                    </code>
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Decimal: {value.decimal.toFixed(format.fractionalBits)} | Raw:{" "}
              {value.rawInt}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
