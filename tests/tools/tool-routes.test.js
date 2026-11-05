import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { unlink, rm } from "node:fs/promises";
import app from "../../src/app.js";

describe("Tool API Routes", () => {
  const cleanup = [];
  afterAll(async () => {
    for (const item of cleanup) {
      if (item.type === "pdf") await unlink(item.path).catch(() => {});
      if (item.type === "dash") await rm(item.path, { recursive: true, force: true }).catch(() => {});
    }
  });

  it("GET /api/tools returns available tools", async () => {
    const res = await request(app).get("/api/tools");
    expect(res.status).toBe(200);
    const names = res.body.data.map(t => t.name);
    expect(names).toContain("pdf_generator");
    expect(names).toContain("dashboard_generator");
  });

  it("POST /api/tools/pdf generates PDF report", async () => {
    const res = await request(app).post("/api/tools/pdf").send({ project_name: "ApiTest" });
    expect(res.status).toBe(201);
    expect(res.body.data.tool).toBe("pdf_generator");
    cleanup.push({ type: "pdf", path: res.body.data.path });
  });

  it("POST /api/tools/dashboard generates dashboard", async () => {
    const res = await request(app).post("/api/tools/dashboard").send({ project_name: "ApiTest" });
    expect(res.status).toBe(201);
    expect(res.body.data.tool).toBe("dashboard_generator");
    cleanup.push({ type: "dash", path: res.body.data.paths.directory });
  });

  it("rejects non-object or missing body with 400", async () => {
    const res = await request(app).post("/api/tools/pdf").send([1, 2, 3]);
    expect(res.status).toBe(400);
  });
});
