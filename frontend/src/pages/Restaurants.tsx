import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { restaurantsApi } from '../services/api';

interface Restaurant {
  id: number;
  slug?: string;
  user_id: number;
  restaurant_name: string;
  restaurant_image?: string;
  rating?: string;
  delivery_time?: string;
  approx_price_for_two?: string;
  license_code?: string;
  short_description?: string;
  is_veg: '0' | '1';
  is_popular: '0' | '1';
  category_id?: string;
  full_address?: string;
  pincode?: string;
  landmark?: string;
  latitude?: string;
  longitude?: string;
  charge_type: 'fixed' | 'dynamic';
  delivery_charge?: string;
  delivery_distance?: string;
  extra_delivery_charge?: string;
  stor_charge_packing_extra?: string;
  delivery_radius_in_km?: string;
  min_order_price?: string;
  admin_commission?: string;
  coupon_id?: string;
  contact_number?: string;
  landline_number?: string;
  email_address?: string;
  opening_hour?: string;
  min_food_preparation_time: string;
  packaging_chanrges?: string;
  city?: string;
  state?: string;
  status: 'offline' | 'online';
  approve_status: 'active' | 'inactive' | 'reject';
  updated_rating: number;
  created_at?: string;
  updated_at?: string;
  stats?: {
    orderCount: number;
    totalRevenue: number;
  };
  // Virtual getters for compatibility
  owner_name?: string;
  email?: string;
  mobile?: string;
  address?: string;
  cuisine_type?: string;
  commission_rate?: number;
}

const Restaurants: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cuisineFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchRestaurants();
  }, [currentPage]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantsApi.getAll({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: cuisineFilter === 'all' ? undefined : cuisineFilter
      });
      
      setRestaurants(response.data.restaurants || []);
      setFilteredRestaurants(response.data.restaurants || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setRestaurants([]);
      setFilteredRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter restaurants based on search term and filters
    let filtered = restaurants;

    if (searchTerm) {
      filtered = filtered.filter(restaurant =>
        restaurant.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (restaurant.email_address && restaurant.email_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (restaurant.city && restaurant.city.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.approve_status === statusFilter);
    }

    if (cuisineFilter !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.category_id?.includes(cuisineFilter));
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, searchTerm, statusFilter, cuisineFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  // const handleCuisineFilter = (cuisine: string) => {
  //   setCuisineFilter(cuisine);
  // };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} />
          Add Restaurant
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search restaurants, owners, or cities..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`px-4 py-2 rounded-lg border ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilter('active')}
              className={`px-4 py-2 rounded-lg border ${
                statusFilter === 'active'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleStatusFilter('inactive')}
              className={`px-4 py-2 rounded-lg border ${
                statusFilter === 'inactive'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Inactive
            </button>
            </div>
        </div>
      </div>

      {/* Restaurants List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredRestaurants.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 text-lg mb-2">No restaurants found</div>
            <div className="text-gray-400">Try adjusting your search or filters</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
              </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
              </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
              </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
              </th>
            </tr>
          </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRestaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                          {restaurant.restaurant_name}
                    </div>
                        <div className="text-sm text-gray-500">{restaurant.category_id || 'Unknown'}</div>
                  </div>
                </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {restaurant.email_address || 'Unknown Owner'}
                        </div>
                        <div className="text-sm text-gray-500">{restaurant.email_address}</div>
                  </div>
                </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {restaurant.city}, {restaurant.state}
                  </div>
                      <div className="text-sm text-gray-500">{restaurant.pincode}</div>
                </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(restaurant.approve_status)}`}>
                        {restaurant.approve_status}
                      </span>
                </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getRatingColor(restaurant.updated_rating)}`}>
                        ⭐ {restaurant.updated_rating || 0}
                      </div>
                </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{restaurant.admin_commission || '0'}%</div>
                      {restaurant.stats && (
                        <div className="text-xs text-gray-500">
                          {restaurant.stats.orderCount} orders
                        </div>
                      )}
                </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit size={16} />
                    </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 size={16} />
                    </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
              <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
              </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
