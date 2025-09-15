import BigNumber from "bignumber.js";

// Configure BigNumber to preserve exact values for large numbers
BigNumber.config({
  DECIMAL_PLACES: 50,
  EXPONENTIAL_AT: 1e9,
});

// Import modular conversion functions
import {
  decimalToBinary,
  binaryToDecimal,
  validateDecimalInput,
  validateBinaryInput,
} from "./conversions";

// Import utilities
import {
  formatWithGrouping,
  formatDisplayValue,
  cleanFormattedValue,
  formatDecimalOutput,
} from "./utils/formatting-utils";
import {
  getBaseName,
  getBaseNumber,
  calculateMinBits,
} from "./utils/calculation-helpers";

export type BaseType = "binary" | "decimal" | "octal" | "hexadecimal";

// Re-export formatting functions for backward compatibility
export {
  formatWithGrouping,
  formatDisplayValue,
  cleanFormattedValue,
  formatDecimalOutput,
} from "./utils/formatting-utils";

// Re-export calculation helpers for backward compatibility
export {
  calculateMinBits,
  getBaseName,
  getBaseNumber,
} from "./utils/calculation-helpers";

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
  // Additional properties for detailed conversion tracking
  integerSteps?: Array<{ quotient: number | BigNumber; remainder: number }>;
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

// calculateMinBits function moved to ./utils/calculation-helpers.ts

// decimalToBinary function moved to ./conversions/decimal-to-binary.ts

// binaryToDecimal function moved to ./conversions/binary-to-decimal.ts

/**
 * Convert decimal to octal using division by 8 method
 */
export function decimalToOctal(decimal: number | BigNumber): ConversionResult {
  const steps: ConversionStep[] = [];
  const integerSteps: Array<{
    quotient: number | BigNumber;
    remainder: number;
  }> = [];
  const fractionalSteps: Array<{ value: number; bit: number }> = [];

  // Handle BigNumber input
  const isBigNumber = decimal instanceof BigNumber;
  const bigDecimal = isBigNumber ? decimal : new BigNumber(decimal);

  const isNegative = bigDecimal.isNegative();
  const absValue = bigDecimal.abs();
  const hasFractionalPart = !absValue.isInteger();

  let quotient = absValue.integerValue(BigNumber.ROUND_DOWN);
  const remainders: string[] = [];

  // Integer part conversion
  if (quotient.gt(0) || !hasFractionalPart) {
    while (quotient.gt(0)) {
      const remainder = quotient.mod(8).toNumber();
      // Preserve BigNumber quotients for large values to avoid precision loss
      const qOut = quotient.gt(Number.MAX_SAFE_INTEGER)
        ? quotient
        : (quotient.toNumber() as number);
      integerSteps.push({ quotient: qOut, remainder });
      remainders.unshift(remainder.toString());
      quotient = quotient.div(8).integerValue(BigNumber.ROUND_DOWN);
    }
  }

  let magnitude = remainders.join("") || "0";

  // Fractional part conversion using BigNumber for precision
  let fractionalResult = "";
  if (hasFractionalPart) {
    // Extract fractional part as BigNumber precisely
    const intPart = absValue.integerValue(BigNumber.ROUND_DOWN);
    let fracPart = absValue.minus(intPart); // 0 <= fracPart < 1

    // Record initial fractional value for the UI table (as number for display)
    fractionalSteps.push({ value: fracPart.toNumber(), bit: -1 });

    // Target precision (fractional octal digits)
    const PRECISION = 20; // matches expected output rounding in tests

    // Compute PRECISION + 1 digits to determine rounding
    const digits: number[] = [];
    for (let i = 0; i < PRECISION + 1 && !fracPart.isZero(); i++) {
      fracPart = fracPart.times(8);
      const digitBN = fracPart.integerValue(BigNumber.ROUND_FLOOR);
      const digit = digitBN.toNumber(); // 0..7
      digits.push(digit);
      // Push step for UI (store the intermediate value after multiplication)
      fractionalSteps.push({ value: fracPart.toNumber(), bit: digit });
      fracPart = fracPart.minus(digitBN);
    }

    // Rounding in base-8: if next digit >= 4, round up last kept digit
    if (digits.length > PRECISION) {
      const next = digits[PRECISION];
      let kept = digits.slice(0, PRECISION);
      if (next >= 4) {
        // propagate carry in base-8
        let carry = 1;
        for (let p = kept.length - 1; p >= 0 && carry; p--) {
          if (kept[p] < 7) {
            kept[p] += 1;
            carry = 0;
          } else {
            kept[p] = 0;
          }
        }
        if (carry) {
          // All fractional digits carried over; bump integer magnitude by 1
          // Convert current integer magnitude (octal) to BigNumber and add 1
          const currentInt = new BigNumber(remainders.join("") || "0", 8);
          const bumped = currentInt.plus(1);
          remainders.length = 0;
          remainders.push(...bumped.toString(8).split(""));
          kept = kept.map((d) => d); // already zeroed by carry loop
        }
      }
      fractionalResult = kept.map((d) => d.toString()).join("");
    } else {
      fractionalResult = digits.map((d) => d.toString()).join("");
    }

    if (fractionalResult) {
      magnitude = (remainders.join("") || "0") + "." + fractionalResult;
    } else {
      magnitude = remainders.join("") || "0";
    }
  }

  // Handle signed representation - for octal, just add negative sign
  let signedResult = magnitude;
  if (isNegative && magnitude !== "0") {
    signedResult = "-" + magnitude;
  }

  return {
    input: decimal.toString(),
    inputBase: "decimal",
    output: signedResult,
    outputBase: "octal",
    steps,
    hasFractionalPart,
    integerSteps,
    fractionalSteps,
    isNegative,
    magnitude,
    signedResult,
  };
}

/**
 * Convert octal to decimal using positional weighting
 */
export function octalToDecimal(octal: string): ConversionResult {
  const steps: ConversionStep[] = [];
  const clean = octal.replace(/\s/g, "");
  const isNegative = clean.startsWith("-");
  const unsigned = isNegative ? clean.slice(1) : clean;

  const [intRaw, fracRaw = ""] = unsigned.split(".");

  // Integer part using BigNumber to be safe
  let intValue = new BigNumber(0);
  for (let i = 0; i < (intRaw || "0").length; i++) {
    const ch = intRaw[i] || "0";
    intValue = intValue.times(8).plus(parseInt(ch, 8));
  }

  // Record integer positional steps (least significant first for display clarity)
  for (let i = 0; i < (intRaw || "").length; i++) {
    const ch = intRaw[(intRaw || "").length - 1 - i];
    const digit = parseInt(ch, 8);
    const power = Math.pow(8, i);
    const contribution = digit * power;
    steps.push({
      step: steps.length + 1,
      input: ch,
      operation: `× 8^${i}`,
      output: contribution.toString(),
    });
  }

  // Fractional part: sum digit * 8^-(k)
  let fracValue = new BigNumber(0);
  for (let i = 0; i < fracRaw.length; i++) {
    const ch = fracRaw[i];
    const digit = parseInt(ch, 8);
    const denom = new BigNumber(8).exponentiatedBy(i + 1);
    const contribution = new BigNumber(digit).div(denom);
    steps.push({
      step: steps.length + 1,
      input: ch,
      operation: `× 8^${-(i + 1)}`,
      output: contribution.toString(),
    });
    fracValue = fracValue.plus(contribution);
  }

  const total = intValue.plus(fracValue);

  // Fixed 20 fractional decimal digits, as per examples
  let unsignedStr: string;
  if (fracRaw.length > 0) {
    unsignedStr = total.toFixed(20);
    // Ensure no scientific notation and keep exactly 20 fractional digits
  } else {
    unsignedStr = total.toFixed();
  }

  const signedStr = isNegative ? `-${unsignedStr}` : unsignedStr;

  return {
    input: octal,
    inputBase: "octal",
    output: signedStr,
    outputBase: "decimal",
    steps,
    hasFractionalPart: fracRaw.length > 0,
    isNegative,
  };
}

/**
 * Convert decimal to hexadecimal using division by 16 method
 */
export function decimalToHexadecimal(
  decimal: number | BigNumber
): ConversionResult {
  const steps: ConversionStep[] = [];
  const integerSteps: Array<{
    quotient: number | BigNumber;
    remainder: number;
  }> = [];
  const fractionalSteps: Array<{ value: number; bit: number }> = [];

  // Handle BigNumber input
  const isBigNumber = decimal instanceof BigNumber;
  const bigDecimal = isBigNumber ? decimal : new BigNumber(decimal);

  const isNegative = bigDecimal.isNegative();
  const absValue = bigDecimal.abs();
  const hasFractionalPart = !absValue.isInteger();

  let quotient = absValue.integerValue(BigNumber.ROUND_DOWN);
  const remainders: string[] = [];

  const hexDigits = "0123456789ABCDEF";

  // Integer part conversion
  if (quotient.gt(0) || !hasFractionalPart) {
    while (quotient.gt(0)) {
      const remainder = quotient.mod(16).toNumber();
      const qOut = quotient.gt(Number.MAX_SAFE_INTEGER)
        ? quotient
        : (quotient.toNumber() as number);
      integerSteps.push({ quotient: qOut, remainder });
      remainders.unshift(hexDigits[remainder]);
      quotient = quotient.div(16).integerValue(BigNumber.ROUND_DOWN);
    }
  }

  let magnitude = remainders.join("") || "0";

  // Fractional part conversion using BigNumber for precision (20 digits)
  let fractionalResult = "";
  if (hasFractionalPart) {
    const intPart = absValue.integerValue(BigNumber.ROUND_DOWN);
    let fracPart = absValue.minus(intPart);

    // Initial fractional step marker
    fractionalSteps.push({ value: fracPart.toNumber(), bit: -1 });

    const PRECISION = 20;
    const digits: number[] = [];
    for (let i = 0; i < PRECISION + 1 && !fracPart.isZero(); i++) {
      fracPart = fracPart.times(16);
      const digitBN = fracPart.integerValue(BigNumber.ROUND_FLOOR);
      const digit = digitBN.toNumber();
      digits.push(digit);
      fractionalSteps.push({ value: fracPart.toNumber(), bit: digit });
      fracPart = fracPart.minus(digitBN);
    }

    // Round last digit in base-16 using next digit
    if (digits.length > PRECISION) {
      const next = digits[PRECISION];
      let kept = digits.slice(0, PRECISION);
      if (next >= 8) {
        let carry = 1;
        for (let p = kept.length - 1; p >= 0 && carry; p--) {
          if (kept[p] < 15) {
            kept[p] += 1;
            carry = 0;
          } else {
            kept[p] = 0;
          }
        }
        if (carry) {
          // Carry overflow into integer hex part
          const currentInt = new BigNumber(remainders.join("") || "0", 16);
          const bumped = currentInt.plus(1);
          remainders.length = 0;
          remainders.push(...bumped.toString(16).toUpperCase().split(""));
        }
      }
      fractionalResult = kept.map((d) => hexDigits[d]).join("");
    } else {
      fractionalResult = digits.map((d) => hexDigits[d]).join("");
    }

    if (fractionalResult) {
      magnitude = (remainders.join("") || "0") + "." + fractionalResult;
    } else {
      magnitude = remainders.join("") || "0";
    }
  }

  // Handle signed representation - for hexadecimal, use two's complement
  let signedResult = magnitude;
  let twosComplementHex = "";
  const decimalValue = isBigNumber ? bigDecimal.abs() : Math.abs(decimal);

  // For large numbers, we need to ensure consistent bit width for both positive and negative
  const shouldUseLargeFormat = !hasFractionalPart;

  // Do NOT compute or expose two's complement for positive inputs.
  // Only handle signed/two's complement when the original input is negative.
  if (shouldUseLargeFormat && isNegative) {
    // Determine minimal standard width (16, 32, 64, 128, ...) that can hold |value| in C2
    const absIntStr = isBigNumber
      ? (decimalValue as BigNumber)
          .integerValue(BigNumber.ROUND_DOWN)
          .toString()
      : Math.trunc(decimalValue as number).toString();
    const N = BigInt(absIntStr);
    // Bit length of magnitude
    const magnitudeBits = Math.max(1, N.toString(2).length);
    const isPow2 = (N & (N - BigInt(1))) === BigInt(0);
    // Minimal signed bits k such that N <= 2^(k-1)
    const requiredSignedBits = isPow2 ? magnitudeBits : magnitudeBits + 1;
    const requiredBytes = Math.ceil(requiredSignedBits / 8);
    // Round up bytes to the minimal power-of-two byte width, with a minimum of 2 bytes (16 bits)
    const nextPow2Bytes = (b: number): number => {
      let x = 1;
      while (x < b) x <<= 1;
      return Math.max(2, x);
    };
    const byteWidth = nextPow2Bytes(requiredBytes);
    const bitWidth = byteWidth * 8;

    // Main result is direct hex with negative sign
    signedResult = "-" + magnitude;

    // Calculate two's complement for negative integers: 2^bitWidth - |value|
    const maxValue = BigInt(1) << BigInt(bitWidth);
    const bigIntValue = N;
    const twosComplementValue = maxValue - bigIntValue;
    twosComplementHex = twosComplementValue
      .toString(16)
      .toUpperCase()
      .padStart(bitWidth / 4, "0");
  }

  // Ensure direct signed result reflects a leading '-' for negatives
  if (isNegative && magnitude !== "0") {
    signedResult = "-" + magnitude;
  }

  return {
    input: decimal.toString(),
    inputBase: "decimal",
    output: signedResult,
    outputBase: "hexadecimal",
    steps,
    hasFractionalPart,
    integerSteps,
    fractionalSteps,
    isNegative,
    magnitude,
    signedResult,
    twosComplementHex,
  };
}

/**
 * Convert hexadecimal to decimal using positional weighting
 */
export function hexadecimalToDecimal(hex: string): ConversionResult {
  const steps: ConversionStep[] = [];
  const clean = hex.replace(/\s/g, "");
  const isExplicitlyNegative = clean.startsWith("-");
  const unsigned = isExplicitlyNegative ? clean.slice(1) : clean;

  const [intRaw, fracRaw = ""] = unsigned.split(".");

  // Integer part via BigNumber accumulation
  let intBN = new BigNumber(0);
  for (let i = 0; i < (intRaw || "0").length; i++) {
    const ch = intRaw[i] || "0";
    const digit = parseInt(ch, 16);
    intBN = intBN.times(16).plus(digit);
  }

  // Fractional part via BigNumber accumulation
  let fracBN = new BigNumber(0);
  for (let i = 0; i < fracRaw.length; i++) {
    const digit = parseInt(fracRaw[i], 16);
    const denom = new BigNumber(16).exponentiatedBy(i + 1);
    const contributionBN = new BigNumber(digit).div(denom);
    steps.push({
      step: steps.length + 1,
      input: fracRaw[i].toUpperCase(),
      operation: `× 16^${-(i + 1)}`,
      output: contributionBN.toString(),
    });
    fracBN = fracBN.plus(contributionBN);
  }

  // Integer contribution steps (for display)
  for (let i = 0; i < intRaw.length; i++) {
    const ch = intRaw[intRaw.length - 1 - i] || "0";
    const digit = parseInt(ch, 16);
    const power = Math.pow(16, i);
    const contribution = digit * power;
    steps.push({
      step: steps.length + 1,
      input: ch.toUpperCase(),
      operation: `× 16^${i}`,
      output: contribution.toString(),
    });
  }

  const total = intBN.plus(fracBN);

  // Unsigned result string (fixed 20 fractional digits if fractional)
  const finalUnsignedStr =
    fracRaw.length > 0 ? total.toFixed(20) : total.toFixed();

  // Signed (two's complement) interpretation
  let signedBN = total;
  if (isExplicitlyNegative) {
    signedBN = total.negated();
  } else if (fracRaw.length === 0) {
    // Only apply C2 for pure integers with no explicit '-'
    const hasInt = (intRaw || "").length > 0;
    const msNibble = (intRaw || "0")[0];
    const msVal = parseInt(msNibble || "0", 16);
    const leadingNegative = hasInt && msVal >= 8;
    if (leadingNegative) {
      const shift = new BigNumber(16).exponentiatedBy((intRaw || "").length);
      signedBN = total.minus(shift);
    }
  } else {
    // Fractional inputs: disable C2; signed equals unsigned
    signedBN = total;
  }

  const finalSignedStr =
    fracRaw.length > 0 ? signedBN.toFixed(20) : signedBN.toFixed();
  const isNegative = signedBN.isNegative();

  return {
    input: hex.toUpperCase(),
    inputBase: "hexadecimal",
    output: finalUnsignedStr,
    outputBase: "decimal",
    steps,
    hasFractionalPart: fracRaw.length > 0,
    isNegative,
    signedResult: finalSignedStr,
  };
}

/**
 * Convert binary to octal by grouping bits in groups of 3
 */
export function binaryToOctal(binary: string): ConversionResult {
  const steps: ConversionStep[] = [];
  const clean = binary.replace(/\s/g, "");
  const isNegative = clean.startsWith("-");
  const unsigned = isNegative ? clean.slice(1) : clean;

  // Split integer and fractional parts
  const [intRaw, fracRaw = ""] = unsigned.split(".");

  // Pad integer (left) and fractional (right) to multiples of 3
  const padLeft = (s: string) =>
    s.length % 3 === 0 ? s : s.padStart(s.length + (3 - (s.length % 3)), "0");
  const padRight = (s: string) =>
    s.length % 3 === 0 ? s : s.padEnd(s.length + (3 - (s.length % 3)), "0");

  const intPadded = padLeft(intRaw || "0");
  const fracPadded = fracRaw ? padRight(fracRaw) : "";

  const intGroups: string[] = [];
  for (let i = 0; i < intPadded.length; i += 3)
    intGroups.push(intPadded.slice(i, i + 3));
  const fracGroups: string[] = [];
  for (let i = 0; i < fracPadded.length; i += 3)
    fracGroups.push(fracPadded.slice(i, i + 3));

  const intOct = intGroups.map((g, idx) => {
    const d = parseInt(g, 2).toString(8);
    steps.push({
      step: steps.length + 1,
      input: g,
      operation: "bin→oct",
      output: d,
    });
    return d;
  });
  const fracOct = fracGroups.map((g, idx) => {
    const d = parseInt(g, 2).toString(8);
    steps.push({
      step: steps.length + 1,
      input: g,
      operation: "bin→oct",
      output: d,
    });
    return d;
  });

  // Join and normalize integer part (remove leading zeros but leave at least one)
  const intJoined = intOct.join("").replace(/^0+/, "") || "0";
  const fracJoined = fracOct.join("");
  const magnitude = fracJoined ? `${intJoined}.${fracJoined}` : intJoined;
  const signed = isNegative ? `-${magnitude}` : magnitude;

  return {
    input: binary,
    inputBase: "binary",
    output: signed,
    outputBase: "octal",
    steps,
    isNegative,
    magnitude,
  };
}

/**
 * Convert octal to binary by expanding each digit
 */
export function octalToBinary(octal: string): ConversionResult {
  const steps: ConversionStep[] = [];
  const clean = octal.replace(/\s/g, "");
  const isNegative = clean.startsWith("-");
  const unsigned = isNegative ? clean.slice(1) : clean;

  const [intRaw, fracRaw = ""] = unsigned.split(".");

  // Map each octal digit to 3-bit binary
  const toBin3 = (d: string) => parseInt(d, 8).toString(2).padStart(3, "0");

  const intGroups: string[] = [];
  for (let i = 0; i < (intRaw || "0").length; i++) {
    const ch = intRaw[i] || "0";
    const bin = toBin3(ch);
    steps.push({
      step: steps.length + 1,
      input: ch,
      operation: "oct→bin",
      output: bin,
    });
    intGroups.push(bin);
  }

  const fracGroups: string[] = [];
  for (let i = 0; i < fracRaw.length; i++) {
    const ch = fracRaw[i];
    const bin = toBin3(ch);
    steps.push({
      step: steps.length + 1,
      input: ch,
      operation: "oct→bin",
      output: bin,
    });
    fracGroups.push(bin);
  }

  // Join and normalize
  let intJoined = intGroups.join("") || "0";
  intJoined = intJoined.replace(/^0+/, "") || "0";
  let fracJoined = fracGroups.join("");
  // Remove trailing zeros from fractional expansion (only padding zeros)
  fracJoined = fracJoined.replace(/0+$/, "");

  const magnitude = fracJoined ? `${intJoined}.${fracJoined}` : intJoined;
  const output = isNegative ? `-${magnitude}` : magnitude;

  return {
    input: octal,
    inputBase: "octal",
    output,
    outputBase: "binary",
    steps,
    isNegative,
    magnitude,
  };
}

/**
 * Convert binary to hexadecimal by grouping bits in groups of 4
 */
export function binaryToHexadecimal(binary: string): ConversionResult {
  const steps: ConversionStep[] = [];
  const clean = binary.replace(/\s/g, "");
  const isNegative = clean.startsWith("-");
  const unsigned = isNegative ? clean.slice(1) : clean;

  // Split integer and fractional parts
  const [intRaw, fracRaw = ""] = unsigned.split(".");

  // Padding helpers (4-bit nibble)
  const padLeft = (s: string) =>
    s.length % 4 === 0 ? s : s.padStart(s.length + (4 - (s.length % 4)), "0");
  const padRight = (s: string) =>
    s.length % 4 === 0 ? s : s.padEnd(s.length + (4 - (s.length % 4)), "0");

  const intPadded = padLeft(intRaw || "0");
  const fracPadded = fracRaw ? padRight(fracRaw) : "";

  const intGroups: string[] = [];
  for (let i = 0; i < intPadded.length; i += 4)
    intGroups.push(intPadded.slice(i, i + 4));
  const fracGroups: string[] = [];
  for (let i = 0; i < fracPadded.length; i += 4)
    fracGroups.push(fracPadded.slice(i, i + 4));

  const hexChars = "0123456789ABCDEF";
  const intHex = intGroups.map((g, idx) => {
    const d = parseInt(g, 2);
    const h = hexChars[d];
    steps.push({
      step: steps.length + 1,
      input: g,
      operation: "bin→hex",
      output: h,
    });
    return h;
  });
  const fracHex = fracGroups.map((g, idx) => {
    const d = parseInt(g, 2);
    const h = hexChars[d];
    steps.push({
      step: steps.length + 1,
      input: g,
      operation: "bin→hex",
      output: h,
    });
    return h;
  });

  // Normalize integer (remove leading zeros but preserve 0)
  const intJoined = intHex.join("").replace(/^0+/, "") || "0";
  const fracJoined = fracHex.join("");
  const magnitude = fracJoined ? `${intJoined}.${fracJoined}` : intJoined;
  const signed = isNegative ? `-${magnitude}` : magnitude;

  return {
    input: binary,
    inputBase: "binary",
    output: signed,
    outputBase: "hexadecimal",
    steps,
    isNegative,
    magnitude,
  };
}

/**
 * Convert hexadecimal to binary by expanding each digit
 */
export function hexadecimalToBinary(hex: string): ConversionResult {
  const steps: ConversionStep[] = [];
  const clean = hex.replace(/\s/g, "");
  const isNegative = clean.startsWith("-");
  const unsigned = isNegative ? clean.slice(1) : clean;

  // Split integer and fractional parts
  const [intRaw, fracRaw = ""] = unsigned.split(".");

  // Map each hex digit to 4-bit binary
  const toBinary4 = (h: string): string =>
    parseInt(h, 16).toString(2).padStart(4, "0");

  const intGroups: string[] = [];
  for (let i = 0; i < intRaw.length; i++) {
    const ch = intRaw[i];
    const bin = toBinary4(ch);
    steps.push({
      step: steps.length + 1,
      input: ch.toUpperCase(),
      operation: "hex→bin",
      output: bin,
    });
    intGroups.push(bin);
  }

  const fracGroups: string[] = [];
  for (let i = 0; i < fracRaw.length; i++) {
    const ch = fracRaw[i];
    const bin = toBinary4(ch);
    steps.push({
      step: steps.length + 1,
      input: ch.toUpperCase(),
      operation: "hex→bin",
      output: bin,
    });
    fracGroups.push(bin);
  }

  // Join and normalize integer and fractional parts
  const intJoinedRaw = intGroups.join("") || "0";
  const intJoined = intJoinedRaw.replace(/^0+/, "") || "0";

  let fracJoined = fracGroups.join("");
  // Remove trailing zeros in fractional part
  fracJoined = fracJoined.replace(/0+$/, "");

  const magnitude = fracRaw
    ? fracJoined
      ? `${intJoined}.${fracJoined}`
      : intJoined
    : intJoined;
  const output = isNegative ? `-${magnitude}` : magnitude;

  return {
    input: hex.toUpperCase(),
    inputBase: "hexadecimal",
    output,
    outputBase: "binary",
    steps,
    isNegative,
    magnitude,
  };
}

/**
 * Convert octal to hexadecimal through decimal
 */
export function octalToHexadecimal(octal: string): ConversionResult {
  // Route via our octal→decimal (with 20 fractional decimal digits) then decimal→hex (20 hex digits)
  const isNegative = octal.trim().startsWith("-");
  const dec = octalToDecimal(octal);
  const decStr = dec.output.replace(/[\s,]/g, "");
  const bigDec = new BigNumber(decStr); // treat as decimal value
  const hexRes = decimalToHexadecimal(bigDec);
  const magnitude = hexRes.magnitude || hexRes.output.replace(/^-/, "");
  const output = isNegative ? `-${magnitude}` : magnitude;

  return {
    input: octal,
    inputBase: "octal",
    output,
    outputBase: "hexadecimal",
    steps: [],
    isNegative,
    magnitude,
  };
}

/**
 * Convert hexadecimal to octal through decimal
 */
export function hexadecimalToOctal(hex: string): ConversionResult {
  const steps: ConversionStep[] = [];
  const clean = hex.replace(/\s/g, "");
  const isNegative = clean.startsWith("-");
  const unsigned = isNegative ? clean.slice(1) : clean;

  const [intHex = "", fracHex = ""] = unsigned.split(".");

  const toBin4 = (h: string) => parseInt(h, 16).toString(2).padStart(4, "0");

  // Expand hex → binary (nibbles)
  const intBin = (intHex || "0")
    .split("")
    .map((ch, i) => {
      const bin = toBin4(ch);
      steps.push({
        step: steps.length + 1,
        input: ch.toUpperCase(),
        operation: "hex→bin",
        output: bin,
      });
      return bin;
    })
    .join("");
  const fracBin = (fracHex || "")
    .split("")
    .map((ch) => {
      const bin = toBin4(ch);
      steps.push({
        step: steps.length + 1,
        input: ch.toUpperCase(),
        operation: "hex→bin",
        output: bin,
      });
      return bin;
    })
    .join("");

  // Normalize integer binary (remove leading zeros but keep one zero)
  const intBinNorm = intBin.replace(/^0+/, "") || "0";
  const fracBinRaw = fracBin; // keep as-is for regrouping

  // Regroup binary → octal (3-bit groups)
  const padLeft3 = (s: string) =>
    s.length % 3 === 0 ? s : s.padStart(s.length + (3 - (s.length % 3)), "0");
  const padRight3 = (s: string) =>
    s.length % 3 === 0 ? s : s.padEnd(s.length + (3 - (s.length % 3)), "0");

  const intPad3 = padLeft3(intBinNorm);
  const fracPad3 = padRight3(fracBinRaw);

  const groupsOf3 = (s: string) => {
    const arr: string[] = [];
    for (let i = 0; i < s.length; i += 3) arr.push(s.slice(i, i + 3));
    return arr;
  };

  const intTriads = groupsOf3(intPad3);
  const fracTriads = fracPad3 ? groupsOf3(fracPad3) : [];

  const intOctDigits = intTriads.map((g) => {
    const d = parseInt(g, 2).toString(8);
    steps.push({
      step: steps.length + 1,
      input: g,
      operation: "bin→oct",
      output: d,
    });
    return d;
  });
  let fracOctDigits = fracTriads.map((g) => {
    const d = parseInt(g, 2).toString(8);
    steps.push({
      step: steps.length + 1,
      input: g,
      operation: "bin→oct",
      output: d,
    });
    return d;
  });
  // If padding introduced a trailing zero digit, drop it
  const padCount = (3 - (fracBinRaw.length % 3)) % 3;
  if (
    padCount > 0 &&
    fracOctDigits.length > 0 &&
    fracOctDigits[fracOctDigits.length - 1] === "0"
  ) {
    fracOctDigits = fracOctDigits.slice(0, -1);
  }

  const intOct = intOctDigits.join("").replace(/^0+/, "") || "0";
  const fracOct = fracOctDigits.join("");
  const magnitude = fracOct ? `${intOct}.${fracOct}` : intOct;
  const signed = isNegative ? `-${magnitude}` : magnitude;

  return {
    input: hex.toUpperCase(),
    inputBase: "hexadecimal",
    output: signed,
    outputBase: "octal",
    steps,
    isNegative,
    magnitude,
  };
}

/**
 * Main conversion function that handles all base conversions
 */
export function convertBetweenBases(
  input: string,
  fromBase: BaseType,
  toBase: BaseType,
  format?: { totalBits: number; integerBits: number; fractionalBits: number },
  useGrouping: boolean = true,
  decimalToBinaryBits?: number,
  binaryToDecimalBits?: number
): ConversionResult {
  // Clean input
  const cleanInput = input.trim();

  if (!cleanInput) {
    throw new Error("La entrada no puede estar vacía");
  }

  // Handle bit length adjustments for decimal-binary and binary-decimal conversions
  let bitLengthWarning = "";
  let adjustedDecimalToBinaryBits = decimalToBinaryBits;
  let adjustedBinaryToDecimalBits = binaryToDecimalBits;

  if (fromBase === "decimal" && toBase === "binary" && decimalToBinaryBits) {
    // Handle large numbers that might be parsed as scientific notation
    let inputNum: number;
    if (cleanInput.includes("e") || cleanInput.includes("E")) {
      // If it's in scientific notation, parse it differently
      inputNum = parseFloat(cleanInput);
    } else if (cleanInput.length > 15) {
      // For very large numbers, use BigInt if possible
      try {
        inputNum = Number(cleanInput);
      } catch {
        inputNum = parseFloat(cleanInput);
      }
    } else {
      inputNum = parseFloat(cleanInput);
    }

    const requiredBits = calculateMinBits(inputNum);
    if (requiredBits > decimalToBinaryBits) {
      bitLengthWarning = `***ADVERTENCIA: La entrada requiere ${requiredBits} bits; se especificaron ${decimalToBinaryBits} bits. Se ajustó automáticamente a ${requiredBits} bits.`;
      adjustedDecimalToBinaryBits = requiredBits; // Use required bits
    }
  }

  if (fromBase === "binary" && toBase === "decimal" && binaryToDecimalBits) {
    const inputLength = cleanInput.replace(".", "").length;
    if (inputLength !== binaryToDecimalBits) {
      bitLengthWarning = `***ADVERTENCIA: La entrada tiene ${inputLength} bits; se especificaron ${binaryToDecimalBits} bits. Se ajustó automáticamente a ${inputLength} bits.`;
      adjustedBinaryToDecimalBits = inputLength; // Use actual input length
    }
  }

  // Validate input based on source base
  switch (fromBase) {
    case "binary":
      // Use the modular binary validation
      const binaryValidation = validateBinaryInput(cleanInput);
      if (!binaryValidation.isValid) {
        throw new Error(binaryValidation.error);
      }
      break;
    case "decimal":
      // Use the modular decimal validation
      const decimalValidation2 = validateDecimalInput(cleanInput);
      if (!decimalValidation2.isValid) {
        throw new Error(decimalValidation2.error);
      }
      break;
    case "octal":
      if (!/^-?[0-7]+(\.[0-7]+)?$/.test(cleanInput)) {
        throw new Error(
          "La entrada octal debe contener solo dígitos 0-7, con punto decimal opcional"
        );
      }
      break;
    case "hexadecimal":
      if (!/^-?[0-9A-Fa-f]+(\.[0-9A-Fa-f]+)?$/.test(cleanInput)) {
        throw new Error(
          "La entrada hexadecimal debe contener solo dígitos hexadecimales válidos, con punto decimal opcional"
        );
      }
      break;
  }

  // Respect user's explicit conversion direction choice
  const actualFromBase = fromBase;

  // Perform conversion
  const result = (() => {
    switch (`${actualFromBase}-${toBase}`) {
      case "decimal-binary":
        // Use the modular decimal-to-binary conversion
        const decimalValidation = validateDecimalInput(cleanInput);
        if (!decimalValidation.isValid) {
          throw new Error(decimalValidation.error);
        }

        let decimalValue: number | BigNumber;

        // Use BigNumber for fractional inputs or large integers to preserve precision
        if (
          cleanInput.includes(".") ||
          (cleanInput.length > 15 &&
            !cleanInput.includes("e") &&
            !cleanInput.includes("E"))
        ) {
          decimalValue = new BigNumber(cleanInput);
        } else {
          decimalValue = parseFloat(cleanInput);
          if (isNaN(decimalValue as number)) {
            throw new Error(
              "El número decimal no es válido o está fuera del rango representable."
            );
          }
        }

        return decimalToBinary(decimalValue, adjustedDecimalToBinaryBits);
      case "binary-decimal":
        return binaryToDecimal(cleanInput, adjustedBinaryToDecimalBits);
      case "decimal-octal":
        // Support big ass numbers - no input length restrictions
        if (!/^-?\d+(\.\d+)?$/.test(cleanInput)) {
          throw new Error(
            "Número decimal inválido. Solo se permiten dígitos, un punto decimal opcional y un signo negativo opcional."
          );
        }

        // Use BigNumber for fractional inputs or very large integers to avoid precision loss
        const useBigNumberOctal =
          cleanInput.includes(".") ||
          (cleanInput.length > 15 &&
            !cleanInput.includes("e") &&
            !cleanInput.includes("E"));

        if (useBigNumberOctal) {
          const bigDecimalValue = new BigNumber(cleanInput);
          return decimalToOctal(bigDecimalValue);
        } else {
          const octalDecimalValue = parseFloat(cleanInput);
          if (isNaN(octalDecimalValue)) {
            throw new Error(
              "El número decimal no es válido o está fuera del rango representable."
            );
          }
          return decimalToOctal(octalDecimalValue);
        }

      case "octal-decimal":
        return octalToDecimal(cleanInput);

      case "decimal-hexadecimal":
        // Support big ass numbers - no input length restrictions
        if (!/^-?\d+(\.\d+)?$/.test(cleanInput)) {
          throw new Error(
            "Número decimal inválido. Solo se permiten dígitos, un punto decimal opcional y un signo negativo opcional."
          );
        }

        // Use BigNumber for fractional inputs or very large integers to avoid precision loss
        const useBigNumberHex =
          cleanInput.includes(".") ||
          (cleanInput.length > 15 &&
            !cleanInput.includes("e") &&
            !cleanInput.includes("E"));

        if (useBigNumberHex) {
          const bigDecimalValue = new BigNumber(cleanInput);
          return decimalToHexadecimal(bigDecimalValue);
        } else {
          const hexDecimalValue = parseFloat(cleanInput);
          if (isNaN(hexDecimalValue)) {
            throw new Error(
              "El número decimal no es válido o está fuera del rango representable."
            );
          }
          return decimalToHexadecimal(hexDecimalValue);
        }
      case "hexadecimal-decimal":
        return hexadecimalToDecimal(cleanInput);
      case "binary-octal":
        return binaryToOctal(cleanInput);
      case "octal-binary":
        return octalToBinary(cleanInput);
      case "binary-hexadecimal":
        return binaryToHexadecimal(cleanInput);
      case "hexadecimal-binary":
        return hexadecimalToBinary(cleanInput);
      case "octal-hexadecimal":
        return octalToHexadecimal(cleanInput);
      case "hexadecimal-octal":
        return hexadecimalToOctal(cleanInput);
      default:
        throw new Error(
          `Conversion from ${fromBase} to ${toBase} not supported`
        );
    }
  })();

  // Apply digit grouping if enabled
  if (useGrouping) {
    // For octal/hexadecimal to binary conversions, don't apply standard binary grouping here
    // Keep it as continuous binary; UI (FormattedNumber) will handle base-aware grouping correctly
    if (
      !(
        (fromBase === "octal" || fromBase === "hexadecimal") &&
        toBase === "binary"
      )
    ) {
      result.output = formatWithGrouping(result.output, toBase);
    }
    // Don't format the input - keep it as originally entered
    // result.input = formatWithGrouping(result.input, fromBase);
  }

  // Add bit length warning if present
  if (bitLengthWarning) {
    result.bitLengthWarning = bitLengthWarning;
  }

  return result;
}

// getBaseName function moved to ./utils/calculation-helpers.ts

// getBaseNumber function moved to ./utils/calculation-helpers.ts

// Re-export conversion functions for backward compatibility
export {
  decimalToBinary,
  binaryToDecimal,
  validateDecimalInput,
  validateBinaryInput,
} from "./conversions";
