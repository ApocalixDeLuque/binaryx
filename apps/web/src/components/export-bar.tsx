"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Share, FileText, Code, Table } from "lucide-react";
import { toast } from "sonner";

interface ExportBarProps {
  data?: {
    format: string;
    operation: string;
    operandA: any;
    operandB: any;
    result?: any;
  };
}

export function ExportBar({ data }: ExportBarProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado al portapapeles", {
        description: "Los datos han sido copiados exitosamente.",
      });
    } catch (err) {
      toast.error("Error", {
        description: "No se pudo copiar al portapapeles.",
      });
    }
  };

  const generateTextSummary = () => {
    if (!data) return "No hay datos para exportar";

    const lines = [
      `binaryx - Resultado`,
      `====================================`,
      ``,
      `Formato: ${data.format}`,
      `Operación: ${data.operation}`,
      `Operando A: ${data.operandA?.decimal} (${data.operandA?.bin})`,
      `Operando B: ${data.operandB?.decimal} (${data.operandB?.bin})`,
    ];

    if (data.result) {
      lines.push(
        `Resultado: ${data.result.resultDecimal} (${data.result.result})`
      );
    }

    return lines.join("\n");
  };

  const handleCopyResults = () => {
    const text = generateTextSummary();
    copyToClipboard(text);
  };

  const handleCopyBinary = () => {
    if (!data) return;

    const binaryData = [
      `A: ${data.operandA?.bin}`,
      `B: ${data.operandB?.bin}`,
      data.result ? `Resultado: ${data.result.result}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    copyToClipboard(binaryData);
  };

  const handleCopyJSON = () => {
    if (!data) return;
    const payload = {
      app: "binaryx",
      format: data.format,
      operation: data.operation,
      operandA: data.operandA,
      operandB: data.operandB,
      result: data.result,
      exportedAt: new Date().toISOString(),
    };
    copyToClipboard(JSON.stringify(payload, null, 2));
  };

  const handleCopyTable = () => {
    if (!data) return;
    const rows = [
      ["Campo", "Valor"],
      ["Formato", data.format],
      ["Operación", data.operation],
      ["A (decimal)", String(data.operandA?.decimal ?? "")],
      ["A (bin)", String(data.operandA?.bin ?? "")],
      ["B (decimal)", String(data.operandB?.decimal ?? "")],
      ["B (bin)", String(data.operandB?.bin ?? "")],
    ];
    if (data.result) {
      rows.push(["Resultado (decimal)", String(data.result.resultDecimal)]);
      rows.push(["Resultado (bin)", String(data.result.result)]);
    }
    const csv = rows
      .map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    copyToClipboard(csv);
    toast.success("Tabla copiada como CSV");
  };

  const handleShare = () => {
    // For now, just copy the summary
    const text = generateTextSummary();
    copyToClipboard(text);

    toast.info("Enlace compartible", {
      description: "Funcionalidad de compartir próximamente disponible.",
    });
  };

  return (
    <Card className="w-full p-0 m-0 border-none shadow-none">
      <CardContent className="p-0">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyResults}
            disabled={!data}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Resumen (texto)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyBinary}
            disabled={!data}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Solo binarios
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJSON}
            disabled={!data}
            className="flex items-center gap-2"
          >
            <Code className="h-4 w-4" />
            JSON
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyTable}
            disabled={!data}
            className="flex items-center gap-2"
          >
            <Table className="h-4 w-4" />
            Tabla (CSV)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={!data}
            className="flex items-center gap-2"
          >
            <Share className="h-4 w-4" />
            Compartir
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled
            className="flex items-center gap-2 opacity-50"
          >
            <Download className="h-4 w-4" />
            PDF (Próximamente)
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Exporta o comparte resultados de binaryx
        </p>
      </CardContent>
    </Card>
  );
}
