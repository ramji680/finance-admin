import React, { useState } from 'react';
import { useRealtime } from '../contexts/RealtimeContext';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,

  RefreshCw
} from 'lucide-react';

interface Payment {
  id: number;
  status: string;
  amount: number;
  currency: string;
  razorpayPaymentId?: string;
  Order?: {
    orderNumber: string;
    totalAmount: number;
  };
  Restaurant?: {
    name: string;
    id: number;
  };
  createdAt: string;
}

const RealtimePaymentMonitor: React.FC = () => {
  const { isConnected, paymentsData, socket } = useRealtime();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Emit refresh event to server
    if (socket) {
      socket.emit('refresh_payments');
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Monitor</h2>
          <p className="text-gray-600">Real-time payment tracking and status updates</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Offline</span>
              </div>
            )}
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {paymentsData?.pendingPayments?.length + paymentsData?.completedPayments?.length || 0}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {paymentsData?.pendingPayments?.length || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {paymentsData?.completedPayments?.length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(paymentsData?.completedPayments?.reduce((sum: number, p: Payment) => sum + (p.Order?.totalAmount || 0), 0) || 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Payment Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pending Payments</h3>
            <p className="text-sm text-gray-600">Payments awaiting processing</p>
          </div>
          <div className="p-4">
            {paymentsData?.pendingPayments?.length > 0 ? (
              <div className="space-y-3">
                {paymentsData.pendingPayments.map((payment: Payment) => (
                  <div
                    key={payment.id}
                    onClick={() => setSelectedPayment(payment)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">
                        Order #{payment.Order?.orderNumber || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {payment.Restaurant?.name || 'Unknown Restaurant'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          {formatAmount(payment.Order?.totalAmount || 0)}
                        </span>
                        {payment.razorpayPaymentId && (
                          <span className="text-xs text-gray-500">
                            ID: {payment.razorpayPaymentId.slice(-8)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No pending payments</p>
                <p className="text-sm">All payments are up to date</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Completed Payments */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Completed</h3>
            <p className="text-sm text-gray-600">Successfully processed payments</p>
          </div>
          <div className="p-4">
            {paymentsData?.completedPayments?.length > 0 ? (
              <div className="space-y-3">
                {paymentsData.completedPayments.map((payment: Payment) => (
                  <div
                    key={payment.id}
                    onClick={() => setSelectedPayment(payment)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">
                        Order #{payment.Order?.orderNumber || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {payment.Restaurant?.name || 'Unknown Restaurant'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          {formatAmount(payment.Order?.totalAmount || 0)}
                        </span>
                        {payment.razorpayPaymentId && (
                          <span className="text-xs text-gray-500">
                            ID: {payment.razorpayPaymentId.slice(-8)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No completed payments</p>
                <p className="text-sm">Completed payments will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Payment ID</p>
                <p className="font-medium text-gray-900">#{selectedPayment.id}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-medium text-gray-900">#{selectedPayment.Order?.orderNumber || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Restaurant</p>
                <p className="font-medium text-gray-900">{selectedPayment.Restaurant?.name || 'Unknown'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(selectedPayment.Order?.totalAmount || 0)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedPayment.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                </div>
              </div>
              
              {selectedPayment.razorpayPaymentId && (
                <div>
                  <p className="text-sm text-gray-600">Razorpay Payment ID</p>
                  <p className="font-mono text-sm text-gray-900">{selectedPayment.razorpayPaymentId}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="font-medium text-gray-900">{formatDate(selectedPayment.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimePaymentMonitor;
