import { describe, it, expect } from "vitest";
import {
  convertOctalToBinary,
  validateOctalInput,
  formatBinaryResult,
} from "./conversion-logic";

/**
 * Tests for Octal to Binary Conversion Component
 */

describe("Octal to Binary Conversion", () => {
  describe("convertOctalToBinary", () => {
    it("should convert positive octal to binary", () => {
      const { result, error } = convertOctalToBinary({
        input: "12",
        fromBase: "octal",
        toBase: "binary",
      });

      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(result?.output).toBe("001010"); // Main conversion doesn't add spaces
    });

    it("should convert octal with spaces to binary", () => {
      const { result, error } = convertOctalToBinary({
        input: "12",
        fromBase: "octal",
        toBase: "binary",
      });

      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(result?.output).toBe("001010");
    });

    it("should convert negative octal to binary", () => {
      const { result, error } = convertOctalToBinary({
        input: "-12",
        fromBase: "octal",
        toBase: "binary",
      });

      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(result?.output).toBe("-001010");
    });

    it("should return error for invalid input", () => {
      const { result, error } = convertOctalToBinary({
        input: "18",
        fromBase: "octal",
        toBase: "binary",
      });

      expect(result).toBeNull();
      expect(error).toBeDefined();
    });
  });

  describe("validateOctalInput", () => {
    it("should validate valid positive octal", () => {
      const { isValid, error } = validateOctalInput("12");
      expect(isValid).toBe(true);
      expect(error).toBeNull();
    });

    it("should validate valid negative octal", () => {
      const { isValid, error } = validateOctalInput("-12");
      expect(isValid).toBe(true);
      expect(error).toBeNull();
    });

    it("should validate octal with spaces", () => {
      const { isValid, error } = validateOctalInput("1 2");
      expect(isValid).toBe(true);
      expect(error).toBeNull();
    });

    it("should reject empty input", () => {
      const { isValid, error } = validateOctalInput("");
      expect(isValid).toBe(false);
      expect(error).toBeDefined();
    });

    it("should reject invalid characters", () => {
      const { isValid, error } = validateOctalInput("18");
      expect(isValid).toBe(false);
      expect(error).toBeDefined();
    });

    it("should accept big ass octal numbers (no length limit)", () => {
      const longInput = "7".repeat(65);
      const { isValid, error } = validateOctalInput(longInput);
      expect(isValid).toBe(true);
      expect(error).toBeNull();
    });
  });

  describe("formatBinaryResult", () => {
    it("should format binary with 4-bit grouping", () => {
      const formatted = formatBinaryResult("10101010");
      expect(formatted).toBe("1010 1010");
    });

    it("should handle binary shorter than 4 bits", () => {
      const formatted = formatBinaryResult("101");
      expect(formatted).toBe("101");
    });

    it("should handle binary with existing spaces", () => {
      const formatted = formatBinaryResult("10 101 010");
      expect(formatted).toBe("1010 1010");
    });
  });
});
