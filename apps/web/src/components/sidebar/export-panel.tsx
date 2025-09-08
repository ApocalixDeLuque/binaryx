"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share, Construction } from "lucide-react";

/**
 * Export/Share panel component - placeholder for now
 *
 * This component is currently disabled as requested.
 * It can be expanded later to include export and sharing functionality.
 */
export function ExportPanel() {
  return (
    <Card className="opacity-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Share className="h-5 w-5" />
          Exportar / Compartir
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Construction className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-sm font-medium mb-2">Próximamente</h3>
          <p className="text-xs text-muted-foreground">
            Las opciones de exportación y compartir estarán disponibles en una
            versión futura.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
