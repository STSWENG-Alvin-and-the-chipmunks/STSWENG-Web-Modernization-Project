const express = require('express');
const router = express.Router();
const {
  createBlogPost,
  getBlogPosts,
  getBlogPostBySlug
} = require('../controllers/blogController');
const auth = require('../auth');

// Create new blog post (protected - admin/manager only)
router.post('/', auth, createBlogPost);

// Get all published blog posts (public)
router.get('/', getBlogPosts);

// Get single blog post by slug (public)
router.get('/:slug', getBlogPostBySlug);

module.exports = router;