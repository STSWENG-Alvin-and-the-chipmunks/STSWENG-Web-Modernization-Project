const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  createBlogPost,
  getBlogPosts,
  getBlogPostBySlug,
  updateBlogPost,
  deleteBlogPost
} = require('../controllers/blogController');
const auth = require('../auth');


// --- Rate limiting for create (POST) blog post route ---
// Limit to 10 requests per hour per IP
const createBlogPostLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many blog posts created from this IP, please try again after an hour'
});

// --- Rate limiting for update (PUT) blog post route ---
// Limit to 10 requests per hour per IP for updates as well
const updateBlogPostLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many blog post updates from this IP, please try again after an hour'
});

// --- Rate limiting for delete (DELETE) blog post route ---
// Limit to 10 requests per hour per IP for deletes
const deleteBlogPostLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many blog post deletions from this IP, please try again after an hour'
});

// --- Multer setup for file uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Invalid file type. Only images are allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

// --- Validation middleware for CREATE ---
const validatePost = [
  body('title').notEmpty().withMessage('Title is required.'),
  body('content').notEmpty().withMessage('Content is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // This sends a JSON error response
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }
    next();
  },
];

// --- Validation middleware for UPDATE ---
const validatePostUpdate = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty.'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty.'),
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

// --- Role-based authorization middleware ---
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};

// Create new blog post (protected - admin/manager only)
//router.post('/', auth, createBlogPost);
router.post('/', createBlogPostLimiter, auth, authorizeRoles('Admin', 'Manager'), upload.single('coverImage'), validatePost, createBlogPost);

// Get all published blog posts (public)
router.get('/', getBlogPosts);

// Get single blog post by slug (public)
router.get('/:slug', getBlogPostBySlug);

// Update blog post by slug (protected)
router.put('/:slug', updateBlogPostLimiter, auth, authorizeRoles('Admin', 'Manager'), upload.single('coverImage'), validatePostUpdate, updateBlogPost);

// Delete blog post by slug (protected)
router.delete('/:slug', deleteBlogPostLimiter, auth, authorizeRoles('Admin', 'Manager'), deleteBlogPost);

module.exports = router;