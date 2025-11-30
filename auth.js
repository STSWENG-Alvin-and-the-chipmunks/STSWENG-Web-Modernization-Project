const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_here';
const User = require('./models/User');

const auth = async function(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    // If the request is for an API route, send JSON error
    if (req.originalUrl.startsWith('/api')) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }
    // Otherwise, redirect to login page
    return res.status(401).redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.user.id);
    if (!user) {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      return res.status(401).redirect('/login');
    }
    
    req.user = user; // Attach the full user object
    next();
  } catch (err) {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(401).json({ success: false, message: 'Token is not valid' });
    }
    res.status(401).redirect('/login');
  }
};

// This function checks if the logged-in user is an Admin
// It MUST run *after* the 'auth' middleware
const isAdmin = (req, res, next) => {
  // req.user is the full user object attached by the 'auth' middleware
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin role required.' 
    });
  }
  
  // User is logged in AND is an admin
  next();
};

// --- Centralized Role Authorization ---
// Checks if the user's role matches one of the allowed roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Requires one of: ${allowedRoles.join(', ')}` 
      });
    }
    next();
  };
};

// Attach user and role flags to res.locals for all views (non-blocking)
const attachUserToLocals = async (req, res, next) => {
  const token = req.cookies.token;

  // defaults for views
  res.locals.currentUser = null;
  res.locals.isAdmin = false;
  res.locals.isManager = false;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.user.id).lean();

    if (user) {
      req.user = req.user || user;          // in case auth already set it
      res.locals.currentUser = user;
      res.locals.isAdmin = user.role === 'admin';
      res.locals.isManager = user.role === 'manager';
    }

    next();
  } catch (err) {
    // token invalid, just proceed as guest
    next();
  }
};

// Export the middleware functions
module.exports = auth;
module.exports.isAdmin = isAdmin;
module.exports.authorizeRoles = authorizeRoles;
module.exports.attachUserToLocals = attachUserToLocals;