import BigNumber from "bignumber.js";
import type {
  ConversionResult,
  ConversionStep,
  BaseType,
  BigNumberType,
} from "../utils/conversion-types";
import { formatDecimalOutput } from "../utils/formatting-utils";

/**
 * Binary to Decimal Conversion Operations
 * Handles all conversions from binary to decimal with proper BigInt support for large numbers
 */

/**
 * Convert binary to decimal using positional weighting
 */
export function binaryToDecimal(
  binary: string,
  specifiedBits?: number
): ConversionResult {
  // Clean the input by removing spaces
  const cleanBinary = binary.replace(/\s/g, "");
  const isExplicitlyNegative = cleanBinary.startsWith("-");
  const binaryWithoutSign = isExplicitlyNegative
    ? cleanBinary.slice(1)
    : cleanBinary;
  const actualBits = binaryWithoutSign.length;
  const bitWidth = specifiedBits || actualBits;
  const steps: ConversionStep[] = [];
  const integerSteps: Array<{ quotient: number; remainder: number }> = [];
  const fractionalSteps: Array<{ value: number; bit: number }> = [];

  // For large binary numbers (> 53 bits), use BigInt to avoid precision loss
  const useBigInt = binaryWithoutSign.length > 53;

  let decimal: number | bigint = 0;
  let unsignedBN: BigNumber | null = null;
  let signedBN: BigNumber | null = null;
  const hasFractionalPart = binaryWithoutSign.includes(".");

  if (hasFractionalPart) {
    // Handle fractional binary precisely using BigNumber
    const [integerPart, fractionalPart] = binaryWithoutSign.split(".");

    // Convert integer part contributions (for steps) and accumulate using BigInt first
    let intBigInt = BigInt(0);
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

      intBigInt += BigInt(contribution);
    }

    // Convert fractional part using BigNumber
    let fracBN = new BigNumber(0);
    for (let i = 0; i < fractionalPart.length; i++) {
      const bit = parseInt(fractionalPart[i]);
      if (bit === 0) {
        // still add a step for completeness
        steps.push({
          step: steps.length + 1,
          input: fractionalPart[i],
          operation: `× 2^${-(i + 1)}`,
          output: "0",
        });
        continue;
      }
      const denom = new BigNumber(2).exponentiatedBy(i + 1);
      const contribution = new BigNumber(1).div(denom);
      steps.push({
        step: steps.length + 1,
        input: fractionalPart[i],
        operation: `× 2^${-(i + 1)}`,
        output: contribution.toString(),
      });
      fracBN = fracBN.plus(contribution);
    }

    // Populate fractionalSteps for table (value shows remaining fraction view)
    fractionalSteps.push({ value: parseFloat("0." + fractionalPart), bit: -1 });
    for (let i = 0; i < fractionalPart.length; i++) {
      const bit = parseInt(fractionalPart[i]);
      fractionalSteps.push({
        value: parseFloat("0." + fractionalPart.slice(i)),
        bit,
      });
    }

    const totalBN = new BigNumber(intBigInt.toString()).plus(fracBN);
    unsignedBN = totalBN;
    decimal = totalBN.toNumber(); // retain numeric approx for step math only
  } else {
    // Integer only - use BigInt for large numbers
    if (useBigInt) {
      try {
        const bigIntValue = BigInt("0b" + binaryWithoutSign);
        decimal = bigIntValue;

        // Create steps for large numbers (simplified)
        steps.push({
          step: 1,
          input: binaryWithoutSign,
          operation: "Convert to BigInt",
          output: bigIntValue.toString(),
        });
      } catch (error) {
        // Fallback to regular conversion if BigInt fails
        for (let i = 0; i < Math.min(binaryWithoutSign.length, 53); i++) {
          const bit = parseInt(
            binaryWithoutSign[binaryWithoutSign.length - 1 - i]
          );
          const power = Math.pow(2, i);
          const contribution = bit * power;

          steps.push({
            step: i + 1,
            input: binaryWithoutSign[binaryWithoutSign.length - 1 - i],
            operation: `× 2^${i}`,
            output: contribution.toString(),
          });

          decimal = (decimal as number) + contribution;
        }
      }
    } else {
      // Regular conversion for smaller numbers
      for (let i = 0; i < binaryWithoutSign.length; i++) {
        const bit = parseInt(
          binaryWithoutSign[binaryWithoutSign.length - 1 - i]
        );
        const power = Math.pow(2, i);
        const contribution = bit * power;

        steps.push({
          step: i + 1,
          input: binaryWithoutSign[binaryWithoutSign.length - 1 - i],
          operation: `× 2^${i}`,
          output: contribution.toString(),
        });

        decimal = (decimal as number) + contribution;
      }
    }
  }

  // Compute unsigned and signed (two's complement) interpretations
  const [integerPart, fractionalPart = ""] = binaryWithoutSign.split(".");
  const integerBitLength = integerPart.length || 0;
  const unsignedDecimal = decimal;

  let signedDecimal: number | bigint;
  if (unsignedBN) {
    // Fractional present: compute signed with BigNumber to avoid BigInt/number mixing
    if (isExplicitlyNegative) {
      signedBN = unsignedBN.negated();
    } else {
      const leadingOne = integerPart.startsWith("1");
      signedBN = leadingOne
        ? unsignedBN.minus(new BigNumber(2).exponentiatedBy(integerBitLength))
        : unsignedBN;
    }
    signedDecimal = signedBN.toNumber();
  } else {
    if (isExplicitlyNegative) {
      signedDecimal = useBigInt
        ? -(unsignedDecimal as bigint)
        : -(unsignedDecimal as number);
    } else {
      const leadingOne = integerPart.startsWith("1");
      if (leadingOne) {
        if (useBigInt) {
          signedDecimal =
            (unsignedDecimal as bigint) -
            (BigInt(1) << BigInt(integerBitLength));
        } else {
          signedDecimal =
            (unsignedDecimal as number) - Math.pow(2, integerBitLength);
        }
      } else {
        signedDecimal = unsignedDecimal;
      }
    }
  }

  // For fractional numbers, render with fixed 20 fractional digits for stability
  const renderDecimal = (val: number | bigint, hasFrac: boolean): string => {
    if (typeof val === "bigint") return val.toString();
    if (hasFrac) {
      const bn = new BigNumber(val);
      return bn.toFixed(20);
    }
    return formatDecimalOutput(val);
  };

  const finalUnsignedStr = unsignedBN
    ? unsignedBN.toFixed(20)
    : renderDecimal(unsignedDecimal, hasFractionalPart);
  const finalSignedStr = ((): string => {
    if (signedBN) return signedBN.toFixed(20);
    return renderDecimal(signedDecimal, hasFractionalPart);
  })();
  const isNegative =
    typeof signedDecimal === "bigint"
      ? signedDecimal < BigInt(0)
      : (signedDecimal as number) < 0;

  const flags = {
    sign: isNegative,
    zero:
      (typeof signedDecimal === "bigint" && signedDecimal === BigInt(0)) ||
      (typeof signedDecimal === "number" && signedDecimal === 0),
    overflow: false,
  };

  return {
    input: binary,
    inputBase: "binary",
    output: finalUnsignedStr,
    outputBase: "decimal",
    steps,
    hasFractionalPart,
    integerSteps,
    fractionalSteps,
    isNegative,
    magnitude: binaryWithoutSign,
    signedResult: finalSignedStr,
    flags,
  };
}

/**
 * Validate binary input for decimal conversion
 */
export function validateBinaryInput(input: string): {
  isValid: boolean;
  error?: string;
} {
  if (!input.trim()) {
    return { isValid: false, error: "La entrada no puede estar vacía" };
  }

  // Remove spaces for validation
  const cleanInput = input.replace(/\s/g, "");

  // Check for valid binary format (only 0s and 1s, optional leading -)
  if (!/^-?[01]+(\.[01]+)?$/.test(cleanInput)) {
    return {
      isValid: false,
      error: "Formato binario inválido. Use solo 0s y 1s.",
    };
  }

  // No input length restrictions - support big ass numbers

  return { isValid: true };
}

/**
 * Calculate two's complement interpretation of binary number
 */
export function calculateTwosComplement(binary: string): {
  unsigned: string;
  signed: string;
} {
  const cleanBinary = binary.replace(/\s/g, "").replace(/^-/, "");
  const bitLength = cleanBinary.length;

  // For large numbers, use BigInt to avoid precision issues
  if (bitLength > 53) {
    // For very large binary numbers, calculate two's complement using string manipulation
    if (cleanBinary.startsWith("1")) {
      // Negative number in two's complement
      const inverted = cleanBinary
        .split("")
        .map((bit) => (bit === "0" ? "1" : "0"))
        .join("");
      const invertedBigInt = BigInt("0b" + inverted);
      const twosComplement = (invertedBigInt + BigInt(1)).toString();
      return {
        unsigned: BigInt("0b" + cleanBinary).toString(),
        signed: "-" + twosComplement,
      };
    } else {
      // Positive number
      const unsignedBigInt = BigInt("0b" + cleanBinary);
      return {
        unsigned: unsignedBigInt.toString(),
        signed: unsignedBigInt.toString(),
      };
    }
  } else {
    // For smaller numbers, use regular arithmetic
    const maxValue = Math.pow(2, bitLength);
    const unsignedValue = parseInt(cleanBinary, 2);
    const signedValue =
      unsignedValue >= maxValue / 2 ? unsignedValue - maxValue : unsignedValue;
    return {
      unsigned: unsignedValue.toString(),
      signed: signedValue.toString(),
    };
  }
}
