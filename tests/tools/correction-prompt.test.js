import { describe, it, expect } from "vitest";
import { buildCorrectionPrompt } from "../../src/agents/correction.service.js";

describe("Correction Prompt Builder", () => {
  it("formats violations with code, field, and message", () => {
    const prompt = buildCorrectionPrompt({
      prompt: "Generate plan",
      input: { goal: "test" },
      previousOutput: { bad: 1 },
      violations: [{ code: "DUPLICATE_ID", field: "/tasks/0/id", message: "Duplicate" }],
      schemaVersion: "1.0.0"
    });
    expect(prompt).toContain("schema (version 1.0.0)");
    expect(prompt).toContain("[DUPLICATE_ID] at /tasks/0/id: Duplicate");
    expect(prompt).toContain("ORIGINAL INSTRUCTION:\nGenerate plan");
    expect(prompt).toContain("PREVIOUS INVALID OUTPUT:");
  });
});
