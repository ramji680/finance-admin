"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportTicket = exports.Payment = exports.Order = exports.Restaurant = exports.User = exports.sequelize = void 0;
const connection_1 = require("../connection");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return connection_1.sequelize; } });
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Restaurant_1 = __importDefault(require("./Restaurant"));
exports.Restaurant = Restaurant_1.default;
const Order_1 = __importDefault(require("./Order"));
exports.Order = Order_1.default;
const Payment_1 = __importDefault(require("./Payment"));
exports.Payment = Payment_1.default;
const SupportTicket_1 = __importDefault(require("./SupportTicket"));
exports.SupportTicket = SupportTicket_1.default;
// Define associations
Restaurant_1.default.hasMany(Order_1.default, {
    foreignKey: 'restaurant_id',
    as: 'orders',
    onDelete: 'CASCADE',
});
Order_1.default.belongsTo(Restaurant_1.default, {
    foreignKey: 'restaurant_id',
    as: 'restaurant',
});
User_1.default.hasMany(Order_1.default, {
    foreignKey: 'user_id',
    as: 'orders',
    onDelete: 'CASCADE',
});
Order_1.default.belongsTo(User_1.default, {
    foreignKey: 'user_id',
    as: 'user',
});
// Payment doesn't have direct restaurant_id, it goes through Order
// Restaurant.hasMany(Payment, {
//   foreignKey: 'restaurant_id',
//   as: 'payments',
//   onDelete: 'CASCADE',
// });
// Payment.belongsTo(Restaurant, {
//   foreignKey: 'restaurant_id',
//   as: 'restaurant',
// });
User_1.default.hasMany(SupportTicket_1.default, {
    foreignKey: 'assigned_to',
    as: 'assignedTickets',
    onDelete: 'SET NULL',
});
SupportTicket_1.default.belongsTo(User_1.default, {
    foreignKey: 'assigned_to',
    as: 'assignedUser',
});
exports.default = connection_1.sequelize;
//# sourceMappingURL=index.js.map