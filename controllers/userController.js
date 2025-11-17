const User = require('../models/User');

// Promote a user to 'manager'
const promoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Admins can only promote 'user' roles to 'manager'
    if (user.role === 'user') {
      user.role = 'manager';
      await user.save();
      res.json({ 
        success: true, 
        message: 'User promoted to manager', 
        data: user 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Cannot promote this user (e.g., already admin or manager)' 
      });
    }
  } catch (err) {
    console.error('Error promoting user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Demote a 'manager' back to 'user'
const demoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only demote users who are currently 'manager'
    if (user.role === 'manager') {
      user.role = 'user';
      await user.save();
      res.json({ 
        success: true, 
        message: 'Manager demoted to user', 
        data: user 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'This user is not a manager' 
      });
    }
  } catch (err) {
    console.error('Error demoting user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  promoteUser,
  demoteUser
};