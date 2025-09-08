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

    it("should reject input too long", () => {
      const longInput = "1".repeat(101);
      const { isValid, error } = validateDecimalInput(longInput);
      expect(isValid).toBe(false);
      expect(error).toBeDefined();
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
      expect(formatted).toBe("1010 1010 1010 1010");
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
