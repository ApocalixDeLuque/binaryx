"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shuffle } from "lucide-react";
import type { BaseType } from "@/lib/base-conversions";
import { getBaseName } from "@/lib/base-conversions";

/**
 * Base option configuration
 */
interface BaseOption {
  /** The base type identifier */
  value: BaseType;
  /** Display label for the base */
  label: string;
  /** Description of the base */
  description: string;
}

/**
 * Props for the BaseSelection component
 */
interface BaseSelectionProps {
  /** Currently selected source base */
  fromBase: BaseType;
  /** Currently selected target base */
  toBase: BaseType;
  /** Callback when source base changes */
  onFromBaseChange: (base: BaseType) => void;
  /** Callback when target base changes */
  onToBaseChange: (base: BaseType) => void;
  /** Callback when bases are swapped */
  onSwapBases: () => void;
}

/**
 * Available base options for conversion
 */
const BASE_OPTIONS: readonly BaseOption[] = [
  { value: "decimal", label: "Decimal", description: "Base 10 (0-9)" },
  { value: "binary", label: "Binario", description: "Base 2 (0-1)" },
  { value: "octal", label: "Octal", description: "Base 8 (0-7)" },
  {
    value: "hexadecimal",
    label: "Hexadecimal",
    description: "Base 16 (0-9,A-F)",
  },
] as const;

/**
 * Component for selecting conversion bases and configuring bit lengths
 *
 * Features:
 * - Clean base selection interface
 * - Base swapping functionality
 * - Bit length configuration for binary conversions
 * - Responsive grid layout
 * - Proper TypeScript typing
 */
export function BaseSelection({
  fromBase,
  toBase,
  onFromBaseChange,
  onToBaseChange,
  onSwapBases,
}: BaseSelectionProps) {
  /**
   * Handle base selection with validation
   */
  const handleBaseChange = (
    position: "from" | "to",
    newBase: BaseType
  ): void => {
    if (position === "from") {
      // Prevent selecting the same base for both positions
      if (newBase === toBase) {
        onToBaseChange(fromBase);
      }
      onFromBaseChange(newBase);
    } else {
      // Prevent selecting the same base for both positions
      if (newBase === fromBase) {
        onFromBaseChange(toBase);
      }
      onToBaseChange(newBase);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Seleccionar bases</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Selection Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* From Base Selection */}
          <div className="flex flex-col space-y-2">
            <Label className="text-sm font-medium text-center">Desde</Label>
            <div className="space-y-2">
              {BASE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={fromBase === option.value ? "default" : "outline"}
                  className="w-full h-auto p-3 justify-start text-left"
                  onClick={() => handleBaseChange("from", option.value)}
                  aria-pressed={fromBase === option.value}
                >
                  <div className="text-left w-full">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {option.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* To Base Selection */}
          <div className="flex flex-col space-y-2">
            <Label className="text-sm font-medium text-center">Hacia</Label>
            <div className="space-y-2">
              {BASE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={toBase === option.value ? "default" : "outline"}
                  className="w-full h-auto p-3 justify-start text-left"
                  onClick={() => handleBaseChange("to", option.value)}
                  aria-pressed={toBase === option.value}
                >
                  <div className="text-left w-full">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {option.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={onSwapBases}
            className="px-6 w-full max-w-xs"
            aria-label="Intercambiar bases de origen y destino"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Intercambiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
