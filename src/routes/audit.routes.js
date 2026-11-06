import { Router } from "express";
import { getExecutions, getExecutionDetail, getExecutionEventsList, verifyExecution } from "../controllers/audit.controller.js";
import { requireAuditAccess } from "../middleware/audit-auth.middleware.js";

const router = Router();

router.use(requireAuditAccess);
router.get("/executions", getExecutions);
router.get("/executions/:executionId", getExecutionDetail);
router.get("/executions/:executionId/events", getExecutionEventsList);
router.get("/executions/:executionId/verify", verifyExecution);

export default router;
