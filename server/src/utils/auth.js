import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRY = '7d';
const SALT_ROUNDS = 10;

// ============================================
// JWT TOKEN MANAGEMENT
// ============================================

/**
 * Sign JWT token for user
 * @param {Object} payload - Data to encode in token
 * @returns {string} JWT token
 */
export const signToken = (payload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256'
    });
    return token;
  } catch (error) {
    console.error('Error signing token:', error);
    throw new Error('Failed to sign token');
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error.message);
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null
 */
export const extractToken = (authHeader) => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }
  return parts[1];
};

// ============================================
// PASSWORD HASHING & VERIFICATION
// ============================================

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcryptjs.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcryptjs.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare plain text password with hash
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} True if match, false otherwise
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcryptjs.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Failed to compare passwords');
  }
};

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password
 * @returns {Object} { isValid, errors }
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate name
 * @param {string} name - User name
 * @returns {boolean} True if valid
 */
export const isValidName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 255;
};
