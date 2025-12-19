exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(`[RoleMiddleware] Access Denied. User Role: ${req.user.role}, Allowed: ${roles}`);
      return res.status(403).json({ message: `Access denied. Your role is ${req.user.role}` });
    }
    next();
  };
};
