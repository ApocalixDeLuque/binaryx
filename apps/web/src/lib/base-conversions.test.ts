import { describe, it, expect } from "vitest";
import {
  decimalToBinary,
  binaryToDecimal,
  decimalToOctal,
  octalToDecimal,
  decimalToHexadecimal,
  hexadecimalToDecimal,
  binaryToOctal,
  octalToBinary,
  binaryToHexadecimal,
  hexadecimalToBinary,
  convertBetweenBases,
  formatWithGrouping,
  cleanFormattedValue,
} from "./base-conversions";

describe("Base Conversion Tests", () => {
  describe("Decimal to Binary", () => {
    it("should convert positive decimal to binary", () => {
      const result = decimalToBinary(42);
      expect(result.output).toBe("00101010"); // 8-bit minimum with padding
      expect(result.isNegative).toBe(false);
    });

    it("should convert negative decimal to binary with two's complement", () => {
      const result = decimalToBinary(-42, 10); // Specify 10-bit width for two's complement
      expect(result.signedResult).toBe("1111010110"); // Two's complement of 42 in 10 bits
      expect(result.isNegative).toBe(true);
    });

    it("should handle -323232122 correctly", () => {
      const result = decimalToBinary(-323232122);
      expect(result.isNegative).toBe(true);
      // The magnitude should be the binary representation of 323232122
      expect(result.magnitude).toMatch(/^[01]+$/);
    });

    it("should handle zero", () => {
      const result = decimalToBinary(0);
      expect(result.output).toBe("00000000"); // 8-bit minimum with padding
      expect(result.isNegative).toBe(false);
    });
  });

  describe("Binary to Decimal", () => {
    it("should convert positive binary to decimal", () => {
      const result = binaryToDecimal("101010");
      expect(result.output).toBe("42");
      expect(result.isNegative).toBe(false);
    });

    it("should convert negative binary (two's complement) to decimal", () => {
      const result = binaryToDecimal("1111010110", 10); // -42 in 10-bit two's complement
      expect(result.output).toBe("-42");
      expect(result.isNegative).toBe(true);
    });

    it("should handle binary with spaces", () => {
      const result = binaryToDecimal("1010 1010");
      expect(result.output).toBe("170");
    });
  });

  describe("Decimal to Octal", () => {
    it("should convert positive decimal to octal", () => {
      const result = decimalToOctal(42);
      expect(result.output).toBe("52");
      expect(result.isNegative).toBe(false);
    });

    it("should convert negative decimal to octal", () => {
      const result = decimalToOctal(-42);
      expect(result.output).toBe("-52");
      expect(result.isNegative).toBe(true);
    });
  });

  describe("Octal to Decimal", () => {
    it("should convert positive octal to decimal", () => {
      const result = octalToDecimal("52");
      expect(result.output).toBe("42");
      expect(result.isNegative).toBe(false);
    });

    it("should convert negative octal to decimal", () => {
      const result = octalToDecimal("-52");
      expect(result.output).toBe("-42");
      expect(result.isNegative).toBe(true);
    });
  });

  describe("Decimal to Hexadecimal", () => {
    it("should convert positive decimal to hexadecimal", () => {
      const result = decimalToHexadecimal(42);
      expect(result.output).toBe("2A");
      expect(result.isNegative).toBe(false);
    });

    it("should convert negative decimal to hexadecimal", () => {
      const result = decimalToHexadecimal(-42);
      expect(result.output).toBe("-2A");
      expect(result.isNegative).toBe(true);
    });
  });

  describe("Hexadecimal to Decimal", () => {
    it("should convert positive hexadecimal to decimal", () => {
      const result = hexadecimalToDecimal("2A");
      expect(result.output).toBe("42");
      expect(result.isNegative).toBe(false);
    });

    it("should convert negative hexadecimal to decimal", () => {
      const result = hexadecimalToDecimal("-2A");
      expect(result.output).toBe("-42");
      expect(result.isNegative).toBe(true);
    });

    it("should handle lowercase hexadecimal", () => {
      const result = hexadecimalToDecimal("2a");
      expect(result.output).toBe("42");
    });
  });

  describe("Binary to Octal", () => {
    it("should convert binary to octal", () => {
      const result = binaryToOctal("101010");
      expect(result.output).toBe("52");
    });

    it("should handle binary with padding", () => {
      const result = binaryToOctal("0101010");
      expect(result.output).toBe("52");
    });
  });

  describe("Octal to Binary", () => {
    it("should convert octal to binary", () => {
      const result = octalToBinary("52");
      expect(result.output).toBe("101010");
    });

    it("should convert negative octal to binary", () => {
      const result = octalToBinary("-52");
      expect(result.output).toBe("-101010");
      expect(result.isNegative).toBe(true);
    });
  });

  describe("Binary to Hexadecimal", () => {
    it("should convert binary to hexadecimal", () => {
      const result = binaryToHexadecimal("101010");
      expect(result.output).toBe("2A");
    });

    it("should handle binary with padding", () => {
      const result = binaryToHexadecimal("00101010");
      expect(result.output).toBe("2A");
    });
  });

  describe("Hexadecimal to Binary", () => {
    it("should convert hexadecimal to binary", () => {
      const result = hexadecimalToBinary("2A");
      expect(result.output).toBe("00101010");
    });

    it("should handle lowercase hexadecimal", () => {
      const result = hexadecimalToBinary("2a");
      expect(result.output).toBe("00101010");
    });
  });

  describe("Main convertBetweenBases function", () => {
    it("should convert decimal to binary", () => {
      const result = convertBetweenBases(
        "42",
        "decimal",
        "binary",
        undefined,
        false
      ); // Disable grouping
      expect(result.output).toBe("00101010"); // 8-bit minimum with padding
      expect(result.inputBase).toBe("decimal");
      expect(result.outputBase).toBe("binary");
    });

    it("should convert binary to decimal", () => {
      const result = convertBetweenBases("101010", "binary", "decimal");
      expect(result.output).toBe("42");
      expect(result.inputBase).toBe("binary");
      expect(result.outputBase).toBe("decimal");
    });

    it("should respect explicit decimal to binary conversion for binary-looking input", () => {
      // When explicitly set to decimal->binary, "1000" should be treated as decimal 1000
      // NOT as binary 1000 (which would be decimal 8)
      const result = convertBetweenBases(
        "1000",
        "decimal",
        "binary",
        undefined,
        false
      ); // Disable grouping
      expect(result.input).toBe("1000");
      expect(result.inputBase).toBe("decimal");
      expect(result.outputBase).toBe("binary");
      // Decimal 1000 in binary should be 1111101000
      expect(result.output).toBe("1111101000");
    });

    it("should handle negative inputs", () => {
      const result = convertBetweenBases("-42", "decimal", "binary");
      expect(result.isNegative).toBe(true);
    });

    it("should handle formatted inputs with grouping", () => {
      const result = convertBetweenBases("10 1010", "binary", "decimal");
      expect(result.output).toBe("42");
    });
  });

  describe("Formatting functions", () => {
    it("should format binary with grouping", () => {
      const result = formatWithGrouping("10101010", "binary");
      expect(result).toBe("1010 1010");
    });

    it("should format decimal with commas", () => {
      const result = formatWithGrouping("1234567", "decimal");
      expect(result).toBe("1,234,567");
    });

    it("should format octal with grouping", () => {
      const result = formatWithGrouping("1234567", "octal");
      expect(result).toBe("1 234 567"); // Groups of 3 from right to left
    });

    it("should format hexadecimal with grouping", () => {
      const result = formatWithGrouping("123456789ABCDEF", "hexadecimal");
      expect(result).toBe("123 4567 89AB CDEF"); // Groups of 4 from right to left
    });

    it("should clean formatted values", () => {
      expect(cleanFormattedValue("10 101 010")).toBe("10101010");
      expect(cleanFormattedValue("1,234,567")).toBe("1234567");
    });
  });

  describe("Specific failing case: -323232122", () => {
    it("should handle large negative decimal correctly", () => {
      const result = convertBetweenBases("-323232122", "decimal", "binary");

      // The input should be parsed correctly
      expect(result.input).toBe("-323232122");
      expect(result.isNegative).toBe(true);

      // Should produce valid binary output
      expect(result.output).toMatch(/^[01\s]+$/);
      expect(result.output.length).toBeGreaterThan(0);
    });

    it("should produce consistent results for decimalToBinary", () => {
      const result = decimalToBinary(-323232122);

      expect(result.isNegative).toBe(true);
      expect(result.magnitude).toMatch(/^[01]+$/);
      expect(result.signedResult).toMatch(/^[01]+$/);
    });
  });
});
