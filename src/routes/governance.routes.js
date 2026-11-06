import { Router } from "express";
import * as ctrl from "../controllers/governance.controller.js";

const router = Router();

router.get("/policies", ctrl.getPolicies);
router.post("/policies", ctrl.createPolicy);
router.patch("/policies/:id", ctrl.updatePolicy);
router.post("/evaluate", ctrl.evaluateProposal);
router.post("/snapshot", ctrl.createSnapshot);
router.get("/status", ctrl.getStatus);

export default router;
