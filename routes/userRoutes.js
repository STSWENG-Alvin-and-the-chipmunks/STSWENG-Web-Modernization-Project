const express = require('express');
const router = express.Router();
const { promoteUser, demoteUser } = require('../controllers/userController');
const auth = require('../auth');
const { isAdmin } = require('../auth'); // Import the new middleware

// Promote User (Admin only)
// PATCH /api/users/promote/:userId
router.patch(
  '/promote/:userId', 
  auth,        // 1. Check if logged in (and attach req.user)
  isAdmin,     // 2. Check if req.user.role is 'admin'
  promoteUser
);

// Demote User (Admin only)
// PATCH /api/users/demote/:userId
router.patch(
  '/demote/:userId',
  auth,        // 1. Check if logged in (and attach req.user)
  isAdmin,     // 2. Check if req.user.role is 'admin'
  demoteUser
);

module.exports = router;