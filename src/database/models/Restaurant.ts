import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../connection';

export interface RestaurantAttributes {
  id: number;
  slug?: string;
  user_id: number;
  restaurant_name: string;
  restaurant_image?: string;
  rating?: string;
  delivery_time?: string;
  approx_price_for_two?: string;
  license_code?: string;
  short_description?: string;
  is_veg: '0' | '1';
  is_popular: '0' | '1';
  category_id?: string;
  full_address?: string;
  pincode?: string;
  landmark?: string;
  latitude?: string;
  longitude?: string;
  charge_type: 'fixed' | 'dynamic';
  delivery_charge?: string;
  delivery_distance?: string;
  extra_delivery_charge?: string;
  stor_charge_packing_extra?: string;
  delivery_radius_in_km?: string;
  min_order_price?: string;
  admin_commission?: string;
  coupon_id?: string;
  contact_number?: string;
  landline_number?: string;
  email_address?: string;
  opening_hour?: string;
  min_food_preparation_time: string;
  packaging_chanrges?: string;
  city?: string;
  state?: string;
  status: 'offline' | 'online';
  approve_status: 'active' | 'inactive' | 'reject';
  updated_rating: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RestaurantCreationAttributes extends Optional<RestaurantAttributes, 'id' | 'status' | 'approve_status' | 'createdAt' | 'updatedAt'> {}

export class Restaurant extends Model<RestaurantAttributes, RestaurantCreationAttributes> implements RestaurantAttributes {
  public id!: number;
  public slug?: string;
  public user_id!: number;
  public restaurant_name!: string;
  public restaurant_image?: string;
  public rating?: string;
  public delivery_time?: string;
  public approx_price_for_two?: string;
  public license_code?: string;
  public short_description?: string;
  public is_veg!: '0' | '1';
  public is_popular!: '0' | '1';
  public category_id?: string;
  public full_address?: string;
  public pincode?: string;
  public landmark?: string;
  public latitude?: string;
  public longitude?: string;
  public charge_type!: 'fixed' | 'dynamic';
  public delivery_charge?: string;
  public delivery_distance?: string;
  public extra_delivery_charge?: string;
  public stor_charge_packing_extra?: string;
  public delivery_radius_in_km?: string;
  public min_order_price?: string;
  public admin_commission?: string;
  public coupon_id?: string;
  public contact_number?: string;
  public landline_number?: string;
  public email_address?: string;
  public opening_hour?: string;
  public min_food_preparation_time!: string;
  public packaging_chanrges?: string;
  public city?: string;
  public state?: string;
  public status!: 'offline' | 'online';
  public approve_status!: 'active' | 'inactive' | 'reject';
  public updated_rating!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual getters for compatibility with frontend
  get owner_name(): string {
    return this.email_address || 'Unknown Owner';
  }

  get email(): string {
    return this.email_address || '';
  }

  get mobile(): string {
    return this.contact_number || '';
  }

  get address(): string {
    return this.full_address || '';
  }

  get cuisine_type(): string {
    return this.category_id || 'Unknown';
  }

  get commission_rate(): number {
    return parseFloat(this.admin_commission || '0');
  }
}

Restaurant.init(
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
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    restaurant_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    restaurant_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    rating: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    delivery_time: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    approx_price_for_two: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    license_code: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    short_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_veg: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
      defaultValue: '0',
    },
    is_popular: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
      defaultValue: '0',
    },
    category_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    full_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    landmark: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    charge_type: {
      type: DataTypes.ENUM('fixed', 'dynamic'),
      allowNull: false,
      defaultValue: 'fixed',
    },
    delivery_charge: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    delivery_distance: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    extra_delivery_charge: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    stor_charge_packing_extra: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    delivery_radius_in_km: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '1',
    },
    min_order_price: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    admin_commission: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    coupon_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    contact_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    landline_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    opening_hour: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    min_food_preparation_time: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: '10',
    },
    packaging_chanrges: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: '0',
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('offline', 'online'),
      allowNull: false,
      defaultValue: 'offline',
    },
    approve_status: {
      type: DataTypes.ENUM('active', 'inactive', 'reject'),
      allowNull: false,
      defaultValue: 'inactive',
    },
    updated_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'restaurant_information',
    modelName: 'Restaurant',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Restaurant;