import { describe, it, expect } from "vitest";
import { validateResearchSemantics } from "../../src/tools/schema_compliance/semantic.research.js";

const base = () => ({
  task_metrics: { total: 4, completed: 2, in_progress: 1, blocked: 1, not_started: 0, completion_percent: 50 },
  blockers: [{ task_id: "T1", description: "d", impact: "i" }],
  risks: [{ risk: "r", severity: "high", evidence: "valid evidence" }]
});

describe("Research Semantic Validation", () => {
  it("passes for valid metrics, blockers and risks", () => {
    const v = validateResearchSemantics(base(), { tasks: [{ id: "T1" }] });
    expect(v).toHaveLength(0);
  });

  it("detects invalid task metric sum", () => {
    const data = base();
    data.task_metrics.total = 10;
    const v = validateResearchSemantics(data);
    expect(v.some(x => x.code === "INVALID_METRICS_TOTAL")).toBe(true);
  });

  it("detects inconsistent completion percentage", () => {
    const data = base();
    data.task_metrics.completion_percent = 99;
    const v = validateResearchSemantics(data);
    expect(v.some(x => x.code === "INVALID_COMPLETION_PERCENTAGE")).toBe(true);
  });

  it("detects unknown blocker tasks and empty risk evidence", () => {
    const data = base();
    data.risks[0].evidence = "   ";
    const v = validateResearchSemantics(data, { tasks: [{ id: "OTHER" }] });
    expect(v.some(x => x.code === "UNKNOWN_BLOCKER_TASK")).toBe(true);
    expect(v.some(x => x.code === "EMPTY_RISK_EVIDENCE")).toBe(true);
  });
});
