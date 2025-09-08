"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings } from "lucide-react";
import type { RoundingMode } from "@/lib/types";

/**
 * Props for the ConfigurationPanel component
 */
interface ConfigurationPanelProps {
  /** Current rounding mode */
  roundingMode: RoundingMode;
  /** Callback when rounding mode changes */
  onRoundingModeChange: (mode: RoundingMode) => void;
  /** Whether to show flags in results */
  showFlags: boolean;
  /** Callback when show flags changes */
  onShowFlagsChange: (show: boolean) => void;
  /** Whether to show verification in results */
  showVerification: boolean;
  /** Callback when show verification changes */
  onShowVerificationChange: (show: boolean) => void;
  /** Whether to use digit grouping */
  useDigitGrouping: boolean;
  /** Callback when digit grouping changes */
  onUseDigitGroupingChange: (use: boolean) => void;
  /** Whether to show signed two's complement */
  showSignedTwosComplement: boolean;
  /** Callback when signed two's complement changes */
  onShowSignedTwosComplementChange: (show: boolean) => void;
}

/**
 * Available rounding mode options
 */
const ROUNDING_OPTIONS = [
  {
    value: "nearest",
    label: "Cercano",
    description: "Redondea al valor más cercano",
  },
  {
    value: "trunc",
    label: "Truncar",
    description: "Elimina los dígitos fraccionarios",
  },
  { value: "floor", label: "Abajo", description: "Redondea hacia abajo" },
  {
    value: "half-away",
    label: "Half away",
    description: "Redondea alejándose de cero",
  },
] as const;

/**
 * Configuration panel component for conversion settings
 *
 * Features:
 * - Rounding mode selection with radio buttons
 * - Toggle switches for display options
 * - Clean, organized grid layout
 * - Proper accessibility with labels and descriptions
 * - TypeScript-safe implementation
 */
export function ConfigurationPanel({
  roundingMode,
  onRoundingModeChange,
  showFlags,
  onShowFlagsChange,
  showVerification,
  onShowVerificationChange,
  useDigitGrouping,
  onUseDigitGroupingChange,
  showSignedTwosComplement,
  onShowSignedTwosComplementChange,
}: ConfigurationPanelProps) {
  /**
   * Handle rounding mode change with type safety
   */
  const handleRoundingModeChange = (value: string): void => {
    const validModes: RoundingMode[] = [
      "nearest",
      "trunc",
      "floor",
      "half-away",
    ];
    if (validModes.includes(value as RoundingMode)) {
      onRoundingModeChange(value as RoundingMode);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rounding Mode Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Redondeo</Label>
          <RadioGroup
            value={roundingMode}
            onValueChange={handleRoundingModeChange}
            className="grid grid-cols-2 gap-3"
          >
            {ROUNDING_OPTIONS.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50 transition-colors"
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="h-3 w-3"
                />
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={option.value}
                    className="text-xs font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Display Options Section */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">
            Opciones de visualización
          </Label>

          <div className="grid grid-cols-1 gap-4">
            {/* Show Flags */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor="show-flags"
                  className="text-sm font-medium cursor-pointer"
                >
                  Banderas
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Mostrar indicadores de estado (Zero, Signo)
                </p>
              </div>
              <Switch
                id="show-flags"
                checked={showFlags}
                onCheckedChange={onShowFlagsChange}
                aria-describedby="show-flags-description"
              />
            </div>

            {/* Show Verification */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor="show-verification"
                  className="text-sm font-medium cursor-pointer"
                >
                  Verificación
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Mostrar pasos de verificación de resultados
                </p>
              </div>
              <Switch
                id="show-verification"
                checked={showVerification}
                onCheckedChange={onShowVerificationChange}
                aria-describedby="show-verification-description"
              />
            </div>

            {/* Digit Grouping */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor="digit-grouping"
                  className="text-sm font-medium cursor-pointer"
                >
                  Agrupar dígitos
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Separar dígitos en grupos para mejor legibilidad
                </p>
              </div>
              <Switch
                id="digit-grouping"
                checked={useDigitGrouping}
                onCheckedChange={onUseDigitGroupingChange}
                aria-describedby="digit-grouping-description"
              />
            </div>

            {/* Signed Two's Complement */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor="show-signed-twos"
                  className="text-sm font-medium cursor-pointer"
                >
                  Complemento a 2
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Mostrar representación en complemento a dos para números
                  negativos
                </p>
              </div>
              <Switch
                id="show-signed-twos"
                checked={showSignedTwosComplement}
                onCheckedChange={onShowSignedTwosComplementChange}
                aria-describedby="show-signed-twos-description"
              />
            </div>
          </div>
        </div>

        {/* Hidden descriptions for screen readers */}
        <div className="sr-only">
          <div id="show-flags-description">
            Activar para mostrar indicadores de estado como Zero Flag y Sign
            Flag en los resultados
          </div>
          <div id="show-verification-description">
            Activar para mostrar pasos detallados de verificación de la
            conversión
          </div>
          <div id="digit-grouping-description">
            Activar para agrupar dígitos con espacios para mejorar la
            legibilidad
          </div>
          <div id="show-signed-twos-description">
            Activar para mostrar la representación en complemento a dos de
            números negativos
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
