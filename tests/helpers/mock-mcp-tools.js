import { registerTools } from "../../src/mcp/taskos.catalog.js";

export const SAMPLE_TASKOS_TOOLS = [
  { server: "taskos", name: "project_list", description: "List all projects", inputSchema: { type: "object" } },
  { server: "taskos", name: "project_get", description: "Get project by ID", inputSchema: { type: "object", required: ["projectId"], properties: { projectId: { type: "string" } } } },
  { server: "taskos", name: "task_list", description: "List tasks for project", inputSchema: { type: "object", required: ["projectId"], properties: { projectId: { type: "string" } } } },
  { server: "taskos", name: "report_blockers", description: "Report blocked tasks", inputSchema: { type: "object", properties: { projectId: { type: "string" } } } },
  { server: "taskos", name: "task_create", description: "Create a task in project", inputSchema: { type: "object", required: ["projectId", "title"], properties: { projectId: { type: "string" }, title: { type: "string" } } } }
];

export function seedMockMcpTools() {
  registerTools("taskos", SAMPLE_TASKOS_TOOLS);
}
