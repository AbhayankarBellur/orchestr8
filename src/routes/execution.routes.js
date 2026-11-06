import { Router } from "express";
import {
  createExecution,
  getExecution,
  getExecutionEvents,
  resumeExecution
} from "../controllers/execution.controller.js";
import { streamExecution } from "../controllers/execution.stream.controller.js";
import { requireExecutionAuth } from "../middleware/execution-auth.middleware.js";

const router = Router();

router.use(requireExecutionAuth);
router.post("/", createExecution);
router.get("/:executionId", getExecution);
router.get("/:executionId/events", getExecutionEvents);
router.get("/:executionId/stream", streamExecution);
router.post("/:executionId/resume", resumeExecution);

export default router;
