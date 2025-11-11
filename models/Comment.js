const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blogPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  }
}, {
  // This automatically adds `createdAt` and `updatedAt` fields
  // for creation and edited timestamps.
  timestamps: true, 
  collection: 'Comment'
});

// Index to quickly find comments for a specific post
CommentSchema.index({ blogPost: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);