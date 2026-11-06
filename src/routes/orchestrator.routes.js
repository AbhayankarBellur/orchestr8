import { Router } from "express";
import { createDecision } from "../controllers/orchestrator.controller.js";

const router = Router();

router.post("/decide", createDecision);

export default router;
