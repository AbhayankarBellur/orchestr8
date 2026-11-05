import { describe, it, expect, afterAll } from "vitest";
import { readFile, rm } from "node:fs/promises";
import { generateDashboard } from "../../src/tools/dashboard_generator/dashboard.service.js";

describe("Dashboard Generator Tool", () => {
  const createdDirs = [];
  afterAll(async () => {
    await Promise.all(createdDirs.map(d => rm(d, { recursive: true, force: true }).catch(() => {})));
  });

  it("generates index.html and data.json with SVG charts", async () => {
    const data = {
      project_name: "TaskOS",
      project_summary: "TaskOS dashboard summary",
      task_metrics: { total: 4, completed: 2, in_progress: 1, blocked: 1, not_started: 0, completion_percent: 50 },
      blockers: [{ task_id: "T1", description: "Deploy blocked", impact: "High" }],
      risks: [{ risk: "Memory leak", severity: "high", evidence: "Profile traces" }],
      tasks: [{ id: "T1", title: "Setup auth", priority: "High", dependencies: [] }]
    };
    const res = await generateDashboard(data);
    createdDirs.push(res.paths.directory);

    expect(res.status).toBe("SUCCESS");
    expect(res.artifactId).toMatch(/^dash_/);

    const html = await readFile(res.paths.html, "utf8");
    const json = JSON.parse(await readFile(res.paths.json, "utf8"));

    expect(html).toContain("TaskOS Project Dashboard");
    expect(html).toContain("<svg");
    expect(html).toContain("Deploy blocked");
    expect(json.project_name).toBe("TaskOS");
  });

  it("generates unique artifact directories on successive calls", async () => {
    const res1 = await generateDashboard({ project_name: "P1" });
    const res2 = await generateDashboard({ project_name: "P2" });
    createdDirs.push(res1.paths.directory, res2.paths.directory);
    expect(res1.paths.directory).not.toBe(res2.paths.directory);
  });

  it("rejects invalid input", async () => {
    await expect(generateDashboard(null)).rejects.toThrow("Invalid project data");
    await expect(generateDashboard([1, 2])).rejects.toThrow("Invalid project data");
  });
});
