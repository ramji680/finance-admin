import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../connection';

export interface SupportTicketAttributes {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'general' | 'support';
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  assigned_to?: number;
  resolution_notes?: string;
  resolved_at?: Date;
  closed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupportTicketCreationAttributes extends Optional<SupportTicketAttributes, 'id' | 'priority' | 'status' | 'category' | 'createdAt' | 'updatedAt'> {}

export class SupportTicket extends Model<SupportTicketAttributes, SupportTicketCreationAttributes> implements SupportTicketAttributes {
  public id!: number;
  public ticket_number!: string;
  public subject!: string;
  public description!: string;
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public status!: 'open' | 'in_progress' | 'resolved' | 'closed';
  public category!: 'technical' | 'billing' | 'general' | 'support';
  public requester_name!: string;
  public requester_email!: string;
  public requester_phone!: string;
  public assigned_to?: number;
  public resolution_notes?: string;
  public resolved_at?: Date;
  public closed_at?: Date;
  public created_at?: Date;
  public updated_at?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SupportTicket.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ticket_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      allowNull: false,
      defaultValue: 'open',
    },
    category: {
      type: DataTypes.ENUM('technical', 'billing', 'general', 'support'),
      allowNull: false,
      defaultValue: 'general',
    },
    requester_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    requester_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    requester_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    assigned_to: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    resolution_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'support_lists',
    modelName: 'SupportTicket',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default SupportTicket;
