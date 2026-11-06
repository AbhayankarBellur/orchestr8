import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import * as mcpService from "../../src/services/mcp.service.js";

describe("MCP API Routes", () => {
  it("GET /api/mcp/taskos/status returns connection info without secrets", async () => {
    const res = await request(app).get("/api/mcp/taskos/status");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.server).toBe("taskos");
    expect(res.body.data.apiKey).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain("taskos_live");
  });

  it("GET /api/mcp/taskos/tools returns the discovered tool catalog", async () => {
    vi.spyOn(mcpService, "getCatalogTools").mockReturnValue([
      { server: "taskos", name: "tool1", description: "desc1" }
    ]);
    const res = await request(app).get("/api/mcp/taskos/tools");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].name).toBe("tool1");
  });

  it("POST /api/mcp/taskos/discover refreshes catalog and returns tools", async () => {
    vi.spyOn(mcpService, "runDiscovery").mockResolvedValue({
      server: "taskos",
      count: 2,
      tools: [{ name: "t1" }, { name: "t2" }],
      discoveredAt: new Date().toISOString()
    });
    const res = await request(app).post("/api/mcp/taskos/discover");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBe(2);
  });
});
