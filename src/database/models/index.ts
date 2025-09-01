import { sequelize } from '../connection';
import User from './User';
import Restaurant from './Restaurant';
import Order from './Order';
import Payment from './Payment';
import SupportTicket from './SupportTicket';

// Define associations
Restaurant.hasMany(Order, {
  foreignKey: 'restaurant_id',
  as: 'orders',
  onDelete: 'CASCADE',
});

Order.belongsTo(Restaurant, {
  foreignKey: 'restaurant_id',
  as: 'restaurant',
});

User.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders',
  onDelete: 'CASCADE',
});

Order.belongsTo(User, {
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

User.hasMany(SupportTicket, {
  foreignKey: 'assigned_to',
  as: 'assignedTickets',
  onDelete: 'SET NULL',
});

SupportTicket.belongsTo(User, {
  foreignKey: 'assigned_to',
  as: 'assignedUser',
});

// Export models
export {
  sequelize,
  User,
  Restaurant,
  Order,
  Payment,
  SupportTicket,
};

export default sequelize;
