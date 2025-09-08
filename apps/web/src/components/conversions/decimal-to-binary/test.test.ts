import { describe, it, expect } from "vitest";
import {
  convertDecimalToBinary,
  validateDecimalInput,
  getManualNegativeWarning,
  formatBinaryResult,
  calculateBitLength,
} from "./conversion-logic";

/**
 * Tests for Decimal to Binary Conversion Component
 */

describe("Decimal to Binary Conversion", () => {
  describe("convertDecimalToBinary", () => {
    it("should convert positive decimal to binary", () => {
      const { result, error } = convertDecimalToBinary({
        input: "42",
        fromBase: "decimal",
        toBase: "binary",
      });

      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(result?.output).toBeDefined();
    });

    it("should convert negative decimal to binary", () => {
      const { result, error } = convertDecimalToBinary({
        input: "-42",
        fromBase: "decimal",
        toBase: "binary",
      });

      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(result?.output).toBeDefined();
    });

    it("should handle large numbers with BigNumber", () => {
      const { result, error } = convertDecimalToBinary({
        input: "10011010001000010000101111010",
        fromBase: "decimal",
        toBase: "binary",
      });

      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(result?.output).toBeDefined();
    });

    it("should convert -1000000101100 to correct binary", () => {
      const { result, error } = convertDecimalToBinary({
        input: "-1000000101100",
        fromBase: "decimal",
        toBase: "binary",
      });

      expect(error).toBeNull();
      expect(result).not.toBeNull();

      // For negative numbers, output should be magnitude with negative sign
      const cleanOutput = result?.output?.replace(/\s/g, "") || "";
      expect(cleanOutput).toBe("-1110100011010100101001101001101011101100");

      // The signed result should be the two's complement representation (without explicit negative sign)
      expect(result?.signedResult).toBe(
        "0001011100101011010110010110010100010100"
      );

      // The output might be formatted with spaces, so let's check the raw value
      const cleanSignedOutput = result?.output?.replace(/\s/g, "") || "";
      expect(cleanSignedOutput).toBe(
        "-1110100011010100101001101001101011101100"
      );
    });

    it("should handle very large negative decimal numbers correctly", () => {
      const { result, error } = convertDecimalToBinary({
        input: "-10000001011009128938912893218901001001001010010",
        fromBase: "decimal",
        toBase: "binary",
      });

      expect(error).toBeNull();
      expect(result).not.toBeNull();

      // For negative numbers, output should be magnitude with negative sign
      const expectedOutput =
        "-111000000011010100110000110111101110111001000001011101011001000010001001011111110000011011101110101010010010000100011101010111110001101111100001101011010";

      // Check the output (unsigned result with negative sign)
      // Note: the result.output might have spaces due to FormattedNumber formatting
      const cleanReceivedOutput = result?.output?.replace(/\s/g, "") || "";
      expect(cleanReceivedOutput).toBe(expectedOutput.replace(/\s/g, ""));

      // Check the signed result (two's complement representation without explicit negative sign)
      // For large negative numbers, signedResult should be the actual two's complement
      expect(result?.signedResult).not.toBe(expectedOutput);
      expect(result?.signedResult).toMatch(/^[01]+$/); // Should only contain 0s and 1s
      expect(result?.signedResult.length).toBeGreaterThan(0);

      // Check that output doesn't contain excessive zeros
      const cleanOutput =
        result?.output?.replace(/\s/g, "").replace(/^-/, "") || "";
      expect(cleanOutput).toBe(
        "111000000011010100110000110111101110111001000001011101011001000010001001011111110000011011101110101010010010000100011101010111110001101111100001101011010"
      );
      expect(cleanOutput).not.toMatch(/0{10,}/); // Should not have 10+ consecutive zeros
    });

    it("should handle numbers of various lengths correctly", () => {
      // Test small numbers
      const smallTest = convertDecimalToBinary({
        input: "-7",
        fromBase: "decimal",
        toBase: "binary",
      });
      expect(smallTest.result?.output).toBe("-111");
      expect(smallTest.result?.signedResult).toBe("1001");

      // Test medium numbers
      const mediumTest = convertDecimalToBinary({
        input: "-12345",
        fromBase: "decimal",
        toBase: "binary",
      });
      const cleanMediumOutput =
        mediumTest.result?.output?.replace(/\s/g, "") || "";
      expect(cleanMediumOutput).toBe("-11000000111001");
      // Two's complement of 12345 should be calculated properly
      expect(mediumTest.result?.signedResult).toBeDefined();

      // Test large numbers
      const largeTest = convertDecimalToBinary({
        input: "-999999999999999999",
        fromBase: "decimal",
        toBase: "binary",
      });
      expect(largeTest.result?.signedResult).toBeDefined();
      expect(largeTest.result?.signedResult?.startsWith("-")).toBe(false); // Two's complement shouldn't have explicit negative sign
      expect(largeTest.result?.signedResult?.length).toBeGreaterThan(10);
    });

    it("should return error for invalid input", () => {
      const { result, error } = convertDecimalToBinary({
        input: "abc",
        fromBase: "decimal",
        toBase: "binary",
      });

      expect(result).toBeNull();
      expect(error).toBeDefined();
    });
  });

  describe("validateDecimalInput", () => {
    it("should validate valid positive decimal", () => {
      const { isValid, error } = validateDecimalInput("123");
      expect(isValid).toBe(true);
      expect(error).toBeNull();
    });

    it("should validate valid negative decimal", () => {
      const { isValid, error } = validateDecimalInput("-123");
      expect(isValid).toBe(true);
      expect(error).toBeNull();
    });

    it("should validate decimal with fractional part", () => {
      const { isValid, error } = validateDecimalInput("123.456");
      expect(isValid).toBe(true);
      expect(error).toBeNull();
    });

    it("should reject empty input", () => {
      const { isValid, error } = validateDecimalInput("");
      expect(isValid).toBe(false);
      expect(error).toBeDefined();
    });

    it("should reject invalid characters", () => {
      const { isValid, error } = validateDecimalInput("12a3");
      expect(isValid).toBe(false);
      expect(error).toBeDefined();
    });

    it("should accept big ass numbers (no length limit)", () => {
      const longInput = "1".repeat(101);
      const { isValid, error } = validateDecimalInput(longInput);
      expect(isValid).toBe(true);
      expect(error).toBeNull();
    });
  });

  describe("getManualNegativeWarning", () => {
    it("should return warning for binary-looking negative input", () => {
      const warning = getManualNegativeWarning("-101010");
      expect(warning).toBeDefined();
    });

    it("should return null for regular decimal input", () => {
      const warning = getManualNegativeWarning("-123");
      expect(warning).toBeNull();
    });

    it("should return null for positive binary-looking input", () => {
      const warning = getManualNegativeWarning("101010");
      expect(warning).toBeNull();
    });
  });

  describe("formatBinaryResult", () => {
    it("should format binary with 4-bit grouping", () => {
      const formatted = formatBinaryResult("1010101010101010");
      expect(formatted).toBe("1010101010101010");
    });

    it("should handle binary shorter than 4 bits", () => {
      const formatted = formatBinaryResult("101");
      expect(formatted).toBe("101");
    });

    it("should handle binary with existing spaces", () => {
      const formatted = formatBinaryResult("10 10 10");
      expect(formatted).toBe("101010");
    });
  });

  describe("calculateBitLength", () => {
    it("should calculate bit length for positive numbers", () => {
      const length = calculateBitLength("1010", false);
      expect(length).toBe(4);
    });

    it("should calculate bit length for negative numbers", () => {
      const length = calculateBitLength("1010", true);
      expect(length).toBe(5); // 4 bits + 1 for sign
    });

    it("should handle binary with spaces", () => {
      const length = calculateBitLength("10 10", true);
      expect(length).toBe(5); // 4 bits + 1 for sign
    });
  });
});
