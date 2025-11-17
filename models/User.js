const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcrypt for hashing

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: 'assets/default-pfp.png'
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'user', 'guest'],
    default: 'user' // New users will default to 'user'
  }
}, { 
  collection: 'User',
  timestamps: true // adds timestamps
});

// Automatically hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', UserSchema);