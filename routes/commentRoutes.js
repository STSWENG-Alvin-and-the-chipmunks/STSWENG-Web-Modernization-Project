const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../auth');
const { createComment } = require('../controllers/commentController');

// --- Validation middleware for creating a comment ---
const validateComment = [
  body('content').notEmpty().withMessage('Content is required.'),
  body('blogId').isMongoId().withMessage('A valid blog post ID is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }
    next();
  },
];

// --- Define POST route for creating a comment ---
// use `auth` here because any logged-in user (Admin, Manager, or User)
// can post a comment.
router.post('/', 
  auth, 
  validateComment, 
  createComment
);


module.exports = router;