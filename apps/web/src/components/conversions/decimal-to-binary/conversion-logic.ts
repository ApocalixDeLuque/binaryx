import type { ConversionResult } from "@/lib/base-conversions";
import { convertBetweenBases } from "@/lib/base-conversions";

/**
 * Decimal to Binary Conversion Logic
 * Contains all the business logic for decimal to binary conversions
 */

export interface DecimalToBinaryOptions {
  input: string;
  fromBase: "decimal";
  toBase: "binary";
}

/**
 * Convert decimal to binary with proper error handling
 */
export function convertDecimalToBinary({
  input,
  fromBase,
  toBase,
}: DecimalToBinaryOptions): {
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
 * Validate decimal input for binary conversion
 */
export function validateDecimalInput(input: string): {
  isValid: boolean;
  error: string | null;
} {
  if (!input.trim()) {
    return { isValid: false, error: "La entrada no puede estar vacía" };
  }

  // Check for valid decimal format
  if (!/^-?\d+(\.\d+)?$/.test(input.trim())) {
    return {
      isValid: false,
      error:
        "Formato decimal inválido. Use solo números y punto decimal opcional.",
    };
  }

  // No input length restrictions - support big ass numbers

  return { isValid: true, error: null };
}

/**
 * Get manual negative warning for binary inputs that look like decimal
 */
export function getManualNegativeWarning(input: string): string | null {
  // If input starts with '-' and contains only 0s and 1s, it might be a binary number
  if (input.startsWith("-") && /^-?[01]+$/.test(input.replace(/\s/g, ""))) {
    return "Si está ingresando un número binario, cambie la base de origen a 'Binario'.";
  }
  return null;
}

/**
 * Format binary result with proper grouping
 */
export function formatBinaryResult(binary: string): string {
  // Remove any existing spaces and handle sign
  const hasSign = binary.startsWith("-");
  const cleanBinary = binary.replace(/\s/g, "").replace("-", "");

  // For this function, just clean spaces - grouping is handled by FormattedNumber component
  return hasSign ? `-${cleanBinary}` : cleanBinary;
}

/**
 * Calculate bit length for binary representation
 */
export function calculateBitLength(
  binary: string,
  isNegative: boolean
): number {
  const cleanBinary = binary.replace(/\s/g, "");
  return isNegative ? cleanBinary.length + 1 : cleanBinary.length;
}
