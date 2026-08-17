import BigNumber from "bignumber.js";
import type { ConversionResult, ConversionStep, BigNumberType } from "../utils/conversion-types";

/**
 * Decimal to Binary Conversion Operations
 * Handles all conversions from decimal to binary with proper two's complement support
 */

/**
 * Convert decimal to binary using division by 2 method with two's complement support
 */
export function decimalToBinary(
  decimal: number | BigNumberType,
  specifiedBits?: number,
): ConversionResult {
  // Handle BigNumber input
  const bigDecimal = decimal instanceof BigNumber ? decimal : new BigNumber(decimal);

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
        quotient: quotient.gt(Number.MAX_SAFE_INTEGER) ? quotient : quotient.toNumber(),
        remainder,
      });
      remainders.unshift(remainder.toString());
      quotient = quotient.div(2).integerValue(BigNumber.ROUND_DOWN);
    }
    magnitude = remainders.join("") || "0";
  } else {
    magnitude = "0";
  }

  // Fractional part conversion with BigNumber precision (dynamic length)
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

    const fractionalResult = bits.join("");
    if (fractionalResult) magnitude += "." + fractionalResult;
  }

  // Integer results use at least 8 bits. A caller-provided width is honored
  // unless the value needs more bits to remain representable.
  let signedResult = magnitude;
  let output = magnitude;

  if (!hasFractionalPart) {
    const magnitudeBits = magnitude.length;
    const isPowerOfTwo = /^10*$/.test(magnitude);
    const requiredSignedBits = isPowerOfTwo ? magnitudeBits : magnitudeBits + 1;
    const requiredBits = isNegative ? requiredSignedBits : magnitudeBits;
    const bitWidth = Math.max(8, specifiedBits ?? 0, requiredBits);

    if (isNegative && magnitude !== "0") {
      const modulus = BigInt(1) << BigInt(bitWidth);
      const magnitudeValue = BigInt(`0b${magnitude}`);
      signedResult = (modulus - magnitudeValue).toString(2).padStart(bitWidth, "0");
      output = signedResult;
    } else {
      signedResult = magnitude.padStart(bitWidth, "0");
      output = signedResult;
    }
  } else if (isNegative && magnitude !== "0") {
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
    output = signedResult;
  }

  const flags = {
    sign: isNegative,
    zero: bigDecimal.isZero(),
    overflow: false, // Could add overflow detection
  };

  return {
    input: decimal.toString(),
    inputBase: "decimal",
    output,
    outputBase: "binary",
    steps,
    hasFractionalPart,
    integerSteps,
    fractionalSteps,
    isNegative,
    magnitude, // This is the binary magnitude without sign
    signedResult,
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
      error: "Formato decimal inválido. Use solo números y punto decimal opcional.",
    };
  }

  return { isValid: true };
}
