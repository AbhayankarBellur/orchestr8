import { Router } from "express";
import { getTools, createPdfReport, createDashboard } from "../controllers/tool.controller.js";

const router = Router();

router.get("/", getTools);
router.post("/pdf", createPdfReport);
router.post("/dashboard", createDashboard);

export default router;
