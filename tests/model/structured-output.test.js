import { describe, it, expect, vi } from "vitest";

vi.mock("../../src/llm/openrouter.client.js", () => ({
  chat: vi.fn().mockResolvedValue({
    choices: [{ message: { content: '{"status":"complete","count":3}' } }],
    usage: { prompt_tokens: 15, completion_tokens: 8 }
  })
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
    const { chat } = await import("../../src/llm/openrouter.client.js");
    chat.mockResolvedValueOnce({
      choices: [{ message: { content: "not valid json" } }],
      usage: {}
    });
    await expect(
      structured("Return JSON", { type: "object" })
    ).rejects.toThrow();
  });
});
