"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Construction } from "lucide-react";

/**
 * Examples panel component - placeholder for now
 *
 * This component is currently disabled as requested.
 * It can be expanded later to include example conversions.
 */
export function ExamplesPanel() {
  return (
    <Card className="opacity-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Ejemplos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Construction className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-sm font-medium mb-2">Próximamente</h3>
          <p className="text-xs text-muted-foreground">
            Los ejemplos estarán disponibles en una versión futura.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
