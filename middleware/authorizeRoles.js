module.exports = function authorizeRoles(...roles) {
    return (req, res, next) => {
      if (!req.user || !req.user.roles) {
        return res.status(403).json({ message: 'Not authenticated' });
      }
  
      const hasRole = roles.some(role => req.user.roles.includes(role));
  
      if (!hasRole) {
        return res.status(403).json({ message: 'Not authorized' });
      }
  
      next();
    };
  };