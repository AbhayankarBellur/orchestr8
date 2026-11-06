import { describe, it, expect } from "vitest";
import { redactSensitiveData } from "../../src/audit/audit.redactor.js";
import { recordEvent } from "../../src/services/audit.service.js";

describe("Sensitive Data Redaction", () => {
  it("redacts top-level sensitive fields", () => {
    const input = {
      api_key: "sk-secret123",
      token: "bearer-xyz",
      password: "pass",
      authorization_nonce: "nonce456",
      safe_param: "visible"
    };
    const cleaned = redactSensitiveData(input);
    expect(cleaned.api_key).toBe("[REDACTED]");
    expect(cleaned.token).toBe("[REDACTED]");
    expect(cleaned.password).toBe("[REDACTED]");
    expect(cleaned.authorization_nonce).toBe("[REDACTED]");
    expect(cleaned.safe_param).toBe("visible");
  });

  it("redacts nested secrets inside objects and arrays", () => {
    const nested = {
      tool: "task_create",
      config: {
        credentials: { secret: "top-secret" },
        headers: [{ authorization: "Bearer 123" }, { "user-agent": "test" }]
      }
    };
    const cleaned = redactSensitiveData(nested);
    expect(cleaned.tool).toBe("task_create");
    expect(cleaned.config.credentials.secret).toBe("[REDACTED]");
    expect(cleaned.config.headers[0].authorization).toBe("[REDACTED]");
    expect(cleaned.config.headers[1]["user-agent"]).toBe("test");
  });

  it("redacts sensitive fields before persisting in audit events", async () => {
    const event = await recordEvent({
      execution_id: "ex_redact",
      event_type: "USER_INPUT_RECEIVED",
      input: { message: "Create task", token: "secret_token_123" }
    });
    expect(event.input.token).toBe("[REDACTED]");
    expect(event.input.message).toBe("Create task");
  });
});
