export const PDF_INPUT_SCHEMA = {
  type: "object",
  required: ["project_name"],
  properties: {
    project_name: { type: "string", description: "Name of the project" },
    project_summary: { type: "string", description: "Executive summary" },
    status: { type: "string", description: "Project status" },
    task_metrics: {
      type: "object",
      properties: {
        total: { type: "integer" },
        completed: { type: "integer" },
        in_progress: { type: "integer" },
        blocked: { type: "integer" },
        not_started: { type: "integer" },
        completion_percent: { type: "number" }
      }
    },
    blockers: { type: "array" },
    risks: { type: "array" },
    tasks: { type: "array" }
  }
};

export const DASHBOARD_INPUT_SCHEMA = {
  type: "object",
  required: ["project_name"],
  properties: {
    project_name: { type: "string", description: "Name of the project" },
    project_summary: { type: "string", description: "Project summary" },
    status: { type: "string", description: "Project status" },
    task_metrics: { type: "object" },
    blockers: { type: "array" },
    risks: { type: "array" },
    tasks: { type: "array" }
  }
};
