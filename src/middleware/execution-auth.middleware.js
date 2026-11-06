export function requireExecutionAuth(req, res, next) {
  const actorId = req.headers["x-trusted-actor-id"] || req.auth?.actorId || req.auth?.id;
  const role = req.headers["x-trusted-actor-role"] || req.auth?.role || "user";

  if (!actorId || typeof actorId !== "string" || !actorId.trim()) {
    return res.status(401).json({
      success: false,
      message: "Authentication required: missing trusted identity header"
    });
  }

  req.auth = {
    actorId: String(actorId).trim(),
    role: String(role).trim(),
    type: "user"
  };
  next();
}
