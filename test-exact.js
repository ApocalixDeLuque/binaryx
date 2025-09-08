// Test the exact binary representation
import BigNumber from "bignumber.js";

console.log("=== Testing Exact Binary Representation ===");

// The user's input
const input = "-10011010001000010000101111010";
console.log("Input:", input);

// Create BigNumber
const bigNum = new BigNumber(input);
console.log("BigNumber value:", bigNum.toString());
console.log("BigNumber binary:", bigNum.toString(2));
console.log("Binary length:", bigNum.toString(2).length);

// Try creating BigNumber with different precision settings
BigNumber.config({ DECIMAL_PLACES: 50, EXPONENTIAL_AT: 1e9 });
const bigNum2 = new BigNumber(input);
console.log("BigNumber2 value:", bigNum2.toString());
console.log("BigNumber2 binary:", bigNum2.toString(2));
console.log("Binary2 length:", bigNum2.toString(2).length);

// What the user expects for normal binary
const expectedNormal =
  "1000000101100011101001110100111001011111001001010110100001110110101001000111010111010011100010";
console.log("Expected normal binary length:", expectedNormal.length);

// What the user expects for two's complement
const expectedTwos =
  "10111111010011100010110001011000110100000110110101001011110001001010110111000101000101100011110";
console.log("Expected two's complement length:", expectedTwos.length);

// Let's see what the actual decimal value should be
// If the input is -10011010001000010000101111010 as decimal
console.log("Input as BigInt:", BigInt(input));
console.log("BigInt binary:", BigInt(input).toString(2));
