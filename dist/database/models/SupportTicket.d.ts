import { Model, Optional } from 'sequelize';
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
export interface SupportTicketCreationAttributes extends Optional<SupportTicketAttributes, 'id' | 'priority' | 'status' | 'category' | 'createdAt' | 'updatedAt'> {
}
export declare class SupportTicket extends Model<SupportTicketAttributes, SupportTicketCreationAttributes> implements SupportTicketAttributes {
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
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default SupportTicket;
//# sourceMappingURL=SupportTicket.d.ts.map