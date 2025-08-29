import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import Razorpay from 'razorpay';
import { Restaurant, Order, Payment } from '../database/models';
import { asyncHandler } from '../middleware/errorHandler';
import { Op } from 'sequelize';

const router = Router();

// Initialize Razorpay
  const razorpay = new Razorpay({
    key_id: process.env['RAZORPAY_KEY_ID']!,
    key_secret: process.env['RAZORPAY_KEY_SECRET']!,
  });

// Validation middleware
const validatePaymentQuery = [
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  query('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
];

// GET /api/payments/monthly - Get monthly payment reports
router.get('/monthly', validatePaymentQuery, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const currentDate = new Date();
    const month = parseInt(req.query['month'] as string) || currentDate.getMonth() + 1;
    const year = parseInt(req.query['year'] as string) || currentDate.getFullYear();

    // Get all restaurants with their monthly payment data
    const restaurants = await Restaurant.findAll({
      where: { isActive: true },
      include: [
        {
          model: Payment,
          as: 'payments',
          where: { month, year },
          required: false,
        },
      ],
    });

    // Calculate monthly data for each restaurant
    const monthlyData = await Promise.all(
      restaurants.map(async (restaurant) => {
        // Get orders for the month
        const orders = await Order.findAll({
          where: {
            restaurantId: restaurant.id,
            orderDate: {
              [Op.gte]: new Date(year, month - 1, 1),
              [Op.lt]: new Date(year, month, 1),
            },
            paymentStatus: 'paid',
          },
        });

        const totalOrders = orders.length;
        const totalAmount = orders.reduce((sum, order) => sum + Number(order.total), 0);
        const commissionAmount = orders.reduce((sum, order) => sum + Number(order.commission), 0);
        const restaurantAmount = totalAmount - commissionAmount;

        // Check if payment record exists
        const existingPayment = (restaurant as any).payments?.[0];
        
        if (existingPayment) {
          // Update existing payment record
          await existingPayment.update({
            totalOrders,
            totalAmount,
            commissionAmount,
            restaurantAmount,
          });
        } else {
          // Create new payment record
          await Payment.create({
            restaurantId: restaurant.id,
            month,
            year,
            totalOrders,
            totalAmount,
            commissionAmount,
            restaurantAmount,
            status: 'pending',
          });
        }

        return {
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            ownerName: restaurant.ownerName,
            city: restaurant.city,
            bankAccountNumber: restaurant.bankAccountNumber,
            bankIfscCode: restaurant.bankIfscCode,
            bankAccountHolderName: restaurant.bankAccountHolderName,
            upiId: restaurant.upiId,
          },
          monthlyData: {
            month,
            year,
            totalOrders,
            totalAmount,
            commissionAmount,
            restaurantAmount,
            paymentStatus: existingPayment?.status || 'pending',
            paymentId: existingPayment?.id,
          },
        };
      })
    );

    // Calculate totals
    const totals = monthlyData.reduce(
      (acc, item) => ({
        totalRestaurants: acc.totalRestaurants + 1,
        totalOrders: acc.totalOrders + item.monthlyData.totalOrders,
        totalAmount: acc.totalAmount + item.monthlyData.totalAmount,
        commissionAmount: acc.commissionAmount + item.monthlyData.commissionAmount,
        restaurantAmount: acc.restaurantAmount + item.monthlyData.restaurantAmount,
        pendingAmount: acc.pendingAmount + (item.monthlyData.paymentStatus === 'pending' ? item.monthlyData.restaurantAmount : 0),
      }),
      {
        totalRestaurants: 0,
        totalOrders: 0,
        totalAmount: 0,
        commissionAmount: 0,
        restaurantAmount: 0,
        pendingAmount: 0,
      }
    );

    return res.json({
      monthlyReport: {
        month,
        year,
        totals,
        restaurants: monthlyData,
      },
    });
  } catch (error) {
    console.error('Get monthly payments error:', error);
    return res.status(500).json({
      error: 'Failed to fetch monthly payment report',
    });
  }
}));

// POST /api/payments/settle - Bulk settlement via Razorpay
router.post('/settle', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { month, year, restaurantIds } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        error: 'Month and year are required',
      });
    }

    // Get pending payments for the specified month/year
    const whereClause: any = {
      month,
      year,
      status: 'pending',
    };

    if (restaurantIds && Array.isArray(restaurantIds)) {
      whereClause.restaurantId = { [Op.in]: restaurantIds };
    }

    const pendingPayments = await Payment.findAll({
      where: whereClause,
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name', 'bankAccountNumber', 'bankIfscCode', 'bankAccountHolderName'],
        },
      ],
    });

    if (pendingPayments.length === 0) {
      return res.status(400).json({
        error: 'No pending payments found for the specified period',
      });
    }

    const settlementResults = [];

    for (const payment of pendingPayments) {
      try {
        // Update payment status to processing
        await payment.update({ status: 'processing' });

        // Create Razorpay payout
        const payoutData = {
          account_number: (payment as any).restaurant.bankAccountNumber,
          fund_account_id: (payment as any).restaurant.bankIfscCode, // This should be a proper fund account ID
          amount: Math.round(payment.restaurantAmount * 100), // Convert to paise
          currency: 'INR',
          mode: 'IMPS',
          purpose: 'payout',
          queue_if_low_balance: true,
          reference_id: `PAYOUT_${payment.id}_${Date.now()}`,
          narration: `Settlement for ${(payment as any).restaurant.name} - ${month}/${year}`,
        };

        const payout = await (razorpay as any).payouts.create(payoutData);

        // Update payment record with Razorpay details
        await payment.update({
          status: 'completed',
          razorpayPayoutId: payout.id,
          settlementDate: new Date(),
          notes: `Settled via Razorpay. Payout ID: ${payout.id}`,
        });

        settlementResults.push({
          paymentId: payment.id,
          restaurantName: (payment as any).restaurant.name,
          amount: payment.restaurantAmount,
          status: 'success',
          razorpayPayoutId: payout.id,
        });
      } catch (error) {
        console.error(`Settlement failed for payment ${payment.id}:`, error);
        
        // Update payment status to failed
        await payment.update({
          status: 'failed',
          notes: `Settlement failed: ${(error as Error).message}`,
        });

        settlementResults.push({
          paymentId: payment.id,
          restaurantName: (payment as any).restaurant.name,
          amount: payment.restaurantAmount,
          status: 'failed',
          error: (error as Error).message,
        });
      }
    }

    const successCount = settlementResults.filter(r => r.status === 'success').length;
    const failedCount = settlementResults.filter(r => r.status === 'failed').length;

    return res.json({
      message: `Settlement completed. ${successCount} successful, ${failedCount} failed.`,
      results: settlementResults,
      summary: {
        total: pendingPayments.length,
        successful: successCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    console.error('Bulk settlement error:', error);
    return res.status(500).json({
      error: 'Failed to process bulk settlement',
    });
  }
}));

// GET /api/payments/history - Get payment history
router.get('/history', validatePaymentQuery, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const offset = (page - 1) * limit;
    const { month, year, status, restaurantId } = req.query;

    // Build where clause
    const whereClause: any = {};
    
    if (month) {
      whereClause.month = parseInt(month as string);
    }

    if (year) {
      whereClause.year = parseInt(year as string);
    }

    if (status) {
      whereClause.status = status;
    }

    if (restaurantId) {
      whereClause.restaurantId = parseInt(restaurantId as string);
    }

    // Get payments with pagination
    const { count, rows: payments } = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name', 'city'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      payments,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    return res.status(500).json({
      error: 'Failed to fetch payment history',
    });
  }
}));

export default router;
