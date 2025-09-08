/**
 * Type definitions for conversion operations
 */

export type BaseType = "binary" | "decimal" | "octal" | "hexadecimal";

export interface ConversionStep {
  step: number;
  input: string;
  operation: string;
  output: string;
  remainder?: string;
}

export interface ConversionResult {
  input: string;
  inputBase: BaseType;
  output: string;
  outputBase: BaseType;
  steps: ConversionStep[];
  intermediateSteps?: ConversionStep[];
  hasFractionalPart?: boolean;
  integerSteps?: Array<{ quotient: number | BigNumberType; remainder: number }>;
  fractionalSteps?: Array<{ value: number; bit: number }>;
  isNegative?: boolean;
  magnitude?: string;
  signedResult?: string;
  twosComplementHex?: string;
  flags?: {
    sign: boolean;
    zero: boolean;
    overflow?: boolean;
  };
  bitLengthWarning?: string;
}

export interface ConversionOptions {
  fromBase: BaseType;
  toBase: BaseType;
  useGrouping?: boolean;
  decimalToBinaryBits?: number;
  binaryToDecimalBits?: number;
}

// Import BigNumber from bignumber.js for type compatibility
import BigNumber from "bignumber.js";

export type BigNumberType = BigNumber;
