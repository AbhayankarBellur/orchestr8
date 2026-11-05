import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import * as healthRepo from "../src/repositories/health.repository.js";

describe("Health API", () => {
  it("returns 200 and healthy status when database is connected", async () => {
    vi.spyOn(healthRepo, "checkDatabase").mockResolvedValue(true);
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.database).toBe("connected");
    expect(res.body.timestamp).toBeDefined();
  });

  it("handles repository failure gracefully via error middleware", async () => {
    vi.spyOn(healthRepo, "checkDatabase").mockRejectedValue(new Error("DB error"));
    const res = await request(app).get("/health");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe("Internal server error");
  });
});
