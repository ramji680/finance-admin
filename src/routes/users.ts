import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User, sequelize } from '../database/models';
import { asyncHandler } from '../middleware/errorHandler';
import { Op } from 'sequelize';

const router = Router();

// Validation middleware
const validateUserCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('mobile')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Valid mobile number is required'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
];

// GET /api/users - Get all users with pagination and filters
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const offset = (page - 1) * limit;
    
    const { search, status } = req.query;
    
    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    // Get users with pagination
    const { count } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    // Get user roles using raw SQL
    const [userRolesResult] = await sequelize.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.mobile,
        u.status,
        u.created_at,
        u.updated_at,
        r.name as role_name
      FROM users u
      LEFT JOIN model_has_roles mhr ON u.id = mhr.model_id
      LEFT JOIN roles r ON mhr.role_id = r.id
      WHERE u.status = 'active'
      ORDER BY u.name ASC
      LIMIT ? OFFSET ?
    `, {
      replacements: [limit, offset]
    });

    const usersWithRoles = (userRolesResult as any[]).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      status: user.status,
      role: user.role_name || 'User',
      created_at: user.created_at,
      updated_at: user.updated_at
    }));

    return res.json({
      users: usersWithRoles,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      error: 'Failed to fetch users',
    });
  }
}));

// GET /api/users/:id - Get user by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get user with role using raw SQL
    const [userResult] = await sequelize.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.mobile,
        u.status,
        u.created_at,
        u.updated_at,
        r.name as role_name
      FROM users u
      LEFT JOIN model_has_roles mhr ON u.id = mhr.model_id
      LEFT JOIN roles r ON mhr.role_id = r.id
      WHERE u.id = ?
    `, {
      replacements: [id]
    });

    if (!userResult || (userResult as any[]).length === 0) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    const user = (userResult as any[])[0];

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        status: user.status,
        role: user.role_name || 'User',
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      error: 'Failed to fetch user',
    });
  }
}));

// POST /api/users - Create new user
router.post('/', validateUserCreation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const userData = req.body;
    
    // Create the user
    const user = await User.create(userData);

    return res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({
      error: 'Failed to create user',
    });
  }
}));

// PUT /api/users/:id - Update user
router.put('/:id', validateUserCreation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    await user.update(updateData);

    return res.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      error: 'Failed to update user',
    });
  }
}));

// DELETE /api/users/:id - Delete user
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    await user.destroy();

    return res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      error: 'Failed to delete user',
    });
  }
}));

// GET /api/users/stats - Get user statistics
router.get('/stats', asyncHandler(async (_req: Request, res: Response) => {
  try {
    // Get user statistics using raw SQL
    const [statsResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users,
        COUNT(DISTINCT r.name) as total_roles
      FROM users u
      LEFT JOIN model_has_roles mhr ON u.id = mhr.model_id
      LEFT JOIN roles r ON mhr.role_id = r.id
    `);

    const [roleStatsResult] = await sequelize.query(`
      SELECT 
        r.name as role_name,
        COUNT(mhr.model_id) as user_count
      FROM roles r
      LEFT JOIN model_has_roles mhr ON r.id = mhr.role_id
      LEFT JOIN users u ON mhr.model_id = u.id AND u.status = 'active'
      GROUP BY r.id, r.name
      ORDER BY user_count DESC
    `);

    const stats = (statsResult as any[])[0];
    const roleStats = roleStatsResult as any[];

    return res.json({
      stats: {
        total: stats.total_users || 0,
        active: stats.active_users || 0,
        inactive: stats.inactive_users || 0,
        totalRoles: stats.total_roles || 0,
        byRole: roleStats.map(role => ({
          role: role.role_name,
          count: role.user_count || 0
        }))
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return res.status(500).json({
      error: 'Failed to fetch user statistics',
    });
  }
}));

export default router;
