import { describe, it, expect } from "vitest";
import { validateExecutionSemantics } from "../../src/tools/schema_compliance/semantic.execution.js";

const base = () => ({
  actions: [
    { action_id: "A1", action_type: "create_task", depends_on: [], requires_approval: true, verification_steps: ["verify"] },
    { action_id: "A2", action_type: "generate_pdf", depends_on: ["A1"], requires_approval: false, verification_steps: ["check"] }
  ]
});

describe("Execution Semantic Validation", () => {
  it("passes for valid actions", () => {
    expect(validateExecutionSemantics(base())).toHaveLength(0);
  });

  it("detects unapproved task mutations and unknown dependencies", () => {
    const data = {
      actions: [
        { action_id: "A1", action_type: "create_task", depends_on: ["NO_ID"], requires_approval: false, verification_steps: ["v"] }
      ]
    };
    const v = validateExecutionSemantics(data);
    expect(v.some(x => x.code === "UNAPPROVED_TASK_MUTATION")).toBe(true);
    expect(v.some(x => x.code === "UNKNOWN_ACTION_DEPENDENCY")).toBe(true);
  });

  it("detects duplicate action IDs, invalid action type, missing verification", () => {
    const data = {
      actions: [
        { action_id: "A1", action_type: "hack_database", depends_on: [], requires_approval: true, verification_steps: [] },
        { action_id: "A1", action_type: "generate_pdf", depends_on: [], requires_approval: false, verification_steps: ["v"] }
      ]
    };
    const v = validateExecutionSemantics(data);
    expect(v.some(x => x.code === "DUPLICATE_ACTION_ID")).toBe(true);
    expect(v.some(x => x.code === "INVALID_ACTION_TYPE")).toBe(true);
    expect(v.some(x => x.code === "MISSING_VERIFICATION_STEPS")).toBe(true);
  });
});
