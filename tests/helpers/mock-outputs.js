export const MOCK_OUTPUTS = {
  research: {
    schema_version: "1.0.0", project_summary: "s",
    task_metrics: { total: 0, completed: 0, in_progress: 0, blocked: 0, not_started: 0, completion_percent: 0 },
    blockers: [], risks: [], recommendations: ["r"],
    reasoning: { summary: "ok", evidence: [], assumptions: [], risks: [], alternatives: [] }
  },
  planning: {
    schema_version: "1.0.0", goal: "g",
    tasks: [{ id: "T1", title: "t", description: "d", priority: "High", dependencies: [], acceptance_criteria: ["a"] }],
    execution_order: ["T1"], risks: [],
    reasoning: { summary: "ok", evidence: [], assumptions: [], risks: [], alternatives: [] }
  },
  execution: {
    schema_version: "1.0.0",
    actions: [{ action_id: "A1", action_type: "generate_dashboard", description: "d", payload: {}, depends_on: [], requires_approval: false, verification_steps: ["v"] }],
    artifacts: [{ type: "dashboard", purpose: "p" }], verification_plan: ["v"],
    reasoning: { summary: "ok", evidence: [], assumptions: [], risks: [], alternatives: [] }
  }
};
