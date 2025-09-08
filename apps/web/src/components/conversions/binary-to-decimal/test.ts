import { describe, it, expect } from "vitest";
import {
  convertBinaryToDecimal,
  validateBinaryInput,
  formatDecimalResult,
} from "./conversion-logic";

/**
 * Tests for Binary to Decimal Conversion Component
 */

describe("Binary to Decimal Conversion", () => {
  describe("convertBinaryToDecimal", () => {
    it("should convert positive binary to decimal", () => {
      const { result, error } = convertBinaryToDecimal({
        input: "1010",
        fromBase: "binary",
        toBase: "decimal",
      });

      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(result?.output).toBe("10");
    });

    it("should convert binary with spaces to decimal", () => {
      const { result, error } = convertBinaryToDecimal({
        input: "10 10",
        fromBase: "binary",
        toBase: "decimal",
      });

      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(result?.output).toBe("10");
    });

    it("should convert negative binary to decimal", () => {
      const { result, error } = convertBinaryToDecimal({
        input: "-1010",
        fromBase: "binary",
        toBase: "decimal",
      });

      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(result?.output).toBe("-10");
    });

    it("should return error for invalid input", () => {
      const { result, error } = convertBinaryToDecimal({
        input: "102",
        fromBase: "binary",
        toBase: "decimal",
      });

      expect(result).toBeNull();
      expect(error).toBeDefined();
    });
  });

  describe("validateBinaryInput", () => {
    it("should validate valid positive binary", () => {
      const { isValid, error } = validateBinaryInput("1010");
      expect(isValid).toBe(true);
      expect(error).toBeNull();
    });

    it("should validate valid negative binary", () => {
      const { isValid, error } = validateBinaryInput("-1010");
      expect(isValid).toBe(true);
      expect(error).toBeNull();
    });

    it("should validate binary with spaces", () => {
      const { isValid, error } = validateBinaryInput("10 10");
      expect(isValid).toBe(true);
      expect(error).toBeNull();
    });

    it("should reject empty input", () => {
      const { isValid, error } = validateBinaryInput("");
      expect(isValid).toBe(false);
      expect(error).toBeDefined();
    });

    it("should reject invalid characters", () => {
      const { isValid, error } = validateBinaryInput("102");
      expect(isValid).toBe(false);
      expect(error).toBeDefined();
    });

    it("should reject input too long", () => {
      const longInput = "1".repeat(65);
      const { isValid, error } = validateBinaryInput(longInput);
      expect(isValid).toBe(false);
      expect(error).toBeDefined();
    });
  });

  describe("formatDecimalResult", () => {
    it("should format large decimal with commas", () => {
      const formatted = formatDecimalResult("1234567890");
      expect(formatted).toBe("1,234,567,890");
    });

    it("should not format small decimal", () => {
      const formatted = formatDecimalResult("123");
      expect(formatted).toBe("123");
    });

    it("should format negative decimal", () => {
      const formatted = formatDecimalResult("-1234567890");
      expect(formatted).toBe("-1,234,567,890");
    });
  });
});
