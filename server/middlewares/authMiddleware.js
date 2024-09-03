// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const AppError = require('../utils/errorHandler');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Middleware for authentication
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized access, no token provided', 401));
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return next(new AppError('Invalid token', 401));

    const user = await User.findById(decoded.userId);
    if (!user) return next(new AppError('User not found', 404));

    req.user = user; // Add user info to request object
    next();
  });
};

// Middleware for role-based access control
exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: You do not have permission to access this resource', 403));
    }
    next();
  };
};
