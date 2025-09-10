import React from "react";
import type { BaseType } from "@/lib/base-conversions";

interface FormattedNumberProps {
  value: string;
  base: BaseType;
  className?: string;
}

/**
 * Dedicated component for formatting numbers across all bases
 * Applies consistent right-to-left grouping for all number bases
 */
export function FormattedNumber({
  value,
  base,
  className = "",
}: FormattedNumberProps) {
  // Remove any existing spaces for consistent formatting
  const cleanValue = value.replace(/[\s,]/g, "");

  switch (base) {
    case "binary":
      return formatBinary(cleanValue, className);
    case "octal":
      return formatOctal(cleanValue, className);
    case "hexadecimal":
      return formatHexadecimal(cleanValue, className);
    case "decimal":
      return formatDecimal(cleanValue, className);
    default:
      return <span className={className}>{value}</span>;
  }
}

function formatBinary(value: string, className: string): React.ReactElement {
  if (!value) {
    return <span className={className}>{value}</span>;
  }

  // Handle sign
  const isNegative = value.startsWith("-");
  const unsigned = isNegative ? value.slice(1) : value;

  // Handle fractional part
  if (unsigned.includes(".")) {
    const [intPartRaw, fracPartRaw] = unsigned.split(".");
    const intPart = intPartRaw || "0";
    const fracPart = fracPartRaw || "";

    // Integer: group right-to-left in 4s
    const intGroups: string[] = [];
    let intRemain = intPart;
    while (intRemain.length > 4) {
      const group = intRemain.slice(-4);
      intGroups.unshift(group);
      intRemain = intRemain.slice(0, -4);
    }
    if (intRemain.length > 0) intGroups.unshift(intRemain);

    // Fractional: group left-to-right in 4s
    const fracGroups: string[] = [];
    for (let i = 0; i < fracPart.length; i += 4) {
      fracGroups.push(fracPart.slice(i, i + 4));
    }

    const formatted = `${isNegative ? "-" : ""}${intGroups.join(
      " "
    )}.${fracGroups.join(" ")}`;
    return <span className={className}>{formatted}</span>;
  }

  // Pure integer: group right-to-left
  const groups: string[] = [];
  let remaining = unsigned;
  while (remaining.length > 4) {
    const group = remaining.slice(-4);
    groups.unshift(group);
    remaining = remaining.slice(0, -4);
  }
  if (remaining.length > 0) groups.unshift(remaining);

  const formatted = `${isNegative ? "-" : ""}${groups.join(" ")}`;
  return <span className={className}>{formatted}</span>;
}

function formatOctal(value: string, className: string): React.ReactElement {
  if (!value) {
    return <span className={className}>{value}</span>;
  }

  const isNegative = value.startsWith("-");
  const unsigned = isNegative ? value.slice(1) : value;

  if (unsigned.includes(".")) {
    const [intPartRaw, fracPartRaw] = unsigned.split(".");
    const intPart = intPartRaw || "0";
    const fracPart = fracPartRaw || "";

    const intGroups: string[] = [];
    let intRemain = intPart;
    while (intRemain.length > 3) {
      const group = intRemain.slice(-3);
      intGroups.unshift(group);
      intRemain = intRemain.slice(0, -3);
    }
    if (intRemain.length > 0) intGroups.unshift(intRemain);

    const fracGroups: string[] = [];
    for (let i = 0; i < fracPart.length; i += 3) {
      fracGroups.push(fracPart.slice(i, i + 3));
    }

    const formatted = `${isNegative ? "-" : ""}${intGroups.join(
      " "
    )}.${fracGroups.join(" ")}`;
    return <span className={className}>{formatted}</span>;
  }

  const groups: string[] = [];
  let remaining = unsigned;
  while (remaining.length > 3) {
    const group = remaining.slice(-3);
    groups.unshift(group);
    remaining = remaining.slice(0, -3);
  }
  if (remaining.length > 0) groups.unshift(remaining);

  const formatted = `${isNegative ? "-" : ""}${groups.join(" ")}`;
  return <span className={className}>{formatted}</span>;
}

function formatHexadecimal(
  value: string,
  className: string
): React.ReactElement {
  if (!value) {
    return <span className={className}>{value}</span>;
  }

  const isNegative = value.startsWith("-");
  const unsigned = isNegative ? value.slice(1) : value;

  if (unsigned.includes(".")) {
    const [intPartRaw, fracPartRaw] = unsigned.split(".");
    const intPart = intPartRaw || "0";
    const fracPart = fracPartRaw || "";

    const intGroups: string[] = [];
    let intRemain = intPart;
    while (intRemain.length > 2) {
      const group = intRemain.slice(-2);
      intGroups.unshift(group);
      intRemain = intRemain.slice(0, -2);
    }
    if (intRemain.length > 0) intGroups.unshift(intRemain);

    const fracGroups: string[] = [];
    for (let i = 0; i < fracPart.length; i += 2) {
      fracGroups.push(fracPart.slice(i, i + 2));
    }

    const formatted = `${isNegative ? "-" : ""}${intGroups.join(
      " "
    )}.${fracGroups.join(" ")}`;
    return <span className={className}>{formatted}</span>;
  }

  const groups: string[] = [];
  let remaining = unsigned;
  while (remaining.length > 2) {
    const group = remaining.slice(-2);
    groups.unshift(group);
    remaining = remaining.slice(0, -2);
  }
  if (remaining.length > 0) groups.unshift(remaining);

  const formatted = `${isNegative ? "-" : ""}${groups.join(" ")}`;
  return <span className={className}>{formatted}</span>;
}

function formatDecimal(value: string, className: string): React.ReactElement {
  if (!value) {
    return <span className={className}>{value}</span>;
  }

  const isNegative = value.startsWith("-");
  const unsigned = isNegative ? value.slice(1) : value;

  if (unsigned.includes(".")) {
    const [intPartRaw, fracPartRaw] = unsigned.split(".");
    const intPart = intPartRaw || "0";
    const fracPart = fracPartRaw || "";
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formatted = `${isNegative ? "-" : ""}${intFormatted}.${fracPart}`;
    return <span className={className}>{formatted}</span>;
  }

  const intFormatted = unsigned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formatted = `${isNegative ? "-" : ""}${intFormatted}`;
  return <span className={className}>{formatted}</span>;
}
