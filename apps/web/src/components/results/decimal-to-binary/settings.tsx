"use client";

import React from "react";
import { Section } from "@/components/results/base/section";

interface SettingsProps {
  fractionBits: number;
  onFractionBitsChange: (n: number) => void;
  tableFractionDigits: number;
  onTableFractionDigitsChange: (n: number) => void;
  intWidth: number | "auto";
  onIntWidthChange: (v: number | "auto") => void;
  padEnabled: boolean;
  onPadEnabledChange: (b: boolean) => void;
}

export function DecimalToBinarySettings({
  fractionBits,
  onFractionBitsChange,
  tableFractionDigits,
  onTableFractionDigitsChange,
  intWidth,
  onIntWidthChange,
  padEnabled,
  onPadEnabledChange,
}: SettingsProps) {
  return (
    <Section title="Configuración de formato">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm items-end">
        <div>
          <label className="block text-muted-foreground mb-1">
            Bits fraccionarios
          </label>
          <input
            type="number"
            min={0}
            className="w-full border rounded px-2 py-1"
            value={fractionBits}
            onChange={(e) =>
              onFractionBitsChange(Math.max(0, Number(e.target.value || 0)))
            }
          />
        </div>
        <div>
          <label className="block text-muted-foreground mb-1">
            Decimales visibles en tabla fraccionaria
          </label>
          <input
            type="number"
            min={0}
            className="w-full border rounded px-2 py-1"
            value={tableFractionDigits}
            onChange={(e) =>
              onTableFractionDigitsChange(
                Math.max(0, Number(e.target.value || 0))
              )
            }
          />
        </div>
        <div>
          <label className="block text-muted-foreground mb-1">
            Bits parte entera (auto o número)
          </label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1"
            value={intWidth === "auto" ? "auto" : String(intWidth)}
            onChange={(e) => {
              const v = e.target.value.trim();
              if (v === "auto" || v === "") onIntWidthChange("auto");
              else onIntWidthChange(Math.max(1, Number(v)));
            }}
          />
        </div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={padEnabled}
            onChange={(e) => onPadEnabledChange(e.target.checked)}
          />
          <span>Aplicar padding fijo</span>
        </label>
      </div>
    </Section>
  );
}
