"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { FormatConfig } from "@/lib/types";
import type { RoundingMode } from "@/lib/types";

interface SettingsPanelProps {
  format: FormatConfig;
  roundingMode: RoundingMode;
  onFormatChange: (format: FormatConfig) => void;
  onRoundingModeChange: (mode: RoundingMode) => void;
}

export function SettingsPanel({
  format,
  roundingMode,
  onFormatChange,
  onRoundingModeChange,
}: SettingsPanelProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Configuración</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Formato</Label>
          <div className="flex gap-2">
            <Button
              variant={format.name === "8.0" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                onFormatChange({
                  totalBits: 8,
                  integerBits: 8,
                  fractionalBits: 0,
                  name: "8.0",
                })
              }
            >
              8.0
            </Button>
            <Button
              variant={format.name === "8.8" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                onFormatChange({
                  totalBits: 16,
                  integerBits: 8,
                  fractionalBits: 8,
                  name: "8.8",
                })
              }
            >
              8.8
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {format.name === "8.0"
              ? "Rango: -128 a +127 (entero con signo)"
              : "Rango: -128.000 a +127.996 (8 bits entero + 8 bits fraccional)"}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Modo de redondeo</Label>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={roundingMode === "nearest" ? "default" : "outline"}
              size="sm"
              onClick={() => onRoundingModeChange("nearest")}
            >
              Más cercano
            </Button>
            <Button
              variant={roundingMode === "trunc" ? "default" : "outline"}
              size="sm"
              onClick={() => onRoundingModeChange("trunc")}
            >
              Truncar
            </Button>
            <Button
              variant={roundingMode === "floor" ? "default" : "outline"}
              size="sm"
              onClick={() => onRoundingModeChange("floor")}
            >
              Piso
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Solo afecta multiplicación Q8.8
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
