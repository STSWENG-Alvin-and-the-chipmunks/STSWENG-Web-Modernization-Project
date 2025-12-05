const express = require('express');
const { body, param, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const auth = require('../auth');
const { authorizeRoles } = require('../auth');
const {
  createComment,
  getCommentsForPost,
  updateComment,
  deleteComment
 } = require('../controllers/commentController');

// --- Rate limiting middleware for deleting a comment ---
const deleteCommentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 delete requests per 15 min window per IP/user.
  message: {
    success: false,
    message: 'Too many delete requests from this IP, please try again after 15 minutes'
  }
});

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
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required.'),

  body('blogId')
    .custom((value) => {
      if (!value) {
        throw new Error('blogId is required.');
      }

      const cleaned = String(value)
        .trim()
        .replace(/[^0-9a-fA-F]/g, ''); // strip any junk like '>'

      if (!/^[0-9a-fA-F]{24}$/.test(cleaned)) {
        throw new Error('A valid blog post ID is required.');
      }

      // store cleaned value back into body so controller can use it
      return true;
    }),

  (req, res, next) => {
    console.log('Incoming comment body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
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

// --- Rate limiting middleware for updating a comment ---
const updateCommentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 comment update requests per windowMs
  message: {
    success: false,
    message: 'Too many comment updates from this IP, please try again after 15 minutes.'
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
  authorizeRoles('admin', 'manager', 'user'), // Any logged-in user can comment
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

// PUT: Update Comment
// Auth: Logged in (Controller handles specific Admin vs Author logic)
router.put('/:commentId', updateCommentLimiter, auth, updateComment);

// DELETE: Delete Comment
// Auth: Logged in (Controller handles specific Admin vs Author logic)
router.delete('/:commentId', deleteCommentLimiter, auth, deleteComment);

module.exports = router;