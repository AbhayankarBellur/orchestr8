import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Live Execution Viewer Static Assets", () => {
  it("serves the viewer index.html at root", async () => {
    const res = await request(app).get("/").expect(200);
    expect(res.text).toContain("Orchestr8");
    expect(res.text).toContain("Live Observability");
  });

  it("serves the viewer index.html at /viewer", async () => {
    const res = await request(app).get("/viewer/").expect(200);
    expect(res.text).toContain("Execution Pipeline Nodes");
  });
});
