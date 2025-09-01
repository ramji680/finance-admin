import { Server as SocketIOServer } from 'socket.io';
import { User, Restaurant, Order, Payment, SupportTicket } from '../database/models';
import { sequelize } from '../database/connection';

export class RealtimeDataService {
  private io: SocketIOServer;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(io: SocketIOServer) {
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

  private async getDashboardData() {
    try {
      // Get total users
      const totalUsers = await User.count({
        where: { status: 'active' }
      });

      // Get total restaurants
      const totalRestaurants = await Restaurant.count({
        where: { status: 'active' }
      });

      // Get total orders
      const totalOrders = await Order.count();

      // Get total revenue from orders using raw query
      const [revenueResult] = await sequelize.query(`
        SELECT SUM(CAST(grand_total_user AS DECIMAL(10,2))) as totalRevenue 
        FROM orders 
        WHERE status = 'Delivered' AND paying_status = '1'
      `);
      
      const totalRevenue = parseFloat((revenueResult as any).totalRevenue || '0');

      // Get recent orders
      const recentOrders = await Order.findAll({
        include: [
          {
            model: Restaurant,
            as: 'restaurant',
            attributes: ['restaurant_name']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      // Get top restaurants by order count using raw query
      const [topRestaurantsResult] = await sequelize.query(`
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
          restaurant: (order as any).restaurant?.restaurant_name || 'Unknown',
          date: order.createdAt
        })),
        topRestaurants: (topRestaurantsResult as any[]).map(restaurant => ({
          id: restaurant.restaurant_id,
          name: 'Restaurant', // We'll need to join with restaurant table for names
          cuisine: 'Unknown',
          orders: restaurant.orderCount,
          revenue: parseFloat(restaurant.totalRevenue || '0')
        }))
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return this.getBasicDashboardData();
    }
  }

  private async getPaymentsData() {
    try {
      // Get all payments
      const payments = await Payment.findAll({
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      // Get payment statistics
      const totalPayments = await Payment.count();
      const successfulPayments = await Payment.count({
        where: { razor_paying_status: '1' }
      });
      const failedPayments = await Payment.count({
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
    } catch (error) {
      console.error('Error fetching payments data:', error);
      return this.getBasicPaymentsData();
    }
  }

  private async getOrdersData() {
    try {
      // Get all orders
      const orders = await Order.findAll({
        include: [
          {
            model: Restaurant,
            as: 'restaurant',
            attributes: ['restaurant_name']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      // Get order statistics
      const totalOrders = await Order.count();
      const pendingOrders = await Order.count({
        where: { status: 'Pending' }
      });
      const confirmedOrders = await Order.count({
        where: { status: 'Confirmed' }
      });
      const deliveredOrders = await Order.count({
        where: { status: 'Delivered' }
      });

      return {
        orders: orders.map(order => ({
          id: order.id,
          order_id: order.order_id,
          restaurant: (order as any).restaurant?.restaurant_name || 'Unknown',
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
    } catch (error) {
      console.error('Error fetching orders data:', error);
      return this.getBasicOrdersData();
    }
  }

  private async getSupportData() {
    try {
      // Get all support tickets
      const tickets = await SupportTicket.findAll({
        include: [
          {
            model: User,
            as: 'assignedUser',
            attributes: ['name']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      // Get ticket statistics
      const totalTickets = await SupportTicket.count();
      const openTickets = await SupportTicket.count({
        where: { status: 'open' }
      });
      const inProgressTickets = await SupportTicket.count({
        where: { status: 'in_progress' }
      });
      const resolvedTickets = await SupportTicket.count({
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
          assigned_to: (ticket as any).assignedUser?.name || 'Unassigned',
          date: ticket.createdAt
        })),
        statistics: {
          total: totalTickets,
          open: openTickets,
          inProgress: inProgressTickets,
          resolved: resolvedTickets
        }
      };
    } catch (error) {
      console.error('Error fetching support data:', error);
      return this.getBasicSupportData();
    }
  }

  private getBasicDashboardData() {
    return {
      totalUsers: 0,
      totalRestaurants: 0,
      totalOrders: 0,
      totalRevenue: 0,
      recentOrders: [],
      topRestaurants: []
    };
  }

  private getBasicPaymentsData() {
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

  private getBasicOrdersData() {
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

  private getBasicSupportData() {
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

  private async broadcastRealData() {
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
    } catch (error) {
      console.error('❌ Error broadcasting real-time data:', error);
    }
  }

  emitToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }
}
