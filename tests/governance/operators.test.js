import { describe, it, expect } from "vitest";
import { evaluateOperator } from "../../src/governance/governance.operators.js";

describe("Governance Operators", () => {
  it("evaluates equality and inequality", () => {
    expect(evaluateOperator("EQ", "taskos", "taskos")).toBe(true);
    expect(evaluateOperator("EQ", "taskos", "other")).toBe(false);
    expect(evaluateOperator("NEQ", 1, 2)).toBe(true);
  });

  it("evaluates numeric comparisons", () => {
    expect(evaluateOperator("GT", 6, 5)).toBe(true);
    expect(evaluateOperator("GTE", 5, 5)).toBe(true);
    expect(evaluateOperator("LT", 3, 5)).toBe(true);
    expect(evaluateOperator("LTE", 5, 5)).toBe(true);
    expect(evaluateOperator("LTE", 6, 5)).toBe(false);
  });

  it("evaluates set membership IN and NOT_IN", () => {
    expect(evaluateOperator("IN", "taskos", ["taskos", "orchestr8"])).toBe(true);
    expect(evaluateOperator("IN", "rogue", ["taskos", "orchestr8"])).toBe(false);
    expect(evaluateOperator("NOT_IN", "rogue", ["taskos"])).toBe(true);
  });

  it("evaluates CONTAINS and EXISTS", () => {
    expect(evaluateOperator("CONTAINS", ["a", "b"], "a")).toBe(true);
    expect(evaluateOperator("CONTAINS", "hello world", "world")).toBe(true);
    expect(evaluateOperator("EXISTS", "any-val", null)).toBe(true);
    expect(evaluateOperator("EXISTS", null, null)).toBe(false);
  });
});
