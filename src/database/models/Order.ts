import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../connection';

export interface OrderAttributes {
  id: number;
  slug?: string;
  payment_method: 'razorpay' | 'phonepe' | 'cash' | 'wallet';
  online_order_id?: string;
  user_id: number;
  restaurant_id: number;
  order_id: string;
  address_id?: number;
  address: string;
  note_for_restaurant?: string;
  menu_detail: string;
  variation?: string;
  option?: string;
  offer_id?: string;
  discount_type: 'percentage' | 'rupee' | '';
  discount?: string;
  menu_price: string;
  finel_amount: string;
  paying_id?: string;
  delivery_type: 'case on delivery' | 'online';
  paying_status: '0' | '1';
  status: 'Pending' | 'Confirmed' | 'Delivered' | 'Processing' | 'Out For Delivery' | 'Returned' | 'Failed To Deliver' | 'Canceled' | 'Scheduled' | 'Reject' | 'Ready' | 'Picked Up';
  reject_description?: string;
  preparation_time?: string;
  otp?: number;
  otp_verify: '0' | '1';
  gst_charge?: string;
  ship_charge?: string;
  ship_user_charge?: number;
  packaging_chanrges?: number;
  grand_total: string;
  grand_total_user: number;
  platform_fees?: string;
  km?: string;
  track_status?: number;
  reach_time?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'payment_method' | 'user_id' | 'restaurant_id' | 'order_id' | 'address' | 'menu_detail' | 'discount_type' | 'menu_price' | 'finel_amount' | 'delivery_type' | 'paying_status' | 'status' | 'otp_verify' | 'grand_total' | 'grand_total_user' | 'createdAt' | 'updatedAt'> {}

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public slug?: string;
  public payment_method!: 'razorpay' | 'phonepe' | 'cash' | 'wallet';
  public online_order_id?: string;
  public user_id!: number;
  public restaurant_id!: number;
  public order_id!: string;
  public address_id?: number;
  public address!: string;
  public note_for_restaurant?: string;
  public menu_detail!: string;
  public variation?: string;
  public option?: string;
  public offer_id?: string;
  public discount_type!: 'percentage' | 'rupee' | '';
  public discount?: string;
  public menu_price!: string;
  public finel_amount!: string;
  public paying_id?: string;
  public delivery_type!: 'case on delivery' | 'online';
  public paying_status!: '0' | '1';
  public status!: 'Pending' | 'Confirmed' | 'Delivered' | 'Processing' | 'Out For Delivery' | 'Returned' | 'Failed To Deliver' | 'Canceled' | 'Scheduled' | 'Reject' | 'Ready' | 'Picked Up';
  public reject_description?: string;
  public preparation_time?: string;
  public otp?: number;
  public otp_verify!: '0' | '1';
  public gst_charge?: string;
  public ship_charge?: string;
  public ship_user_charge?: number;
  public packaging_chanrges?: number;
  public grand_total!: string;
  public grand_total_user!: number;
  public platform_fees?: string;
  public km?: string;
  public track_status?: number;
  public reach_time?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.ENUM('razorpay', 'phonepe', 'cash', 'wallet'),
      allowNull: false,
    },
    online_order_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    restaurant_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'restaurant_information',
        key: 'id',
      },
    },
    order_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    note_for_restaurant: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    menu_detail: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    variation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    option: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    offer_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    discount_type: {
      type: DataTypes.ENUM('percentage', 'rupee', ''),
      allowNull: false,
      defaultValue: '',
    },
    discount: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    menu_price: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    finel_amount: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    paying_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    delivery_type: {
      type: DataTypes.ENUM('case on delivery', 'online'),
      allowNull: false,
    },
    paying_status: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
      defaultValue: '0',
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Confirmed', 'Delivered', 'Processing', 'Out For Delivery', 'Returned', 'Failed To Deliver', 'Canceled', 'Scheduled', 'Reject', 'Ready', 'Picked Up'),
      allowNull: false,
      defaultValue: 'Pending',
    },
    reject_description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    preparation_time: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    otp_verify: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
      defaultValue: '0',
    },
    gst_charge: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ship_charge: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ship_user_charge: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    packaging_chanrges: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    grand_total: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    grand_total_user: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    platform_fees: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    km: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    track_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reach_time: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    modelName: 'Order',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Order;
