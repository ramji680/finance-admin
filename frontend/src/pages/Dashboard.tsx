import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { dashboardApi } from '../services/api';
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
  BarChart3,
  Wifi,
  WifiOff,
  RefreshCw,
  Calendar,
  Users,
  Package
} from 'lucide-react';
import { useRealtime } from '../contexts/RealtimeContext';
import RevenueChart from '../components/charts/RevenueChart';

interface StatCard {
  title: string;
  value: string;
  change: number;
  changeType: 'positive' | 'negative';
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
  description?: string;
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
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isConnected, dashboardData } = useRealtime();

  // API Queries
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery(
    ['dashboard-stats'],
    dashboardApi.getStats,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );

  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery(
    ['dashboard-analytics', selectedPeriod],
    () => {
      const endDate = new Date();
      let startDate = new Date();
      
      switch (selectedPeriod) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }
      
      return dashboardApi.getAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    },
    {
      refetchInterval: 60000, // Refetch every minute
      staleTime: 30000,
    }
  );

  const { data: recentActivityData, refetch: refetchActivity } = useQuery(
    ['dashboard-recent-activity'],
    () => dashboardApi.getRecentActivity({ limit: 10 }),
    {
      refetchInterval: 45000, // Refetch every 45 seconds
      staleTime: 15000,
    }
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchAnalytics(),
        refetchActivity()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Generate stats from API data
  const generateStats = (): StatCard[] => {
    const stats = statsData?.data?.stats || {};
    
    return [
      {
        title: 'Total Revenue',
        value: `₹${(stats.currentMonth?.revenue || 0).toLocaleString()}`,
        change: 12.5,
        changeType: 'positive',
        icon: DollarSign,
        color: 'text-green-500',
        gradient: 'from-green-500 to-emerald-500',
        description: 'This month'
      },
      {
        title: 'Active Restaurants',
        value: (stats.totalRestaurants || 0).toString(),
        change: 8.2,
        changeType: 'positive',
        icon: Store,
        color: 'text-blue-500',
        gradient: 'from-blue-500 to-indigo-500',
        description: 'Currently active'
      },
      {
        title: 'Total Orders',
        value: (stats.totalOrders || 0).toLocaleString(),
        change: -3.1,
        changeType: 'negative',
        icon: ShoppingCart,
        color: 'text-purple-500',
        gradient: 'from-purple-500 to-pink-500',
        description: 'All time'
      },
      {
        title: 'Support Tickets',
        value: (stats.totalSupportTickets || 0).toString(),
        change: -15.4,
        changeType: 'positive',
        icon: MessageSquare,
        color: 'text-orange-500',
        gradient: 'from-orange-500 to-red-500',
        description: 'Open tickets'
      }
    ];
  };

  // Generate recent activities from API data
  const generateRecentActivities = (): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    
    // Add recent orders from API
    if (recentActivityData?.data?.recentActivity?.orders) {
      recentActivityData.data.recentActivity.orders.slice(0, 3).forEach((order: any) => {
        activities.push({
          id: order.id,
          type: 'order',
          title: 'New Order',
          description: `Order #${order.orderNumber || order.id} from ${order.restaurant?.name || 'Restaurant'}`,
          time: 'Just now',
          status: 'pending',
          amount: order.total
        });
      });
    }

    // Add recent payments from API
    if (recentActivityData?.data?.recentActivity?.payments) {
      recentActivityData.data.recentActivity.payments.slice(0, 2).forEach((payment: any) => {
        activities.push({
          id: payment.id,
          type: 'payment',
          title: 'Payment Completed',
          description: `Payment for order #${payment.orderNumber || 'N/A'}`,
          time: 'Recently',
          status: 'completed',
          amount: payment.amount
        });
      });
    }

    // Add support tickets from API
    if (recentActivityData?.data?.recentActivity?.tickets) {
      recentActivityData.data.recentActivity.tickets.slice(0, 2).forEach((ticket: any) => {
        activities.push({
          id: ticket.id,
          type: 'support',
          title: 'Support Ticket',
          description: `New ticket from ${ticket.requesterName || 'User'}`,
          time: 'Recently',
          status: 'pending'
        });
      });
    }

    return activities.slice(0, 5);
  };

  // Generate top restaurants from API data
  const generateTopRestaurants = () => {
    if (!analyticsData?.data?.analytics?.topRestaurants) return [];
    
    return analyticsData.data.analytics.topRestaurants.map((restaurant: any) => ({
      name: restaurant.restaurant?.name || 'Unknown Restaurant',
      orders: restaurant.orderCount || 0,
      revenue: restaurant.totalRevenue || 0,
      rating: 4.5 // Default rating since it's not in the API response
    }));
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!analyticsData?.data?.analytics?.revenueByDay) return [];
    
    return analyticsData.data.analytics.revenueByDay.map((item: any) => ({
      date: item.date,
      orderCount: item.orderCount || 0,
      totalRevenue: item.totalRevenue || 0,
      totalCommission: item.totalCommission || 0
    }));
  };

  const stats = generateStats();
  const recentActivities = generateRecentActivities();
  const topRestaurants = generateTopRestaurants();
  const chartData = prepareChartData();

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

  if (isLoading || statsLoading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="skeleton h-8 w-48"></div>
          <div className="skeleton h-4 w-96"></div>
        </div>
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="skeleton h-4 w-24"></div>
                <div className="skeleton w-12 h-12 rounded-xl"></div>
              </div>
              <div className="skeleton h-10 w-32 mb-2"></div>
              <div className="skeleton h-4 w-40"></div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <div className="card-header">
              <div className="skeleton h-6 w-32"></div>
            </div>
            <div className="card-body">
              <div className="skeleton h-64 w-full"></div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <div className="skeleton h-6 w-24"></div>
            </div>
            <div className="card-body space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-16 w-full"></div>
              ))}
            </div>
          </div>
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
          
          {/* Real-time connection status */}
          <div className="flex items-center space-x-4 mt-3">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-medium">Live Data</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm font-medium">Offline</span>
                </div>
              )}
            </div>
            
            {dashboardData?.timestamp && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">
                  Last updated: {new Date(dashboardData.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Period Selector */}
          <div className="flex items-center space-x-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
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
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card group hover:shadow-lg transition-all duration-300">
              <div className="stat-card-header">
                <div className="flex-1">
                  <span className="stat-card-title">{stat.title}</span>
                  {stat.description && (
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  )}
                </div>
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
              <div className="flex items-center space-x-2">
                {/* Chart Type Selector */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  {(['line', 'area', 'bar'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
                      className={`p-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        chartType === type
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {type === 'line' && <BarChart3 className="w-4 h-4" />}
                      {type === 'area' && <BarChart3 className="w-4 h-4" />}
                      {type === 'bar' && <BarChart3 className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
                
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            {analyticsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <RevenueChart data={chartData} chartType={chartType} height={256} />
            )}
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

            <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-200 hover:scale-105">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-900">Manage Users</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity and Top Restaurants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
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
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No recent activity</p>
                  <p className="text-sm">Activity will appear here in real-time</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Restaurants */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Top Restaurants</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {topRestaurants.length > 0 ? (
                topRestaurants.map((restaurant: any, index: number) => (
                  <div key={restaurant.name} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{restaurant.name}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Package className="w-3 h-3 mr-1" />
                          {restaurant.orders} orders
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          ₹{restaurant.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{restaurant.rating}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Store className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No restaurant data</p>
                  <p className="text-sm">Restaurant data will appear here in real-time</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
