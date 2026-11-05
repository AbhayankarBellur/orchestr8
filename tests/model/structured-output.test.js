import { describe, it, expect, vi } from "vitest";

vi.mock("../../src/llm/ollama.client.js", () => ({
  chat: vi.fn().mockResolvedValue({
    message: { content: '{"status":"complete","count":3}' },
    eval_count: 8,
    eval_duration: 400000000
  }),
  checkOllama: vi.fn()
}));

import { structured } from "../../src/llm/model.service.js";

describe("Structured inference", () => {
  it("returns parsed JSON", async () => {
    const result = await structured("Return project status", {
      type: "object",
      properties: {
        status: { type: "string" },
        count: { type: "integer" }
      },
      required: ["status", "count"]
    });
    expect(result.response.status).toBe("complete");
    expect(result.response.count).toBe(3);
  });

  it("rejects invalid JSON", async () => {
    const { chat } = await import("../../src/llm/ollama.client.js");
    chat.mockResolvedValueOnce({
      message: { content: "not valid json" }
    });
    await expect(
      structured("Return JSON", { type: "object" })
    ).rejects.toThrow();
  });
});
