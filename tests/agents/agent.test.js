import { describe, it, expect, vi } from "vitest";

vi.mock("../../src/llm/model.service.js", () => ({
  structured: vi.fn().mockResolvedValue({
    response: { schema_version: "1.0.0" },
    metrics: { generatedTokens: 20 }
  })
}));

import { runAgent, listAgents } from "../../src/agents/agent.service.js";

describe("Agent architecture", () => {
  it("registers three independent agents", () => {
    expect(listAgents()).toHaveLength(3);
  });

  it.each(["research", "planning", "execution"])(
    "loads and runs the %s agent", async id => {
      const result = await runAgent(id, { project: "TaskOS" });
      expect(result.agent).toBe(id);
      expect(result.version).toBe("1.0.0");
    }
  );

  it("rejects unknown agents", async () => {
    await expect(runAgent("unknown", {})).rejects.toThrow("Unknown agent");
  });
});
