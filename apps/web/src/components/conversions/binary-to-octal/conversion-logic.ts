import type { ConversionResult } from "@/lib/base-conversions";

/**
 * Binary to Octal Conversion Logic
 */

export interface BinaryToOctalOptions {
  input: string;
  fromBase: "binary";
  toBase: "octal";
}

/**
 * Convert binary to octal with proper error handling
 */
export function convertBinaryToOctal({
  input,
  fromBase,
  toBase,
}: BinaryToOctalOptions): {
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
 * Validate binary input for octal conversion
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

  // Check for valid binary format (only 0s and 1s, optional leading -, allow spaces)
  if (!/^-?[01\s]+(\.[01\s]+)?$/.test(input)) {
    return {
      isValid: false,
      error: "Formato binario inválido. Use solo 0s y 1s.",
    };
  }

  // No input length restrictions - support big ass numbers

  return { isValid: true, error: null };
}

/**
 * Format octal result with proper grouping
 */
export function formatOctalResult(octal: string): string {
  if (!octal || octal === "0") return octal;
  // Remove any existing spaces and clean
  const clean = octal.replace(/\s/g, "").replace(/^-/, "");
  // Group in 3-digit chunks from right to left
  const groups: string[] = [];
  let remaining = clean;
  while (remaining.length > 3) {
    const group = remaining.slice(-3);
    groups.unshift(group);
    remaining = remaining.slice(0, -3);
  }
  if (remaining.length > 0) groups.unshift(remaining);

  const result = groups.join(" ");
  // Re-add the negative sign if it was present
  return octal.startsWith("-") ? "-" + result : result;
}
