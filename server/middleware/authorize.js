// middleware/authorize.js

module.exports = function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      console.warn('Authorization failed: No user found on request object');
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.warn(`Authorization failed: User role "${req.user.role}" is not allowed`);
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }

    next();
  };
};