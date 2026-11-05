import { describe, it, expect, afterAll } from "vitest";
import { readFile, rm } from "node:fs/promises";
import { generateDashboard } from "../../src/tools/dashboard_generator/dashboard.service.js";

describe("Dashboard Security & Escaping", () => {
  const createdDirs = [];
  afterAll(async () => {
    await Promise.all(createdDirs.map(d => rm(d, { recursive: true, force: true }).catch(() => {})));
  });

  it("escapes malicious scripts and event handlers in all fields", async () => {
    const malicious = {
      project_name: '<script>alert("pwned")</script>',
      project_summary: '<img src=x onerror=alert("xss")>',
      blockers: [{ task_id: '"><script>', description: "<b onmouseover=alert(1)>evil</b>", impact: "<i>bad</i>" }],
      risks: [{ risk: "<script>evil()</script>", severity: "high", evidence: "<svg onload=alert(2)>" }],
      tasks: [{ id: "T1", title: "<iframe src=javascript:alert(3)>", priority: "High" }]
    };

    const res = await generateDashboard(malicious);
    createdDirs.push(res.paths.directory);

    const html = await readFile(res.paths.html, "utf8");

    expect(html).not.toContain('<script>alert("pwned")</script>');
    expect(html).toContain("&lt;script&gt;alert(&quot;pwned&quot;)&lt;/script&gt;");

    expect(html).not.toContain("<img src=x onerror=alert(\"xss\")>");
    expect(html).toContain("&lt;img src=x onerror=alert(&quot;xss&quot;)&gt;");

    expect(html).not.toContain("<b onmouseover=alert(1)>evil</b>");
    expect(html).not.toContain("<iframe src=javascript:alert(3)>");
    expect(html).not.toContain("<svg onload=alert(2)>");
  });
});
