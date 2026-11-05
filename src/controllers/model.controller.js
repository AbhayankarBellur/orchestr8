import * as service from "../llm/model.service.js";

export async function infer(req, res, next) {
  try {
    const result = await service.infer(req.body.prompt, req.body.system);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function structured(req, res, next) {
  try {
    const result = await service.structured(req.body.prompt, req.body.schema);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function status(req, res, next) {
  try {
    res.json({ success: true, data: await service.status() });
  } catch (error) { next(error); }
}
