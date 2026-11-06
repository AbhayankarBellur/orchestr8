export const WORKFLOWS_PART1 = [
  {
    id: "wf-1", name: "01 — Project Intelligence",
    description: "Read-only discovery, task & blocker analysis, dashboard and PDF",
    prompt: "Run project intelligence analysis on Backend Migration: discover project, inspect tasks and blockers, render dashboard and PDF report",
    nodes: [
      { id: "req", title: "User Request", icon: "💬", server: "user", tool: "request", status: "PENDING" },
      { id: "p_list", title: "Discover Project", icon: "🔍", server: "taskos", tool: "project_list", status: "PENDING" },
      { id: "p_get", title: "Project Details", icon: "📋", server: "taskos", tool: "project_get", status: "PENDING" },
      { id: "t_list", title: "Inspect Tasks", icon: "📝", server: "taskos", tool: "task_list", status: "PENDING" },
      { id: "blockers", title: "Analyze Blockers", icon: "🚧", server: "taskos", tool: "report_blockers", status: "PENDING" },
      { id: "dash", title: "Render Dashboard", icon: "📊", server: "orchestr8", tool: "dashboard_generator", status: "PENDING" },
      { id: "pdf", title: "Executive Report", icon: "📄", server: "orchestr8", tool: "pdf_generator", status: "PENDING" }
    ]
  },
  {
    id: "wf-2", name: "02 — Task Creation",
    description: "Approval-gated mutation: checks project, pauses for human approval, executes & verifies",
    prompt: "Add a task to Backend Migration: Implement JWT Authentication with high priority assigned to Abhayankar",
    nodes: [
      { id: "req", title: "User Request", icon: "💬", server: "user", tool: "request", status: "PENDING" },
      { id: "p_list", title: "Find Project", icon: "🔍", server: "taskos", tool: "project_list", status: "PENDING" },
      { id: "t_list", title: "Check Duplicates", icon: "📝", server: "taskos", tool: "task_list", status: "PENDING" },
      { id: "gate", title: "Approval Gate", icon: "🛡️", server: "governance", tool: "human_approval", status: "PENDING" },
      { id: "create", title: "Execute Mutation", icon: "⚡", server: "taskos", tool: "task_create", status: "PENDING" },
      { id: "verify", title: "Read-Back Verify", icon: "✅", server: "taskos", tool: "task_get", status: "PENDING" }
    ]
  },
  {
    id: "wf-3", name: "03 — Blocker Resolution",
    description: "Approval-gated transition: detects blockers, requests approval to transition prerequisite, refreshes dashboard",
    prompt: "Identify and resolve any blockers in the Backend Migration project",
    nodes: [
      { id: "req", title: "User Request", icon: "💬", server: "user", tool: "request", status: "PENDING" },
      { id: "blockers", title: "Detect Blockers", icon: "🚧", server: "taskos", tool: "report_blockers", status: "PENDING" },
      { id: "gate", title: "Transition Gate", icon: "🛡️", server: "governance", tool: "human_approval", status: "PENDING" },
      { id: "trans", title: "Transition Task", icon: "⚡", server: "taskos", tool: "task_transition", status: "PENDING" },
      { id: "dash", title: "Refresh Dashboard", icon: "📊", server: "orchestr8", tool: "dashboard_generator", status: "PENDING" }
    ]
  }
];
