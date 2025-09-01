"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Restaurant = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../connection");
class Restaurant extends sequelize_1.Model {
    // Virtual getters for compatibility with frontend
    get owner_name() {
        return this.email_address || 'Unknown Owner';
    }
    get email() {
        return this.email_address || '';
    }
    get mobile() {
        return this.contact_number || '';
    }
    get address() {
        return this.full_address || '';
    }
    get cuisine_type() {
        return this.category_id || 'Unknown';
    }
    get commission_rate() {
        return parseFloat(this.admin_commission || '0');
    }
}
exports.Restaurant = Restaurant;
Restaurant.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    slug: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    restaurant_name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    restaurant_image: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    rating: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    delivery_time: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    approx_price_for_two: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    license_code: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    short_description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    is_veg: {
        type: sequelize_1.DataTypes.ENUM('0', '1'),
        allowNull: false,
        defaultValue: '0',
    },
    is_popular: {
        type: sequelize_1.DataTypes.ENUM('0', '1'),
        allowNull: false,
        defaultValue: '0',
    },
    category_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    full_address: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    pincode: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    landmark: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    latitude: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    longitude: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    charge_type: {
        type: sequelize_1.DataTypes.ENUM('fixed', 'dynamic'),
        allowNull: false,
        defaultValue: 'fixed',
    },
    delivery_charge: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    delivery_distance: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    extra_delivery_charge: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    stor_charge_packing_extra: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    delivery_radius_in_km: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        defaultValue: '1',
    },
    min_order_price: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    admin_commission: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    coupon_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    contact_number: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    landline_number: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    email_address: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    opening_hour: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    min_food_preparation_time: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: false,
        defaultValue: '10',
    },
    packaging_chanrges: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: true,
        defaultValue: '0',
    },
    city: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    state: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('offline', 'online'),
        allowNull: false,
        defaultValue: 'offline',
    },
    approve_status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive', 'reject'),
        allowNull: false,
        defaultValue: 'inactive',
    },
    updated_rating: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: 'restaurant_information',
    modelName: 'Restaurant',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = Restaurant;
//# sourceMappingURL=Restaurant.js.map