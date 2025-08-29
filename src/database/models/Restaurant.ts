import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../connection';

export interface RestaurantAttributes {
  id: number;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  cuisine: string;
  rating: number;
  isActive: boolean;
  commissionRate: number;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankAccountHolderName: string;
  upiId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RestaurantInstance extends Model<RestaurantAttributes, RestaurantCreationAttributes> {
  orders?: any[];
  payments?: any[];
}

export interface RestaurantCreationAttributes extends Optional<RestaurantAttributes, 'id' | 'rating' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class Restaurant extends Model<RestaurantAttributes, RestaurantCreationAttributes> implements RestaurantInstance {
  public id!: number;
  public name!: string;
  public ownerName!: string;
  public email!: string;
  public phone!: string;
  public address!: string;
  public city!: string;
  public state!: string;
  public pincode!: string;
  public cuisine!: string;
  public rating!: number;
  public isActive!: boolean;
  public commissionRate!: number;
  public bankAccountNumber!: string;
  public bankIfscCode!: string;
  public bankAccountHolderName!: string;
  public upiId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Restaurant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    ownerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        len: [10, 15],
        notEmpty: true,
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50],
        notEmpty: true,
      },
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50],
        notEmpty: true,
      },
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        len: [6, 10],
        notEmpty: true,
      },
    },
    cuisine: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 10.0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    bankAccountNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        len: [9, 20],
        notEmpty: true,
      },
    },
    bankIfscCode: {
      type: DataTypes.STRING(11),
      allowNull: false,
      validate: {
        len: [11, 11],
        notEmpty: true,
      },
    },
    bankAccountHolderName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    upiId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'restaurants',
    modelName: 'Restaurant',
  }
);

export default Restaurant;
