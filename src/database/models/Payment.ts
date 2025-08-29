import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../connection';

export interface PaymentAttributes {
  id: number;
  restaurantId: number;
  month: number;
  year: number;
  totalOrders: number;
  totalAmount: number;
  commissionAmount: number;
  restaurantAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  razorpayPayoutId?: string;
  settlementDate?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentInstance extends Model<PaymentAttributes, PaymentCreationAttributes> {
  restaurant?: any;
}

export interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentInstance {
  public id!: number;
  public restaurantId!: number;
  public month!: number;
  public year!: number;
  public totalOrders!: number;
  public totalAmount!: number;
  public commissionAmount!: number;
  public restaurantAmount!: number;
  public status!: 'pending' | 'processing' | 'completed' | 'failed';
  public razorpayPayoutId?: string;
  public settlementDate?: Date;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Payment.init(
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
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2020,
        max: 2030,
      },
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    restaurantAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    razorpayPayoutId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    settlementDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'payments',
    modelName: 'Payment',
    indexes: [
      {
        unique: true,
        fields: ['restaurantId', 'month', 'year'],
      },
    ],
    hooks: {
      beforeSave: (payment: Payment) => {
        // Calculate restaurant amount
        if (payment.changed('totalAmount') || payment.changed('commissionAmount')) {
          payment.restaurantAmount = payment.totalAmount - payment.commissionAmount;
        }
        
        // Set settlement date when status changes to completed
        if (payment.changed('status') && payment.status === 'completed' && !payment.settlementDate) {
          payment.settlementDate = new Date();
        }
      },
    },
  }
);

export default Payment;
