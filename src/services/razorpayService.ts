const Razorpay = require('razorpay');
const crypto = require('crypto');

export class RazorpayService {
  private razorpay: any;
  private io: any;

  constructor(io: any) {
    const keyId = process.env['RAZORPAY_KEY_ID'];
    const keySecret = process.env['RAZORPAY_KEY_SECRET'];
    
    console.log('Razorpay Environment Check:', {
      keyId: keyId ? 'SET' : 'NOT SET',
      keySecret: keySecret ? 'SET' : 'NOT SET',
      nodeEnv: process.env['NODE_ENV']
    });
    
    if (!keyId || !keySecret) {
      console.error('Missing Razorpay credentials:', {
        RAZORPAY_KEY_ID: keyId ? 'SET' : 'NOT SET',
        RAZORPAY_KEY_SECRET: keySecret ? 'SET' : 'NOT SET'
      });
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required');
    }
    
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    this.io = io;
    
    console.log('✅ Razorpay service initialized successfully');
  }

  // Create a new payment order
  public async createPaymentOrder(orderData: {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<any> {
    try {
      const options = {
        amount: orderData.amount * 100, // Razorpay expects amount in paise
        currency: orderData.currency || 'INR',
        receipt: orderData.receipt,
        notes: orderData.notes || {}
      };

      const order = await this.razorpay.orders.create(options);
      console.log('✅ Razorpay order created:', order.id);
      
      return order;
    } catch (error) {
      console.error('❌ Error creating Razorpay order:', error);
      throw error;
    }
  }

  // Verify payment signature
  public async verifyPaymentSignature(paymentData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<boolean> {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;
      
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env['RAZORPAY_KEY_SECRET']!)
        .update(body.toString())
        .digest('hex');
      
      return expectedSignature === razorpaySignature;
    } catch (error) {
      console.error('❌ Error verifying payment signature:', error);
      return false;
    }
  }

  // Process payment webhook
  public async processWebhook(webhookData: any): Promise<void> {
    try {
      const { event, payload } = webhookData;

      switch (event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(payload.payment.entity);
          break;
        
        case 'payment.failed':
          await this.handlePaymentFailed(payload.payment.entity);
          break;
        
        case 'order.paid':
          await this.handleOrderPaid(payload.order.entity);
          break;
        
        default:
          console.log(`ℹ️ Unhandled webhook event: ${event}`);
      }
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
    }
  }

  // Handle successful payment capture
  private async handlePaymentCaptured(paymentEntity: any): Promise<void> {
    try {
      console.log('✅ Payment captured:', paymentEntity.id);
      
      // Emit real-time update
      this.io.emit('payment_status_update', {
        paymentId: paymentEntity.id,
        status: 'captured',
        amount: paymentEntity.amount,
        timestamp: new Date().toISOString()
      });
      
      // In a real implementation, you would update the database here
      // Since we're read-only, we just emit the event
    } catch (error) {
      console.error('❌ Error handling payment captured:', error);
    }
  }

  // Handle failed payment
  private async handlePaymentFailed(paymentEntity: any): Promise<void> {
    try {
      console.log('❌ Payment failed:', paymentEntity.id);
      
      // Emit real-time update
      this.io.emit('payment_status_update', {
        paymentId: paymentEntity.id,
        status: 'failed',
        amount: paymentEntity.amount,
        timestamp: new Date().toISOString()
      });
      
      // In a real implementation, you would update the database here
      // Since we're read-only, we just emit the event
    } catch (error) {
      console.error('❌ Error handling payment failed:', error);
    }
  }

  // Handle order paid
  private async handleOrderPaid(orderEntity: any): Promise<void> {
    try {
      console.log('✅ Order paid:', orderEntity.id);
      
      // Emit real-time update
      this.io.emit('order_payment_completed', {
        orderId: orderEntity.id,
        status: 'paid',
        amount: orderEntity.amount,
        timestamp: new Date().toISOString()
      });
      
      // In a real implementation, you would update the database here
      // Since we're read-only, we just emit the event
    } catch (error) {
      console.error('❌ Error handling order paid:', error);
    }
  }

  // Get payment details from Razorpay
  public async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('❌ Error getting payment details:', error);
      throw error;
    }
  }

  // Get order details from Razorpay
  public async getOrderDetails(orderId: string): Promise<any> {
    try {
      const order = await this.razorpay.orders.fetch(orderId);
      return order;
    } catch (error) {
      console.error('❌ Error getting order details:', error);
      throw error;
    }
  }

  // Refund payment
  public async refundPayment(paymentId: string, amount: number, notes?: string): Promise<any> {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount * 100, // Convert to paise
        notes: notes ? { reason: notes } : undefined
      });

      console.log('✅ Payment refunded successfully:', refund.id);
      
      // Emit real-time update
      this.io.emit('payment_refunded', {
        paymentId,
        refundId: refund.id,
        amount: amount,
        notes,
        timestamp: new Date().toISOString()
      });

      return refund;
    } catch (error) {
      console.error('❌ Error refunding payment:', error);
      throw error;
    }
  }

  // Get payment analytics
  public async getPaymentAnalytics(): Promise<any> {
    try {
      // This would typically involve aggregating data from your database
      // Since we're read-only, we'll return basic structure
      const analytics = {
        totalPayments: 0,
        successfulPayments: 0,
        failedPayments: 0,
        totalAmount: 0,
        averageAmount: 0,
        currency: 'INR'
      };

      return analytics;
    } catch (error) {
      console.error('❌ Error getting payment analytics:', error);
      throw error;
    }
  }
}
