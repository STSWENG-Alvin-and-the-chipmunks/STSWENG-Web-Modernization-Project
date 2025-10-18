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
  coverImage: {
    type: String,
    default: ''
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
  // createdAt and updatedAt automatically added by:
  isPublished: {
    type: Boolean,
    default: false
  }
}, { 
  collection: 'BlogPost',
  timestamps: true 
});

BlogPostSchema.index({ isPublished: 1, createdAt: -1 });

module.exports = mongoose.model('BlogPost', BlogPostSchema);