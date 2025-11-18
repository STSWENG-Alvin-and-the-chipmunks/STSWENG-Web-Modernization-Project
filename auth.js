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

// --- NEW MIDDLEWARE ---
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

// Export both functions
module.exports = auth;
module.exports.isAdmin = isAdmin;