"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const models_1 = require("../database/models");
const errorHandler_1 = require("../middleware/errorHandler");
const sequelize_1 = require("sequelize");
const router = (0, express_1.Router)();
// Validation middleware
const validateRestaurantCreation = [
    (0, express_validator_1.body)('restaurant_name')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Restaurant name must be between 2 and 255 characters'),
    (0, express_validator_1.body)('owner_name')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Owner name must be between 2 and 255 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('mobile')
        .isLength({ min: 10, max: 15 })
        .withMessage('Valid mobile number is required'),
    (0, express_validator_1.body)('address')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Address must be between 10 and 500 characters'),
    (0, express_validator_1.body)('city')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('City must be between 2 and 100 characters'),
    (0, express_validator_1.body)('state')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('State must be between 2 and 100 characters'),
    (0, express_validator_1.body)('pincode')
        .isLength({ min: 6, max: 10 })
        .withMessage('Pincode must be between 6 and 10 characters'),
    (0, express_validator_1.body)('cuisine_type')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Cuisine type must be between 2 and 100 characters'),
    (0, express_validator_1.body)('commission_rate')
        .isFloat({ min: 0, max: 100 })
        .withMessage('Commission rate must be between 0 and 100'),
];
// GET /api/restaurants - Get all restaurants with pagination and filters
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 10;
        const offset = (page - 1) * limit;
        const { city, status, cuisine } = req.query;
        const whereClause = {};
        if (city) {
            whereClause.city = { [sequelize_1.Op.like]: `%${city}%` };
        }
        if (status) {
            whereClause.approve_status = status;
        }
        if (cuisine) {
            whereClause.category_id = { [sequelize_1.Op.like]: `%${cuisine}%` };
        }
        // Get restaurants with pagination
        const { count, rows: restaurants } = await models_1.Restaurant.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['restaurant_name', 'ASC']],
        });
        // Get additional stats for each restaurant
        const restaurantsWithStats = await Promise.all(restaurants.map(async (restaurant) => {
            const orderCount = await models_1.Order.count({
                where: { restaurant_id: restaurant.id },
            });
            const totalRevenue = await models_1.Order.sum('grand_total_user', {
                where: {
                    restaurant_id: restaurant.id,
                    paying_status: 'paid',
                },
            });
            return {
                ...restaurant.toJSON(),
                stats: {
                    orderCount: orderCount || 0,
                    totalRevenue: totalRevenue || 0,
                },
            };
        }));
        return res.json({
            restaurants: restaurantsWithStats,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
            },
        });
    }
    catch (error) {
        console.error('Get restaurants error:', error);
        return res.status(500).json({
            error: 'Failed to fetch restaurants',
        });
    }
}));
// GET /api/restaurants/:id - Get restaurant by ID
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await models_1.Restaurant.findByPk(id);
        if (!restaurant) {
            return res.status(404).json({
                error: 'Restaurant not found',
            });
        }
        // Get restaurant stats
        const orderCount = await models_1.Order.count({
            where: { restaurant_id: id },
        });
        const totalRevenue = await models_1.Order.sum('grand_total_user', {
            where: {
                restaurant_id: id,
                paying_status: 'paid',
            },
        });
        const totalCommission = await models_1.Order.sum('grand_total', {
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
    }
    catch (error) {
        console.error('Get restaurant error:', error);
        return res.status(500).json({
            error: 'Failed to fetch restaurant',
        });
    }
}));
// POST /api/restaurants - Create new restaurant
router.post('/', validateRestaurantCreation, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array(),
        });
    }
    try {
        const restaurantData = req.body;
        // Create the restaurant
        const restaurant = await models_1.Restaurant.create(restaurantData);
        return res.status(201).json({
            message: 'Restaurant created successfully',
            restaurant,
        });
    }
    catch (error) {
        console.error('Create restaurant error:', error);
        return res.status(500).json({
            error: 'Failed to create restaurant',
        });
    }
}));
// PUT /api/restaurants/:id - Update restaurant
router.put('/:id', validateRestaurantCreation, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array(),
        });
    }
    try {
        const { id } = req.params;
        const updateData = req.body;
        const restaurant = await models_1.Restaurant.findByPk(id);
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
    }
    catch (error) {
        console.error('Update restaurant error:', error);
        return res.status(500).json({
            error: 'Failed to update restaurant',
        });
    }
}));
// DELETE /api/restaurants/:id - Delete restaurant
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await models_1.Restaurant.findByPk(id);
        if (!restaurant) {
            return res.status(404).json({
                error: 'Restaurant not found',
            });
        }
        await restaurant.destroy();
        return res.json({
            message: 'Restaurant deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete restaurant error:', error);
        return res.status(500).json({
            error: 'Failed to delete restaurant',
        });
    }
}));
// GET /api/restaurants/:id/orders - Get restaurant orders
router.get('/:id/orders', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 10;
        const offset = (page - 1) * limit;
        const { count, rows: orders } = await models_1.Order.findAndCountAll({
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
    }
    catch (error) {
        console.error('Get restaurant orders error:', error);
        return res.status(500).json({
            error: 'Failed to fetch restaurant orders',
        });
    }
}));
exports.default = router;
//# sourceMappingURL=restaurants.js.map