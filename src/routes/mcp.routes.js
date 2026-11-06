import { Router } from "express";
import { getTaskosStatus, getTaskosTools, discoverTaskos } from "../controllers/mcp.controller.js";

const router = Router();

router.get("/taskos/status", getTaskosStatus);
router.get("/taskos/tools", getTaskosTools);
router.post("/taskos/discover", discoverTaskos);

export default router;
