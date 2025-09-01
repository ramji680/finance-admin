"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportTicket = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../connection");
class SupportTicket extends sequelize_1.Model {
}
exports.SupportTicket = SupportTicket;
SupportTicket.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    ticket_number: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
        },
    },
    subject: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    priority: {
        type: sequelize_1.DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
        allowNull: false,
        defaultValue: 'open',
    },
    category: {
        type: sequelize_1.DataTypes.ENUM('technical', 'billing', 'general', 'support'),
        allowNull: false,
        defaultValue: 'general',
    },
    requester_name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    requester_email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            isEmail: true,
            notEmpty: true,
        },
    },
    requester_phone: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    assigned_to: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    resolution_notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    resolved_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    closed_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: 'support_lists',
    modelName: 'SupportTicket',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = SupportTicket;
//# sourceMappingURL=SupportTicket.js.map