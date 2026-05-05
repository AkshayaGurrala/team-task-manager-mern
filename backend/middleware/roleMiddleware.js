const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admins only' });
  }
};

const adminOrMember = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'member')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied' });
  }
};

module.exports = { adminOnly, adminOrMember };
