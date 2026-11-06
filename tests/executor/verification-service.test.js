import { describe, it, expect, beforeEach, vi } from "vitest";
import { verifyResult } from "../../src/services/verification.service.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";

describe("Verification Service", () => {
  beforeEach(async () => {
    await auditRepository.clear();
  });

  it("verifies read-only tool results", async () => {
    const res = await verifyResult({
      executionId: "exec_v1",
      proposal: { tool_name: "project_list" },
      executionResult: { result: [{ id: "p1" }] }
    });
    expect(res.status).toBe("VERIFIED");
    expect(res.verified).toBe(true);
  });

  it("reads back task_create via task_get through executor", async () => {
    const mockExecutor = vi.fn().mockResolvedValue({
      success: true, result: { id: "t1", title: "Task 1" }
    });
    const res = await verifyResult({
      executionId: "exec_v2",
      proposal: { tool_name: "task_create" },
      executionResult: { result: { id: "t1" } },
      executor: mockExecutor
    });
    expect(res.status).toBe("VERIFIED");
    expect(mockExecutor).toHaveBeenCalledWith(expect.objectContaining({
      proposal: expect.objectContaining({ tool_name: "task_get", arguments: { taskId: "t1" } })
    }));
  });

  it("reports VERIFICATION_FAILED if read-back fails", async () => {
    const mockExecutor = vi.fn().mockRejectedValue(new Error("Task not found"));
    const res = await verifyResult({
      executionId: "exec_v3",
      proposal: { tool_name: "task_create" },
      executionResult: { result: { id: "t_missing" } },
      executor: mockExecutor
    });
    expect(res.status).toBe("VERIFICATION_FAILED");
    expect(res.verified).toBe(false);
  });
});
