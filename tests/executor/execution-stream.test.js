import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import EventEmitter from "node:events";
import app from "../../src/app.js";
import { streamExecution } from "../../src/controllers/execution.stream.controller.js";
import * as orchService from "../../src/services/orchestration.service.js";
import { emitAuditEvent } from "../../src/services/audit.emitter.js";

describe("Execution SSE Stream Endpoint", () => {
  it("rejects unauthenticated stream requests", async () => {
    const res = await request(app).get("/api/executions/exec_test_sse/stream").expect(401);
    expect(res.body.success).toBe(false);
  });

  it("sets SSE headers and streams historical and live audit events", async () => {
    const execId = "exec_sse_test_1";
    const history = [{ event_id: "evt_1", event_type: "EXECUTION_CREATED" }];
    vi.spyOn(orchService, "getExecutionEventsService").mockResolvedValue(history);

    const req = new EventEmitter();
    req.params = { executionId: execId };
    const written = [];
    const headers = {};
    const res = {
      setHeader: (k, v) => { headers[k] = v; },
      flushHeaders: vi.fn(),
      write: chunk => written.push(chunk),
      end: vi.fn()
    };

    await streamExecution(req, res, vi.fn());

    expect(headers["Content-Type"]).toBe("text/event-stream");
    expect(headers["Cache-Control"]).toBe("no-cache");
    expect(written[0]).toContain("EXECUTION_CREATED");

    emitAuditEvent(execId, { event_id: "evt_2", event_type: "TOOL_EXECUTED" });
    expect(written[1]).toContain("TOOL_EXECUTED");

    req.emit("close");
    emitAuditEvent(execId, { event_id: "evt_3", event_type: "POST_CLOSE" });
    expect(written.length).toBe(2);
  });
});
