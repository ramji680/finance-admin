"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../connection");
class Order extends sequelize_1.Model {
}
exports.Order = Order;
Order.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    slug: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    payment_method: {
        type: sequelize_1.DataTypes.ENUM('razorpay', 'phonepe', 'cash', 'wallet'),
        allowNull: false,
    },
    online_order_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    restaurant_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'restaurant_information',
            key: 'id',
        },
    },
    order_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    address_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    address: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    note_for_restaurant: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    menu_detail: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    variation: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    option: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    offer_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    discount_type: {
        type: sequelize_1.DataTypes.ENUM('percentage', 'rupee', ''),
        allowNull: false,
        defaultValue: '',
    },
    discount: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    menu_price: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    finel_amount: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    paying_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    delivery_type: {
        type: sequelize_1.DataTypes.ENUM('case on delivery', 'online'),
        allowNull: false,
    },
    paying_status: {
        type: sequelize_1.DataTypes.ENUM('0', '1'),
        allowNull: false,
        defaultValue: '0',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('Pending', 'Confirmed', 'Delivered', 'Processing', 'Out For Delivery', 'Returned', 'Failed To Deliver', 'Canceled', 'Scheduled', 'Reject', 'Ready', 'Picked Up'),
        allowNull: false,
        defaultValue: 'Pending',
    },
    reject_description: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    preparation_time: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    otp: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    otp_verify: {
        type: sequelize_1.DataTypes.ENUM('0', '1'),
        allowNull: false,
        defaultValue: '0',
    },
    gst_charge: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    ship_charge: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    ship_user_charge: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: true,
    },
    packaging_chanrges: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: true,
    },
    grand_total: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    grand_total_user: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false,
    },
    platform_fees: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    km: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    track_status: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    reach_time: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: 'orders',
    modelName: 'Order',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = Order;
//# sourceMappingURL=Order.js.map