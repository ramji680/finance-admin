import axios, { AxiosInstance } from 'axios';

export interface BeneficiaryUPI {
  type: 'upi';
  name: string;
  email?: string;
  contact?: string;
  upiId: string;
}

export interface BeneficiaryBank {
  type: 'bank';
  name: string;
  email?: string;
  contact?: string;
  ifsc: string;
  accountNumber: string;
}

export type Beneficiary = BeneficiaryUPI | BeneficiaryBank;

export class RazorpayXService {
  private client: AxiosInstance;
  private accountNumber: string;

  constructor() {
    const keyId = process.env['RAZORPAY_X_KEY_ID'];
    const keySecret = process.env['RAZORPAY_X_KEY_SECRET'];
    this.accountNumber = process.env['RAZORPAY_X_ACCOUNT_NUMBER'] || '';

    if (!keyId || !keySecret || !this.accountNumber) {
      throw new Error('Missing RazorpayX credentials: RAZORPAY_X_KEY_ID, RAZORPAY_X_KEY_SECRET, RAZORPAY_X_ACCOUNT_NUMBER');
    }

    this.client = axios.create({
      baseURL: 'https://api.razorpay.com/v1',
      auth: { username: keyId, password: keySecret },
    });
  }

  async createContact(name: string, email?: string, contact?: string) {
    const { data } = await this.client.post('/contacts', {
      name,
      email,
      contact,
      type: 'vendor',
    });
    return data;
  }

  async createFundAccountForUPI(contactId: string, upiId: string) {
    const { data } = await this.client.post('/fund_accounts', {
      contact_id: contactId,
      account_type: 'vpa',
      vpa: { address: upiId },
    });
    return data;
  }

  async createFundAccountForBank(contactId: string, ifsc: string, accountNumber: string) {
    const { data } = await this.client.post('/fund_accounts', {
      contact_id: contactId,
      account_type: 'bank_account',
      bank_account: { ifsc, account_number: accountNumber },
    });
    return data;
  }

  async createPayout(fundAccountId: string, amountInRupees: number, mode: 'UPI' | 'IMPS' | 'NEFT', narration?: string) {
    const { data } = await this.client.post('/payouts', {
      account_number: this.accountNumber,
      fund_account_id: fundAccountId,
      amount: Math.round(amountInRupees * 100),
      currency: 'INR',
      mode,
      purpose: 'payout',
      queue_if_low_balance: true,
      narration,
    });
    return data;
  }
}


