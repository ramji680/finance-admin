"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../connection");
class Payment extends sequelize_1.Model {
    // Virtual getters for compatibility
    get status() {
        return this.razor_paying_status === '1' ? 'captured' : 'failed';
    }
    get method() {
        return 'razorpay';
    }
    get currency() {
        return 'INR';
    }
}
exports.Payment = Payment;
Payment.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    razor_key: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    razor_order_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    razor_secret_key: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    order_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    merchantTransactionId: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    contact: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    razor_paying_status: {
        type: sequelize_1.DataTypes.ENUM('0', '1'),
        allowNull: false,
    },
    signature: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    razorpay_payment_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: 'razorpay_payments',
    modelName: 'Payment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = Payment;
//# sourceMappingURL=Payment.js.map