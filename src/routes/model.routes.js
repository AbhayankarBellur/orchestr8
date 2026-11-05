import { Router } from "express";
import * as controller from "../controllers/model.controller.js";

const router = Router();

router.post("/infer", controller.infer);
router.post("/structured", controller.structured);
router.get("/status", controller.status);

export default router;
