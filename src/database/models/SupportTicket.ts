import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../connection';

export interface SupportTicketAttributes {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'general' | 'restaurant' | 'order';
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  assignedTo?: number;
  notes?: string;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupportTicketCreationAttributes extends Optional<SupportTicketAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

export class SupportTicket extends Model<SupportTicketAttributes, SupportTicketCreationAttributes> implements SupportTicketAttributes {
  public id!: number;
  public ticketNumber!: string;
  public subject!: string;
  public description!: string;
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public status!: 'open' | 'in_progress' | 'resolved' | 'closed';
  public category!: 'technical' | 'billing' | 'general' | 'restaurant' | 'order';
  public requesterName!: string;
  public requesterEmail!: string;
  public requesterPhone?: string;
  public assignedTo?: number;
  public notes?: string;
  public resolvedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SupportTicket.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ticketNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    subject: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [5, 200],
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
      type: DataTypes.ENUM('technical', 'billing', 'general', 'restaurant', 'order'),
      allowNull: false,
      defaultValue: 'general',
    },
    requesterName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    requesterEmail: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    requesterPhone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        len: [10, 15],
      },
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'support_tickets',
    modelName: 'SupportTicket',
    hooks: {
      beforeSave: (ticket: SupportTicket) => {
        // Generate ticket number if not provided
        if (!ticket.ticketNumber) {
          const timestamp = Date.now().toString().slice(-8);
          const random = Math.random().toString(36).substring(2, 6).toUpperCase();
          ticket.ticketNumber = `TKT-${timestamp}-${random}`;
        }
        
        // Set resolvedAt when status changes to resolved
        if (ticket.changed('status') && ticket.status === 'resolved' && !ticket.resolvedAt) {
          ticket.resolvedAt = new Date();
        }
      },
    },
  }
);

export default SupportTicket;
