"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResultSelectorProps {
  enabled?: boolean;
  value: "unsigned" | "signed";
  onChange: (v: "unsigned" | "signed") => void;
}

export function ResultSelector({
  enabled = true,
  value,
  onChange,
}: ResultSelectorProps) {
  if (!enabled) return null;
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as any)}>
      <TabsList>
        <TabsTrigger value="unsigned">Sin signo</TabsTrigger>
        <TabsTrigger value="signed">Con signo (C2)</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
