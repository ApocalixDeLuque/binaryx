"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormatConfigComponent } from "./format-config";
import { ExamplesList } from "./examples-list";
import { ExportBar } from "./export-bar";
import type { FormatConfig, NumberValue, RoundingMode } from "@/lib/types";
import { ChevronDown } from "lucide-react";

interface SidebarConfigProps {
  format: FormatConfig;
  onFormatChange: (format: FormatConfig) => void;
  onLoadExample: (example: any) => void;
  showVerification: boolean;
  onToggleVerification: () => void;
  roundingMode: RoundingMode;
  onRoundingModeChange: (mode: RoundingMode) => void;
  operandA: NumberValue | null;
  operandB: NumberValue | null;
  operation: string;
  result: any;
}

export function SidebarConfig({
  format,
  onFormatChange,
  onLoadExample,
  showVerification,
  onToggleVerification,
  roundingMode,
  onRoundingModeChange,
  operandA,
  operandB,
  operation,
  result,
}: SidebarConfigProps) {
  const [sectionsOpen, setSectionsOpen] = useState({
    general: true,
    examples: false,
    export: true,
  });

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("binaryx_sections_open");
      if (saved) setSectionsOpen((p) => ({ ...p, ...JSON.parse(saved) }));
    } catch {}
  }, []);
  React.useEffect(() => {
    try {
      localStorage.setItem(
        "binaryx_sections_open",
        JSON.stringify(sectionsOpen)
      );
    } catch {}
  }, [sectionsOpen]);

  const DisclosureRow = ({
    id,
    title,
    defaultOpen = true,
    children,
  }: {
    id: string;
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
  }) => {
    const [open, setOpen] = useState(defaultOpen);
    React.useEffect(() => {
      try {
        const raw = localStorage.getItem(`binaryx_disclosure_${id}`);
        if (raw != null) setOpen(raw === "1");
      } catch {}
    }, []);
    React.useEffect(() => {
      try {
        localStorage.setItem(`binaryx_disclosure_${id}`, open ? "1" : "0");
      } catch {}
    }, [id, open]);
    return (
      <div className="border rounded">
        <button
          type="button"
          className="w-full flex items-center justify-between p-2 text-left"
          onClick={() => setOpen(!open)}
        >
          <span className="text-sm">{title}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
        {open && <div className="p-3 space-y-2">{children}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* General Configuration */}
      <Card className="p-0">
        <Collapsible
          open={sectionsOpen.general}
          onOpenChange={(open) =>
            setSectionsOpen((p) => ({ ...p, general: open }))
          }
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between p-3"
            >
              <span className="font-medium text-sm">Configuración</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  sectionsOpen.general ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-4 space-y-3">
              <DisclosureRow id="format" title="Formato">
                <FormatConfigComponent
                  format={format}
                  onFormatChange={onFormatChange}
                />
              </DisclosureRow>
              <DisclosureRow id="rounding" title="Modo de Redondeo">
                <RadioGroup
                  value={roundingMode}
                  onValueChange={(val) =>
                    onRoundingModeChange(val as RoundingMode)
                  }
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nearest" id="nearest" />
                    <Label htmlFor="nearest" className="text-sm">
                      Más cercano
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="trunc" id="trunc" />
                    <Label htmlFor="trunc" className="text-sm">
                      Truncar
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="floor" id="floor" />
                    <Label htmlFor="floor" className="text-sm">
                      Piso
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-2">
                  Aplica a multiplicación en punto fijo
                </p>
              </DisclosureRow>
              <DisclosureRow id="verification" title="Verificación">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mostrar verificación</span>
                  <Switch
                    checked={showVerification}
                    onCheckedChange={onToggleVerification}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Compara resultado esperado vs. obtenido
                </p>
              </DisclosureRow>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Examples */}
      <Card className="p-0">
        <Collapsible
          open={sectionsOpen.examples}
          onOpenChange={(open) =>
            setSectionsOpen((p) => ({ ...p, examples: open }))
          }
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between p-3"
            >
              <span className="font-medium text-sm">Ejemplos</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  sectionsOpen.examples ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-4">
              <ExamplesList onLoadExample={onLoadExample} />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Export */}
      <Card className="p-0">
        <Collapsible
          open={sectionsOpen.export}
          onOpenChange={(open) =>
            setSectionsOpen((p) => ({ ...p, export: open }))
          }
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between p-3"
            >
              <span className="font-medium text-sm">Exportar Resultados</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  sectionsOpen.export ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-4">
              <ExportBar
                data={
                  operandA && operandB
                    ? {
                        format: format.name,
                        operation,
                        operandA,
                        operandB,
                        result: operation === "×" ? null : result,
                      }
                    : undefined
                }
              />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
