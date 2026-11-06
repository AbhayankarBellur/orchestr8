export function requireExecutionAuth(req, res, next) {
  const headerActor = req.headers["x-trusted-actor-id"];
  const headerRole = req.headers["x-trusted-actor-role"];

  if (req.method !== "GET" && (!headerActor || typeof headerActor !== "string" || !headerActor.trim())) {
    return res.status(401).json({
      success: false,
      message: "Authentication required: missing trusted identity header"
    });
  }

  const actorId = headerActor || req.query?.actorId || req.auth?.actorId;
  const role = headerRole || (headerActor ? req.auth?.role || "user" : "viewer");

  if (!actorId || typeof actorId !== "string" || !actorId.trim()) {
    return res.status(401).json({
      success: false,
      message: "Authentication required: missing trusted identity header"
    });
  }

  req.auth = {
    actorId: String(actorId).trim(),
    role: String(role).trim(),
    type: headerActor ? "user" : "stream_viewer"
  };
  next();
}
