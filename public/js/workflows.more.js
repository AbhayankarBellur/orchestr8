export const WORKFLOWS_PART2 = [
  {
    id: "wf-4", name: "04 — Execution Review",
    description: "Read-only risk and overdue review with metrics and downloadable executive report",
    prompt: "Perform an execution review and risk assessment for Backend Migration",
    nodes: [
      { id: "req", title: "User Request", icon: "💬", server: "user", tool: "request", status: "PENDING" },
      { id: "p_list", title: "Find Project", icon: "🔍", server: "taskos", tool: "project_list", status: "PENDING" },
      { id: "p_get", title: "Project Health", icon: "📋", server: "taskos", tool: "project_get", status: "PENDING" },
      { id: "t_list", title: "Analyze Risks", icon: "⚠️", server: "taskos", tool: "task_list", status: "PENDING" },
      { id: "dash", title: "Render Visuals", icon: "📊", server: "orchestr8", tool: "dashboard_generator", status: "PENDING" },
      { id: "pdf", title: "Review PDF", icon: "📄", server: "orchestr8", tool: "pdf_generator", status: "PENDING" }
    ]
  },
  {
    id: "wf-5", name: "05 — Plan Execution",
    description: "Multi-action plan with sequential exact-action approvals and dependency wiring",
    prompt: "Execute the RBAC implementation plan for Backend Migration by creating the tasks and dependencies",
    nodes: [
      { id: "req", title: "User Request", icon: "💬", server: "user", tool: "request", status: "PENDING" },
      { id: "gate1", title: "Approval 1", icon: "🛡️", server: "governance", tool: "human_approval", status: "PENDING" },
      { id: "create1", title: "Create Task 1", icon: "⚡", server: "taskos", tool: "task_create", status: "PENDING" },
      { id: "gate2", title: "Approval 2", icon: "🛡️", server: "governance", tool: "human_approval", status: "PENDING" },
      { id: "create2", title: "Create Task 2", icon: "⚡", server: "taskos", tool: "task_create", status: "PENDING" },
      { id: "dep", title: "Wire Dependency", icon: "🔗", server: "taskos", tool: "task_dependency_add", status: "PENDING" },
      { id: "pdf", title: "Plan Confirmation", icon: "📄", server: "orchestr8", tool: "pdf_generator", status: "PENDING" }
    ]
  }
];
