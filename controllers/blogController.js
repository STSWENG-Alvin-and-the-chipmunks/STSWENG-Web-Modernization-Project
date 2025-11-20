const BlogPost = require('../models/BlogPost');
const path = require('path');
const sanitize = require('sanitize-filename');
const fs = require('fs/promises'); // for file deletion

// Create new blog post
const createBlogPost = async (req, res) => {
  try {
    const { title, slug, content, tags, isPublished } = req.body;
    
    // Check if slug already exists
    const existingPost = await BlogPost.findOne({ slug: { $eq: slug } });
    if (existingPost) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slug already exists' 
      });
    }

    // Handle cover image URL
    let coverImage = '';
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    }

    const blogPost = new BlogPost({
      title,
      slug,
      content,
      author: req.user.id, // From auth middleware
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
      isPublished: isPublished === 'true',
      coverImage
    });

    await blogPost.save();

    res.json({ 
      success: true, 
      message: 'Blog post created successfully',
      data: blogPost 
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get all published blog posts with optional filtering
const getBlogPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tag } = req.query;
    
    const query = { isPublished: true };
    
    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const blogPosts = await BlogPost.find(query)
      .populate('author', 'username profilePic')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BlogPost.countDocuments(query);

    res.json({
      success: true,
      data: blogPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get single blog post by slug
const getBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blogPost = await BlogPost.findOne({ slug, isPublished: true, isDeleted: false })
      .populate('author', 'username profilePic');

    if (!blogPost) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }

    res.json({
      success: true,
      data: blogPost
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Update blog post by slug
const updateBlogPost = async (req, res) => {
  try {
    const { title, slug, content, tags, isPublished } = req.body;
    const blogPost = await BlogPost.findOne({ slug: req.params.slug });

    if (!blogPost) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // If the slug is being updated, check if the new one is unique
    if (slug && slug !== blogPost.slug) {
        const existingPost = await BlogPost.findOne({ slug: { $eq: slug } });
        if (existingPost) {
            return res.status(400).json({ success: false, message: 'New slug already exists' });
        }
        blogPost.slug = slug;
    }
    
    // Handle new cover image upload
    if (req.file) {
      // If there's an old image, delete it
      if (blogPost.coverImage) {
        const oldImagePath = path.join(__dirname, '../public', blogPost.coverImage);
        try {
          await fs.unlink(oldImagePath);
        } catch (err) {
          console.error("Error deleting old image:", err.message);
        }
      }
      blogPost.coverImage = `/uploads/${req.file.filename}`;
    }

    // Update fields
    blogPost.title = title || blogPost.title;
    blogPost.content = content || blogPost.content;
    blogPost.tags = tags ? (Array.isArray(tags) ? tags : tags.split(',')) : blogPost.tags;
    if (isPublished !== undefined) {
      blogPost.isPublished = isPublished === 'true';
    }

    const updatedPost = await blogPost.save();

    res.json({ 
      success: true, 
      message: 'Blog post updated successfully', 
      data: updatedPost 
    });

  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete blog post by slug
const deleteBlogPost = async (req, res) => {
  try {
    const blogPost = await BlogPost.findOne({ slug: req.params.slug });

    if (!blogPost) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // Note: REMOVED the file deletion code
    // In a soft delete, we keep the image so the post can be restored later.

    // Perform Soft Delete
    blogPost.isDeleted = true;
    blogPost.isPublished = false; // Unpublish it as well for safety
    await blogPost.save();

    res.json({ success: true, message: 'Blog post deleted successfully' });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBlogPost: require('./blogController').createBlogPost, // assuming you kept the old one or copy-pasted the whole file
  getBlogPosts,
  getBlogPostBySlug,
  updateBlogPost: require('./blogController').updateBlogPost, // assuming you kept the old one
  deleteBlogPost
};