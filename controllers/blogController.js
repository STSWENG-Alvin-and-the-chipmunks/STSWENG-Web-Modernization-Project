const BlogPost = require('../models/BlogPost');
const path = require('path');
const fs = require('fs/promises'); // for file deletion

// --- CREATE BLOG POST ---
const createBlogPost = async (req, res) => {
  try {
    const { title, content, tags, isPublished, slug } = req.body;

    // Basic server-side checks (in case client-side missed something)
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required.',
      });
    }

    // Tags: "tag1, tag2" -> ["tag1","tag2"]
    const tagsArray = tags
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    // Slug: use provided or derive from title
    let finalSlug = slug && slug.trim()
      ? slug.trim().toLowerCase()
      : title.toLowerCase();

    finalSlug = finalSlug
      .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
      .replace(/\s+/g, '-')         // spaces -> dashes
      .replace(/-+/g, '-');         // no double dashes

    // Enforce unique slug by erroring if taken
    const existingPost = await BlogPost.findOne({ slug: finalSlug });
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: 'Slug already exists. Please choose a different one.',
      });
    }

    const coverImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const post = await BlogPost.create({
      title,
      slug: finalSlug,
      content,
      tags: tagsArray,
      coverImage: coverImageUrl,
      isPublished: isPublished === 'true',
      author: req.user._id, // auth middleware attaches req.user
    });

    return res.status(201).json({
      success: true,
      message: 'Post created successfully.',
      post: {
        _id: post._id,
        slug: post.slug,
        title: post.title,
      },
    });
  } catch (err) {
    console.error('Error creating blog post:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating blog post.',
      error: err.message,
    });
  }
};

// --- GET ALL PUBLISHED BLOG POSTS ---
const getBlogPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tag } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const query = { isPublished: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    const blogPosts = await BlogPost.find(query)
      .populate('author', 'username profilePic')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await BlogPost.countDocuments(query);

    res.json({
      success: true,
      data: blogPosts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalPosts: total,
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// --- GET SINGLE POST BY SLUG ---
const getBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blogPost = await BlogPost.findOne({
      slug,
      isPublished: true,
      isDeleted: false,
    }).populate('author', 'username profilePic');

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      });
    }

    res.json({
      success: true,
      data: blogPost,
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// --- UPDATE BLOG POST BY SLUG ---
const updateBlogPost = async (req, res) => {
  try {
    const { title, slug, content, tags, isPublished } = req.body;
    const blogPost = await BlogPost.findOne({ slug: req.params.slug });

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      });
    }

    // If slug is being updated, ensure uniqueness
    if (slug && slug !== blogPost.slug) {
      const existingPost = await BlogPost.findOne({ slug: { $eq: slug } });
      if (existingPost) {
        return res.status(400).json({
          success: false,
          message: 'New slug already exists',
        });
      }
      blogPost.slug = slug;
    }

    // New cover image
    if (req.file) {
      if (blogPost.coverImage) {
        const oldImagePath = path.join(__dirname, '../public', blogPost.coverImage);
        try {
          await fs.unlink(oldImagePath);
        } catch (err) {
          console.error('Error deleting old image:', err.message);
        }
      }
      blogPost.coverImage = `/uploads/${req.file.filename}`;
    }

    // Update other fields
    blogPost.title = title || blogPost.title;
    blogPost.content = content || blogPost.content;
    blogPost.tags = tags
      ? (Array.isArray(tags) ? tags : tags.split(','))
      : blogPost.tags;

    if (isPublished !== undefined) {
      blogPost.isPublished = isPublished === 'true';
    }

    const updatedPost = await blogPost.save();

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: updatedPost,
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// --- SOFT DELETE BLOG POST BY SLUG ---
// "Delete" = Unpublish blog post by slug
const deleteBlogPost = async (req, res) => {
  try {
    const { slug } = req.params;

    const blogPost = await BlogPost.findOne({ slug });

    if (!blogPost) {
      return res
        .status(404)
        .json({ success: false, message: 'Blog post not found' });
    }

    blogPost.isPublished = false;
    await blogPost.save();

    return res.json({
      success: true,
      message: 'Blog post unpublished successfully',
    });
  } catch (error) {
    console.error('Error unpublishing blog post:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  createBlogPost,
  getBlogPosts,
  getBlogPostBySlug,
  updateBlogPost,
  deleteBlogPost,
};
