"use client";

import React, { Suspense } from "react";
import { ConversionPanel } from "@/components/conversion-panel";

function ConversionesContent() {
  return <ConversionPanel />;
}

export default function ConversionesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConversionesContent />
    </Suspense>
  );
}
