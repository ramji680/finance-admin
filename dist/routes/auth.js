"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const jwt = __importStar(require("jsonwebtoken"));
const models_1 = require("../database/models");
const errorHandler_1 = require("../middleware/errorHandler");
const sequelize_1 = require("sequelize");
const router = (0, express_1.Router)();
// Validation middleware
const validateLogin = [
    (0, express_validator_1.body)('username')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Username/Email must be between 3 and 100 characters'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
];
// POST /api/auth/login
router.post('/login', validateLogin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // Check validation errors
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array(),
        });
    }
    const { username, password } = req.body;
    try {
        // Find user by email or name
        const user = await models_1.User.findOne({
            where: {
                status: 'active',
                [sequelize_1.Op.or]: [
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
        const token = jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email,
            role: role,
        }, process.env['JWT_SECRET'], {
            expiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
        });
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
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            error: 'Login failed',
        });
    }
}));
// POST /api/auth/logout (optional - client-side token removal)
router.post('/logout', (_req, res) => {
    return res.json({
        message: 'Logout successful',
    });
});
// GET /api/auth/me - Get current user info
router.get('/me', async (_req, res) => {
    try {
        // This route should be protected by auth middleware
        // For now, we'll return a message
        return res.json({
            message: 'Use this route with authentication middleware to get user info',
        });
    }
    catch (error) {
        console.error('Get user info error:', error);
        return res.status(500).json({
            error: 'Failed to get user info',
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map