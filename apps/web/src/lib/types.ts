export interface FormatConfig {
  totalBits: number;
  integerBits: number;
  fractionalBits: number;
  name: string; // e.g., "8.8", "16.0", "12.4"
}

export type OperationType = "+" | "×";

export type RoundingMode = "nearest" | "trunc" | "floor" | "half-away";

export interface NumberValue {
  format: FormatConfig;
  decimal: number;
  rawInt: number; // signed integer representation
  bin: string; // binary string
  isNegative: boolean;
  tables: {
    integerDiv: Array<{ quotient: number; remainder: number }>;
    fracMul: Array<{ value: number; bit: number }>;
  };
  A1?: string; // inverted bits for negatives
  A2?: string; // two's complement for negatives
  validation: {
    isValid: boolean;
    error?: string;
    recommendedFormat?: FormatConfig;
  };
}

export interface Operation {
  type: OperationType;
  method: "Booth" | "Fixed-point";
  A: NumberValue;
  B: NumberValue;
  result: NumberValue;
  steps: Array<Step>;
}

export interface Step {
  type: string;
  data: any;
}

export interface Flags {
  Z: boolean; // zero
  C: boolean; // carry
  N: boolean; // negative/sign
  V: boolean; // overflow
  carryMap: string;
  overflow: boolean;
  saturated: boolean;
}

export interface BoothStep {
  i: number;
  Q0: number;
  Qm1: number;
  operation: "A=A+M" | "A=A-M" | "none";
  A: string;
  Q: string;
  Qm1_new: number;
}

export interface FixedPointMulStep {
  Af: number;
  Bf: number;
  product32: number;
  shifted: number;
  saturated: boolean;
}
