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

module.exports = {
  createComment
};