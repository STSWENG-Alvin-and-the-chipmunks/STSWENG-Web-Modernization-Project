const Comment = require('../models/Comment');
const BlogPost = require('../models/BlogPost');
const mongoose = require('mongoose');

// Create a new comment
const createComment = async (req, res) => {
  try {
    const { content, blogId } = req.body;
    const author = req.user.id; // From auth middleware

    // Validate blogId to prevent NoSQL injection
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid blog post ID is required.'
      });
    }

    // Check if the blog post exists
    const post = await BlogPost.findById(blogId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // 1) Create and save the comment
    const comment = await Comment.create({
      content,
      author,
      blogPost: blogId
    });

    // 2) Attach comment ID to the BlogPost document
    post.comments.push(comment._id);
    await post.save();

    // 3) If this came from a normal HTML form, redirect back to the post page
    // (which will refresh and show the new comment)
    return res.redirect(`/posts/${blogId}`);

    // If later you need JSON for an API, you can add a branch like:
    // if (req.headers.accept && req.headers.accept.includes('application/json')) { ... }

  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all comments for a specific blog post
const getCommentsForPost = async (req, res) => {
  try {
    const { blogId } = req.params;

    // Validation is now handled in the route's `validateGetComments`
    // We can proceed assuming blogId is a valid Mongo ID

    // Find comments, sort by newest first (createdAt: -1),
    // and populate the author's details.
    const comments = await Comment.find({ blogPost: blogId })
      .populate('author', 'username profilePic')
      .sort({ createdAt: -1 }); // Sorts newest first

    // Check if the post exists by checking if comments were found
    // or by an explicit check
    const post = await BlogPost.findById(blogId);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }
    
    res.json({
      success: true,
      count: comments.length,
      data: comments
    });

  } catch (error)
 {
    console.error('Error fetching comments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// --- Update Comment (Admin or Author only) ---
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // CHECK OWNERSHIP: Allow if user is Admin OR if user is the Author
    if (req.user.role !== 'admin' && comment.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this comment' });
    }

    comment.content = content || comment.content;
    await comment.save();

    res.json({ success: true, message: 'Comment updated successfully', data: comment });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// --- Delete Comment (Admin, Manager, or Author only) ---
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Allow Admin, Manager, or the Author to delete
    const role = req.user.role;
    if (!['admin', 'manager'].includes(role) &&
        comment.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    // 1) Remove the comment ID from the BlogPost.comments array
    await BlogPost.updateOne(
      { _id: comment.blogPost },
      { $pull: { comments: comment._id } }
    );

    // 2) Hard delete the comment document itself
    await Comment.deleteOne({ _id: commentId });

    return res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


module.exports = {
  createComment,
  getCommentsForPost,
  updateComment,
  deleteComment
};