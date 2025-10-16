const BlogPost = require('../models/BlogPost');
const path = require('path');

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
    if (req.files && req.files.coverImage) {
      const file = req.files.coverImage;
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      
      if (validImageTypes.includes(file.mimetype)) {
        const uploadPath = path.join(__dirname, '../public/uploads', file.name);
        await file.mv(uploadPath);
        coverImage = `/uploads/${file.name}`;
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid file type. Only JPEG, PNG, and GIF are allowed.' 
        });
      }
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
    
    const blogPost = await BlogPost.findOne({ slug, isPublished: true })
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

module.exports = {
  createBlogPost,
  getBlogPosts,
  getBlogPostBySlug
};