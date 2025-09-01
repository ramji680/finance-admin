import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  CreditCard, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  Settings,
  BarChart3,
  Users,
  FileText,
  Home
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      color: 'from-blue-500 to-blue-600',
      description: 'Overview & Analytics'
    },
    {
      name: 'Restaurants',
      href: '/restaurants',
      icon: Store,
      color: 'from-green-500 to-green-600',
      description: 'Manage Restaurants'
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600',
      description: 'Payment Processing'
    },
    {
      name: 'Support',
      href: '/support',
      icon: MessageSquare,
      color: 'from-orange-500 to-orange-600',
      description: 'Customer Support'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Advanced Reports'
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      color: 'from-pink-500 to-pink-600',
      description: 'User Management'
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileText,
      color: 'from-teal-500 to-teal-600',
      description: 'Detailed Reports'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-white/30 
        transform transition-all duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Fynito
              </h1>
              <p className="text-xs text-gray-500">Superadmin Portal</p>
            </div>
          </Link>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md scale-105 border border-blue-200/50' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-105'
                  }
                `}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0
                    ${isActive 
                      ? 'bg-gradient-to-br ' + item.color + ' shadow-lg' 
                      : 'bg-gray-100 group-hover:bg-gradient-to-br group-hover:' + item.color + ' group-hover:shadow-lg'
                    }
                  `}>
                    <Icon className={`w-5 h-5 transition-all duration-200 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block">{item.name}</span>
                    <span className="text-xs text-gray-500 hidden lg:block">{item.description}</span>
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="px-4 py-2">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
            Quick Actions
          </h3>
          
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200 hover:scale-105">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-medium">Settings</span>
              <span className="text-xs text-gray-500 hidden lg:block">System Configuration</span>
            </div>
          </button>

          <Link to="/" className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200 hover:scale-105">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-medium">Home</span>
              <span className="text-xs text-gray-500 hidden lg:block">Back to Main</span>
            </div>
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105 group"
          >
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-500 transition-colors duration-200 flex-shrink-0">
              <LogOut className="w-5 h-5 text-red-500 group-hover:text-white transition-colors duration-200" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-medium">Sign Out</span>
              <span className="text-xs text-red-500 hidden lg:block">Secure Logout</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:scale-105 transition-transform duration-200"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>
    </>
  );
};

export default Sidebar;
