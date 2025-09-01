"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeDataService = void 0;
const models_1 = require("../database/models");
const connection_1 = require("../database/connection");
class RealtimeDataService {
    constructor(io) {
        this.intervalId = null;
        this.io = io;
    }
    startBroadcasting() {
        // Broadcast data every 30 seconds
        this.intervalId = setInterval(() => {
            this.broadcastRealData();
        }, 30000);
        // Initial broadcast
        this.broadcastRealData();
    }
    stopBroadcasting() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    async getDashboardData() {
        try {
            // Get total users
            const totalUsers = await models_1.User.count({
                where: { status: 'active' }
            });
            // Get total restaurants
            const totalRestaurants = await models_1.Restaurant.count({
                where: { status: 'active' }
            });
            // Get total orders
            const totalOrders = await models_1.Order.count();
            // Get total revenue from orders using raw query
            const [revenueResult] = await connection_1.sequelize.query(`
        SELECT SUM(CAST(grand_total_user AS DECIMAL(10,2))) as totalRevenue 
        FROM orders 
        WHERE status = 'Delivered' AND paying_status = '1'
      `);
            const totalRevenue = parseFloat(revenueResult.totalRevenue || '0');
            // Get recent orders
            const recentOrders = await models_1.Order.findAll({
                include: [
                    {
                        model: models_1.Restaurant,
                        as: 'restaurant',
                        attributes: ['restaurant_name']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: 5
            });
            // Get top restaurants by order count using raw query
            const [topRestaurantsResult] = await connection_1.sequelize.query(`
        SELECT 
          o.restaurant_id,
          COUNT(o.id) as orderCount,
          SUM(CAST(o.grand_total_user AS DECIMAL(10,2))) as totalRevenue
        FROM orders o
        JOIN restaurant_information r ON o.restaurant_id = r.id
        WHERE o.status = 'Delivered'
        GROUP BY o.restaurant_id
        ORDER BY orderCount DESC
        LIMIT 5
      `);
            return {
                totalUsers,
                totalRestaurants,
                totalOrders,
                totalRevenue,
                recentOrders: recentOrders.map(order => ({
                    id: order.id,
                    order_id: order.order_id,
                    amount: order.grand_total_user,
                    status: order.status,
                    restaurant: order.restaurant?.restaurant_name || 'Unknown',
                    date: order.createdAt
                })),
                topRestaurants: topRestaurantsResult.map(restaurant => ({
                    id: restaurant.restaurant_id,
                    name: 'Restaurant', // We'll need to join with restaurant table for names
                    cuisine: 'Unknown',
                    orders: restaurant.orderCount,
                    revenue: parseFloat(restaurant.totalRevenue || '0')
                }))
            };
        }
        catch (error) {
            console.error('Error fetching dashboard data:', error);
            return this.getBasicDashboardData();
        }
    }
    async getPaymentsData() {
        try {
            // Get all payments
            const payments = await models_1.Payment.findAll({
                order: [['createdAt', 'DESC']],
                limit: 50
            });
            // Get payment statistics
            const totalPayments = await models_1.Payment.count();
            const successfulPayments = await models_1.Payment.count({
                where: { razor_paying_status: '1' }
            });
            const failedPayments = await models_1.Payment.count({
                where: { razor_paying_status: '0' }
            });
            // Get total amount
            const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0);
            return {
                payments: payments.map(payment => ({
                    id: payment.id,
                    order_id: payment.order_id,
                    amount: payment.amount,
                    status: payment.status,
                    method: payment.method,
                    date: payment.createdAt
                })),
                statistics: {
                    total: totalPayments,
                    successful: successfulPayments,
                    failed: failedPayments,
                    totalAmount
                }
            };
        }
        catch (error) {
            console.error('Error fetching payments data:', error);
            return this.getBasicPaymentsData();
        }
    }
    async getOrdersData() {
        try {
            // Get all orders
            const orders = await models_1.Order.findAll({
                include: [
                    {
                        model: models_1.Restaurant,
                        as: 'restaurant',
                        attributes: ['restaurant_name']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: 50
            });
            // Get order statistics
            const totalOrders = await models_1.Order.count();
            const pendingOrders = await models_1.Order.count({
                where: { status: 'Pending' }
            });
            const confirmedOrders = await models_1.Order.count({
                where: { status: 'Confirmed' }
            });
            const deliveredOrders = await models_1.Order.count({
                where: { status: 'Delivered' }
            });
            return {
                orders: orders.map(order => ({
                    id: order.id,
                    order_id: order.order_id,
                    restaurant: order.restaurant?.restaurant_name || 'Unknown',
                    amount: order.grand_total_user,
                    status: order.status,
                    payment_status: order.paying_status === '1' ? 'Paid' : 'Pending',
                    date: order.createdAt
                })),
                statistics: {
                    total: totalOrders,
                    pending: pendingOrders,
                    confirmed: confirmedOrders,
                    delivered: deliveredOrders
                }
            };
        }
        catch (error) {
            console.error('Error fetching orders data:', error);
            return this.getBasicOrdersData();
        }
    }
    async getSupportData() {
        try {
            // Get all support tickets
            const tickets = await models_1.SupportTicket.findAll({
                include: [
                    {
                        model: models_1.User,
                        as: 'assignedUser',
                        attributes: ['name']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: 50
            });
            // Get ticket statistics
            const totalTickets = await models_1.SupportTicket.count();
            const openTickets = await models_1.SupportTicket.count({
                where: { status: 'open' }
            });
            const inProgressTickets = await models_1.SupportTicket.count({
                where: { status: 'in_progress' }
            });
            const resolvedTickets = await models_1.SupportTicket.count({
                where: { status: 'resolved' }
            });
            return {
                tickets: tickets.map(ticket => ({
                    id: ticket.id,
                    ticket_number: ticket.ticket_number,
                    subject: ticket.subject,
                    priority: ticket.priority,
                    status: ticket.status,
                    requester: ticket.requester_name,
                    assigned_to: ticket.assignedUser?.name || 'Unassigned',
                    date: ticket.createdAt
                })),
                statistics: {
                    total: totalTickets,
                    open: openTickets,
                    inProgress: inProgressTickets,
                    resolved: resolvedTickets
                }
            };
        }
        catch (error) {
            console.error('Error fetching support data:', error);
            return this.getBasicSupportData();
        }
    }
    getBasicDashboardData() {
        return {
            totalUsers: 0,
            totalRestaurants: 0,
            totalOrders: 0,
            totalRevenue: 0,
            recentOrders: [],
            topRestaurants: []
        };
    }
    getBasicPaymentsData() {
        return {
            payments: [],
            statistics: {
                total: 0,
                successful: 0,
                failed: 0,
                totalAmount: 0
            }
        };
    }
    getBasicOrdersData() {
        return {
            orders: [],
            statistics: {
                total: 0,
                pending: 0,
                confirmed: 0,
                delivered: 0
            }
        };
    }
    getBasicSupportData() {
        return {
            tickets: [],
            statistics: {
                total: 0,
                open: 0,
                inProgress: 0,
                resolved: 0
            }
        };
    }
    async broadcastRealData() {
        try {
            const dashboardData = await this.getDashboardData();
            const paymentsData = await this.getPaymentsData();
            const ordersData = await this.getOrdersData();
            const supportData = await this.getSupportData();
            // Broadcast to all connected clients
            this.io.emit('dashboard_data_update', dashboardData);
            this.io.emit('payments_update', paymentsData);
            this.io.emit('orders_update', ordersData);
            this.io.emit('support_tickets_update', supportData);
            console.log('📊 Real-time data broadcasted successfully');
        }
        catch (error) {
            console.error('❌ Error broadcasting real-time data:', error);
        }
    }
    emitToAll(event, data) {
        this.io.emit(event, data);
    }
    emitToRoom(room, event, data) {
        this.io.to(room).emit(event, data);
    }
}
exports.RealtimeDataService = RealtimeDataService;
//# sourceMappingURL=realtimeDataService.js.map