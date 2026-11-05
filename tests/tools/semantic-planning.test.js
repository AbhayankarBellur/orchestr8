import { describe, it, expect } from "vitest";
import { validatePlanningSemantics } from "../../src/tools/schema_compliance/semantic.planning.js";

const base = () => ({
  tasks: [
    { id: "T1", dependencies: [] },
    { id: "T2", dependencies: ["T1"] }
  ],
  execution_order: ["T1", "T2"]
});

describe("Planning Semantic Validation", () => {
  it("passes for valid acyclic tasks and execution order", () => {
    expect(validatePlanningSemantics(base())).toHaveLength(0);
  });

  it("detects duplicate task IDs and unknown dependencies", () => {
    const data = {
      tasks: [{ id: "T1", dependencies: ["UNKNOWN"] }, { id: "T1", dependencies: [] }],
      execution_order: ["T1"]
    };
    const v = validatePlanningSemantics(data);
    expect(v.some(x => x.code === "DUPLICATE_TASK_ID")).toBe(true);
    expect(v.some(x => x.code === "UNKNOWN_DEPENDENCY")).toBe(true);
  });

  it("detects self-dependencies and circular dependencies", () => {
    const data = {
      tasks: [
        { id: "A", dependencies: ["B", "A"] },
        { id: "B", dependencies: ["A"] }
      ],
      execution_order: ["A", "B"]
    };
    const v = validatePlanningSemantics(data);
    expect(v.some(x => x.code === "SELF_DEPENDENCY")).toBe(true);
    expect(v.some(x => x.code === "CIRCULAR_DEPENDENCY")).toBe(true);
  });

  it("detects missing or incomplete execution order", () => {
    const data = base();
    data.execution_order = ["T1"];
    const v = validatePlanningSemantics(data);
    expect(v.some(x => x.code === "INVALID_EXECUTION_ORDER")).toBe(true);
  });
});
