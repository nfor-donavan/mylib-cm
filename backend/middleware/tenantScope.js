// Every tenant-scoped document carries a tenantId field. This middleware
// makes it structurally hard to leak data across schools: it resolves the
// tenant for the current request and exposes a `scoped(filter)` helper that
// controllers MUST use when building Mongoose queries.
//
// SuperAdmins may pass an explicit ?tenantId=... query param to inspect a
// specific school; everyone else is locked to their own req.tenantId.
function tenantScope(req, res, next) {
  if (req.user.role === "SuperAdmin") {
    req.effectiveTenantId = req.query.tenantId || null; // null = cross-tenant view, use with care
  } else {
    if (!req.tenantId) {
      return res.status(403).json({ error: "Account is not associated with a school" });
    }
    req.effectiveTenantId = req.tenantId;
  }

  // Helper controllers call instead of writing `{ tenantId: ... }` by hand,
  // so tenant isolation can never be accidentally omitted from a query.
  req.scoped = (filter = {}) => {
    if (!req.effectiveTenantId) {
      throw new Error("Refusing to build an unscoped query outside SuperAdmin cross-tenant views");
    }
    return { ...filter, tenantId: req.effectiveTenantId };
  };

  next();
}

module.exports = tenantScope;
