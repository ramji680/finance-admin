import { Model, Optional } from 'sequelize';
export interface PaymentAttributes {
    id: number;
    name: string;
    razor_key: string;
    razor_order_id: string;
    razor_secret_key: string;
    order_id: string;
    amount: number;
    merchantTransactionId: string;
    contact: string;
    email: string;
    razor_paying_status: '0' | '1';
    signature: string;
    razorpay_payment_id: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
    id: number;
    name: string;
    razor_key: string;
    razor_order_id: string;
    razor_secret_key: string;
    order_id: string;
    amount: number;
    merchantTransactionId: string;
    contact: string;
    email: string;
    razor_paying_status: '0' | '1';
    signature: string;
    razorpay_payment_id: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    get status(): string;
    get method(): string;
    get currency(): string;
}
export default Payment;
//# sourceMappingURL=Payment.d.ts.map