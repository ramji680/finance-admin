import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { Restaurant, Order, Payment } from '../database/models';
import { asyncHandler } from '../middleware/errorHandler';
import { Op } from 'sequelize';

const router = Router();

// Validation middleware
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

// GET /api/restaurants - Get all restaurants with pagination and filters
router.get('/', validatePagination, asyncHandler(async (req: Request, res: Response) => {
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
    const { search, city, status, cuisine } = req.query;

    // Build where clause
    const whereClause: any = {};
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { ownerName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (city) {
      whereClause.city = { [Op.like]: `%${city}%` };
    }

    if (status) {
      whereClause.isActive = status === 'active';
    }

    if (cuisine) {
      whereClause.cuisine = { [Op.like]: `%${cuisine}%` };
    }

    // Get restaurants with pagination
    const { count, rows: restaurants } = await Restaurant.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    // Get additional stats for each restaurant
    const restaurantsWithStats = await Promise.all(
      restaurants.map(async (restaurant) => {
        const orderCount = await Order.count({
          where: { restaurantId: restaurant.id },
        });

        const totalRevenue = await Order.sum('total', {
          where: {
            restaurantId: restaurant.id,
            paymentStatus: 'paid',
          },
        });

        const pendingPayment = await Payment.findOne({
          where: {
            restaurantId: restaurant.id,
            status: 'pending',
          },
          order: [['createdAt', 'DESC']],
        });

        return {
          ...restaurant.toJSON(),
          stats: {
            orderCount: orderCount || 0,
            totalRevenue: totalRevenue || 0,
            pendingPayment: pendingPayment ? {
              amount: pendingPayment.restaurantAmount,
              month: pendingPayment.month,
              year: pendingPayment.year,
            } : null,
          },
        };
      })
    );

    return res.json({
      restaurants: restaurantsWithStats,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    return res.status(500).json({
      error: 'Failed to fetch restaurants',
    });
  }
}));

// GET /api/restaurants/:id - Get restaurant by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurant not found',
      });
    }

    // Get restaurant stats
    const orderCount = await Order.count({
      where: { restaurantId: id },
    });

    const totalRevenue = await Order.sum('total', {
      where: {
        restaurantId: id,
        paymentStatus: 'paid',
      },
    });

    const totalCommission = await Order.sum('commission', {
      where: {
        restaurantId: id,
        paymentStatus: 'paid',
      },
    });

    const pendingPayment = await Payment.findOne({
      where: {
        restaurantId: id,
        status: 'pending',
      },
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      restaurant: {
        ...restaurant.toJSON(),
        stats: {
          orderCount: orderCount || 0,
          totalRevenue: totalRevenue || 0,
          totalCommission: totalCommission || 0,
          pendingPayment: pendingPayment ? {
            amount: pendingPayment.restaurantAmount,
            month: pendingPayment.month,
            year: pendingPayment.year,
          } : null,
        },
      },
    });
  } catch (error) {
    console.error('Get restaurant error:', error);
    return res.status(500).json({
      error: 'Failed to fetch restaurant',
    });
  }
}));

// GET /api/restaurants/:id/orders - Get restaurant orders
router.get('/:id/orders', validatePagination, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const { id } = req.params;
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const offset = (page - 1) * limit;
    const { status, paymentStatus, startDate, endDate } = req.query;

    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurant not found',
      });
    }

    // Build where clause
    const whereClause: any = { restaurantId: id };
    
    if (status) {
      whereClause.status = status;
    }

    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus;
    }

    if (startDate && endDate) {
      whereClause.orderDate = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    // Get orders with pagination
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['orderDate', 'DESC']],
    });

    return res.json({
      orders,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get restaurant orders error:', error);
    return res.status(500).json({
      error: 'Failed to fetch restaurant orders',
    });
  }
}));

// GET /api/restaurants/:id/payments - Get restaurant payment history
router.get('/:id/payments', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurant not found',
      });
    }

    // Get payment history
    const payments = await Payment.findAll({
      where: { restaurantId: id },
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      payments,
    });
  } catch (error) {
    console.error('Get restaurant payments error:', error);
    return res.status(500).json({
      error: 'Failed to fetch restaurant payments',
    });
  }
}));

// PUT /api/restaurants/:id - Update restaurant
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurant not found',
      });
    }

    await restaurant.update(updateData);

    return res.json({
      message: 'Restaurant updated successfully',
      restaurant,
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    return res.status(500).json({
      error: 'Failed to update restaurant',
    });
  }
}));

export default router;
