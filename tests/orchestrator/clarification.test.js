import { describe, it, expect, beforeEach, vi } from "vitest";
import { decideTool } from "../../src/orchestrator/decision.service.js";
import * as modelService from "../../src/llm/model.service.js";
import { seedMockMcpTools } from "../helpers/mock-mcp-tools.js";

describe("Orchestrator Clarification & Non-Tool Decisions", () => {
  beforeEach(() => { seedMockMcpTools(); });

  it("handles CLARIFICATION_REQUIRED when required project ID is missing", async () => {
    const mock = JSON.stringify({
      decision_version: "1.0.0",
      status: "CLARIFICATION_REQUIRED",
      intent: { description: "Create task", entities: ["task"], operation: "create" },
      tool_selection: null,
      clarification: {
        question: "Which project should this task be created in?",
        missing_information: ["projectId"]
      },
      reasoning: { assumptions: [], uncertainties: ["Unknown project"], risks: [] }
    });
    vi.spyOn(modelService, "structuredRaw").mockResolvedValueOnce({ model: "m", content: mock, metrics: {} });
    const res = await decideTool("Create a task titled Deploy Backend");
    expect(res.decision.status).toBe("CLARIFICATION_REQUIRED");
    expect(res.decision.clarification.missing_information).toContain("projectId");
    expect(res.validation.valid).toBe(true);
  });

  it("handles NO_TOOL_REQUIRED for general inquiries", async () => {
    const mock = JSON.stringify({
      decision_version: "1.0.0",
      status: "NO_TOOL_REQUIRED",
      intent: { description: "General question", entities: [], operation: "general" },
      tool_selection: null,
      clarification: null,
      reasoning: { assumptions: [], uncertainties: [], risks: [] }
    });
    vi.spyOn(modelService, "structuredRaw").mockResolvedValueOnce({ model: "m", content: mock, metrics: {} });
    const res = await decideTool("What is TaskOS?");
    expect(res.decision.status).toBe("NO_TOOL_REQUIRED");
    expect(res.validation.valid).toBe(true);
  });
});
