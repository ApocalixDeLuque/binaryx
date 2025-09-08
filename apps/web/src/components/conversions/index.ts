/**
 * Base-to-Base Conversion Components
 * Organized collection of all conversion operations
 */

// Decimal to Binary
export { DecimalToBinary } from "./decimal-to-binary/index";
export * from "./decimal-to-binary/conversion-logic";

// Binary to Decimal
export { BinaryToDecimal } from "./binary-to-decimal/index";
export * from "./binary-to-decimal/conversion-logic";

// Binary to Octal
export { BinaryToOctalConversion } from "./binary-to-octal";
export {
  convertBinaryToOctal,
  validateBinaryInput as validateBinaryInputOctal,
  formatOctalResult,
} from "./binary-to-octal/conversion-logic";

// Octal to Binary
export { OctalToBinaryConversion } from "./octal-to-binary";
export {
  convertOctalToBinary,
  validateOctalInput,
  formatBinaryResult as formatBinaryResultOctal,
} from "./octal-to-binary/conversion-logic";

// Binary to Hexadecimal
export { BinaryToHexadecimalConversion } from "./binary-to-hexadecimal";

// Re-export types and utilities
export type { ConversionResult } from "@/lib/base-conversions";
