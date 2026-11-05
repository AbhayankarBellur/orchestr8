import { describe, it, expect, vi } from "vitest";
import { runAgent } from "../../src/agents/agent.service.js";
import * as modelService from "../../src/llm/model.service.js";
import { MOCK_OUTPUTS } from "../helpers/mock-outputs.js";

const valid = JSON.stringify(MOCK_OUTPUTS.planning);
const invalid = JSON.stringify({ schema_version: "1.0.0", invalid: true });

describe("Correction Loop & Termination", () => {
  it("resolves on attempt 1 if initial output is valid", async () => {
    vi.spyOn(modelService, "structuredRaw").mockResolvedValueOnce({ model: "m", content: valid, metrics: {} });
    const res = await runAgent("planning", { goal: "test" });
    expect(res.attempt).toBe(1);
    expect(res.status).toBe("SUCCESS");
  });

  it("recovers on attempt 2 after one correction", async () => {
    vi.spyOn(modelService, "structuredRaw")
      .mockResolvedValueOnce({ model: "m", content: invalid, metrics: {} })
      .mockResolvedValueOnce({ model: "m", content: valid, metrics: {} });
    const res = await runAgent("planning", { goal: "test" });
    expect(res.attempt).toBe(2);
    expect(res.status).toBe("SUCCESS");
  });

  it("terminates with FAILED_SCHEMA after 3 failed attempts", async () => {
    const spy = vi.spyOn(modelService, "structuredRaw")
      .mockResolvedValue({ model: "m", content: invalid, metrics: {} });
    await expect(runAgent("planning", { goal: "test" })).rejects.toMatchObject({
      name: "SchemaValidationError",
      payload: { status: "FAILED_SCHEMA", attempts: 3 }
    });
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
