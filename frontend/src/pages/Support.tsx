import { useState } from 'react'
import { useQuery } from 'react-query'
import { supportApi } from '../services/api'
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'

const Support = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [showChat, setShowChat] = useState(false)
  const [showNewTicketModal, setShowNewTicketModal] = useState(false)
  
  const { data: ticketsData, isLoading } = useQuery(
    ['support-tickets', page, search, statusFilter, priorityFilter, categoryFilter],
    () => supportApi.getTickets({
      page,
      limit: 10,
      search,
      status: statusFilter,
      priority: priorityFilter,
      category: categoryFilter,
    })
  )

  const { data: stats } = useQuery('support-stats', supportApi.getStats)

  const openChat = (ticket: any) => {
    setSelectedTicket(ticket)
    setShowChat(true)
  }

  const tickets = ticketsData?.data?.tickets || []
  const pagination = ticketsData?.data?.pagination

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'badge-warning',
      in_progress: 'badge-info',
      resolved: 'badge-success',
      closed: 'badge-gray',
    }
    return <span className={`badge ${colors[status as keyof typeof colors]}`}>{status}</span>
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'badge-info',
      medium: 'badge-warning',
      high: 'badge-danger',
      urgent: 'badge-danger',
    }
    return <span className={`badge ${colors[priority as keyof typeof colors]}`}>{priority}</span>
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      technical: AlertTriangle,
      billing: CheckCircle,
      general: MessageCircle,
      support: User,
    }
    const Icon = icons[category as keyof typeof icons] || MessageCircle
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                <p className="text-gray-600">Manage customer support requests and provide assistance</p>
              </div>
            </div>
          </div>
          <button 
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-md transform hover:-translate-y-0.5"
            onClick={() => setShowNewTicketModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.data?.stats?.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.data?.stats?.byStatus?.open || 0}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.data?.stats?.byStatus?.inProgress || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.data?.stats?.byStatus?.resolved || 0}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Categories</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="general">General</option>
              <option value="support">Support</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Ticket</th>
                      <th className="table-header-cell">Requester</th>
                      <th className="table-header-cell">Category</th>
                      <th className="table-header-cell">Priority</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Assigned To</th>
                      <th className="table-header-cell">Created</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {tickets.map((ticket: any) => (
                      <tr key={ticket.id}>
                        <td className="table-cell">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              {getCategoryIcon(ticket.category)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                #{ticket.ticket_number}
                              </p>
                              <p className="text-sm text-gray-500 max-w-xs truncate">
                                {ticket.subject}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{ticket.requester_name}</p>
                            <p className="text-xs text-gray-500">{ticket.requester_email}</p>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="text-sm text-gray-900 capitalize">{ticket.category}</span>
                        </td>
                        <td className="table-cell">
                          {getPriorityBadge(ticket.priority)}
                        </td>
                        <td className="table-cell">
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td className="table-cell">
                          {ticket.assignedUser ? (
                            <div className="flex items-center space-x-2">
                              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="text-sm text-gray-900">{ticket.assignedUser.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Unassigned</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className="text-sm text-gray-500">
                            {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openChat(ticket)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Open Chat"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="pagination">
                  <div className="pagination-info">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="pagination-nav">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className={`pagination-button ${page === 1 ? 'pagination-button-disabled' : ''}`}
                    >
                      Previous
                    </button>
                    <span className="pagination-button pagination-button-active">
                      {page}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.totalPages}
                      className={`pagination-button ${page === pagination.totalPages ? 'pagination-button-disabled' : ''}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Support Chat - #{selectedTicket.ticket_number}
                  </h3>
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{selectedTicket.requester_name}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(selectedTicket.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{selectedTicket.description}</p>
                    </div>
                    
                    {/* Chat messages would go here */}
                    <div className="text-center text-gray-500 text-sm">
                      Chat functionality will be implemented with Socket.io
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="form-input flex-1"
                  />
                  <button className="btn-primary">Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full animate-modal-in">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Create New Support Ticket
                  </h3>
                  <button
                    onClick={() => setShowNewTicketModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Requester Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Requester Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter requester name"
                      />
                    </div>

                    {/* Requester Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority *
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Category</option>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="general">General</option>
                        <option value="support">Support</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number (optional)"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of the issue"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Detailed description of the issue or request"
                    />
                  </div>
                </form>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Create Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Support
