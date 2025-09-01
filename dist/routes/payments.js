"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializePaymentRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const razorpayService_1 = require("../services/razorpayService");
const connection_1 = require("../database/connection");
const router = (0, express_1.Router)();
// Initialize Razorpay service (we'll need to pass io instance)
let razorpayService;
const initializePaymentRoutes = (io) => {
    razorpayService = new razorpayService_1.RazorpayService(io);
};
exports.initializePaymentRoutes = initializePaymentRoutes;
// GET /api/payments/monthly - Get monthly settlements for restaurants
router.get('/monthly', auth_1.authenticateToken, async (req, res) => {
    try {
        const { month, year = new Date().getFullYear() } = req.query;
        // Build where clause for date filtering
        let dateWhereClause = '';
        const replacements = [];
        if (month) {
            dateWhereClause = 'WHERE MONTH(rp.created_at) = ? AND YEAR(rp.created_at) = ?';
            replacements.push(month, year);
        }
        else {
            dateWhereClause = 'WHERE YEAR(rp.created_at) = ?';
            replacements.push(year);
        }
        // Get monthly settlements grouped by restaurant
        const [settlementsResult] = await connection_1.sequelize.query(`
      SELECT 
        ri.id as restaurant_id,
        ri.restaurant_name,
        MONTH(rp.created_at) as month,
        YEAR(rp.created_at) as year,
        COUNT(DISTINCT rp.order_id) as total_orders,
        SUM(rp.amount) as total_amount,
        SUM(rp.amount * 0.1) as commission, -- Assuming 10% commission
        SUM(rp.amount * 0.9) as net_amount, -- Restaurant gets 90%
        CASE 
          WHEN COUNT(rp.id) > 0 THEN 'pending'
          ELSE 'no_data'
        END as payment_status,
        MAX(rp.created_at) as last_payment_date
      FROM restaurant_information ri
      LEFT JOIN orders o ON ri.id = o.restaurant_id
      LEFT JOIN razorpay_payments rp ON o.order_id = rp.order_id AND rp.razor_paying_status = '1'
      ${dateWhereClause}
      GROUP BY ri.id, ri.restaurant_name, MONTH(rp.created_at), YEAR(rp.created_at)
      HAVING total_orders > 0
      ORDER BY total_amount DESC
    `, {
            replacements
        });
        const settlements = settlementsResult.map(settlement => ({
            id: settlement.restaurant_id,
            restaurantName: settlement.restaurant_name,
            restaurantId: settlement.restaurant_id,
            month: settlement.month,
            year: settlement.year,
            totalOrders: settlement.total_orders,
            totalAmount: parseFloat(settlement.total_amount || '0'),
            commission: parseFloat(settlement.commission || '0'),
            netAmount: parseFloat(settlement.net_amount || '0'),
            status: settlement.payment_status,
            dueDate: new Date(settlement.year, settlement.month, 15).toISOString().split('T')[0], // 15th of next month
            processedDate: settlement.payment_status === 'completed' ? settlement.last_payment_date : null,
            paymentMethod: 'razorpay',
            transactionId: `SETTLE_${settlement.restaurant_id}_${settlement.year}_${settlement.month}`
        }));
        return res.json({
            success: true,
            data: {
                monthlyReport: {
                    restaurants: settlements.map(settlement => ({
                        monthlyData: settlement
                    }))
                }
            }
        });
    }
    catch (error) {
        console.error('Get monthly settlements error:', error);
        return res.status(500).json({
            error: 'Failed to fetch monthly settlements'
        });
    }
});
// GET /api/payments/analytics - Get payment analytics
router.get('/analytics', auth_1.authenticateToken, async (_req, res) => {
    try {
        // Get payment analytics using raw SQL
        const [analyticsResult] = await connection_1.sequelize.query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN razor_paying_status = '1' THEN 1 ELSE 0 END) as successful_payments,
        SUM(CASE WHEN razor_paying_status = '0' THEN 1 ELSE 0 END) as failed_payments,
        SUM(CASE WHEN razor_paying_status = '1' THEN amount ELSE 0 END) as total_amount,
        AVG(CASE WHEN razor_paying_status = '1' THEN amount ELSE NULL END) as average_amount
      FROM razorpay_payments
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
        const analytics = analyticsResult[0];
        return res.json({
            success: true,
            data: {
                totalPayments: analytics.total_payments || 0,
                successfulPayments: analytics.successful_payments || 0,
                failedPayments: analytics.failed_payments || 0,
                totalAmount: parseFloat(analytics.total_amount || '0'),
                averageAmount: parseFloat(analytics.average_amount || '0'),
                successRate: analytics.total_payments > 0
                    ? Math.round((analytics.successful_payments / analytics.total_payments) * 100)
                    : 0
            }
        });
    }
    catch (error) {
        console.error('Get payment analytics error:', error);
        return res.status(500).json({
            error: 'Failed to fetch payment analytics'
        });
    }
});
// POST /api/payments/bulk-settlement - Process bulk settlements
router.post('/bulk-settlement', auth_1.authenticateToken, async (req, res) => {
    try {
        const { restaurantIds, month, year } = req.body;
        if (!restaurantIds || !Array.isArray(restaurantIds) || restaurantIds.length === 0) {
            return res.status(400).json({
                error: 'Restaurant IDs are required'
            });
        }
        // Get settlement data for selected restaurants
        const [settlementsResult] = await connection_1.sequelize.query(`
      SELECT 
        ri.id as restaurant_id,
        ri.restaurant_name,
        ri.email_address,
        ri.contact_number,
        SUM(rp.amount * 0.9) as net_amount,
        COUNT(DISTINCT rp.order_id) as total_orders
      FROM restaurant_information ri
      LEFT JOIN orders o ON ri.id = o.restaurant_id
      LEFT JOIN razorpay_payments rp ON o.order_id = rp.order_id AND rp.razor_paying_status = '1'
      WHERE ri.id IN (${restaurantIds.map(() => '?').join(',')})
        AND MONTH(rp.created_at) = ?
        AND YEAR(rp.created_at) = ?
      GROUP BY ri.id, ri.restaurant_name, ri.email_address, ri.contact_number
      HAVING net_amount > 0
    `, {
            replacements: [...restaurantIds, month, year]
        });
        const settlements = settlementsResult;
        // Process each settlement (in a real implementation, this would integrate with Razorpay X)
        const processedSettlements = settlements.map(settlement => ({
            restaurantId: settlement.restaurant_id,
            restaurantName: settlement.restaurant_name,
            amount: parseFloat(settlement.net_amount),
            orders: settlement.total_orders,
            status: 'processing',
            transactionId: `BULK_${settlement.restaurant_id}_${Date.now()}`,
            processedAt: new Date().toISOString()
        }));
        // Emit real-time update
        if (razorpayService) {
            // This would emit to connected clients
            console.log('Bulk settlement processed:', processedSettlements);
        }
        return res.json({
            success: true,
            message: `Bulk settlement initiated for ${processedSettlements.length} restaurants`,
            data: {
                settlements: processedSettlements,
                totalAmount: processedSettlements.reduce((sum, s) => sum + s.amount, 0)
            }
        });
    }
    catch (error) {
        console.error('Bulk settlement error:', error);
        return res.status(500).json({
            error: 'Failed to process bulk settlement'
        });
    }
});
// GET /api/payments - Get all payments with filters
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, method } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        // Build where clause
        let whereClause = '';
        const replacements = [];
        if (status) {
            whereClause += whereClause ? ' AND ' : ' WHERE ';
            whereClause += 'rp.status = ?';
            replacements.push(status);
        }
        if (method) {
            whereClause += whereClause ? ' AND ' : ' WHERE ';
            whereClause += 'rp.method = ?';
            replacements.push(method);
        }
        // Get payments with restaurant info using raw SQL
        const [paymentsResult] = await connection_1.sequelize.query(`
      SELECT 
        rp.id,
        rp.order_id,
        rp.razorpay_payment_id,
        rp.amount,
        'INR' as currency,
        CASE WHEN rp.razor_paying_status = '1' THEN 'captured' ELSE 'failed' END as status,
        'razorpay' as method,
        rp.email,
        rp.contact,
        rp.name,
        rp.created_at,
        rp.updated_at,
        ri.restaurant_name
      FROM razorpay_payments rp
      LEFT JOIN orders o ON rp.order_id = o.order_id
      LEFT JOIN restaurant_information ri ON o.restaurant_id = ri.id
      ${whereClause}
      ORDER BY rp.created_at DESC
      LIMIT ? OFFSET ?
    `, {
            replacements: [...replacements, Number(limit), offset]
        });
        // Get total count
        const [countResult] = await connection_1.sequelize.query(`
      SELECT COUNT(*) as total
      FROM razorpay_payments rp
      ${whereClause}
    `, {
            replacements
        });
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / Number(limit));
        return res.json({
            success: true,
            data: paymentsResult.map(payment => ({
                id: payment.id,
                orderId: payment.order_id,
                razorpayPaymentId: payment.razorpay_payment_id,
                amount: parseFloat(payment.amount || '0'),
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                email: payment.email,
                contact: payment.contact,
                name: payment.name,
                createdAt: payment.created_at,
                updatedAt: payment.updated_at,
                restaurant: payment.restaurant_name || 'Unknown'
            })),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages
            }
        });
    }
    catch (error) {
        console.error('Get payments error:', error);
        return res.status(500).json({
            error: 'Failed to fetch payments'
        });
    }
});
// GET /api/payments/analytics/overview - Get payment analytics
router.get('/analytics/overview', auth_1.authenticateToken, async (_req, res) => {
    try {
        // Get payment analytics using raw SQL
        const [analyticsResult] = await connection_1.sequelize.query(`
      SELECT 
        COUNT(*) as totalPayments,
        SUM(CAST(amount AS DECIMAL(10,2))) as totalAmount,
        COUNT(CASE WHEN status = 'captured' THEN 1 END) as successfulPayments,
        SUM(CASE WHEN status = 'captured' THEN CAST(amount AS DECIMAL(10,2)) ELSE 0 END) as successfulAmount,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failedPayments,
        COUNT(CASE WHEN status = 'created' THEN 1 END) as pendingPayments,
        SUM(CASE WHEN status = 'created' THEN CAST(amount AS DECIMAL(10,2)) ELSE 0 END) as pendingAmount
      FROM razorpay_payments
    `);
        const analytics = analyticsResult[0];
        return res.json({
            success: true,
            data: {
                totalPayments: parseInt(analytics.totalPayments || '0'),
                totalAmount: parseFloat(analytics.totalAmount || '0'),
                successfulPayments: parseInt(analytics.successfulPayments || '0'),
                successfulAmount: parseFloat(analytics.successfulAmount || '0'),
                failedPayments: parseInt(analytics.failedPayments || '0'),
                pendingPayments: parseInt(analytics.pendingPayments || '0'),
                pendingAmount: parseFloat(analytics.pendingAmount || '0'),
                successRate: analytics.totalPayments > 0 ?
                    ((analytics.successfulPayments / analytics.totalPayments) * 100).toFixed(2) : '0'
            }
        });
    }
    catch (error) {
        console.error('Payment analytics error:', error);
        return res.status(500).json({
            error: 'Failed to fetch payment analytics'
        });
    }
});
// POST /api/payments/bulk-settlement - Bulk settlement
router.post('/bulk-settlement', auth_1.authenticateToken, async (req, res) => {
    try {
        const { paymentIds } = req.body;
        if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Payment IDs array is required'
            });
        }
        // Get pending payments
        const [pendingPaymentsResult] = await connection_1.sequelize.query(`
      SELECT id, order_id, amount, razorpay_payment_id
      FROM razorpay_payments 
      WHERE id IN (?) AND status = 'created'
    `, {
            replacements: [paymentIds]
        });
        const pendingPayments = pendingPaymentsResult;
        if (pendingPayments.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No pending payments found for settlement'
            });
        }
        // Process settlements
        const settlements = [];
        const errors = [];
        for (const payment of pendingPayments) {
            try {
                // Update payment status to captured (simulating settlement)
                await connection_1.sequelize.query(`
          UPDATE razorpay_payments 
          SET status = 'captured', updated_at = NOW()
          WHERE id = ?
        `, {
                    replacements: [payment.id]
                });
                settlements.push({
                    id: payment.id,
                    orderId: payment.order_id,
                    amount: payment.amount,
                    status: 'settled'
                });
            }
            catch (error) {
                errors.push({
                    id: payment.id,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        return res.json({
            success: true,
            message: `Processed ${settlements.length} settlements successfully`,
            data: {
                settlements,
                errors,
                totalProcessed: settlements.length,
                totalErrors: errors.length
            }
        });
    }
    catch (error) {
        console.error('Bulk settlement error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process bulk settlement'
        });
    }
});
// Get payment by ID (read-only)
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const [paymentResult] = await connection_1.sequelize.query(`
      SELECT 
        rp.id,
        rp.order_id,
        rp.razorpay_payment_id,
        rp.razorpay_order_id,
        rp.razorpay_signature,
        rp.amount,
        rp.currency,
        rp.status,
        rp.method,
        rp.description,
        rp.email,
        rp.contact,
        rp.name,
        rp.error_code,
        rp.error_description,
        rp.refund_status,
        rp.refund_id,
        rp.refund_amount,
        rp.refund_notes,
        rp.refund_reason,
        rp.refund_receipt,
        rp.refund_processed_at,
        rp.created_at,
        rp.updated_at,
        ri.restaurant_name,
        o.grand_total_user as orderAmount,
        o.status as orderStatus
      FROM razorpay_payments rp
      LEFT JOIN orders o ON rp.order_id = o.order_id
      LEFT JOIN restaurant_information ri ON o.restaurant_id = ri.id
      WHERE rp.id = ?
    `, {
            replacements: [id]
        });
        const payments = paymentResult;
        if (payments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        const payment = payments[0];
        return res.json({
            success: true,
            data: {
                id: payment.id,
                orderId: payment.order_id,
                razorpayPaymentId: payment.razorpay_payment_id,
                razorpayOrderId: payment.razorpay_order_id,
                razorpaySignature: payment.razorpay_signature,
                amount: parseFloat(payment.amount || '0'),
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                description: payment.description,
                email: payment.email,
                contact: payment.contact,
                name: payment.name,
                errorCode: payment.error_code,
                errorDescription: payment.error_description,
                refundStatus: payment.refund_status,
                refundId: payment.refund_id,
                refundAmount: payment.refund_amount ? parseFloat(payment.refund_amount) : null,
                refundNotes: payment.refund_notes,
                refundReason: payment.refund_reason,
                refundReceipt: payment.refund_receipt,
                refundProcessedAt: payment.refund_processed_at,
                createdAt: payment.created_at,
                updatedAt: payment.updated_at,
                restaurant: payment.restaurant_name || 'Unknown',
                orderAmount: payment.orderAmount ? parseFloat(payment.orderAmount) : null,
                orderStatus: payment.orderStatus
            }
        });
    }
    catch (error) {
        console.error('Get payment by ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch payment'
        });
    }
});
// POST /api/payments/verify - Verify payment signature
router.post('/verify', auth_1.authenticateToken, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters'
            });
        }
        // Verify signature using Razorpay service
        const isValid = await razorpayService.verifyPaymentSignature({
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }
        // Update payment status in database
        await connection_1.sequelize.query(`
      UPDATE razorpay_payments 
      SET status = 'captured', updated_at = NOW()
      WHERE razorpay_order_id = ? AND razorpay_payment_id = ?
    `, {
            replacements: [razorpay_order_id, razorpay_payment_id]
        });
        return res.json({
            success: true,
            message: 'Payment verified and updated successfully'
        });
    }
    catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify payment'
        });
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map