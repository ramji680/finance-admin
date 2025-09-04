import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Restaurant, Order } from '../database/models';
import { asyncHandler } from '../middleware/errorHandler';
import { Op } from 'sequelize';

const router = Router();

// Validation middleware
const validateRestaurantCreation = [
  body('restaurant_name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Restaurant name must be between 2 and 255 characters'),
  body('owner_name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Owner name must be between 2 and 255 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('mobile')
    .isLength({ min: 10, max: 15 })
    .withMessage('Valid mobile number is required'),
  body('address')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('pincode')
    .isLength({ min: 6, max: 10 })
    .withMessage('Pincode must be between 6 and 10 characters'),
  body('cuisine_type')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cuisine type must be between 2 and 100 characters'),
  body('commission_rate')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Commission rate must be between 0 and 100'),
];

// GET /api/restaurants - Get all restaurants with pagination and filters
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const offset = (page - 1) * limit;
    
    const { city, status, cuisine } = req.query;
    
    const whereClause: any = {};

    if (city) {
      whereClause.city = { [Op.like]: `%${city}%` };
    }

    if (status) {
      whereClause.approve_status = status;
    }

    if (cuisine) {
      whereClause.category_id = { [Op.like]: `%${cuisine}%` };
    }

    // Get restaurants with pagination
    const { count, rows: restaurants } = await Restaurant.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['restaurant_name', 'ASC']],
    });

    // Get additional stats for each restaurant
    const restaurantsWithStats = await Promise.all(
      restaurants.map(async (restaurant) => {
        const orderCount = await Order.count({
          where: { restaurant_id: restaurant.id, status: 'Delivered', paying_status: '1' },
        });

        const totalRevenue = await Order.sum('grand_total_user', {
          where: {
            restaurant_id: restaurant.id,
            paying_status: '1',
            status: 'Delivered',
          },
        });

        return {
          ...restaurant.toJSON(),
          stats: {
            orderCount: orderCount || 0,
            totalRevenue: totalRevenue || 0,
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
      where: { restaurant_id: id },
    });

    const totalRevenue = await Order.sum('grand_total_user', {
      where: {
        restaurant_id: id,
        paying_status: 'paid',
      },
    });

    const totalCommission = await Order.sum('grand_total', {
      where: {
        restaurant_id: id,
        paying_status: 'paid',
      },
    });

    const restaurantWithStats = {
      ...restaurant.toJSON(),
      stats: {
        orderCount: orderCount || 0,
        totalRevenue: totalRevenue || 0,
        totalCommission: totalCommission || 0,
      },
    };

    return res.json({
      restaurant: restaurantWithStats,
    });
  } catch (error) {
    console.error('Get restaurant error:', error);
    return res.status(500).json({
      error: 'Failed to fetch restaurant',
    });
  }
}));

// POST /api/restaurants - Create new restaurant
router.post('/', validateRestaurantCreation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const restaurantData = req.body;
    
    // Create the restaurant
    const restaurant = await Restaurant.create(restaurantData);

    return res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant,
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    return res.status(500).json({
      error: 'Failed to create restaurant',
    });
  }
}));

// PUT /api/restaurants/:id - Update restaurant
router.put('/:id', validateRestaurantCreation, asyncHandler(async (req: Request, res: Response) => {
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

// DELETE /api/restaurants/:id - Delete restaurant
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurant not found',
      });
    }

    await restaurant.destroy();

    return res.json({
      message: 'Restaurant deleted successfully',
    });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    return res.status(500).json({
      error: 'Failed to delete restaurant',
    });
  }
}));

// GET /api/restaurants/:id/orders - Get restaurant orders
router.get('/:id/orders', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: { restaurant_id: id },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
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

export default router;
