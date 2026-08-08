const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (!roles.includes(req.session.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource',
    });
  }

  return next();
};

module.exports = {
  authorizeRoles,
};
