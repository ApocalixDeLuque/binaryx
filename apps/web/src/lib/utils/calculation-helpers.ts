import BigNumber from "bignumber.js";

/**
 * Calculation helpers for number conversions
 */

/**
 * Calculate the minimum bits needed to represent a number in two's complement
 */
export function calculateMinBits(decimal: number): number {
  if (decimal === 0) return 1;

  const absValue = Math.abs(decimal);

  // For two's complement, we always need at least 1 sign bit + magnitude bits
  const magnitudeBits = Math.ceil(Math.log2(absValue + 1));
  return magnitudeBits + 1; // +1 for sign bit
}

/**
 * Get base name in Spanish
 */
export function getBaseName(
  base: "binary" | "decimal" | "octal" | "hexadecimal"
): string {
  switch (base) {
    case "binary":
      return "Binario";
    case "decimal":
      return "Decimal";
    case "octal":
      return "Octal";
    case "hexadecimal":
      return "Hexadecimal";
    default:
      return base;
  }
}

/**
 * Get the base number for a base type
 */
export function getBaseNumber(
  base: "binary" | "decimal" | "octal" | "hexadecimal"
): number {
  switch (base) {
    case "binary":
      return 2;
    case "decimal":
      return 10;
    case "octal":
      return 8;
    case "hexadecimal":
      return 16;
    default:
      return 10;
  }
}

/**
 * Validate input based on base type
 */
export function validateInput(
  input: string,
  base: "binary" | "decimal" | "octal" | "hexadecimal"
): boolean {
  const cleanInput = input.trim();

  switch (base) {
    case "binary":
      return /^-?[01]+(\.[01]+)?$/.test(cleanInput.replace(/\s/g, ""));
    case "decimal":
      return /^-?\d+(\.\d+)?$/.test(cleanInput);
    case "octal":
      return /^-?[0-7]+(\.[0-7]+)?$/.test(cleanInput);
    case "hexadecimal":
      return /^-?[0-9A-Fa-f]+(\.[0-9A-Fa-f]+)?$/.test(cleanInput);
    default:
      return false;
  }
}

/**
 * Create validation error message
 */
export function getValidationError(
  input: string,
  base: "binary" | "decimal" | "octal" | "hexadecimal"
): string {
  switch (base) {
    case "binary":
      return "La entrada binaria debe contener solo 0s y 1s, con punto decimal opcional";
    case "decimal":
      return "La entrada decimal debe contener solo dígitos, con punto decimal opcional";
    case "octal":
      return "La entrada octal debe contener solo dígitos 0-7, con punto decimal opcional";
    case "hexadecimal":
      return "La entrada hexadecimal debe contener solo dígitos hexadecimales válidos, con punto decimal opcional";
    default:
      return "Entrada inválida";
  }
}
