// Test BigNumber functionality with user's large input
import { convertBetweenBases } from "./apps/web/src/lib/base-conversions.ts";

console.log("=== Testing BigNumber with Large Input ===");

try {
  const result = convertBetweenBases(
    "-10011010001000010000101111010",
    "decimal",
    "binary"
  );
  console.log("✅ Success! Conversion completed");
  console.log("Input:", result.input);
  console.log("Output (binary):", result.output);
  console.log("Output length:", result.output.replace(/\s/g, "").length);
  console.log("Is negative:", result.isNegative);
} catch (error) {
  console.log("❌ Error:", error.message);
  console.log("Error type:", error.constructor.name);
}

console.log("\n=== Testing Smaller Numbers Still Work ===");
try {
  const result = convertBetweenBases("-323232122", "decimal", "binary");
  console.log("✅ Success! Small number conversion");
  console.log("Input:", result.input);
  console.log("Output length:", result.output.replace(/\s/g, "").length);
} catch (error) {
  console.log("❌ Error:", error.message);
}
