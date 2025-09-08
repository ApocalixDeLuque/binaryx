import type { ConversionResult } from "@/lib/base-conversions";
import { convertBetweenBases } from "@/lib/base-conversions";

/**
 * Binary to Decimal Conversion Logic
 */

export interface BinaryToDecimalOptions {
  input: string;
  fromBase: "binary";
  toBase: "decimal";
}

/**
 * Convert binary to decimal with proper error handling
 */
export function convertBinaryToDecimal({
  input,
  fromBase,
  toBase,
}: BinaryToDecimalOptions): {
  result: ConversionResult | null;
  error: string | null;
} {
  try {
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
 * Validate binary input for decimal conversion
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
  if (!/^-?[01]+$/.test(cleanInput)) {
    return {
      isValid: false,
      error: "Formato binario inválido. Use solo 0s y 1s.",
    };
  }

  // No input length restrictions - support big ass numbers

  return { isValid: true, error: null };
}

/**
 * Format decimal result with proper grouping
 */
export function formatDecimalResult(decimal: string): string {
  // Add commas every 3 digits from right to left
  return decimal.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
