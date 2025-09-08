import type { ConversionResult } from "@/lib/base-conversions";

/**
 * Octal to Binary Conversion Logic
 */

export interface OctalToBinaryOptions {
  input: string;
  fromBase: "octal";
  toBase: "binary";
}

/**
 * Convert octal to binary with proper error handling
 */
export function convertOctalToBinary({
  input,
  fromBase,
  toBase,
}: OctalToBinaryOptions): {
  result: ConversionResult | null;
  error: string | null;
} {
  try {
    const { convertBetweenBases } = require("@/lib/base-conversions");
    const result = convertBetweenBases(input, fromBase, toBase);
    return { result, error: null };
  } catch (error) {
    return {
      result: null,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido en la conversión",
    };
  }
}

/**
 * Validate octal input for binary conversion
 */
export function validateOctalInput(input: string): {
  isValid: boolean;
  error: string | null;
} {
  if (!input.trim()) {
    return { isValid: false, error: "La entrada no puede estar vacía" };
  }

  // Remove spaces for validation
  const cleanInput = input.replace(/\s/g, "");

  // Check for valid octal format (only 0-7, optional leading -, allow spaces)
  if (!/^-?[0-7\s]+(\.[0-7\s]+)?$/.test(input)) {
    return {
      isValid: false,
      error: "Formato octal inválido. Use solo dígitos del 0-7.",
    };
  }

  // No input length restrictions - support big ass numbers

  return { isValid: true, error: null };
}

/**
 * Format binary result with proper grouping
 */
export function formatBinaryResult(binary: string): string {
  if (!binary || binary === "0") return binary;
  // Remove any existing spaces and clean
  const clean = binary.replace(/\s/g, "").replace(/^-/, "");
  // Group in 4-bit chunks from right to left
  const groups: string[] = [];
  let remaining = clean;
  while (remaining.length > 4) {
    const group = remaining.slice(-4);
    groups.unshift(group);
    remaining = remaining.slice(0, -4);
  }
  if (remaining.length > 0) groups.unshift(remaining);

  const result = groups.join(" ");
  // Re-add the negative sign if it was present
  return binary.startsWith("-") ? "-" + result : result;
}
