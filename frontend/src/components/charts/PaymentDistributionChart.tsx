import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface PaymentData {
  status: string;
  count: number;
  amount: number;
}

interface PaymentDistributionChartProps {
  data: PaymentData[];
  height?: number;
}

const PaymentDistributionChart: React.FC<PaymentDistributionChartProps> = ({ 
  data, 
  height = 300 
}) => {
  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#3b82f6'];
  
  const STATUS_LABELS = {
    'completed': 'Completed',
    'pending': 'Pending',
    'processing': 'Processing',
    'failed': 'Failed',
    'cancelled': 'Cancelled'
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{STATUS_LABELS[data.status as keyof typeof STATUS_LABELS] || data.status}</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Count: <span className="font-medium">{data.count}</span>
            </p>
            <p className="text-sm text-green-600">
              Amount: <span className="font-medium">{formatCurrency(data.amount)}</span>
            </p>
            <p className="text-sm text-blue-600">
              Percentage: <span className="font-medium">{((data.count / data.reduce((sum: number, item: PaymentData) => sum + item.count, 0)) * 100).toFixed(1)}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">
              {STATUS_LABELS[entry.value as keyof typeof STATUS_LABELS] || entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-600">No payment data available</p>
          <p className="text-sm text-gray-500">Payment distribution will appear here</p>
        </div>
      </div>
    );
  }

  // Calculate total for percentage
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ status, count }) => `${STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}: ${count}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Total Payments</p>
          <p className="text-lg font-semibold text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-lg font-semibold text-green-600">{formatCurrency(totalAmount)}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentDistributionChart;
