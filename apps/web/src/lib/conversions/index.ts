/**
 * Conversion Operations
 * Modular conversion functions organized by conversion type
 */

// Decimal to Binary conversions
export { decimalToBinary, validateDecimalInput } from "./decimal-to-binary";

// Binary to Decimal conversions
export {
  binaryToDecimal,
  validateBinaryInput,
  calculateTwosComplement,
} from "./binary-to-decimal";

// Re-export types
export type {
  BaseType,
  ConversionResult,
  ConversionStep,
} from "../utils/conversion-types";
