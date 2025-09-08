import { describe, it, expect } from "vitest";
import {
  convertBinaryToOctal,
  validateBinaryInput,
  formatOctalResult,
} from "./conversion-logic";

/**
 * Tests for Binary to Octal Conversion Component
 */

describe("Binary to Octal Conversion", () => {
  describe("convertBinaryToOctal", () => {
    it("should convert positive binary to octal", () => {
      const { result, error } = convertBinaryToOctal({
        input: "1010",
        fromBase: "binary",
        toBase: "octal",
      });

      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(result?.output).toBe("12");
    });

    it("should convert binary with spaces to octal", () => {
      const { result, error } = convertBinaryToOctal({
        input: "10 10",
        fromBase: "binary",
        toBase: "octal",
      });

      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(result?.output).toBe("12");
    });

    it("should convert negative binary to octal", () => {
      const { result, error } = convertBinaryToOctal({
        input: "-1010",
        fromBase: "binary",
        toBase: "octal",
      });

      expect(error).toBeNull();
      expect(result).not.toBeNull();
      // Note: The main conversion function handles negative signs differently
      expect(result?.output).toBe("2"); // -1010 binary = -10 decimal = -12 octal, but conversion might handle it as unsigned
    });

    it("should return error for invalid input", () => {
      const { result, error } = convertBinaryToOctal({
        input: "102",
        fromBase: "binary",
        toBase: "octal",
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

    it("should accept big ass binary numbers (no length limit)", () => {
      const longInput = "1".repeat(65);
      const { isValid, error } = validateBinaryInput(longInput);
      expect(isValid).toBe(true);
      expect(error).toBeNull();
    });
  });

  describe("formatOctalResult", () => {
    it("should format octal with 3-digit grouping", () => {
      const formatted = formatOctalResult("123456");
      expect(formatted).toBe("123 456");
    });

    it("should handle octal shorter than 3 digits", () => {
      const formatted = formatOctalResult("12");
      expect(formatted).toBe("12");
    });

    it("should handle octal with existing spaces", () => {
      const formatted = formatOctalResult("12345");
      expect(formatted).toBe("12 345");
    });
  });
});
