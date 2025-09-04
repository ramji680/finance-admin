import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../connection';

export interface WeeklySettlementOrderAttributes {
  id: number;
  weekly_settlement_id: number;
  order_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface WeeklySettlementOrderCreationAttributes extends Optional<WeeklySettlementOrderAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class WeeklySettlementOrder extends Model<WeeklySettlementOrderAttributes, WeeklySettlementOrderCreationAttributes> implements WeeklySettlementOrderAttributes {
  public id!: number;
  public weekly_settlement_id!: number;
  public order_id!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

WeeklySettlementOrder.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    weekly_settlement_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'weekly_settlement_orders',
    modelName: 'WeeklySettlementOrder',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['weekly_settlement_id', 'order_id'],
        name: 'uniq_weekly_order',
      },
    ],
  }
);

export default WeeklySettlementOrder;


