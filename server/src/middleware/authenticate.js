import { extractToken, verifyToken } from '../utils/auth.js';

/**
 * Middleware to authenticate JWT token
 * Verifies token from Authorization header
 * Attaches user data to req.user if valid
 */
export const authenticate = (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Missing authorization header',
        message: 'Authorization header is required'
      });
    }

    // Extract token from "Bearer <token>"
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'Invalid authorization header format',
        message: 'Expected format: "Authorization: Bearer <token>"'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user data to request
    // req.user = decoded;
    req.user = {
      id: decoded.id,
      email: decoded.email
    }
    req.token = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    if (error.message.includes('expired')) {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please login again.'
      });
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message || 'Invalid token'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user data if token present, but doesn't fail if missing
 */
export const authenticateOptional = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = extractToken(authHeader);

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    req.token = token;
  } catch (error) {
    // Silently fail for optional auth
    console.warn('Optional auth warning:', error.message);
  }

  next();
};
