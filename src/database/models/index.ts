import { sequelize } from '../connection';
import User from './User';
import Restaurant from './Restaurant';
import Order from './Order';
import Payment from './Payment';
import SupportTicket from './SupportTicket';

// Define associations
Restaurant.hasMany(Order, {
  foreignKey: 'restaurantId',
  as: 'orders',
  onDelete: 'CASCADE',
});

Order.belongsTo(Restaurant, {
  foreignKey: 'restaurantId',
  as: 'restaurant',
});

Restaurant.hasMany(Payment, {
  foreignKey: 'restaurantId',
  as: 'payments',
  onDelete: 'CASCADE',
});

Payment.belongsTo(Restaurant, {
  foreignKey: 'restaurantId',
  as: 'restaurant',
});

User.hasMany(SupportTicket, {
  foreignKey: 'assignedTo',
  as: 'assignedTickets',
  onDelete: 'SET NULL',
});

SupportTicket.belongsTo(User, {
  foreignKey: 'assignedTo',
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
