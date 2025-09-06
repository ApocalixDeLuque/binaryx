"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { FormatConfig } from "@/lib/types";

interface FormatConfigProps {
  format: FormatConfig;
  onFormatChange: (format: FormatConfig) => void;
}

const PRESET_FORMATS: FormatConfig[] = [
  { totalBits: 8, integerBits: 8, fractionalBits: 0, name: "8.0" },
  { totalBits: 16, integerBits: 8, fractionalBits: 8, name: "8.8" },
  { totalBits: 16, integerBits: 16, fractionalBits: 0, name: "16.0" },
  { totalBits: 24, integerBits: 16, fractionalBits: 8, name: "16.8" },
  { totalBits: 32, integerBits: 16, fractionalBits: 16, name: "16.16" },
  { totalBits: 32, integerBits: 24, fractionalBits: 8, name: "24.8" },
];

export function FormatConfigComponent({
  format,
  onFormatChange,
}: FormatConfigProps) {
  const [customIntBits, setCustomIntBits] = useState(
    format.integerBits.toString()
  );
  const [customFracBits, setCustomFracBits] = useState(
    format.fractionalBits.toString()
  );

  const handlePresetSelect = (preset: FormatConfig) => {
    onFormatChange(preset);
    setCustomIntBits(preset.integerBits.toString());
    setCustomFracBits(preset.fractionalBits.toString());
  };

  const handleCustomApply = () => {
    const intBits = parseInt(customIntBits) || 8;
    const fracBits = parseInt(customFracBits) || 0;
    const totalBits = intBits + fracBits;

    const customFormat: FormatConfig = {
      totalBits,
      integerBits: intBits,
      fractionalBits: fracBits,
      name: `${intBits}.${fracBits}`,
    };

    onFormatChange(customFormat);
  };

  const getMaxValue = (format: FormatConfig) => {
    const maxInt = Math.pow(2, format.integerBits - 1) - 1;
    const maxFrac =
      format.fractionalBits > 0
        ? (Math.pow(2, format.fractionalBits) - 1) /
          Math.pow(2, format.fractionalBits)
        : 0;
    return maxInt + maxFrac;
  };

  return (
    <div className="space-y-4">
      {/* Current Format Summary */}
      <div className="p-3 border rounded">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="font-medium">Formato actual</div>
            <div className="text-muted-foreground">
              {format.integerBits}.{format.fractionalBits} ({format.totalBits}{" "}
              bits)
            </div>
          </div>
          <div className="font-mono text-sm">{format.name}</div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Rango: ±{getMaxValue(format).toFixed(format.fractionalBits)}
        </div>
      </div>

      {/* Presets */}
      <div>
        <Label className="text-sm font-medium">Formatos</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {PRESET_FORMATS.map((preset) => (
            <Button
              key={preset.name}
              variant={format.name === preset.name ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetSelect(preset)}
              className="text-xs"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom */}
      <div>
        <Label className="text-sm font-medium">Personalizado</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <Label htmlFor="int-bits" className="text-xs">
              Bits enteros
            </Label>
            <Input
              id="int-bits"
              type="number"
              min="1"
              max="31"
              value={customIntBits}
              onChange={(e) => setCustomIntBits(e.target.value)}
              placeholder="8"
            />
          </div>
          <div>
            <Label htmlFor="frac-bits" className="text-xs">
              Bits fraccionales
            </Label>
            <Input
              id="frac-bits"
              type="number"
              min="0"
              max="31"
              value={customFracBits}
              onChange={(e) => setCustomFracBits(e.target.value)}
              placeholder="8"
            />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Total:{" "}
            {(parseInt(customIntBits || "0") || 0) +
              (parseInt(customFracBits || "0") || 0)}{" "}
            bits
          </div>
          <Button
            onClick={handleCustomApply}
            size="sm"
            disabled={!customIntBits || !customFracBits}
          >
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}
