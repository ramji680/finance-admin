import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../connection';

export interface OrderAttributes {
  id: number;
  restaurantId: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  commission: number;
  restaurantAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'upi' | 'online';
  orderDate: Date;
  deliveryDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'commission' | 'restaurantAmount' | 'status' | 'paymentStatus' | 'createdAt' | 'updatedAt'> {}

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public restaurantId!: number;
  public orderNumber!: string;
  public customerName!: string;
  public customerPhone!: string;
  public customerAddress!: string;
  public items!: string;
  public subtotal!: number;
  public tax!: number;
  public deliveryFee!: number;
  public total!: number;
  public commission!: number;
  public restaurantAmount!: number;
  public status!: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  public paymentStatus!: 'pending' | 'paid' | 'failed' | 'refunded';
  public paymentMethod!: 'cash' | 'card' | 'upi' | 'online';
  public orderDate!: Date;
  public deliveryDate?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    customerPhone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        len: [10, 15],
        notEmpty: true,
      },
    },
    customerAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    items: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    commission: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    restaurantAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'upi', 'online'),
      allowNull: false,
      defaultValue: 'cash',
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    modelName: 'Order',
    hooks: {
      beforeSave: (order: Order) => {
        // Calculate commission and restaurant amount
        if (order.changed('total') || order.changed('commission')) {
          // Commission is calculated based on restaurant's commission rate
          // This will be updated when the order is linked to a restaurant
          order.restaurantAmount = order.total - order.commission;
        }
      },
    },
  }
);

export default Order;
