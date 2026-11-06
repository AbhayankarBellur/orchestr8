export function requireAuditAccess(req, res, next) {
  const actorId = req.headers["x-trusted-actor-id"];
  const role = req.headers["x-trusted-actor-role"];

  if (!actorId || typeof actorId !== "string" || !actorId.trim()) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const allowedRoles = ["auditor", "admin"];
  if (!allowedRoles.includes(role)) {
    return res.status(403).json({ success: false, message: "Unauthorized: auditor or admin role required" });
  }

  req.auth = { actorId: String(actorId).trim(), role: String(role).trim() };
  next();
}
