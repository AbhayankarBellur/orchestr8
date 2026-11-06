import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getDbCollection } from "../../src/repositories/mongo.helper.js";

describe("Durable Storage Guard (Production Invariant)", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("throws in production when MongoDB connection is missing", () => {
    process.env.NODE_ENV = "production";
    expect(() => getDbCollection("executions")).toThrow(/Durable MongoDB storage required in production/);
  });

  it("permits null collection in test environment when disconnected", () => {
    process.env.NODE_ENV = "test";
    expect(getDbCollection("executions")).toBeNull();
  });
});
