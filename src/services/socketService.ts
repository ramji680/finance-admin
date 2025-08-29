import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User, SupportTicket } from '../database/models';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
}

interface ChatMessage {
  ticketId: number;
  message: string;
  senderId: number;
  senderName: string;
  timestamp: Date;
}

export const setupSocketHandlers = (io: SocketIOServer): void => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth['token'] || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as any;
      
      // Verify user exists and is active
      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        return next(new Error('Invalid or inactive user'));
      }

      socket.userId = user.id;
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.username} (ID: ${socket.userId}) connected`);

    // Join support ticket room
    socket.on('join_ticket', (ticketId: number) => {
      socket.join(`ticket_${ticketId}`);
      console.log(`User ${socket.username} joined ticket ${ticketId}`);
    });

    // Leave support ticket room
    socket.on('leave_ticket', (ticketId: number) => {
      socket.leave(`ticket_${ticketId}`);
      console.log(`User ${socket.username} left ticket ${ticketId}`);
    });

    // Send message to support ticket
    socket.on('send_message', async (data: ChatMessage) => {
      try {
        // Verify ticket exists and user has access
        const ticket = await SupportTicket.findByPk(data.ticketId);
        if (!ticket) {
          socket.emit('error', { message: 'Ticket not found' });
          return;
        }

        // Create chat message record (you might want to create a separate ChatMessage model)
        const messageData = {
          ticketId: data.ticketId,
          message: data.message,
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: data.timestamp,
        };

        // Broadcast message to all users in the ticket room
        io.to(`ticket_${data.ticketId}`).emit('new_message', messageData);

        // Update ticket status if it's from support team
        if (data.senderId === socket.userId) {
          await ticket.update({ 
            status: 'in_progress',
            assignedTo: socket.userId,
          });

          // Notify about ticket status change
          io.to(`ticket_${data.ticketId}`).emit('ticket_updated', {
            ticketId: data.ticketId,
            status: 'in_progress',
            assignedTo: socket.userId,
          });
        }

        console.log(`Message sent to ticket ${data.ticketId} by ${data.senderName}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Update ticket status
    socket.on('update_ticket_status', async (data: { ticketId: number; status: string; notes?: string }) => {
      try {
        const ticket = await SupportTicket.findByPk(data.ticketId);
        if (!ticket) {
          socket.emit('error', { message: 'Ticket not found' });
          return;
        }

        // Update ticket
        const updateData: any = {
          status: data.status as 'open' | 'in_progress' | 'resolved' | 'closed',
        };
        
        // Only add notes if it's provided
        if (data.notes !== undefined) {
          updateData.notes = data.notes;
        }
        
        await ticket.update(updateData);

        // Notify all users in the ticket room
        io.to(`ticket_${data.ticketId}`).emit('ticket_updated', {
          ticketId: data.ticketId,
          status: data.status,
          notes: data.notes,
          updatedBy: socket.username,
          updatedAt: new Date(),
        });

        console.log(`Ticket ${data.ticketId} status updated to ${data.status} by ${socket.username}`);
      } catch (error) {
        console.error('Update ticket status error:', error);
        socket.emit('error', { message: 'Failed to update ticket status' });
      }
    });

    // Assign ticket to user
    socket.on('assign_ticket', async (data: { ticketId: number; assignedTo: number }) => {
      try {
        const ticket = await SupportTicket.findByPk(data.ticketId);
        if (!ticket) {
          socket.emit('error', { message: 'Ticket not found' });
          return;
        }

        const assignedUser = await User.findByPk(data.assignedTo);
        if (!assignedUser) {
          socket.emit('error', { message: 'Assigned user not found' });
          return;
        }

        // Update ticket assignment
        await ticket.update({
          assignedTo: data.assignedTo,
          status: 'in_progress',
        });

        // Notify all users in the ticket room
        io.to(`ticket_${data.ticketId}`).emit('ticket_assigned', {
          ticketId: data.ticketId,
          assignedTo: data.assignedTo,
          assignedToName: assignedUser.username,
          assignedBy: socket.username,
          assignedAt: new Date(),
        });

        console.log(`Ticket ${data.ticketId} assigned to ${assignedUser.username} by ${socket.username}`);
      } catch (error) {
        console.error('Assign ticket error:', error);
        socket.emit('error', { message: 'Failed to assign ticket' });
      }
    });

    // Typing indicator
    socket.on('typing_start', (ticketId: number) => {
      socket.to(`ticket_${ticketId}`).emit('user_typing', {
        ticketId,
        userId: socket.userId,
        username: socket.username,
      });
    });

    socket.on('typing_stop', (ticketId: number) => {
      socket.to(`ticket_${ticketId}`).emit('user_stopped_typing', {
        ticketId,
        userId: socket.userId,
        username: socket.username,
      });
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log(`User ${socket.username} (ID: ${socket.userId}) disconnected`);
    });
  });

  // Error handling
  io.on('error', (error) => {
    console.error('Socket.io error:', error);
  });
};

// Helper function to emit to specific users
export const emitToUser = (io: SocketIOServer, userId: number, event: string, data: any): void => {
  io.sockets.sockets.forEach((socket: AuthenticatedSocket) => {
    if (socket.userId === userId) {
      socket.emit(event, data);
    }
  });
};

// Helper function to emit to ticket room
export const emitToTicket = (io: SocketIOServer, ticketId: number, event: string, data: any): void => {
  io.to(`ticket_${ticketId}`).emit(event, data);
};
