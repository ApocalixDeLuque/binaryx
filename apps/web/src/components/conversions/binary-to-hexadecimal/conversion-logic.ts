import type { ConversionResult } from "@/lib/base-conversions";

/**
 * Binary to Hexadecimal Conversion Logic
 */

export interface BinaryToHexadecimalOptions {
  input: string;
  fromBase: "binary";
  toBase: "hexadecimal";
}

/**
 * Convert binary to hexadecimal with proper error handling
 */
export function convertBinaryToHexadecimal({
  input,
  fromBase,
  toBase,
}: BinaryToHexadecimalOptions): {
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
 * Validate binary input for hexadecimal conversion
 */
export function validateBinaryInput(input: string): {
  isValid: boolean;
  error: string | null;
} {
  if (!input.trim()) {
    return { isValid: false, error: "La entrada no puede estar vacía" };
  }

  // Remove spaces for validation
  const cleanInput = input.replace(/\s/g, "");

  // Check for valid binary format (only 0s and 1s, optional leading -)
  if (!/^-?[01]+(\.[01]+)?$/.test(cleanInput)) {
    return {
      isValid: false,
      error: "Formato binario inválido. Use solo 0s y 1s.",
    };
  }

  return { isValid: true, error: null };
}

/**
 * Format hexadecimal result with proper grouping
 */
export function formatHexadecimalResult(hex: string): string {
  if (!hex || hex === "0") return hex;
  // Remove any existing spaces and clean
  const clean = hex.replace(/\s/g, "").replace(/^-/, "");
  // Group in 2-character chunks from right to left
  const groups: string[] = [];
  let remaining = clean;
  while (remaining.length > 2) {
    const group = remaining.slice(-2);
    groups.unshift(group);
    remaining = remaining.slice(0, -2);
  }
  if (remaining.length > 0) groups.unshift(remaining);
  return groups.join(" ");
}
