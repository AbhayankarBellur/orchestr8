export function requireAuditAccess(req, res, next) {
  const actorId = req.headers["x-trusted-actor-id"] || req.query?.actorId || req.auth?.actorId;
  const role = req.headers["x-trusted-actor-role"] || req.query?.role || req.auth?.role || "user";

  if (!actorId) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const allowedRoles = ["auditor", "admin"];
  if (!allowedRoles.includes(role)) {
    return res.status(403).json({ success: false, message: "Unauthorized: auditor or admin role required" });
  }

  req.auth = { actorId: String(actorId).trim(), role: String(role).trim() };
  next();
}
