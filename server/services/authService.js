const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Use environment variable for JWT secret key for security
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Token expiration time for better security
const TOKEN_EXPIRATION = '1h';

/**
 * Registers a new user, hashes the password, and returns the user and token.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Object} { user, token }
 */
const registerUser = async (username, email, password) => {
  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash the password before saving it
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });

  // Save the new user to the database
  await user.save();

  // Generate JWT token
  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });

  return { user, token };
};

/**
 * Authenticates a user by verifying the email and password, and returns the user and token.
 * @param {string} email
 * @param {string} password
 * @returns {Object} { user, token }
 */
const authenticateUser = async (email, password) => {
  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare the password with the hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });

  return { user, token };
};

module.exports = { registerUser, authenticateUser };
