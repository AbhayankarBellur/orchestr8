import express from "express";
import healthRoutes from "./routes/health.routes.js";
import modelRoutes from "./routes/model.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use("/health", healthRoutes);
app.use("/api/model", modelRoutes);
app.use("/api/agents", agentRoutes);
app.use(errorMiddleware);

export default app;
