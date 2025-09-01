import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../connection';

export interface PaymentAttributes {
  id: number;
  name: string;
  razor_key: string;
  razor_order_id: string;
  razor_secret_key: string;
  order_id: string;
  amount: number;
  merchantTransactionId: string;
  contact: string;
  email: string;
  razor_paying_status: '0' | '1';
  signature: string;
  razorpay_payment_id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: number;
  public name!: string;
  public razor_key!: string;
  public razor_order_id!: string;
  public razor_secret_key!: string;
  public order_id!: string;
  public amount!: number;
  public merchantTransactionId!: string;
  public contact!: string;
  public email!: string;
  public razor_paying_status!: '0' | '1';
  public signature!: string;
  public razorpay_payment_id!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual getters for compatibility
  get status(): string {
    return this.razor_paying_status === '1' ? 'captured' : 'failed';
  }

  get method(): string {
    return 'razorpay';
  }

  get currency(): string {
    return 'INR';
  }
}

Payment.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    razor_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    razor_order_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    razor_secret_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    order_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    merchantTransactionId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contact: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    razor_paying_status: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
    },
    signature: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    razorpay_payment_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'razorpay_payments',
    modelName: 'Payment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Payment;