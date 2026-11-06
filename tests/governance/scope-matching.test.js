import { describe, it, expect } from "vitest";
import { matchesScope } from "../../src/governance/governance.scope.js";

describe("Policy Scope Matching", () => {
  const proposal = { server: "taskos", tool_name: "task_create", arguments: { title: "Test" } };

  it("evaluates execution and server scopes", () => {
    expect(matchesScope({ type: "execution" }, proposal)).toBe(true);
    expect(matchesScope({ type: "server", server: "taskos" }, proposal)).toBe(true);
    expect(matchesScope({ type: "server", server: "other" }, proposal)).toBe(false);
  });

  it("evaluates tool scope with optional server", () => {
    expect(matchesScope({ type: "tool", tool: "task_create" }, proposal)).toBe(true);
    expect(matchesScope({ type: "tool", tool: "task_create", server: "taskos" }, proposal)).toBe(true);
    expect(matchesScope({ type: "tool", tool: "task_list" }, proposal)).toBe(false);
  });

  it("evaluates agent and action scopes", () => {
    expect(matchesScope({ type: "agent", agent: "planner" }, proposal, { agent: "planner" })).toBe(true);
    expect(matchesScope({ type: "agent", agent: "planner" }, proposal, { agent: "researcher" })).toBe(false);
    expect(matchesScope({ type: "action", action: "task_create" }, proposal)).toBe(true);
    expect(matchesScope({ type: "action", action: "deploy" }, proposal, { action: "deploy" })).toBe(true);
  });

  it("evaluates input and output scopes deterministically", () => {
    expect(matchesScope({ type: "input", tool: "task_create" }, proposal)).toBe(true);
    expect(matchesScope({ type: "input", tool: "pdf_generator" }, proposal)).toBe(false);
    expect(matchesScope({ type: "output", tool: "task_create" }, proposal, {})).toBe(false);
    expect(matchesScope({ type: "output", tool: "task_create" }, proposal, { output: { id: "1" } })).toBe(true);
  });
});
