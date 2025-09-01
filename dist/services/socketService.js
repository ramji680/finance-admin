"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToTicket = exports.emitToUser = exports.setupSocketHandlers = void 0;
const jwt = require('jsonwebtoken');
const models_1 = require("../database/models");
const setupSocketHandlers = (io) => {
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth['token'] || socket.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                return next(new Error('Authentication token required'));
            }
            const decoded = jwt.verify(token, process.env['JWT_SECRET']);
            // Verify user exists and is active
            const user = await models_1.User.findByPk(decoded.id);
            if (!user || user.status !== 'active') {
                return next(new Error('Invalid or inactive user'));
            }
            socket.userId = user.id;
            socket.username = user.username;
            next();
        }
        catch (error) {
            next(new Error('Authentication failed'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`User ${socket.username} (ID: ${socket.userId}) connected`);
        // Join support ticket room
        socket.on('join_ticket', (ticketId) => {
            socket.join(`ticket_${ticketId}`);
            console.log(`User ${socket.username} joined ticket ${ticketId}`);
        });
        // Leave support ticket room
        socket.on('leave_ticket', (ticketId) => {
            socket.leave(`ticket_${ticketId}`);
            console.log(`User ${socket.username} left ticket ${ticketId}`);
        });
        // Send message to support ticket
        socket.on('send_message', async (data) => {
            try {
                // Verify ticket exists and user has access
                const ticket = await models_1.SupportTicket.findByPk(data.ticketId);
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
                        assigned_to: socket.userId,
                    });
                    // Notify about ticket status change
                    io.to(`ticket_${data.ticketId}`).emit('ticket_updated', {
                        ticketId: data.ticketId,
                        status: 'in_progress',
                        assignedTo: socket.userId,
                    });
                }
                console.log(`Message sent to ticket ${data.ticketId} by ${data.senderName}`);
            }
            catch (error) {
                console.error('Send message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
        // Update ticket status
        socket.on('update_ticket_status', async (data) => {
            try {
                const ticket = await models_1.SupportTicket.findByPk(data.ticketId);
                if (!ticket) {
                    socket.emit('error', { message: 'Ticket not found' });
                    return;
                }
                await ticket.update({
                    status: data.status,
                });
                // Notify about ticket status change
                io.to(`ticket_${data.ticketId}`).emit('ticket_updated', {
                    ticketId: data.ticketId,
                    status: data.status,
                    updatedBy: socket.username,
                });
                console.log(`Ticket ${data.ticketId} status updated to ${data.status} by ${socket.username}`);
            }
            catch (error) {
                console.error('Update ticket status error:', error);
                socket.emit('error', { message: 'Failed to update ticket status' });
            }
        });
        // Assign ticket to user
        socket.on('assign_ticket', async (data) => {
            try {
                const ticket = await models_1.SupportTicket.findByPk(data.ticketId);
                if (!ticket) {
                    socket.emit('error', { message: 'Ticket not found' });
                    return;
                }
                const assignedUser = await models_1.User.findByPk(data.assignedToId);
                if (!assignedUser) {
                    socket.emit('error', { message: 'Assigned user not found' });
                    return;
                }
                await ticket.update({
                    assigned_to: data.assignedToId,
                    status: 'in_progress',
                });
                // Notify about ticket assignment
                io.to(`ticket_${data.ticketId}`).emit('ticket_assigned', {
                    ticketId: data.ticketId,
                    assignedToId: data.assignedToId,
                    assignedToName: assignedUser.name,
                    assignedBy: socket.username,
                });
                console.log(`Ticket ${data.ticketId} assigned to ${assignedUser.name} by ${socket.username}`);
            }
            catch (error) {
                console.error('Assign ticket error:', error);
                socket.emit('error', { message: 'Failed to assign ticket' });
            }
        });
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User ${socket.username} (ID: ${socket.userId}) disconnected`);
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
// Helper function to emit to specific users
const emitToUser = (io, userId, event, data) => {
    io.sockets.sockets.forEach((socket) => {
        if (socket.userId === userId) {
            socket.emit(event, data);
        }
    });
};
exports.emitToUser = emitToUser;
// Helper function to emit to ticket room
const emitToTicket = (io, ticketId, event, data) => {
    io.to(`ticket_${ticketId}`).emit(event, data);
};
exports.emitToTicket = emitToTicket;
//# sourceMappingURL=socketService.js.map