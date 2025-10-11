const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const {
  createBlogPost,
  getBlogPosts,
  getBlogPostBySlug
} = require('../controllers/blogController');
const auth = require('../auth');


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

// --- Validation middleware ---
const validatePost = [
  body('title').notEmpty().withMessage('Title is required.'),
  body('content').notEmpty().withMessage('Content is required.'),
  body('author').notEmpty().withMessage('Author is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({ status: 400, message: 'Validation failed', errors: errors.array() });
    }
    next();
  },
];

// Create new blog post (protected - admin/manager only)
//router.post('/', auth, createBlogPost);
router.post('/', auth, upload.single('coverImage'), validatePost, createBlogPost);

// Get all published blog posts (public)
router.get('/', getBlogPosts);

// Get single blog post by slug (public)
router.get('/:slug', getBlogPostBySlug);

module.exports = router;