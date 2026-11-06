import express from "express";
import healthRoutes from "./routes/health.routes.js";
import modelRoutes from "./routes/model.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import toolRoutes from "./routes/tool.routes.js";
import mcpRoutes from "./routes/mcp.routes.js";
import orchestratorRoutes from "./routes/orchestrator.routes.js";
import governanceRoutes from "./routes/governance.routes.js";
import approvalRoutes from "./routes/approval.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import executionRoutes from "./routes/execution.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use("/health", healthRoutes);
app.use("/api/model", modelRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/mcp", mcpRoutes);
app.use("/api/orchestrator", orchestratorRoutes);
app.use("/api/governance", governanceRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/executions", executionRoutes);
app.use(errorMiddleware);

export default app;
