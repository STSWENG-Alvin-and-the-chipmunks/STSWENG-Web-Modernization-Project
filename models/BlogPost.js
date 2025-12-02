// models/BlogPost.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sub-Schema for Comments
const commentSchema = new Schema({
  content: { 
    type: String, 
    required: true 
  },
  author: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', // Ensure this matches your User model name exactly
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// This schema now combines ALL fields from both files
const BlogPostSchema = new mongoose.Schema({
  
  // --- Fields from your original 'BlogPost' schema ---
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublished: {
    type: Boolean,
    default: false
  },

  // --- Fields from your 'Posts.js' file ---
  subtitle: {
    type: String,
    trim: true,
    default: ''
  },
  heroImage: { // Using this instead of 'coverImage' to match your template
    type: String,
    default: ''
  },
  imageCredit: {
    type: String,
    default: ''
  },
  readTime: {
    type: String,
    default: ''
  },
  upvotes: {
    type: Number,
    default: 0
  },
  comments: [commentSchema],

  // Soft delete flag
  isDeleted: {
    type: Boolean,
    default: false
  }

}, { 
  // --- Options from your original 'BlogPost' schema ---
  collection: 'BlogPost', // Ensures it uses your existing collection
  timestamps: true        // Automatically adds createdAt/updatedAt
});

// Index from your original 'BlogPost' schema (good for performance)
BlogPostSchema.index({ isPublished: 1, createdAt: -1 });

module.exports = mongoose.model('BlogPost', BlogPostSchema);