const Comment = require('../models/Comment');
const BlogPost = require('../models/BlogPost');

// Create a new comment
const createComment = async (req, res) => {
  try {
    const { content, blogId } = req.body;
    const author = req.user.id; // From auth middleware

    // Validate blogId to prevent NoSQL injection
    if (
      typeof blogId !== 'string' ||
      !blogId.match(/^[a-fA-F0-9]{24}$/)
    ) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid blogId' 
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

    const comment = new Comment({
      content,
      author,
      blogPost: blogId
    });

    await comment.save();

    // Populate author info before sending back
    // The frontend will want to display the user's name/pic
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username profilePic');

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      data: populatedComment
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ 
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
    const comments = await Comment.find({ blogPost: blogId, isDeleted: false })
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


// Update a comment
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const comment = req.comment; // From ownership middleware

    comment.content = content;
    comment.editedAt = new Date();

    await comment.save();

    const populated = await Comment.findById(comment._id)
      .populate('author', 'username profilePic');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: populated
    });

  } catch (err) {
    console.error('Update comment error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Soft delete a comment
const deleteComment = async (req, res) => {
  try {
    const comment = req.comment; // From ownership middleware
    
    if (comment.isDeleted) {
      return res.status(410).json({
        success: false,
        message: 'Comment already deleted'
      });
    }

    comment.isDeleted = true;
    await comment.save();

    res.json({
      success: true,
      message: 'Comment deleted (soft delete) successfully'
    });

  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createComment,
  getCommentsForPost,
  updateComment,
  deleteComment
};