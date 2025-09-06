import type {
  NumberValue,
  FormatConfig,
  BoothStep,
  FixedPointMulStep,
  Flags,
} from "./types";

/**
 * Convert decimal to binary with full step tracking
 */
export function decimalToBinary(
  decimal: number,
  format: FormatConfig
): NumberValue {
  const bits = format.totalBits;
  const fracBits = format.fractionalBits;
  const intBits = format.integerBits;

  let rawInt: number;
  let bin: string;
  let isNegative = decimal < 0;
  let A1: string | undefined;
  let A2: string | undefined;
  let validation = {
    isValid: true,
    error: undefined as string | undefined,
    recommendedFormat: undefined as FormatConfig | undefined,
  };

  const tables = {
    integerDiv: [] as Array<{ quotient: number; remainder: number }>,
    fracMul: [] as Array<{ value: number; bit: number }>,
  };

  // Calculate the maximum value for this format
  const maxValue =
    Math.pow(2, intBits - 1) - (fracBits > 0 ? 1 / Math.pow(2, fracBits) : 0);
  const absValue = Math.abs(decimal);

  // Check if value fits in format
  if (absValue > maxValue) {
    validation.isValid = false;
    validation.error = `Valor ${decimal} excede el rango del formato ${format.name} (-${maxValue} a +${maxValue})`;

    // Suggest a better format
    let suggestedIntBits = Math.ceil(Math.log2(absValue + 1)) + 1; // +1 for sign bit
    let suggestedFracBits = fracBits;
    if (decimal % 1 !== 0) {
      suggestedFracBits = Math.max(fracBits, 8); // Suggest at least 8 fractional bits
    }

    validation.recommendedFormat = {
      totalBits: suggestedIntBits + suggestedFracBits,
      integerBits: suggestedIntBits,
      fractionalBits: suggestedFracBits,
      name: `${suggestedIntBits}.${suggestedFracBits}`,
    };
  }

  if (fracBits === 0) {
    // Integer format
    rawInt = Math.round(decimal);

    // Integer division table for positive magnitude
    let quotient = Math.floor(absValue);
    while (quotient > 0 && tables.integerDiv.length < intBits) {
      const remainder = quotient % 2;
      tables.integerDiv.unshift({ quotient, remainder });
      quotient = Math.floor(quotient / 2);
    }

    // Create binary representation
    const magnitudeBin = Math.abs(rawInt).toString(2).padStart(bits, "0");
    bin = magnitudeBin;

    if (isNegative) {
      // A1: invert all bits
      A1 = magnitudeBin
        .split("")
        .map((bit) => (bit === "0" ? "1" : "0"))
        .join("");
      // A2: add 1
      const a2Int = parseInt(A1, 2) + 1;
      A2 = a2Int.toString(2).padStart(bits, "0");
      bin = A2;
      rawInt = -Math.abs(rawInt); // Ensure negative
    }
  } else {
    // Fixed point format
    // Convert by multiplying by 2^fracBits and rounding
    const scaleFactor = Math.pow(2, fracBits);
    rawInt = Math.round(decimal * scaleFactor);

    // Integer part division
    const integerPart = Math.floor(absValue);
    let quotient = integerPart;
    while (quotient > 0 && tables.integerDiv.length < intBits) {
      const remainder = quotient % 2;
      tables.integerDiv.unshift({ quotient, remainder });
      quotient = Math.floor(quotient / 2);
    }

    // Fractional part multiplication by 2
    let fractionalPart = absValue - integerPart;
    for (let i = 0; i < fracBits; i++) {
      fractionalPart *= 2;
      const bit = Math.floor(fractionalPart);
      tables.fracMul.push({ value: fractionalPart, bit });
      fractionalPart -= bit;
    }

    // Combine integer and fractional bits
    // For negative numbers, we need to handle the rawInt differently
    const absRawInt = Math.abs(rawInt);
    const integerBits = (absRawInt >>> fracBits)
      .toString(2)
      .padStart(intBits, "0");
    const fractionalBits = (absRawInt & (Math.pow(2, fracBits) - 1))
      .toString(2)
      .padStart(fracBits, "0");
    const magnitudeBin = integerBits + fractionalBits;

    bin = magnitudeBin;

    if (isNegative) {
      // A1: invert all bits
      A1 = magnitudeBin
        .split("")
        .map((bit) => (bit === "0" ? "1" : "0"))
        .join("");
      // A2: add 1
      const a2Int = parseInt(A1, 2) + 1;
      A2 = a2Int.toString(2).padStart(bits, "0");
      bin = A2;
      rawInt = -Math.abs(rawInt); // Ensure negative
    }
  }

  return {
    format,
    decimal,
    rawInt,
    bin,
    isNegative,
    tables,
    A1,
    A2,
    validation,
  };
}

/**
 * Convert binary (A2) to decimal
 */
export function binaryToDecimal(
  bin: string,
  format: FormatConfig
): NumberValue {
  const bits = format.totalBits;

  if (bin.length !== bits) {
    throw new Error(`Binary string must be ${bits} bits`);
  }

  let rawInt = parseInt(bin, 2);
  // Handle two's complement
  if (bin[0] === "1") {
    rawInt = rawInt - (1 << bits);
  }

  const decimal =
    format.fractionalBits === 0
      ? rawInt
      : rawInt / Math.pow(2, format.fractionalBits);

  return decimalToBinary(decimal, format);
}

/**
 * Add two binary numbers with carry tracking
 */
export function addBinary(
  a: string,
  b: string
): { result: string; carryMap: string; flags: Flags } {
  const len = Math.max(a.length, b.length);
  const aPadded = a.padStart(len, "0");
  const bPadded = b.padStart(len, "0");

  let result = "";
  let carry = "0";
  let carryMap = "";

  for (let i = len - 1; i >= 0; i--) {
    const bitA = aPadded[i];
    const bitB = bPadded[i];
    const sum = parseInt(bitA) + parseInt(bitB) + parseInt(carry);

    result = (sum % 2).toString() + result;
    carry = Math.floor(sum / 2).toString();
    carryMap = carry + carryMap;
  }

  // Calculate flags
  const resultInt = parseInt(result, 2);
  const isNegative = result[0] === "1";
  const msb = len - 1;

  const flags: Flags = {
    Z: resultInt === 0,
    N: isNegative,
    C: carry === "1",
    V: false, // Will be calculated by caller based on operation
    carryMap,
    overflow: false,
    saturated: false,
  };

  return { result, carryMap, flags };
}

/**
 * Booth multiplication algorithm
 */
export function boothMultiply(
  a: number,
  b: number
): { result: number; steps: BoothStep[] } {
  if (Math.abs(a) > 127 || Math.abs(b) > 127) {
    throw new Error("Booth multiplication requires 8-bit signed integers");
  }

  const steps: BoothStep[] = [];
  let A = 0; // Accumulator
  let Q = Math.abs(a); // Multiplicand in Q
  let Qm1 = 0; // Q-1
  const M = Math.abs(b); // Multiplier

  // Initialize with sign extension
  if (a < 0) Q = (~Q & 0xff) + 1; // Two's complement
  if (b < 0) {
    // For negative multiplier, we need to adjust the algorithm
  }

  for (let i = 0; i < 8; i++) {
    const Q0 = Q & 1;

    let operation: "A=A+M" | "A=A-M" | "none" = "none";

    if (Q0 === 1 && Qm1 === 0) {
      A = A - M;
      operation = "A=A-M";
    } else if (Q0 === 0 && Qm1 === 1) {
      A = A + M;
      operation = "A=A+M";
    }

    // Arithmetic right shift
    const newQm1 = Q0;
    Q = (Q >>> 1) | ((A & 1) << 7);
    A = A >> 1;

    if (a < 0) A = A | 0x80; // Sign extension for negative

    steps.push({
      i: i + 1,
      Q0,
      Qm1,
      operation,
      A: A.toString(2).padStart(8, "0"),
      Q: Q.toString(2).padStart(8, "0"),
      Qm1_new: newQm1,
    });

    Qm1 = newQm1;
  }

  // Apply signs
  const signA = a < 0 ? -1 : 1;
  const signB = b < 0 ? -1 : 1;
  const result = signA * signB * ((A << 8) | Q);

  return { result, steps };
}

/**
 * Fixed-point multiplication for 8.8 format
 */
export function fixedPointMultiply(
  a: number,
  b: number,
  roundingMode: "nearest" | "trunc" | "floor" = "nearest"
): FixedPointMulStep {
  // Convert to Q8.8
  const Af = Math.round(a * 256);
  const Bf = Math.round(b * 256);

  // 32-bit product
  const product32 = Af * Bf;

  // Shift right by 8 with rounding
  let shifted: number;
  switch (roundingMode) {
    case "nearest":
      shifted = Math.round(product32 / 256);
      break;
    case "trunc":
      shifted = Math.trunc(product32 / 256);
      break;
    case "floor":
      shifted = Math.floor(product32 / 256);
      break;
  }

  // Saturation
  let saturated = false;
  if (shifted > 32767) {
    shifted = 32767;
    saturated = true;
  } else if (shifted < -32768) {
    shifted = -32768;
    saturated = true;
  }

  return {
    Af,
    Bf,
    product32,
    shifted,
    saturated,
  };
}

/**
 * Perform addition with full step tracking
 */
export function performArithmetic(
  a: NumberValue,
  b: NumberValue
): {
  result: string;
  resultDecimal: number;
  carryMap: string;
  flags: Flags;
} {
  const { result, carryMap, flags } = addBinary(a.bin, b.bin);

  // Calculate overflow for signed arithmetic
  const aSign = a.bin[0] === "1";
  const bSign = b.bin[0] === "1";
  const resultSign = result[0] === "1";

  // Addition overflow: same signs + different result sign
  const overflow = aSign === bSign && aSign !== resultSign;

  const finalFlags = {
    ...flags,
    V: overflow,
  };

  // Convert result back to decimal
  const resultInt =
    result[0] === "1"
      ? parseInt(result, 2) - (1 << a.format.totalBits)
      : parseInt(result, 2);

  const resultDecimal =
    a.format.fractionalBits === 0
      ? resultInt
      : resultInt / Math.pow(2, a.format.fractionalBits);

  return {
    result,
    resultDecimal,
    carryMap,
    flags: finalFlags,
  };
}
