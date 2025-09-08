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
  const integerSteps: Array<{ quotient: number; remainder: number }> = [];
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
      integerSteps.push({ quotient: quotient.toNumber(), remainder });
      remainders.unshift(remainder.toString());
      quotient = quotient.div(8).integerValue(BigNumber.ROUND_DOWN);
    }
  }

  let magnitude = remainders.join("") || "0";

  // Fractional part conversion (only for regular numbers, not BigNumbers for now)
  let fractionalResult = "";
  if (hasFractionalPart && !isBigNumber) {
    let fractionalPart = absValue.toNumber() - Math.floor(absValue.toNumber());
    const fractionalBits: string[] = [];

    // Initial fractional step
    fractionalSteps.push({ value: fractionalPart, bit: -1 }); // Special marker for initial

    while (fractionalPart > 0 && fractionalBits.length < 10) {
      fractionalPart *= 8;
      const bit = Math.floor(fractionalPart);
      fractionalSteps.push({ value: fractionalPart, bit });
      fractionalBits.push(bit.toString());
      fractionalPart -= bit;
    }

    fractionalResult = fractionalBits.join("");
    magnitude += "." + fractionalResult;
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
  let decimal = 0;
  const isNegative = octal.startsWith("-");
  const cleanOctal = isNegative ? octal.slice(1) : octal;

  for (let i = 0; i < cleanOctal.length; i++) {
    const digit = parseInt(cleanOctal[cleanOctal.length - 1 - i], 8);
    const power = Math.pow(8, i);
    const contribution = digit * power;

    steps.push({
      step: i + 1,
      input: cleanOctal[cleanOctal.length - 1 - i],
      operation: `× 8^${i}`,
      output: contribution.toString(),
    });

    decimal += contribution;
  }

  const result = isNegative ? -decimal : decimal;

  return {
    input: octal,
    inputBase: "octal",
    output: result.toString(),
    outputBase: "decimal",
    steps,
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
  const integerSteps: Array<{ quotient: number; remainder: number }> = [];
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
      integerSteps.push({ quotient: quotient.toNumber(), remainder });
      remainders.unshift(hexDigits[remainder]);
      quotient = quotient.div(16).integerValue(BigNumber.ROUND_DOWN);
    }
  }

  let magnitude = remainders.join("") || "0";

  // Fractional part conversion (only for regular numbers, not BigNumbers for now)
  let fractionalResult = "";
  if (hasFractionalPart && !isBigNumber) {
    let fractionalPart = absValue.toNumber() - Math.floor(absValue.toNumber());
    const fractionalBits: string[] = [];

    // Initial fractional step
    fractionalSteps.push({ value: fractionalPart, bit: -1 }); // Special marker for initial

    while (fractionalPart > 0 && fractionalBits.length < 10) {
      fractionalPart *= 16;
      const bit = Math.floor(fractionalPart);
      fractionalSteps.push({ value: fractionalPart, bit });
      fractionalBits.push(hexDigits[bit]);
      fractionalPart -= bit;
    }

    fractionalResult = fractionalBits.join("");
    magnitude += "." + fractionalResult;
  }

  // Handle signed representation - for hexadecimal, use two's complement
  let signedResult = magnitude;
  let twosComplementHex = "";
  const decimalValue = isBigNumber ? bigDecimal.abs() : Math.abs(decimal);

  // For large numbers, we need to ensure consistent bit width for both positive and negative
  const shouldUseLargeFormat =
    isBigNumber ||
    (typeof decimal === "number" && Math.abs(decimal) > 0x7fffffff);

  if (shouldUseLargeFormat) {
    // Determine the appropriate bit width based on the number size
    const binaryLength = isBigNumber
      ? bigDecimal.toString(2).length
      : decimalValue.toString(2).length;
    let bitWidth;

    if (binaryLength <= 32) {
      bitWidth = 32; // 4 bytes
    } else if (binaryLength <= 48) {
      bitWidth = 48; // 6 bytes
    } else {
      bitWidth = 64; // 8 bytes - use 64-bit for larger numbers
    }

    // For large numbers, pad to the calculated bit width for consistency
    if (!isNegative) {
      signedResult = isBigNumber
        ? bigDecimal
            .toString(16)
            .toUpperCase()
            .padStart(bitWidth / 4, "0")
        : decimalValue
            .toString(16)
            .toUpperCase()
            .padStart(bitWidth / 4, "0");
    }
  }

  if (isNegative && magnitude !== "0") {
    // Main result is direct hex with negative sign
    signedResult = "-" + magnitude;

    // Calculate two's complement separately
    const binaryLength = decimalValue.toString(2).length;
    let bitWidth;

    if (binaryLength <= 32) {
      bitWidth = 32; // 4 bytes
    } else if (binaryLength <= 48) {
      bitWidth = 48; // 6 bytes
    } else {
      bitWidth = 64; // 8 bytes - use 64-bit for larger numbers
    }

    // For negative numbers, calculate two's complement: 2^bitWidth - |value|
    const maxValue = BigInt(1) << BigInt(bitWidth);
    const bigIntValue = isBigNumber
      ? BigInt((decimalValue as BigNumber).toString())
      : BigInt(decimalValue as number);
    const twosComplementValue = maxValue - bigIntValue;
    twosComplementHex = twosComplementValue
      .toString(16)
      .toUpperCase()
      .padStart(bitWidth / 4, "0");
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
  let decimal = 0;
  const isNegative = hex.startsWith("-");
  const cleanHex = isNegative ? hex.slice(1) : hex;

  for (let i = 0; i < cleanHex.length; i++) {
    const digit = parseInt(cleanHex[cleanHex.length - 1 - i], 16);
    const power = Math.pow(16, i);
    const contribution = digit * power;

    steps.push({
      step: i + 1,
      input: cleanHex[cleanHex.length - 1 - i].toUpperCase(),
      operation: `× 16^${i}`,
      output: contribution.toString(),
    });

    decimal += contribution;
  }

  const result = isNegative ? -decimal : decimal;

  return {
    input: hex.toUpperCase(),
    inputBase: "hexadecimal",
    output: result.toString(),
    outputBase: "decimal",
    steps,
    isNegative,
  };
}

/**
 * Convert binary to octal by grouping bits in groups of 3
 */
export function binaryToOctal(binary: string): ConversionResult {
  const steps: ConversionStep[] = [];
  let paddedBinary = binary.replace(/\s/g, ""); // Remove spaces first

  // Pad with zeros on the left to make length divisible by 3
  while (paddedBinary.length % 3 !== 0) {
    paddedBinary = "0" + paddedBinary;
  }

  // Group into chunks of 3 bits
  const groups: string[] = [];
  for (let i = 0; i < paddedBinary.length; i += 3) {
    groups.push(paddedBinary.slice(i, i + 3));
  }

  // Convert each group to octal
  const octalDigits: string[] = [];
  groups.forEach((group, index) => {
    const decimal = parseInt(group, 2);
    const octal = decimal.toString(8);

    steps.push({
      step: index + 1,
      input: group,
      operation: "Binary to Octal",
      output: octal,
    });

    octalDigits.push(octal);
  });

  // Remove leading zeros from the final result
  const result = octalDigits.join("").replace(/^0+/, "") || "0";

  return {
    input: binary,
    inputBase: "binary",
    output: result,
    outputBase: "octal",
    steps,
  };
}

/**
 * Convert octal to binary by expanding each digit
 */
export function octalToBinary(octal: string): ConversionResult {
  const steps: ConversionStep[] = [];
  const binaryGroups: string[] = [];
  const isNegative = octal.startsWith("-");
  const cleanOctal = isNegative
    ? octal.slice(1).replace(/\s/g, "")
    : octal.replace(/\s/g, "");

  for (let i = 0; i < cleanOctal.length; i++) {
    const digit = parseInt(cleanOctal[i], 8);
    const binary = digit.toString(2).padStart(3, "0");

    steps.push({
      step: i + 1,
      input: cleanOctal[i],
      operation: "Octal to Binary",
      output: binary,
    });

    binaryGroups.push(binary);
  }

  const binaryResult = binaryGroups.join("");

  return {
    input: octal,
    inputBase: "octal",
    output: isNegative ? "-" + binaryResult : binaryResult,
    outputBase: "binary",
    steps,
    isNegative,
  };
}

/**
 * Convert binary to hexadecimal by grouping bits in groups of 4
 */
export function binaryToHexadecimal(binary: string): ConversionResult {
  const steps: ConversionStep[] = [];
  let paddedBinary = binary;

  // Pad with zeros on the left to make length divisible by 4
  while (paddedBinary.length % 4 !== 0) {
    paddedBinary = "0" + paddedBinary;
  }

  // Group into chunks of 4 bits
  const groups: string[] = [];
  for (let i = 0; i < paddedBinary.length; i += 4) {
    groups.push(paddedBinary.slice(i, i + 4));
  }

  // Convert each group to hexadecimal
  const hexDigits: string[] = [];
  const hexChars = "0123456789ABCDEF";
  groups.forEach((group, index) => {
    const decimal = parseInt(group, 2);
    const hex = hexChars[decimal];

    steps.push({
      step: index + 1,
      input: group,
      operation: "Binary to Hex",
      output: hex,
    });

    hexDigits.push(hex);
  });

  return {
    input: binary,
    inputBase: "binary",
    output: hexDigits.join(""),
    outputBase: "hexadecimal",
    steps,
  };
}

/**
 * Convert hexadecimal to binary by expanding each digit
 */
export function hexadecimalToBinary(hex: string): ConversionResult {
  const steps: ConversionStep[] = [];
  const binaryGroups: string[] = [];

  for (let i = 0; i < hex.length; i++) {
    const digit = parseInt(hex[i], 16);
    const binary = digit.toString(2).padStart(4, "0");

    steps.push({
      step: i + 1,
      input: hex[i].toUpperCase(),
      operation: "Hex to Binary",
      output: binary,
    });

    binaryGroups.push(binary);
  }

  return {
    input: hex.toUpperCase(),
    inputBase: "hexadecimal",
    output: binaryGroups.join(""),
    outputBase: "binary",
    steps,
  };
}

/**
 * Convert octal to hexadecimal through decimal
 */
export function octalToHexadecimal(octal: string): ConversionResult {
  const octalToDec = octalToDecimal(octal);
  const decToHex = decimalToHexadecimal(parseInt(octalToDec.output));

  return {
    input: octal,
    inputBase: "octal",
    output: decToHex.output,
    outputBase: "hexadecimal",
    steps: octalToDec.steps,
    intermediateSteps: decToHex.steps,
  };
}

/**
 * Convert hexadecimal to octal through decimal
 */
export function hexadecimalToOctal(hex: string): ConversionResult {
  const hexToDec = hexadecimalToDecimal(hex);
  const decToOctal = decimalToOctal(parseInt(hexToDec.output));

  return {
    input: hex.toUpperCase(),
    inputBase: "hexadecimal",
    output: decToOctal.output,
    outputBase: "octal",
    steps: hexToDec.steps,
    intermediateSteps: decToOctal.steps,
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

        if (
          cleanInput.length > 15 &&
          !cleanInput.includes(".") &&
          !cleanInput.includes("e") &&
          !cleanInput.includes("E")
        ) {
          // For very large integers, use BigNumber to preserve exact value
          decimalValue = new BigNumber(cleanInput);
        } else {
          decimalValue = parseFloat(cleanInput);
          // Check for NaN (invalid number)
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

        let useBigNumberOctal = false;
        if (
          cleanInput.length > 15 &&
          !cleanInput.includes(".") &&
          !cleanInput.includes("e") &&
          !cleanInput.includes("E")
        ) {
          const testParse = parseFloat(cleanInput);
          if (
            testParse.toString().includes("e") ||
            testParse.toString().includes("E")
          ) {
            useBigNumberOctal = true;
          }
        }

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

        let useBigNumberHex = false;
        if (
          cleanInput.length > 15 &&
          !cleanInput.includes(".") &&
          !cleanInput.includes("e") &&
          !cleanInput.includes("E")
        ) {
          const testParse = parseFloat(cleanInput);
          if (
            testParse.toString().includes("e") ||
            testParse.toString().includes("E")
          ) {
            useBigNumberHex = true;
          }
        }

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
    // For octal to binary conversion, don't apply standard binary grouping
    // Keep it as continuous binary (3 bits per octal digit)
    if (!(fromBase === "octal" && toBase === "binary")) {
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
