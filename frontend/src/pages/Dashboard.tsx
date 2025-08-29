import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Store, 
  CreditCard, 
  MessageSquare,
  DollarSign,
  ShoppingCart,
  Activity,
  Clock,
  Star,
  Eye,
  Download,
  BarChart3
} from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change: number;
  changeType: 'positive' | 'negative';
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
}

interface RecentActivity {
  id: number;
  type: 'payment' | 'order' | 'support' | 'restaurant';
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
  amount?: number;
}

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Mock data - replace with actual API calls
  const stats: StatCard[] = [
    {
      title: 'Total Revenue',
      value: '₹2,45,890',
      change: 12.5,
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-500',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Active Restaurants',
      value: '156',
      change: 8.2,
      changeType: 'positive',
      icon: Store,
      color: 'text-blue-500',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Total Orders',
      value: '2,847',
      change: -3.1,
      changeType: 'negative',
      icon: ShoppingCart,
      color: 'text-purple-500',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Support Tickets',
      value: '23',
      change: -15.4,
      changeType: 'positive',
      icon: MessageSquare,
      color: 'text-orange-500',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: 1,
      type: 'payment',
      title: 'Payment Processed',
      description: 'Restaurant ABC monthly settlement completed',
      time: '2 minutes ago',
      status: 'completed',
      amount: 45000
    },
    {
      id: 2,
      type: 'order',
      title: 'High Value Order',
      description: 'New order worth ₹12,500 from Restaurant XYZ',
      time: '5 minutes ago',
      status: 'pending'
    },
    {
      id: 3,
      type: 'support',
      title: 'Support Ticket Resolved',
      description: 'Technical issue resolved for Restaurant DEF',
      time: '15 minutes ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'restaurant',
      title: 'New Restaurant Onboarded',
      description: 'Restaurant GHI successfully registered',
      time: '1 hour ago',
      status: 'completed'
    },
    {
      id: 5,
      type: 'payment',
      title: 'Payment Failed',
      description: 'Settlement failed for Restaurant JKL',
      time: '2 hours ago',
      status: 'failed',
      amount: 32000
    }
  ];

  const topRestaurants = [
    { name: 'Restaurant ABC', orders: 245, revenue: 125000, rating: 4.8 },
    { name: 'Restaurant XYZ', orders: 198, revenue: 98000, rating: 4.6 },
    { name: 'Restaurant DEF', orders: 176, revenue: 87000, rating: 4.7 },
    { name: 'Restaurant GHI', orders: 154, revenue: 76000, rating: 4.5 },
    { name: 'Restaurant JKL', orders: 132, revenue: 65000, rating: 4.4 }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="w-5 h-5" />;
      case 'order': return <ShoppingCart className="w-5 h-5" />;
      case 'support': return <MessageSquare className="w-5 h-5" />;
      case 'restaurant': return <Store className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="skeleton h-8 w-32 mb-2"></div>
              <div className="skeleton h-12 w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
          {['7d', '30d', '90d'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card group hover:shadow-lg transition-all duration-300">
              <div className="stat-card-header">
                <span className="stat-card-title">{stat.title}</span>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="stat-card-value">{stat.value}</div>
              <div className={`stat-card-change ${stat.changeType === 'positive' ? 'positive' : 'negative'}`}>
                {stat.changeType === 'positive' ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                <span>{Math.abs(stat.change)}%</span>
                <span className="text-gray-500 ml-1">from last period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Download className="w-4 h-4 text-gray-600" />
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
                <p className="text-sm text-gray-500">Revenue trends over time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 hover:scale-105">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-900">Process Payments</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 hover:scale-105">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-900">Add Restaurant</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 hover:scale-105">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-900">View Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity and Top Restaurants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.time}
                        </span>
                        {activity.amount && (
                          <span className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            ₹{activity.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Restaurants */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Top Restaurants</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {topRestaurants.map((restaurant, index) => (
                <div key={restaurant.name} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{restaurant.name}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{restaurant.orders} orders</span>
                      <span>₹{restaurant.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">{restaurant.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
