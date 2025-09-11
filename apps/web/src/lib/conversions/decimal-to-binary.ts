import BigNumber from "bignumber.js";
import type {
  ConversionResult,
  ConversionStep,
  BaseType,
  BigNumberType,
} from "../utils/conversion-types";
import { formatDecimalOutput } from "../utils/formatting-utils";

/**
 * Decimal to Binary Conversion Operations
 * Handles all conversions from decimal to binary with proper two's complement support
 */

/**
 * Convert decimal to binary using division by 2 method with two's complement support
 */
export function decimalToBinary(
  decimal: number | BigNumberType,
  specifiedBits?: number
): ConversionResult {
  // Handle BigNumber input
  const isBigNumber = decimal instanceof BigNumber;
  const bigDecimal = isBigNumber ? decimal : new BigNumber(decimal);

  const steps: ConversionStep[] = [];
  const integerSteps: Array<{
    quotient: number | BigNumberType;
    remainder: number;
  }> = [];
  const fractionalSteps: Array<{ value: number; bit: number }> = [];

  const isNegative = bigDecimal.isNegative();
  const absValue = bigDecimal.abs();
  const hasFractionalPart = !absValue.isInteger();

  let quotient = absValue.integerValue(BigNumber.ROUND_DOWN);
  const remainders: string[] = [];

  // Step 1: Convert absolute value to binary using repeated division by 2
  let magnitude: string;
  if (quotient.gt(0) || !hasFractionalPart) {
    while (quotient.gt(0)) {
      const remainder = quotient.mod(2).toNumber();
      integerSteps.push({
        quotient: quotient.gt(Number.MAX_SAFE_INTEGER)
          ? quotient
          : quotient.toNumber(),
        remainder,
      });
      remainders.unshift(remainder.toString());
      quotient = quotient.div(2).integerValue(BigNumber.ROUND_DOWN);
    }
    magnitude = remainders.join("") || "0";
  } else {
    magnitude = "0";
  }

  // Step 2: Determine bit width - adapt based on minimum required
  let bitWidth: number;
  if (specifiedBits) {
    bitWidth = specifiedBits;
  } else {
    // For BigNumbers, estimate bit width from string length
    const estimatedBits = isBigNumber
      ? bigDecimal.toString(2).length
      : Math.ceil(Math.log2(Math.abs(bigDecimal.toNumber()) + 1));

    // For negative numbers, use the same bit width as positive (two's complement handles the sign)
    bitWidth = Math.max(estimatedBits, magnitude.length);
    // Ensure minimum 8-bit alignment for readability
    bitWidth = Math.max(bitWidth, 8);
  }

  // Don't pad small results - use natural binary representation
  // Only pad very large numbers if needed for readability
  // (This preserves the natural binary length for small numbers)

  // Fractional part conversion with BigNumber precision (dynamic length)
  let fractionalResult = "";
  if (hasFractionalPart) {
    const intPartBN = absValue.integerValue(BigNumber.ROUND_DOWN);
    let fracBN = absValue.minus(intPartBN);

    // Record initial fractional value for the table
    fractionalSteps.push({ value: fracBN.toNumber(), bit: -1 });

    // Decide a generous cap based on decimal places
    const dp = (absValue as BigNumber).decimalPlaces?.() ?? 0;
    const maxBits = Math.max(64, Math.min(1024, Math.ceil(dp * 4)));

    const bits: string[] = [];
    for (let i = 0; i < maxBits && !fracBN.isZero(); i++) {
      fracBN = fracBN.times(2);
      const bitBN = fracBN.integerValue(BigNumber.ROUND_FLOOR);
      const bit = bitBN.toNumber();
      fractionalSteps.push({ value: fracBN.toNumber(), bit });
      bits.push(bit.toString());
      fracBN = fracBN.minus(bitBN);
    }

    fractionalResult = bits.join("");
    if (fractionalResult) magnitude += "." + fractionalResult;
  }

  // Handle signed representation for negative numbers
  let signedResult = magnitude;
  let output = magnitude;

  if (isNegative && magnitude !== "0") {
    // For negative numbers:
    // - output (unsigned): magnitude with negative sign
    // - signedResult (two's complement): actual two's complement representation
    output = "-" + magnitude;

    // Calculate two's complement for signedResult
    if (magnitude.includes(".")) {
      // Fractional two's complement with dynamic fractional width
      const [i, f = ""] = magnitude.split(".");
      const frac = f;
      const intWidth = i.length + 1; // pad with one extra sign bit
      const paddedInt = i.padStart(intWidth, "0");

      const invert = (s: string) =>
        s
          .split("")
          .map((b) => (b === "0" ? "1" : "0"))
          .join("");

      const invInt = invert(paddedInt);
      const invFrac = invert(frac);

      // Add 1 to the entire fixed-point word (integer + fractional)
      const joined = (invInt + invFrac).split("");
      let carry = 1;
      for (let k = joined.length - 1; k >= 0 && carry; k--) {
        if (joined[k] === "0") {
          joined[k] = "1";
          carry = 0;
        } else {
          joined[k] = "0";
        }
      }
      const newInt = joined.slice(0, intWidth).join("");
      const newFrac = joined.slice(intWidth, intWidth + frac.length).join("");
      signedResult = `${newInt}.${newFrac}`;
    } else {
      // For integer binary, calculate proper two's complement
      // Use minimal width such that the magnitude fits in (width - 1) bits
      // i.e., width = magnitude bit-length + 1
      const binaryLength = magnitude.length;
      const width = binaryLength + 1;
      // Pad to ensure we have enough bits for two's complement
      const paddedBinary = magnitude.padStart(width, "0");

      // Calculate one's complement (invert all bits)
      const inverted = paddedBinary
        .split("")
        .map((bit) => (bit === "0" ? "1" : "0"))
        .join("");

      // Convert to BigInt for large numbers and add 1
      const invertedBigInt = BigInt("0b" + inverted);
      const twosComplementBigInt = invertedBigInt + BigInt(1);

      // Convert back to binary string
      signedResult = twosComplementBigInt.toString(2);

      // Ensure proper length equals chosen width
      if (signedResult.length < paddedBinary.length) {
        signedResult = signedResult.padStart(paddedBinary.length, "0");
      }
    }
  }

  const flags = {
    sign: isNegative,
    zero: decimal === 0,
    overflow: false, // Could add overflow detection
  };

  return {
    input: decimal.toString(),
    inputBase: "decimal",
    output, // This is the unsigned result (magnitude with sign for negative)
    outputBase: "binary",
    steps,
    hasFractionalPart,
    integerSteps,
    fractionalSteps,
    isNegative,
    magnitude, // This is the binary magnitude without sign
    signedResult, // This is the two's complement representation
    flags,
  };
}

/**
 * Validate decimal input for binary conversion
 */
export function validateDecimalInput(input: string): {
  isValid: boolean;
  error?: string;
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

  return { isValid: true };
}
