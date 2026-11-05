import { getHealth } from "../services/health.service.js";

export async function healthController(req, res, next) {
  try {
    const result = await getHealth();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
