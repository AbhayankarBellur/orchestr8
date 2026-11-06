import { Router } from "express";
import {
  createExecution,
  getExecution,
  getExecutionEvents,
  resumeExecution
} from "../controllers/execution.controller.js";

const router = Router();

router.post("/", createExecution);
router.get("/:executionId", getExecution);
router.get("/:executionId/events", getExecutionEvents);
router.post("/:executionId/resume", resumeExecution);

export default router;
