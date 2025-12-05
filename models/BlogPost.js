// models/BlogPost.js
const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
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

  // “Posts.js” fields
  subtitle: {
    type: String,
    trim: true,
    default: ''
  },
  heroImage: {
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

  // Now references Comment documents
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: false
  }],

  isDeleted: {
    type: Boolean,
    default: false
  }

}, {
  collection: 'BlogPost',
  timestamps: true
});

BlogPostSchema.index({ isPublished: 1, createdAt: -1 });

module.exports = mongoose.model('BlogPost', BlogPostSchema);
