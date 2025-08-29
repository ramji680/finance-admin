import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Send,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Shield,
  Target
} from 'lucide-react';

interface Payment {
  id: number;
  restaurantName: string;
  restaurantId: number;
  month: string;
  year: number;
  totalOrders: number;
  totalAmount: number;
  commission: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  dueDate: string;
  processedDate?: string;
  paymentMethod: string;
  transactionId?: string;
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<number>(2024);
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [showBulkSettlement, setShowBulkSettlement] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        id: 1,
        restaurantName: 'Spice Garden Restaurant',
        restaurantId: 1,
        month: 'March',
        year: 2024,
        totalOrders: 1247,
        totalAmount: 1250000,
        commission: 187500,
        netAmount: 1062500,
        status: 'pending',
        dueDate: '2024-03-31',
        paymentMethod: 'Razorpay X',
      },
      {
        id: 2,
        restaurantName: 'Coastal Delights',
        restaurantId: 2,
        month: 'March',
        year: 2024,
        totalOrders: 892,
        totalAmount: 890000,
        commission: 106800,
        netAmount: 783200,
        status: 'processing',
        dueDate: '2024-03-31',
        paymentMethod: 'Razorpay X',
        processedDate: '2024-03-28',
      },
      {
        id: 3,
        restaurantName: 'Punjabi Dhaba',
        restaurantId: 3,
        month: 'March',
        year: 2024,
        totalOrders: 1567,
        totalAmount: 1567000,
        commission: 282060,
        netAmount: 1284940,
        status: 'completed',
        dueDate: '2024-03-31',
        paymentMethod: 'Razorpay X',
        processedDate: '2024-03-27',
        transactionId: 'TXN_001234',
      },
      {
        id: 4,
        restaurantName: 'Gujarati Thali House',
        restaurantId: 4,
        month: 'March',
        year: 2024,
        totalOrders: 0,
        totalAmount: 0,
        commission: 0,
        netAmount: 0,
        status: 'pending',
        dueDate: '2024-03-31',
        paymentMethod: 'Razorpay X',
      },
      {
        id: 5,
        restaurantName: 'Bengali Fish Curry',
        restaurantId: 5,
        month: 'March',
        year: 2024,
        totalOrders: 456,
        totalAmount: 456000,
        commission: 72960,
        netAmount: 383040,
        status: 'failed',
        dueDate: '2024-03-31',
        paymentMethod: 'Razorpay X',
        processedDate: '2024-03-26',
      }
    ];
    
    setPayments(mockPayments);
    setFilteredPayments(mockPayments);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = payments.filter(payment => {
      const matchesSearch = payment.restaurantName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesMonth = monthFilter === 'all' || payment.month === monthFilter;
      const matchesYear = payment.year === yearFilter;
      
      return matchesSearch && matchesStatus && matchesMonth && matchesYear;
    });

    setFilteredPayments(filtered);
    setCurrentPage(1);
  }, [payments, searchQuery, statusFilter, monthFilter, yearFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'processing':
        return <span className="badge badge-warning">Processing</span>;
      case 'pending':
        return <span className="badge badge-gray">Pending</span>;
      case 'failed':
        return <span className="badge badge-danger">Failed</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleSelectPayment = (paymentId: number) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === currentPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(currentPayments.map(p => p.id));
    }
  };

  const handleBulkSettlement = async () => {
    if (selectedPayments.length === 0) return;
    
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update status for selected payments
    setPayments(prev => prev.map(payment => 
      selectedPayments.includes(payment.id) 
        ? { ...payment, status: 'processing' as const }
        : payment
    ));
    
    setSelectedPayments([]);
    setShowBulkSettlement(false);
    setIsProcessing(false);
  };

  const totalPendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.netAmount, 0);

  const totalCompletedAmount = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.netAmount, 0);

  const totalCommission = payments.reduce((sum, p) => sum + p.commission, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Manage restaurant settlements and bulk payments</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowBulkSettlement(true)}
            disabled={selectedPayments.length === 0}
          >
            <Zap className="w-4 h-4 mr-2" />
            Bulk Settlement
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Pending Amount</span>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="stat-card-value">₹{(totalPendingAmount / 100000).toFixed(1)}L</div>
          <div className="stat-card-change negative">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>{payments.filter(p => p.status === 'pending').length}</span>
            <span className="text-gray-500 ml-1">restaurants pending</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Completed Amount</span>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="stat-card-value">₹{(totalCompletedAmount / 100000).toFixed(1)}L</div>
          <div className="stat-card-change positive">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{payments.filter(p => p.status === 'completed').length}</span>
            <span className="text-gray-500 ml-1">settlements completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Commission</span>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="stat-card-value">₹{(totalCommission / 100000).toFixed(1)}L</div>
          <div className="stat-card-change positive">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+18%</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Success Rate</span>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="stat-card-value">
            {payments.length > 0 
              ? Math.round((payments.filter(p => p.status === 'completed').length / payments.length) * 100)
              : 0}%
          </div>
          <div className="stat-card-change positive">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+5%</span>
            <span className="text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Trends */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Payment Trends</h3>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <BarChart3 className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <LineChart className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-600">Chart component will be integrated here</p>
                <p className="text-sm text-gray-500">Monthly payment trends</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Payment Distribution</h3>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <PieChart className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PieChart className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-600">Chart component will be integrated here</p>
                <p className="text-sm text-gray-500">Payment status distribution</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Months</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
              </select>
              
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(Number(e.target.value))}
                className="form-select"
              >
                <option value={2023}>2023</option>
                <option value={2024}>2024</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="w-12">
                <input
                  type="checkbox"
                  checked={selectedPayments.length === currentPayments.length && currentPayments.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th>Restaurant</th>
              <th>Period</th>
              <th>Orders</th>
              <th>Total Amount</th>
              <th>Commission</th>
              <th>Net Amount</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td>
                  <input
                    type="checkbox"
                    checked={selectedPayments.includes(payment.id)}
                    onChange={() => handleSelectPayment(payment.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {payment.restaurantName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{payment.restaurantName}</p>
                      <p className="text-sm text-gray-500">ID: {payment.restaurantId}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{payment.month}</p>
                    <p className="text-sm text-gray-500">{payment.year}</p>
                  </div>
                </td>
                <td>
                  <span className="text-sm font-medium">{payment.totalOrders.toLocaleString()}</span>
                </td>
                <td>
                  <span className="text-sm font-medium">₹{(payment.totalAmount / 100000).toFixed(1)}L</span>
                </td>
                <td>
                  <span className="text-sm font-medium text-blue-600">₹{(payment.commission / 100000).toFixed(1)}L</span>
                </td>
                <td>
                  <span className="text-sm font-medium text-green-600">₹{(payment.netAmount / 100000).toFixed(1)}L</span>
                </td>
                <td>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(payment.status)}
                    {getStatusBadge(payment.status)}
                  </div>
                </td>
                <td>
                  <span className="text-sm text-gray-500">{payment.dueDate}</span>
                </td>
                <td>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                    {payment.status === 'pending' && (
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Process Payment">
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredPayments.length)} of {filteredPayments.length} results
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Bulk Settlement Modal */}
      {showBulkSettlement && (
        <div className="modal-overlay" onClick={() => setShowBulkSettlement(false)}>
          <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Bulk Settlement</h3>
              <button
                onClick={() => setShowBulkSettlement(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Process {selectedPayments.length} Payments
                </h4>
                <p className="text-gray-600 mb-4">
                  This will initiate settlement for {selectedPayments.length} selected restaurants using Razorpay X.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Secure Processing</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    All payments are processed securely through Razorpay X with real-time tracking.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowBulkSettlement(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleBulkSettlement}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Process Payments
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
