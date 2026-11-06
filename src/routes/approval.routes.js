import { Router } from "express";
import { createApproval, listApprovals, getApproval, approveApproval, rejectApproval } from "../controllers/approval.controller.js";
import { requireApproverAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", createApproval);
router.get("/", listApprovals);
router.get("/:approvalId", getApproval);
router.post("/:approvalId/approve", requireApproverAuth, approveApproval);
router.post("/:approvalId/reject", requireApproverAuth, rejectApproval);

export default router;
