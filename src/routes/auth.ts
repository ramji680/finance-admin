import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as jwt from 'jsonwebtoken';
import { User } from '../database/models';
import { asyncHandler } from '../middleware/errorHandler';

import { Op } from 'sequelize';

const router = Router();

// Validation middleware
const validateLogin = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Username/Email must be between 3 and 100 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// POST /api/auth/login
router.post('/login', validateLogin, asyncHandler(async (req: Request, res: Response) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  const { username, password } = req.body;

  try {
    // Find user by email or name
    const user = await User.findOne({
      where: {
        status: 'active',
        [Op.or]: [
          { email: username },
          { name: username }
        ]
      },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Get user role
    const role = await user.getRole();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: role,
      },
      process.env['JWT_SECRET']!,
      {
        expiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
      } as jwt.SignOptions
    );

    // Return user info and token
    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Login failed',
    });
  }
}));

// POST /api/auth/logout (optional - client-side token removal)
router.post('/logout', (_req: Request, res: Response) => {
  return res.json({
    message: 'Logout successful',
  });
});

// GET /api/auth/me - Get current user info
router.get('/me', async (_req: Request, res: Response) => {
  try {
    // This route should be protected by auth middleware
    // For now, we'll return a message
    return res.json({
      message: 'Use this route with authentication middleware to get user info',
    });
  } catch (error) {
    console.error('Get user info error:', error);
    return res.status(500).json({
      error: 'Failed to get user info',
    });
  }
});

export default router;
