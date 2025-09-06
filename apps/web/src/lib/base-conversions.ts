export type BaseType = "binary" | "decimal" | "octal" | "hexadecimal";

/**
 * Format a number with proper digit grouping based on the base
 */
export function formatWithGrouping(value: string, base: BaseType): string {
  if (!value || value === "0") return value;

  // Handle negative numbers
  const isNegative = value.startsWith("-");
  const absValue = isNegative ? value.slice(1) : value;

  let formattedValue;
  switch (base) {
    case "binary":
      // Group binary digits in groups of 4 from right to left
      const result = [];
      for (let i = absValue.length; i > 0; i -= 4) {
        const start = Math.max(0, i - 4);
        const group = absValue.slice(start, i);
        result.unshift(group);
      }
      formattedValue = result.join(" ");
      break;
    case "octal":
      // Group octal digits in groups of 3 from right to left
      const octalResult = [];
      for (let i = absValue.length; i > 0; i -= 3) {
        const start = Math.max(0, i - 3);
        const group = absValue.slice(start, i);
        octalResult.unshift(group);
      }
      formattedValue = octalResult.join(" ");
      break;
    case "decimal":
      // Add commas for thousands in decimal
      formattedValue = absValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      break;
    case "hexadecimal":
      // Group hexadecimal digits in groups of 2 from right to left
      const hexResult = [];
      for (let i = absValue.length; i > 0; i -= 2) {
        const start = Math.max(0, i - 2);
        const group = absValue.slice(start, i);
        hexResult.unshift(group);
      }
      formattedValue = hexResult.join(" ");
      break;
    default:
      formattedValue = absValue;
  }

  // Return formatted value with negative sign if applicable
  return isNegative ? "-" + formattedValue : formattedValue;
}

/**
 * Format a value with proper digit grouping for display (without spaces/commas removal)
 */
export function formatDisplayValue(value: string, base: BaseType): string {
  if (!value || value === "0") return value;

  switch (base) {
    case "binary":
      // Group binary digits in groups of 4 from right to left
      const result = [];
      for (let i = value.length; i > 0; i -= 4) {
        const start = Math.max(0, i - 4);
        const group = value.slice(start, i);
        result.unshift(group);
      }
      return result.join(" ");
    case "octal":
      // Group octal digits in groups of 3 from right to left
      const octalResult = [];
      for (let i = value.length; i > 0; i -= 3) {
        const start = Math.max(0, i - 3);
        const group = value.slice(start, i);
        octalResult.unshift(group);
      }
      return octalResult.join(" ");
    case "hexadecimal":
      // Group hexadecimal digits in groups of 2 from right to left
      const hexResult = [];
      for (let i = value.length; i > 0; i -= 2) {
        const start = Math.max(0, i - 2);
        const group = value.slice(start, i);
        hexResult.unshift(group);
      }
      return hexResult.join(" ");
    default:
      return value;
  }
}

/**
 * Clean formatted values by removing spaces and commas for input parsing
 */
export function cleanFormattedValue(value: string): string {
  return value.replace(/[\s,]/g, "");
}

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
  integerSteps?: Array<{ quotient: number; remainder: number }>;
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

/**
 * Calculate the minimum bits needed to represent a number in two's complement
 */
function calculateMinBits(decimal: number): number {
  if (decimal === 0) return 1;

  const absValue = Math.abs(decimal);

  // For two's complement, we always need at least 1 sign bit + magnitude bits
  const magnitudeBits = Math.ceil(Math.log2(absValue + 1));
  return magnitudeBits + 1; // +1 for sign bit
}

/**
 * Convert decimal to binary using division by 2 method with two's complement support
 */
export function decimalToBinary(
  decimal: number,
  specifiedBits?: number
): ConversionResult {
  const minBits = calculateMinBits(decimal);
  const bitWidth = specifiedBits || minBits;
  const steps: ConversionStep[] = [];
  const integerSteps: Array<{ quotient: number; remainder: number }> = [];
  const fractionalSteps: Array<{ value: number; bit: number }> = [];

  const isNegative = decimal < 0;
  const absValue = Math.abs(decimal);
  const hasFractionalPart = absValue % 1 !== 0;

  let quotient = Math.floor(absValue);
  const remainders: string[] = [];

  // Step 1: Convert absolute value to binary using division by 2
  if (quotient > 0 || !hasFractionalPart) {
    while (quotient > 0) {
      const remainder = quotient % 2;
      integerSteps.push({ quotient, remainder });
      remainders.unshift(remainder.toString());
      quotient = Math.floor(quotient / 2);
    }
  }

  let magnitude = remainders.join("") || "0";

  // Step 2: Pad to the correct bit width
  magnitude = magnitude.padStart(bitWidth, "0");

  // Fractional part conversion
  let fractionalResult = "";
  if (hasFractionalPart) {
    let fractionalPart = absValue - Math.floor(absValue);
    const fractionalBits: string[] = [];

    // Initial fractional step
    fractionalSteps.push({ value: fractionalPart, bit: -1 }); // Special marker for initial

    while (fractionalPart > 0 && fractionalBits.length < 10) {
      fractionalPart *= 2;
      const bit = Math.floor(fractionalPart);
      fractionalSteps.push({ value: fractionalPart, bit });
      fractionalBits.push(bit.toString());
      fractionalPart -= bit;
    }

    fractionalResult = fractionalBits.join("");
    magnitude += "." + fractionalResult;
  }

  // Handle signed representation for negative numbers
  let signedResult = magnitude;
  let invertedBits = "";
  if (isNegative && magnitude !== "0") {
    // Step 3: Invert the bits (C1 - One's complement)
    invertedBits = magnitude
      .split("")
      .map((bit) => (bit === "0" ? "1" : "0"))
      .join("");

    // Step 4: Add 1 to get two's complement (C2) - maintain bit width
    let resultBits = "";
    let carry = 1; // Start with carry = 1 (adding 1)

    // Process from right to left (LSB to MSB)
    for (let i = invertedBits.length - 1; i >= 0; i--) {
      const bit = parseInt(invertedBits[i]);
      const sum = bit + carry;

      if (sum === 2) {
        resultBits = "0" + resultBits;
        carry = 1;
      } else {
        resultBits = sum.toString() + resultBits;
        carry = 0;
      }
    }

    // Handle final carry - this can increase the bit width
    if (carry === 1) {
      resultBits = "1" + resultBits;
    }

    // Maintain exact bit width by truncating if necessary
    if (resultBits.length > bitWidth) {
      // Truncate from the left (MSB) to maintain bit width
      resultBits = resultBits.slice(-bitWidth);
    } else if (resultBits.length < bitWidth) {
      // Pad with zeros on the left if shorter
      resultBits = resultBits.padStart(bitWidth, "0");
    }

    signedResult = resultBits;
  }

  const flags = {
    sign: isNegative,
    zero: decimal === 0,
    overflow: false, // Could add overflow detection
  };

  return {
    input: decimal.toString(),
    inputBase: "decimal",
    output: signedResult,
    outputBase: "binary",
    steps,
    hasFractionalPart,
    integerSteps,
    fractionalSteps,
    isNegative,
    magnitude, // This is the padded binary magnitude
    signedResult,
    flags,
  };
}

/**
 * Convert binary to decimal using positional weighting
 */
export function binaryToDecimal(
  binary: string,
  specifiedBits?: number
): ConversionResult {
  const actualBits = binary.length;
  const bitWidth = specifiedBits || actualBits;
  const steps: ConversionStep[] = [];
  const integerSteps: Array<{ quotient: number; remainder: number }> = [];
  const fractionalSteps: Array<{ value: number; bit: number }> = [];
  let decimal = 0;
  const hasFractionalPart = binary.includes(".");

  if (hasFractionalPart) {
    const [integerPart, fractionalPart] = binary.split(".");

    // Convert integer part
    for (let i = 0; i < integerPart.length; i++) {
      const bit = parseInt(integerPart[integerPart.length - 1 - i]);
      const power = Math.pow(2, i);
      const contribution = bit * power;

      steps.push({
        step: steps.length + 1,
        input: integerPart[integerPart.length - 1 - i],
        operation: `× 2^${i}`,
        output: contribution.toString(),
      });

      decimal += contribution;
    }

    // Convert fractional part
    for (let i = 0; i < fractionalPart.length; i++) {
      const bit = parseInt(fractionalPart[i]);
      const power = Math.pow(2, -(i + 1));
      const contribution = bit * power;

      steps.push({
        step: steps.length + 1,
        input: fractionalPart[i],
        operation: `× 2^${-(i + 1)}`,
        output: contribution.toString(),
      });

      decimal += contribution;
    }

    // Add fractional steps for table display
    fractionalSteps.push({ value: parseFloat("0." + fractionalPart), bit: -1 });
    for (let i = 0; i < fractionalPart.length; i++) {
      const bit = parseInt(fractionalPart[i]);
      fractionalSteps.push({
        value: parseFloat("0." + fractionalPart.slice(i)),
        bit,
      });
    }
  } else {
    // Integer only
    for (let i = 0; i < binary.length; i++) {
      const bit = parseInt(binary[binary.length - 1 - i]);
      const power = Math.pow(2, i);
      const contribution = bit * power;

      steps.push({
        step: i + 1,
        input: binary[binary.length - 1 - i],
        operation: `× 2^${i}`,
        output: contribution.toString(),
      });

      decimal += contribution;
    }
  }

  // Handle two's complement for negative numbers (leading '1' bit)
  const isNegative = binary.replace(".", "").startsWith("1");
  if (isNegative) {
    decimal = decimal - Math.pow(2, bitWidth);
  }

  const flags = {
    sign: isNegative,
    zero: decimal === 0,
    overflow: false,
  };

  return {
    input: binary,
    inputBase: "binary",
    output: decimal.toString(),
    outputBase: "decimal",
    steps,
    hasFractionalPart,
    integerSteps,
    fractionalSteps,
    isNegative: false,
    magnitude: binary,
    signedResult: decimal.toString(),
    flags,
  };
}

/**
 * Convert decimal to octal using division by 8 method
 */
export function decimalToOctal(decimal: number): ConversionResult {
  const steps: ConversionStep[] = [];
  const integerSteps: Array<{ quotient: number; remainder: number }> = [];
  const fractionalSteps: Array<{ value: number; bit: number }> = [];

  const isNegative = decimal < 0;
  const absValue = Math.abs(decimal);
  const hasFractionalPart = absValue % 1 !== 0;

  let quotient = Math.floor(absValue);
  const remainders: string[] = [];

  // Integer part conversion
  if (quotient > 0 || !hasFractionalPart) {
    while (quotient > 0) {
      const remainder = quotient % 8;
      integerSteps.push({ quotient, remainder });
      remainders.unshift(remainder.toString());
      quotient = Math.floor(quotient / 8);
    }
  }

  let magnitude = remainders.join("") || "0";

  // Fractional part conversion
  let fractionalResult = "";
  if (hasFractionalPart) {
    let fractionalPart = absValue - Math.floor(absValue);
    const fractionalBits: string[] = [];

    // Initial fractional step
    fractionalSteps.push({ value: fractionalPart, bit: -1 }); // Special marker for initial

    while (fractionalPart > 0 && fractionalBits.length < 10) {
      fractionalPart *= 8;
      const bit = Math.floor(fractionalPart);
      fractionalSteps.push({ value: fractionalPart, bit });
      fractionalBits.push(bit.toString(8));
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
export function decimalToHexadecimal(decimal: number): ConversionResult {
  const steps: ConversionStep[] = [];
  const integerSteps: Array<{ quotient: number; remainder: number }> = [];
  const fractionalSteps: Array<{ value: number; bit: number }> = [];

  const isNegative = decimal < 0;
  const absValue = Math.abs(decimal);
  const hasFractionalPart = absValue % 1 !== 0;

  let quotient = Math.floor(absValue);
  const remainders: string[] = [];

  const hexDigits = "0123456789ABCDEF";

  // Integer part conversion
  if (quotient > 0 || !hasFractionalPart) {
    while (quotient > 0) {
      const remainder = quotient % 16;
      integerSteps.push({ quotient, remainder });
      remainders.unshift(hexDigits[remainder]);
      quotient = Math.floor(quotient / 16);
    }
  }

  let magnitude = remainders.join("") || "0";

  // Fractional part conversion
  let fractionalResult = "";
  if (hasFractionalPart) {
    let fractionalPart = absValue - Math.floor(absValue);
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
  const decimalValue = Math.abs(decimal);

  // For large numbers, we need to ensure consistent bit width for both positive and negative
  if (decimalValue > 0x7fffffff) {
    // Determine the appropriate bit width based on the number size
    const binaryLength = decimalValue.toString(2).length;
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
      signedResult = decimalValue
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
    const twosComplementValue = maxValue - BigInt(decimalValue);
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
  let paddedBinary = binary;

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

  return {
    input: binary,
    inputBase: "binary",
    output: octalDigits.join(""),
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
    const inputNum = parseFloat(cleanInput);
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
      if (!/^-?[01]+(\.[01]+)?$/.test(cleanInput)) {
        throw new Error(
          "La entrada binaria debe contener solo 0s y 1s, con punto decimal opcional"
        );
      }
      break;
    case "decimal":
      if (!/^-?\d+(\.\d+)?$/.test(cleanInput)) {
        throw new Error(
          "La entrada decimal debe contener solo dígitos, con punto decimal opcional"
        );
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

  // Perform conversion
  const result = (() => {
    switch (`${fromBase}-${toBase}`) {
      case "decimal-binary":
        return decimalToBinary(
          parseFloat(cleanInput),
          adjustedDecimalToBinaryBits
        );
      case "binary-decimal":
        return binaryToDecimal(cleanInput, adjustedBinaryToDecimalBits);
      case "decimal-octal":
        return decimalToOctal(parseFloat(cleanInput));
      case "octal-decimal":
        return octalToDecimal(cleanInput);
      case "decimal-hexadecimal":
        return decimalToHexadecimal(parseFloat(cleanInput));
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
    result.input = formatWithGrouping(result.input, fromBase);
  }

  // Add bit length warning if present
  if (bitLengthWarning) {
    result.bitLengthWarning = bitLengthWarning;
  }

  return result;
}

/**
 * Get the name of a base in Spanish
 */
export function getBaseName(base: BaseType): string {
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
export function getBaseNumber(base: BaseType): number {
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
