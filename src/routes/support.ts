import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { SupportTicket, User, sequelize } from '../database/models';
import { asyncHandler } from '../middleware/errorHandler';
import { Op } from 'sequelize';

const router = Router();

// Validation middleware
const validateTicketCreation = [
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('category')
    .optional()
    .isIn(['technical', 'billing', 'general', 'support'])
    .withMessage('Invalid category'),
  body('requesterName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Requester name must be between 2 and 100 characters'),
  body('requesterEmail')
    .isEmail()
    .withMessage('Valid email is required'),
  body('requesterPhone')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
];

const validateTicketUpdate = [
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('assignedTo')
    .optional()
    .isInt()
    .withMessage('Assigned user ID must be an integer'),
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// GET /api/support/tickets - Get all support tickets with filters
router.get('/tickets', validatePagination, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const offset = (page - 1) * limit;
    const { status, priority, category, search, assignedTo } = req.query;

    // Build where clause
    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (category) {
      whereClause.category = category;
    }

    if (assignedTo) {
      whereClause.assigned_to = parseInt(assignedTo as string);
    }

    if (search) {
      whereClause[Op.or] = [
        { subject: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { requester_name: { [Op.like]: `%${search}%` } },
        { requester_email: { [Op.like]: `%${search}%` } },
      ];
    }

    // Get tickets with pagination
    const { count, rows: tickets } = await SupportTicket.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit,
      offset,
      order: [
        ['priority', 'DESC'],
        ['created_at', 'DESC'],
      ],
    });

    return res.json({
      tickets,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    return res.status(500).json({
      error: 'Failed to fetch support tickets',
    });
  }
}));

// POST /api/support/tickets - Create new support ticket
router.post('/tickets', validateTicketCreation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const ticketData = req.body;

    // Create the ticket
    const ticket = await SupportTicket.create(ticketData);

    // Get the created ticket with assigned user info
    const createdTicket = await SupportTicket.findByPk(ticket.id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: createdTicket,
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    return res.status(500).json({
      error: 'Failed to create support ticket',
    });
  }
}));

// GET /api/support/tickets/:id - Get ticket by ID
router.get('/tickets/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({
        error: 'Support ticket not found',
      });
    }

    return res.json({
      ticket,
    });
  } catch (error) {
    console.error('Get support ticket error:', error);
    return res.status(500).json({
      error: 'Failed to fetch support ticket',
    });
  }
}));

// PUT /api/support/tickets/:id - Update ticket
router.put('/tickets/:id', validateTicketUpdate, asyncHandler(async (req: Request, res: Response) => {
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

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.ticketNumber;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        error: 'Support ticket not found',
      });
    }

    await ticket.update(updateData);

    // Get updated ticket with assigned user info
    const updatedTicket = await SupportTicket.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json({
      message: 'Support ticket updated successfully',
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error('Update support ticket error:', error);
    return res.status(500).json({
      error: 'Failed to update support ticket',
    });
  }
}));

// GET /api/support/stats - Get support statistics
router.get('/stats', asyncHandler(async (_req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get total counts
    const totalTickets = await SupportTicket.count();
    const openTickets = await SupportTicket.count({ where: { status: 'open' } });
    const inProgressTickets = await SupportTicket.count({ where: { status: 'in_progress' } });
    const resolvedTickets = await SupportTicket.count({ where: { status: 'resolved' } });
    const closedTickets = await SupportTicket.count({ where: { status: 'closed' } });

    // Get current month stats
    const currentMonthTickets = await SupportTicket.count({
      where: {
        created_at: {
          [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
          [Op.lt]: new Date(currentYear, currentMonth, 1),
        },
      },
    });

    // Get tickets by priority
    const ticketsByPriority = await SupportTicket.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['priority'],
      raw: true,
    });

    // Get tickets by category
    const ticketsByCategory = await SupportTicket.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['category'],
      raw: true,
    });

    return res.json({
      stats: {
        total: totalTickets,
        byStatus: {
          open: openTickets,
          inProgress: inProgressTickets,
          resolved: resolvedTickets,
          closed: closedTickets,
        },
        currentMonth: currentMonthTickets,
        byPriority: ticketsByPriority,
        byCategory: ticketsByCategory,
      },
    });
  } catch (error) {
    console.error('Get support stats error:', error);
    return res.status(500).json({
      error: 'Failed to fetch support statistics',
    });
  }
}));

// GET /api/support/agents - Get available support agents
router.get('/agents', asyncHandler(async (_req: Request, res: Response) => {
  try {
    const agents = await User.findAll({
      where: { 
        status: 'active',
      },
      attributes: ['id', 'name', 'email'],
    });

    return res.json({
      agents,
    });
  } catch (error) {
    console.error('Get support agents error:', error);
    return res.status(500).json({
      error: 'Failed to fetch support agents',
    });
  }
}));

export default router;
