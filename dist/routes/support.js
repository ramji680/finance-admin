"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const models_1 = require("../database/models");
const errorHandler_1 = require("../middleware/errorHandler");
const sequelize_1 = require("sequelize");
const router = (0, express_1.Router)();
// Validation middleware
const validateTicketCreation = [
    (0, express_validator_1.body)('subject')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Subject must be between 5 and 200 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters long'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be low, medium, high, or urgent'),
    (0, express_validator_1.body)('category')
        .optional()
        .isIn(['technical', 'billing', 'general', 'support'])
        .withMessage('Invalid category'),
    (0, express_validator_1.body)('requesterName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Requester name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('requesterEmail')
        .isEmail()
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('requesterPhone')
        .optional()
        .isLength({ min: 10, max: 15 })
        .withMessage('Phone number must be between 10 and 15 characters'),
];
const validateTicketUpdate = [
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['open', 'in_progress', 'resolved', 'closed'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority'),
    (0, express_validator_1.body)('assignedTo')
        .optional()
        .isInt()
        .withMessage('Assigned user ID must be an integer'),
];
const validatePagination = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
];
// GET /api/support/tickets - Get all support tickets with filters
router.get('/tickets', validatePagination, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array(),
        });
    }
    try {
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 20;
        const offset = (page - 1) * limit;
        const { status, priority, category, search, assignedTo } = req.query;
        // Build where clause
        const whereClause = {};
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
            whereClause.assigned_to = parseInt(assignedTo);
        }
        if (search) {
            whereClause[sequelize_1.Op.or] = [
                { subject: { [sequelize_1.Op.like]: `%${search}%` } },
                { description: { [sequelize_1.Op.like]: `%${search}%` } },
                { requester_name: { [sequelize_1.Op.like]: `%${search}%` } },
                { requester_email: { [sequelize_1.Op.like]: `%${search}%` } },
            ];
        }
        // Get tickets with pagination
        const { count, rows: tickets } = await models_1.SupportTicket.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: models_1.User,
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
    }
    catch (error) {
        console.error('Get support tickets error:', error);
        return res.status(500).json({
            error: 'Failed to fetch support tickets',
        });
    }
}));
// POST /api/support/tickets - Create new support ticket
router.post('/tickets', validateTicketCreation, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array(),
        });
    }
    try {
        const ticketData = req.body;
        // Create the ticket
        const ticket = await models_1.SupportTicket.create(ticketData);
        // Get the created ticket with assigned user info
        const createdTicket = await models_1.SupportTicket.findByPk(ticket.id, {
            include: [
                {
                    model: models_1.User,
                    as: 'assignedUser',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });
        return res.status(201).json({
            message: 'Support ticket created successfully',
            ticket: createdTicket,
        });
    }
    catch (error) {
        console.error('Create support ticket error:', error);
        return res.status(500).json({
            error: 'Failed to create support ticket',
        });
    }
}));
// GET /api/support/tickets/:id - Get ticket by ID
router.get('/tickets/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await models_1.SupportTicket.findByPk(id, {
            include: [
                {
                    model: models_1.User,
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
    }
    catch (error) {
        console.error('Get support ticket error:', error);
        return res.status(500).json({
            error: 'Failed to fetch support ticket',
        });
    }
}));
// PUT /api/support/tickets/:id - Update ticket
router.put('/tickets/:id', validateTicketUpdate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
        // Remove fields that shouldn't be updated
        delete updateData.id;
        delete updateData.ticketNumber;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        const ticket = await models_1.SupportTicket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({
                error: 'Support ticket not found',
            });
        }
        await ticket.update(updateData);
        // Get updated ticket with assigned user info
        const updatedTicket = await models_1.SupportTicket.findByPk(id, {
            include: [
                {
                    model: models_1.User,
                    as: 'assignedUser',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });
        return res.json({
            message: 'Support ticket updated successfully',
            ticket: updatedTicket,
        });
    }
    catch (error) {
        console.error('Update support ticket error:', error);
        return res.status(500).json({
            error: 'Failed to update support ticket',
        });
    }
}));
// GET /api/support/stats - Get support statistics
router.get('/stats', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        // Get total counts
        const totalTickets = await models_1.SupportTicket.count();
        const openTickets = await models_1.SupportTicket.count({ where: { status: 'open' } });
        const inProgressTickets = await models_1.SupportTicket.count({ where: { status: 'in_progress' } });
        const resolvedTickets = await models_1.SupportTicket.count({ where: { status: 'resolved' } });
        const closedTickets = await models_1.SupportTicket.count({ where: { status: 'closed' } });
        // Get current month stats
        const currentMonthTickets = await models_1.SupportTicket.count({
            where: {
                created_at: {
                    [sequelize_1.Op.gte]: new Date(currentYear, currentMonth - 1, 1),
                    [sequelize_1.Op.lt]: new Date(currentYear, currentMonth, 1),
                },
            },
        });
        // Get tickets by priority
        const ticketsByPriority = await models_1.SupportTicket.findAll({
            attributes: [
                'priority',
                [models_1.sequelize.fn('COUNT', models_1.sequelize.col('id')), 'count'],
            ],
            group: ['priority'],
            raw: true,
        });
        // Get tickets by category
        const ticketsByCategory = await models_1.SupportTicket.findAll({
            attributes: [
                'category',
                [models_1.sequelize.fn('COUNT', models_1.sequelize.col('id')), 'count'],
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
    }
    catch (error) {
        console.error('Get support stats error:', error);
        return res.status(500).json({
            error: 'Failed to fetch support statistics',
        });
    }
}));
// GET /api/support/agents - Get available support agents
router.get('/agents', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    try {
        const agents = await models_1.User.findAll({
            where: {
                status: 'active',
            },
            attributes: ['id', 'name', 'email'],
        });
        return res.json({
            agents,
        });
    }
    catch (error) {
        console.error('Get support agents error:', error);
        return res.status(500).json({
            error: 'Failed to fetch support agents',
        });
    }
}));
exports.default = router;
//# sourceMappingURL=support.js.map