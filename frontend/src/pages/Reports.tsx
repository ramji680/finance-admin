import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  
  Users,
  Store,
  CreditCard,
  MessageSquare,
  Eye,
  Share2
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  type: 'financial' | 'operational' | 'user' | 'support';
  description: string;
  generatedAt: string;
  period: string;
  status: 'ready' | 'generating' | 'failed';
  size: string;
  format: 'PDF' | 'Excel' | 'CSV';
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Mock data for now - would be replaced with actual API call
      const mockReports: Report[] = [
        {
          id: '1',
          title: 'Monthly Revenue Report',
          type: 'financial',
          description: 'Comprehensive revenue analysis for the current month',
          generatedAt: '2024-01-15T10:30:00Z',
          period: 'January 2024',
          status: 'ready',
          size: '2.4 MB',
          format: 'PDF'
        },
        {
          id: '2',
          title: 'Restaurant Performance Report',
          type: 'operational',
          description: 'Restaurant metrics, ratings, and performance indicators',
          generatedAt: '2024-01-14T15:45:00Z',
          period: 'Q4 2023',
          status: 'ready',
          size: '1.8 MB',
          format: 'Excel'
        },
        {
          id: '3',
          title: 'User Analytics Report',
          type: 'user',
          description: 'User growth, engagement, and behavior analysis',
          generatedAt: '2024-01-13T09:20:00Z',
          period: 'December 2023',
          status: 'ready',
          size: '3.2 MB',
          format: 'CSV'
        },
        {
          id: '4',
          title: 'Support Ticket Analysis',
          type: 'support',
          description: 'Support ticket trends, resolution times, and satisfaction scores',
          generatedAt: '2024-01-12T14:15:00Z',
          period: 'Last 30 days',
          status: 'ready',
          size: '1.5 MB',
          format: 'PDF'
        },
        {
          id: '5',
          title: 'Payment Processing Report',
          type: 'financial',
          description: 'Payment success rates, failed transactions, and processing times',
          generatedAt: '2024-01-11T11:00:00Z',
          period: 'January 2024',
          status: 'generating',
          size: '0 MB',
          format: 'PDF'
        }
      ];
      
      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial':
        return <CreditCard className="h-5 w-5" />;
      case 'operational':
        return <Store className="h-5 w-5" />;
      case 'user':
        return <Users className="h-5 w-5" />;
      case 'support':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'operational':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-purple-100 text-purple-800';
      case 'support':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReports = reports.filter(report => {
    if (selectedType !== 'all' && report.type !== selectedType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and manage comprehensive business reports</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowGenerateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FileText size={16} />
            Generate Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="financial">Financial</option>
              <option value="operational">Operational</option>
              <option value="user">User Analytics</option>
              <option value="support">Support</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getTypeColor(report.type)}`}>
                  {getTypeIcon(report.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(report.type)}`}>
                    {report.type}
                  </span>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                {report.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Period:</span>
                <span className="text-gray-900">{report.period}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Generated:</span>
                <span className="text-gray-900">{formatDate(report.generatedAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Size:</span>
                <span className="text-gray-900">{report.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Format:</span>
                <span className="text-gray-900">{report.format}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {report.status === 'ready' && (
                <>
                  <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm">
                    <Download size={14} />
                    Download
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Share2 size={16} />
                  </button>
                </>
              )}
              {report.status === 'generating' && (
                <div className="flex-1 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  Generating...
                </div>
              )}
              {report.status === 'failed' && (
                <button className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm">
                  Retry Generation
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Generate New Report</h3>
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="financial">Financial Report</option>
                      <option value="operational">Operational Report</option>
                      <option value="user">User Analytics Report</option>
                      <option value="support">Support Report</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                      <option value="365">Last year</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="PDF">PDF</option>
                      <option value="Excel">Excel</option>
                      <option value="CSV">CSV</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Generate Report
                </button>
                <button 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
