import { Router } from "express";
import { getAgents, executeAgent } from "../controllers/agent.controller.js";

const router = Router();

router.get("/", getAgents);
router.post("/:agent/run", executeAgent);

export default router;
