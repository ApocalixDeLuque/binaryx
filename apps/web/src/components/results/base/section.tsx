"use client";

import React from "react";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, children, className }: SectionProps) {
  return (
    <div className={`border rounded-lg ${className || ""}`}>
      <div className="px-4 py-3 border-b bg-muted/50">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
