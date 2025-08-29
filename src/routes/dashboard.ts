import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { Restaurant, Order, Payment, SupportTicket, sequelize } from '../database/models';
import { asyncHandler } from '../middleware/errorHandler';
import { Op } from 'sequelize';

const router = Router();

// Validation middleware
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),
];

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', asyncHandler(async (_req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get total counts
    const totalRestaurants = await Restaurant.count({ where: { isActive: true } });
    const totalOrders = await Order.count();
    const totalSupportTickets = await SupportTicket.count();
    const openSupportTickets = await SupportTicket.count({ where: { status: 'open' } });

    // Get current month stats
    const currentMonthOrders = await Order.count({
      where: {
        orderDate: {
          [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
          [Op.lt]: new Date(currentYear, currentMonth, 1),
        },
      },
    });

    const currentMonthRevenue = await Order.sum('total', {
      where: {
        orderDate: {
          [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
          [Op.lt]: new Date(currentYear, currentMonth, 1),
        },
        paymentStatus: 'paid',
      },
    });

    const currentMonthCommission = await Order.sum('commission', {
      where: {
        orderDate: {
          [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
          [Op.lt]: new Date(currentYear, currentMonth, 1),
        },
        paymentStatus: 'paid',
      },
    });

    // Get pending payments
    const pendingPayments = await Payment.count({
      where: { status: 'pending' },
    });

    const pendingPaymentsAmount = await Payment.sum('restaurantAmount', {
      where: { status: 'pending' },
    });

    return res.json({
      stats: {
        totalRestaurants,
        totalOrders,
        totalSupportTickets,
        openSupportTickets,
        currentMonth: {
          orders: currentMonthOrders,
          revenue: currentMonthRevenue || 0,
          commission: currentMonthCommission || 0,
        },
        pendingPayments: {
          count: pendingPayments,
          amount: pendingPaymentsAmount || 0,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({
      error: 'Failed to fetch dashboard statistics',
    });
  }
}));

// GET /api/dashboard/analytics - Get detailed analytics
router.get('/analytics', validateDateRange, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const { startDate, endDate } = req.query;
    const currentDate = new Date();
    
    // Default to current month if no dates provided
    const start = startDate ? new Date(startDate as string) : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get orders by date range
    const orders = await Order.findAll({
      where: {
        orderDate: {
          [Op.between]: [start, end],
        },
      },
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'city'],
        },
      ],
      order: [['orderDate', 'DESC']],
    });

    // Get revenue by day
    const revenueByDay = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('orderDate')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue'],
        [sequelize.fn('SUM', sequelize.col('commission')), 'totalCommission'],
      ],
      where: {
        orderDate: {
          [Op.between]: [start, end],
        },
        paymentStatus: 'paid',
      },
      group: [sequelize.fn('DATE', sequelize.col('orderDate'))],
      order: [[sequelize.fn('DATE', sequelize.col('orderDate')), 'ASC']],
      raw: true,
    });

    // Get top restaurants by orders
    const topRestaurants = await Order.findAll({
      attributes: [
        'restaurantId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue'],
      ],
      where: {
        orderDate: {
          [Op.between]: [start, end],
        },
        paymentStatus: 'paid',
      },
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name', 'city'],
        },
      ],
      group: ['restaurantId'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true,
    });

    // Get support tickets by category
    const supportByCategory = await SupportTicket.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'ticketCount'],
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      group: ['category'],
      raw: true,
    });

    return res.json({
      analytics: {
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        orders,
        revenueByDay,
        topRestaurants,
        supportByCategory,
      },
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return res.status(500).json({
      error: 'Failed to fetch dashboard analytics',
    });
  }
}));

// GET /api/dashboard/recent-activity - Get recent activity
router.get('/recent-activity', asyncHandler(async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query['limit'] as string) || 10;

    // Get recent orders
    const recentOrders = await Order.findAll({
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });

    // Get recent support tickets
    const recentTickets = await SupportTicket.findAll({
      order: [['createdAt', 'DESC']],
      limit,
    });

    // Get recent payments
    const recentPayments = await Payment.findAll({
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });

    return res.json({
      recentActivity: {
        orders: recentOrders,
        tickets: recentTickets,
        payments: recentPayments,
      },
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    return res.status(500).json({
      error: 'Failed to fetch recent activity',
    });
  }
}));

export default router;
