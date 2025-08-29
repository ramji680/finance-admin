import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Star,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  Store,
  Users,
  Filter,
  Calendar
} from 'lucide-react';

interface Restaurant {
  id: number;
  name: string;
  location: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  lastOrder: string;
  joinedDate: string;
  category: string;
  commission: number;
}

const Restaurants: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockRestaurants: Restaurant[] = [
      {
        id: 1,
        name: 'Spice Garden Restaurant',
        location: 'Mumbai, Maharashtra',
        phone: '+91 98765 43210',
        email: 'info@spicegarden.com',
        status: 'active',
        rating: 4.8,
        totalOrders: 1247,
        totalRevenue: 1250000,
        lastOrder: '2 hours ago',
        joinedDate: 'Jan 15, 2024',
        category: 'North Indian',
        commission: 15
      },
      {
        id: 2,
        name: 'Coastal Delights',
        location: 'Chennai, Tamil Nadu',
        phone: '+91 87654 32109',
        email: 'hello@coastaldelights.com',
        status: 'active',
        rating: 4.6,
        totalOrders: 892,
        totalRevenue: 890000,
        lastOrder: '1 hour ago',
        joinedDate: 'Feb 3, 2024',
        category: 'South Indian',
        commission: 12
      },
      {
        id: 3,
        name: 'Punjabi Dhaba',
        location: 'Delhi, NCR',
        phone: '+91 76543 21098',
        email: 'contact@punjabidhaba.com',
        status: 'active',
        rating: 4.7,
        totalOrders: 1567,
        totalRevenue: 1567000,
        lastOrder: '30 minutes ago',
        joinedDate: 'Dec 20, 2023',
        category: 'Punjabi',
        commission: 18
      },
      {
        id: 4,
        name: 'Gujarati Thali House',
        location: 'Ahmedabad, Gujarat',
        phone: '+91 65432 10987',
        email: 'info@gujaratithali.com',
        status: 'pending',
        rating: 0,
        totalOrders: 0,
        totalRevenue: 0,
        lastOrder: 'Never',
        joinedDate: 'Mar 10, 2024',
        category: 'Gujarati',
        commission: 14
      },
      {
        id: 5,
        name: 'Bengali Fish Curry',
        location: 'Kolkata, West Bengal',
        phone: '+91 54321 09876',
        email: 'hello@bengalifish.com',
        status: 'inactive',
        rating: 4.5,
        totalOrders: 456,
        totalRevenue: 456000,
        lastOrder: '1 week ago',
        joinedDate: 'Nov 5, 2023',
        category: 'Bengali',
        commission: 16
      }
    ];
    
    setRestaurants(mockRestaurants);
    setFilteredRestaurants(mockRestaurants);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = restaurants.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           restaurant.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           restaurant.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || restaurant.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Restaurant];
      let bValue: any = b[sortBy as keyof Restaurant];
      
      if (sortBy === 'rating' || sortBy === 'totalOrders' || sortBy === 'totalRevenue') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredRestaurants(filtered);
    setCurrentPage(1);
  }, [restaurants, searchQuery, statusFilter, categoryFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRestaurants = filteredRestaurants.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'inactive':
        return <span className="badge badge-danger">Inactive</span>;
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const openDetailsModal = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowDetailsModal(true);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant partners and their performance</p>
        </div>
        
        <button className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Restaurant
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Restaurants</span>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="stat-card-value">{restaurants.length}</div>
          <div className="stat-card-change positive">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12%</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Active Restaurants</span>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="stat-card-value">{restaurants.filter(r => r.status === 'active').length}</div>
          <div className="stat-card-change positive">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+8%</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Orders</span>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="stat-card-value">{restaurants.reduce((sum, r) => sum + r.totalOrders, 0).toLocaleString()}</div>
          <div className="stat-card-change positive">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+15%</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Revenue</span>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="stat-card-value">₹{(restaurants.reduce((sum, r) => sum + r.totalRevenue, 0) / 100000).toFixed(1)}L</div>
          <div className="stat-card-change positive">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+22%</span>
            <span className="text-gray-500 ml-1">this month</span>
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
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Categories</option>
                  <option value="North Indian">North Indian</option>
                  <option value="South Indian">South Indian</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Bengali">Bengali</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select"
                >
                  <option value="name">Name</option>
                  <option value="rating">Rating</option>
                  <option value="totalOrders">Total Orders</option>
                  <option value="totalRevenue">Total Revenue</option>
                  <option value="joinedDate">Join Date</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restaurants Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th 
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-2">
                  <span>Restaurant</span>
                  {sortBy === 'name' && (
                    <span className="text-blue-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th>Location</th>
              <th>Status</th>
              <th 
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center space-x-2">
                  <span>Rating</span>
                  {sortBy === 'rating' && (
                    <span className="text-blue-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('totalOrders')}
              >
                <div className="flex items-center space-x-2">
                  <span>Orders</span>
                  {sortBy === 'totalOrders' && (
                    <span className="text-blue-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('totalRevenue')}
              >
                <div className="flex items-center space-x-2">
                  <span>Revenue</span>
                  {sortBy === 'totalRevenue' && (
                    <span className="text-blue-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th>Last Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRestaurants.map((restaurant) => (
              <tr key={restaurant.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {restaurant.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{restaurant.name}</p>
                      <p className="text-sm text-gray-500">{restaurant.category}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{restaurant.location}</span>
                  </div>
                </td>
                <td>{getStatusBadge(restaurant.status)}</td>
                <td>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{restaurant.rating}</span>
                  </div>
                </td>
                <td>
                  <span className="text-sm font-medium">{restaurant.totalOrders.toLocaleString()}</span>
                </td>
                <td>
                  <span className="text-sm font-medium">₹{(restaurant.totalRevenue / 100000).toFixed(1)}L</span>
                </td>
                <td>
                  <span className="text-sm text-gray-500">{restaurant.lastOrder}</span>
                </td>
                <td>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openDetailsModal(restaurant)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredRestaurants.length)} of {filteredRestaurants.length} results
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

      {/* Restaurant Details Modal */}
      {showDetailsModal && selectedRestaurant && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Restaurant Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Store className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{selectedRestaurant.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{selectedRestaurant.location}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{selectedRestaurant.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{selectedRestaurant.email}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{selectedRestaurant.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Orders</span>
                      <span className="font-medium">{selectedRestaurant.totalOrders.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Revenue</span>
                      <span className="font-medium">₹{(selectedRestaurant.totalRevenue / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Commission Rate</span>
                      <span className="font-medium">{selectedRestaurant.commission}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Joined: {selectedRestaurant.joinedDate}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Last Order: {selectedRestaurant.lastOrder}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
              <button className="btn btn-primary">
                Edit Restaurant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
