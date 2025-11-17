const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { promoteUser, demoteUser } = require('../controllers/userController');
const auth = require('../auth');
const { isAdmin } = require('../auth'); // Import the new middleware

// Configure rate limiter for sensitive admin routes (e.g., 10 requests per 15 min per IP)
const adminActionsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many requests, please try again later.',
});
// Promote User (Admin only)
// PATCH /api/users/promote/:userId
router.patch(
  '/promote/:userId', 
  auth,        // 1. Check if logged in (and attach req.user)
  isAdmin,     // 2. Check if req.user.role is 'admin'
  adminActionsLimiter, // Rate limiting middleware
  promoteUser
);

// Demote User (Admin only)
// PATCH /api/users/demote/:userId
router.patch(
  '/demote/:userId',
  auth,        // 1. Check if logged in (and attach req.user)
  isAdmin,     // 2. Check if req.user.role is 'admin'
  adminActionsLimiter, // Rate limiting middleware
  demoteUser
);

module.exports = router;