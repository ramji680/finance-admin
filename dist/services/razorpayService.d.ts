export declare class RazorpayService {
    private razorpay;
    private io;
    constructor(io: any);
    createPaymentOrder(orderData: {
        amount: number;
        currency: string;
        receipt: string;
        notes?: Record<string, string>;
    }): Promise<any>;
    verifyPaymentSignature(paymentData: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }): Promise<boolean>;
    processWebhook(webhookData: any): Promise<void>;
    private handlePaymentCaptured;
    private handlePaymentFailed;
    private handleOrderPaid;
    getPaymentDetails(paymentId: string): Promise<any>;
    getOrderDetails(orderId: string): Promise<any>;
    refundPayment(paymentId: string, amount: number, notes?: string): Promise<any>;
    getPaymentAnalytics(): Promise<any>;
}
//# sourceMappingURL=razorpayService.d.ts.map