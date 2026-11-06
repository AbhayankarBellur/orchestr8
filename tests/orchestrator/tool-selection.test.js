import { describe, it, expect, beforeEach, vi } from "vitest";
import { decideTool } from "../../src/orchestrator/decision.service.js";
import * as modelService from "../../src/llm/model.service.js";
import { seedMockMcpTools } from "../helpers/mock-mcp-tools.js";

function mockDecision(tool, server = "taskos", args = {}) {
  return JSON.stringify({
    decision_version: "1.0.0",
    status: "TOOL_PROPOSED",
    intent: { description: "User request", entities: [], operation: "read" },
    tool_selection: {
      server, tool_name: tool, arguments: args,
      selection_rationale: `Selected ${tool}`,
      evidence: ["Tool matches request"],
      alternatives_considered: []
    },
    clarification: null,
    reasoning: { assumptions: [], uncertainties: [], risks: [] }
  });
}

describe("Orchestrator Dynamic Tool Selection", () => {
  beforeEach(() => { seedMockMcpTools(); });

  it.each([
    ["Find my projects", "project_list", "taskos", {}],
    ["Show project details", "project_get", "taskos", { projectId: "p1" }],
    ["Find unfinished tasks", "task_list", "taskos", { projectId: "p1" }],
    ["Identify blockers", "report_blockers", "taskos", {}],
    ["Generate a PDF report", "pdf_generator", "orchestr8", { project_name: "P1" }],
    ["Create a dashboard", "dashboard_generator", "orchestr8", { project_name: "P1" }]
  ])("selects %s -> %s on %s", async (query, tool, server, args) => {
    vi.spyOn(modelService, "structuredRaw").mockResolvedValueOnce({
      model: "test-model", content: mockDecision(tool, server, args), metrics: {}
    });
    const res = await decideTool(query);
    expect(res.decision.tool_selection.tool_name).toBe(tool);
    expect(res.decision.tool_selection.server).toBe(server);
    expect(res.validation.valid).toBe(true);
  });
});
