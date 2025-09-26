const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_here';
const User = require('./models/User');

module.exports = async function(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.user.id);
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ msg: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log('Token is not valid', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
