import {
  hashPassword,
  comparePassword,
  signToken,
  isValidEmail,
  isValidName
} from '../utils/auth.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  getUserWithProfile
} from '../models/userModel.js';

/**
 * POST /api/auth/signup
 * Register a new user
 * Body: { name, email, password }
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body)

    // ============================================
    // VALIDATION
    // ============================================

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name, email, and password are required'
      });
    }

    // Trim inputs
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedPassword = password.trim();

    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid email format'
      });
    }

    // Validate name
    if (!isValidName(trimmedName)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name must be between 2 and 255 characters'
      });
    }

    // Validate password
    if (trimmedPassword.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters'
      });
    }

    // ============================================
    // CHECK IF USER EXISTS
    // ============================================

    const existingUser = await findUserByEmail(trimmedEmail);
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email is already registered'
      });
    }

    // ============================================
    // HASH PASSWORD & CREATE USER
    // ============================================

    const passwordHash = await hashPassword(trimmedPassword);
    const newUser = await createUser(trimmedEmail, passwordHash);

    // ============================================
    // GENERATE JWT TOKEN
    // ============================================

    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      type: 'access_token'
    });
    console.log(token)



    // ============================================
    // RESPONSE
    // ============================================

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);

    if (error.message.includes('already registered')) {
      return res.status(409).json({
        error: 'Conflict',
        message: error.message
      });
    }

    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to register user'
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * Body: { email, password }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ============================================
    // VALIDATION
    // ============================================

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid email format'
      });
    }

    // ============================================
    // FIND USER
    // ============================================

    const user = await findUserByEmail(trimmedEmail);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    }

    // ============================================
    // VERIFY PASSWORD
    // ============================================

    const isPasswordValid = await comparePassword(
      trimmedPassword,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    }

    // ============================================
    // GENERATE JWT TOKEN
    // ============================================

    const token = signToken({
      id: user.id,
      email: user.email,
      type: 'access_token'
    });
    console.log(token)

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to login'
    });
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 * Headers: Authorization: Bearer <token>
 */
export const getMe = async (req, res) => {
  try {
    // req.user is set by authenticate middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found in token'
      });
    }

    // ============================================
    // GET USER WITH PROFILE
    // ============================================

    const userWithProfile = await getUserWithProfile(req.user.id);

    if (!userWithProfile) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // ============================================
    // FORMAT RESPONSE
    // ============================================

    const userData = {
      id: userWithProfile.id,
      email: userWithProfile.email,
      created_at: userWithProfile.user_created_at,
      profile: null
    };

    // Add profile if it exists
    if (userWithProfile.onboarding_id) {
  userData.profile = {
    id: userWithProfile.onboarding_id,
    completed: userWithProfile.completed,
    personal_info: userWithProfile.personal_info,
    academic_background: userWithProfile.academic_background,
    preferences: userWithProfile.preferences,
    created_at: userWithProfile.onboarding_created_at
  };
}


    return res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
      },
      profile: userData.profile || null
    });
  } catch (error) {
    console.error('Get user error:', error);

    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve user profile'
    });
  }
};

export default {
  signup,
  login,
  getMe
};
