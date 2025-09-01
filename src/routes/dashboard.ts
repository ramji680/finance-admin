import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { sequelize } from '../database/connection';

const router = Router();

// Dashboard endpoints now using real database data

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', asyncHandler(async (_req: Request, res: Response) => {
  try {
    console.log('Dashboard stats endpoint called');
    
    // Test queries one by one to isolate the issue
    
    // Get total users
    console.log('Testing users query...');
    const [usersResult] = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE status = "active"');
    const totalUsers = (usersResult as any[])[0].count;
    console.log('Users result:', totalUsers);
    
    // Get total restaurants
    console.log('Testing restaurants query...');
    const [restaurantsResult] = await sequelize.query('SELECT COUNT(*) as count FROM restaurant_information WHERE approve_status = "active"');
    const totalRestaurants = (restaurantsResult as any[])[0].count;
    console.log('Restaurants result:', totalRestaurants);
    
    // Get total orders
    console.log('Testing orders query...');
    const [ordersResult] = await sequelize.query('SELECT COUNT(*) as count FROM orders');
    const totalOrders = (ordersResult as any[])[0].count;
    console.log('Orders result:', totalOrders);
    
    // Return simplified response
    console.log('Dashboard stats computed successfully');

    return res.json({
      stats: {
        totalUsers,
        totalRestaurants,
        totalOrders,
        totalSupportTickets: 0,
        openSupportTickets: 0,
        currentMonth: {
          orders: 0,
          revenue: 0,
          commission: 0,
        },
        pendingPayments: {
          count: 0,
          amount: 0,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({
      error: 'Failed to fetch dashboard statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// GET /api/dashboard/analytics - Get analytics data
router.get('/analytics', asyncHandler(async (_req: Request, res: Response) => {
  try {
    // Get real analytics data using raw SQL
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Get revenue trend for last 6 months using raw SQL
    const revenueTrend = [];
    for (let month = 5; month >= 0; month--) {
      const targetMonth = currentDate.getMonth() - month;
      const targetYear = targetMonth < 0 ? currentYear - 1 : currentYear;
      const monthNumber = targetMonth < 0 ? targetMonth + 12 : targetMonth;
      
      const [monthResult] = await sequelize.query(`
        SELECT 
          SUM(CAST(grand_total_user AS DECIMAL(10,2))) as totalRevenue,
          SUM(CAST(grand_total AS DECIMAL(10,2))) as totalCommission
        FROM orders 
        WHERE MONTH(created_at) = ? AND YEAR(created_at) = ? AND paying_status = '1'
      `, {
        replacements: [monthNumber + 1, targetYear]
      });
      
      const monthRevenue = parseFloat((monthResult as any[])[0].totalRevenue || '0');
      const monthCommission = parseFloat((monthResult as any[])[0].totalCommission || '0');
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      revenueTrend.push({
        month: monthNames[monthNumber],
        revenue: monthRevenue,
        commission: monthCommission,
      });
    }

    // Get order trend for last 6 months using raw SQL
    const orderTrend = [];
    for (let month = 5; month >= 0; month--) {
      const targetMonth = currentDate.getMonth() - month;
      const targetYear = targetMonth < 0 ? currentYear - 1 : currentYear;
      const monthNumber = targetMonth < 0 ? targetMonth + 12 : targetMonth;
      
      const [monthResult] = await sequelize.query(`
        SELECT 
          COUNT(*) as orderCount,
          SUM(CAST(grand_total_user AS DECIMAL(10,2))) as totalRevenue
        FROM orders 
        WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
      `, {
        replacements: [monthNumber + 1, targetYear]
      });
      
      const monthRevenue = parseFloat((monthResult as any[])[0].totalRevenue || '0');
      const monthOrderCount = parseInt((monthResult as any[])[0].orderCount || '0');
      const avgOrderValue = monthOrderCount > 0 ? monthRevenue / monthOrderCount : 0;
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      orderTrend.push({
        month: monthNames[monthNumber],
        orders: monthOrderCount,
        avgOrderValue: Math.round(avgOrderValue),
      });
    }

    // Get top restaurants by revenue using raw SQL
    const [topRestaurantsResult] = await sequelize.query(`
      SELECT 
        o.restaurant_id,
        r.restaurant_name,
        COUNT(o.id) as orders,
        SUM(CAST(o.grand_total_user AS DECIMAL(10,2))) as revenue
      FROM orders o
      JOIN restaurant_information r ON o.restaurant_id = r.id
      WHERE o.status = 'Delivered' AND o.paying_status = '1'
      GROUP BY o.restaurant_id, r.restaurant_name
      ORDER BY revenue DESC
      LIMIT 5
    `);

    const topRestaurants = (topRestaurantsResult as any[]).map(restaurant => ({
      id: restaurant.restaurant_id,
      name: restaurant.restaurant_name,
      orders: restaurant.orders,
      revenue: parseFloat(restaurant.revenue || '0'),
    }));

    return res.json({
      revenueTrend,
      orderTrend,
      topRestaurants,
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return res.status(500).json({
      error: 'Failed to fetch analytics data',
    });
  }
}));

// GET /api/dashboard/recent-activity - Get recent activity
router.get('/recent-activity', asyncHandler(async (_req: Request, res: Response) => {
  try {
    // Get real recent activity using raw SQL
    const [recentOrdersResult] = await sequelize.query(`
      SELECT 
        o.id,
        o.order_id,
        r.restaurant_name,
        o.grand_total_user as amount,
        o.status,
        o.created_at
      FROM orders o
      LEFT JOIN restaurant_information r ON o.restaurant_id = r.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    const [recentPaymentsResult] = await sequelize.query(`
      SELECT 
        id,
        order_id,
        amount,
        status,
        created_at
      FROM razorpay_payments
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const [recentTicketsResult] = await sequelize.query(`
      SELECT 
        id,
        subject,
        status,
        priority,
        created_at
      FROM support_lists
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const recentActivity = {
      recentOrders: (recentOrdersResult as any[]).map(order => ({
        id: order.id,
        orderNumber: order.order_id,
        restaurantName: order.restaurant_name || 'Unknown',
        customerName: 'Customer', // Could be joined with users table if needed
        amount: parseFloat(order.amount || '0'),
        status: order.status,
        timestamp: order.created_at
      })),
      recentPayments: (recentPaymentsResult as any[]).map(payment => ({
        id: payment.id,
        orderId: payment.order_id,
        amount: parseFloat(payment.amount || '0'),
        status: payment.status,
        timestamp: payment.created_at
      })),
      recentSupportTickets: (recentTicketsResult as any[]).map(ticket => ({
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        timestamp: ticket.created_at
      }))
    };

    return res.json(recentActivity);
  } catch (error) {
    console.error('Dashboard recent activity error:', error);
    return res.status(500).json({
      error: 'Failed to fetch recent activity',
    });
  }
}));

export default router;
