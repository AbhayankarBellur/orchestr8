import { describe, it, expect, afterAll } from "vitest";
import { readFile, unlink } from "node:fs/promises";
import { generatePdf } from "../../src/tools/pdf_generator/pdf.service.js";

describe("PDF Generator Tool", () => {
  const files = [];
  afterAll(async () => { await Promise.all(files.map(p => unlink(p).catch(() => {}))); });

  it("generates a valid PDF with correct header and metadata", async () => {
    const res = await generatePdf({
      project_name: "TaskOS",
      project_summary: "TaskOS execution report summary",
      task_metrics: { total: 4, completed: 2, in_progress: 1, blocked: 1, not_started: 0, completion_percent: 50 },
      blockers: [{ task_id: "T1", description: "Deploy blocked", impact: "High" }],
      risks: [{ risk: "Memory leak", severity: "high", evidence: "Profile traces" }]
    });
    files.push(res.path);
    expect(res.status).toBe("SUCCESS");
    expect(res.fileSize).toBeGreaterThan(500);
    expect(res.pageCount).toBeGreaterThanOrEqual(1);
    const buf = await readFile(res.path);
    expect(buf.subarray(0, 4).toString("utf8")).toBe("%PDF");
  });

  it("handles empty optional sections gracefully", async () => {
    const res = await generatePdf({ project_name: "EmptyProject" });
    files.push(res.path);
    expect(res.status).toBe("SUCCESS");
    const buf = await readFile(res.path);
    expect(buf.subarray(0, 4).toString("utf8")).toBe("%PDF");
  });

  it("produces multi-page PDF with long content and unique filenames", async () => {
    const tasks = Array.from({ length: 40 }, (_, i) => ({
      id: `T${i}`, title: `Task ${i}`, description: `Task ${i} details.`, priority: "High"
    }));
    const r1 = await generatePdf({ project_name: "LongProj", tasks });
    const r2 = await generatePdf({ project_name: "LongProj", tasks });
    files.push(r1.path, r2.path);
    expect(r1.pageCount).toBeGreaterThanOrEqual(2);
    expect(r1.path).not.toBe(r2.path);
  });

  it("rejects invalid input", async () => {
    await expect(generatePdf(null)).rejects.toThrow("Invalid project data");
  });
});
