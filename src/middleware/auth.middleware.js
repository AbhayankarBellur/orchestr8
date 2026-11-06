export function requireApproverAuth(req, res, next) {
  const auth = req.auth || (
    req.headers["x-trusted-actor-id"] ? {
      actorId: String(req.headers["x-trusted-actor-id"]),
      role: String(req.headers["x-trusted-actor-role"] || "user")
    } : null
  );

  if (!auth || !auth.actorId) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const allowed = ["approver", "admin"];
  if (!allowed.includes(auth.role)) {
    return res.status(403).json({ success: false, message: "Unauthorized: approver role required" });
  }

  req.auth = auth;
  next();
}
