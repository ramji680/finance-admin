import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../connection';

export interface WeeklySettlementAttributes {
  id: number;
  restaurant_id: number;
  yearweek: number; // ISO yearweek, e.g., 202514
  week_start_date: Date;
  week_end_date: Date;
  order_count: number;
  gross_amount: number;
  commission_rate: number; // percentage, e.g., 10.00
  commission_amount: number;
  net_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  due_date: Date | null;
  payout_id?: string | null;
  payout_reference?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface WeeklySettlementCreationAttributes extends Optional<WeeklySettlementAttributes, 'id' | 'due_date' | 'payout_id' | 'payout_reference' | 'created_at' | 'updated_at'> {}

export class WeeklySettlement extends Model<WeeklySettlementAttributes, WeeklySettlementCreationAttributes> implements WeeklySettlementAttributes {
  public id!: number;
  public restaurant_id!: number;
  public yearweek!: number;
  public week_start_date!: Date;
  public week_end_date!: Date;
  public order_count!: number;
  public gross_amount!: number;
  public commission_rate!: number;
  public commission_amount!: number;
  public net_amount!: number;
  public status!: 'pending' | 'processing' | 'completed' | 'failed';
  public due_date!: Date | null;
  public payout_id?: string | null;
  public payout_reference?: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

WeeklySettlement.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    restaurant_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    yearweek: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    week_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    week_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    order_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    gross_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 10.0,
    },
    commission_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    net_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    payout_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    payout_reference: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'weekly_settlements',
    modelName: 'WeeklySettlement',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['restaurant_id', 'yearweek'],
        name: 'uniq_restaurant_yearweek',
      },
    ],
  }
);

export default WeeklySettlement;


