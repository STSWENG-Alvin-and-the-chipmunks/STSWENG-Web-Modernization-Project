const express = require('express');
const { body, param, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const auth = require('../auth');
const {
  createComment,
  getCommentsForPost
 } = require('../controllers/commentController');

// --- Rate limiting middleware for comment creation ---
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 comment creation requests per windowMs
  message: {
    success: false,
    message: 'Too many comments created from this IP, please try again after 15 minutes.'
  }
});

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

// --- Rate limiting middleware for getting comments ---
const getCommentsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests for comments from this IP, please try again after 15 minutes.'
  }
});

// --- Validation middleware for GET route ---
const validateGetComments = [
  param('blogId').isMongoId().withMessage('A valid blog post ID is required in the URL.'),
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
  commentLimiter, // Apply rate limiter.
  auth,
  validateComment,
  createComment
);

// --- GET ROUTE ---
// Get comments for a specific blog post (Public)
router.get('/:blogId',
  validateGetComments,
  getCommentsLimiter,
  getCommentsForPost
);


module.exports = router;