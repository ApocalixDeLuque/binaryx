import type { BaseType } from "./conversion-types";

/**
 * Formatting utilities for number display
 */

/**
 * Format a number with proper digit grouping based on the base
 */
export function formatWithGrouping(value: string, base: BaseType): string {
  if (!value || value === "0") return value;

  // Handle negative numbers
  const isNegative = value.startsWith("-");
  const absValue = isNegative ? value.slice(1) : value;

  let formattedValue;
  switch (base) {
    case "binary":
      // Group binary digits in groups of 4 from right to left
      const result = [];
      for (let i = absValue.length; i > 0; i -= 4) {
        const start = Math.max(0, i - 4);
        const group = absValue.slice(start, i);
        result.unshift(group);
      }
      formattedValue = result.join(" ");
      break;
    case "octal":
      // Group octal digits in groups of 3 from right to left
      const octalResult = [];
      let remaining = absValue;
      while (remaining.length > 3) {
        const group = remaining.slice(-3);
        octalResult.unshift(group);
        remaining = remaining.slice(0, -3);
      }
      if (remaining.length > 0) {
        octalResult.unshift(remaining);
      }
      formattedValue = octalResult.join(" ");
      break;
    case "decimal":
      // Add commas for thousands in decimal
      formattedValue = absValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      break;
    case "hexadecimal":
      // Group hexadecimal digits in groups of 4 from right to left
      const hexResult = [];
      for (let i = absValue.length; i > 0; i -= 4) {
        const start = Math.max(0, i - 4);
        const group = absValue.slice(start, i);
        hexResult.unshift(group);
      }
      formattedValue = hexResult.join(" ");
      break;
    default:
      formattedValue = absValue;
  }

  // Return formatted value with negative sign if applicable
  return isNegative ? "-" + formattedValue : formattedValue;
}

/**
 * Format a value with proper digit grouping for display (without spaces/commas removal)
 */
export function formatDisplayValue(value: string, base: BaseType): string {
  if (!value || value === "0") return value;

  switch (base) {
    case "binary":
      // Group binary digits in groups of 4 from right to left
      const result = [];
      for (let i = value.length; i > 0; i -= 4) {
        const start = Math.max(0, i - 4);
        const group = value.slice(start, i);
        result.unshift(group);
      }
      return result.join(" ");
    case "octal":
      // Group octal digits in groups of 3 from right to left
      const octalResult = [];
      for (let i = value.length; i > 0; i -= 3) {
        const start = Math.max(0, i - 3);
        const group = value.slice(start, i);
        octalResult.unshift(group);
      }
      return octalResult.join(" ");
    case "hexadecimal":
      // Group hexadecimal digits in groups of 2 from right to left
      const hexResult = [];
      for (let i = value.length; i > 0; i -= 2) {
        const start = Math.max(0, i - 2);
        const group = value.slice(start, i);
        hexResult.unshift(group);
      }
      return hexResult.join(" ");
    default:
      return value;
  }
}

/**
 * Clean formatted values by removing spaces and commas for input parsing
 */
export function cleanFormattedValue(value: string): string {
  return value.replace(/[\s,]/g, "");
}

/**
 * Format decimal output to prevent scientific notation
 */
export function formatDecimalOutput(num: number | bigint): string {
  if (typeof num === "bigint") {
    return num.toString();
  }

  if (Math.abs(num) >= 1e15 || Math.abs(num) < 1e-6) {
    // For very large or small numbers, convert to string without scientific notation
    return num.toLocaleString("fullwide", { useGrouping: false });
  }
  return num.toString();
}
