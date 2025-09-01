import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface RealtimeContextType {
  socket: Socket | null;
  isConnected: boolean;
  dashboardData: any;
  paymentsData: any;
  ordersData: any;
  supportData: any;
  connect: () => void;
  disconnect: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

interface RealtimeProviderProps {
  children: ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [paymentsData, setPaymentsData] = useState<any>(null);
  const [ordersData, setOrdersData] = useState<any>(null);
  const [supportData, setSupportData] = useState<any>(null);
  
  const { user } = useAuth();

  const connect = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No auth token available, skipping socket connection');
      return;
    }

    try {
      const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : 'http://localhost:5000'; // Backend URL
      const newSocket = io(socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to real-time server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from real-time server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setIsConnected(false);
      });

      // Dashboard data updates
      newSocket.on('dashboard_data_update', (data) => {
        console.log('📊 Dashboard data update received:', data);
        setDashboardData(data);
      });

      // Payment updates
      newSocket.on('payments_update', (data) => {
        console.log('💳 Payment update received:', data);
        setPaymentsData(data);
      });

      newSocket.on('payment_status_update', (data) => {
        console.log('💳 Payment status update received:', data);
        // Update existing payments data
        setPaymentsData((prev: any) => ({
          ...prev,
          pendingPayments: prev?.pendingPayments?.filter((p: any) => p.id !== data.paymentId) || [],
          completedPayments: prev?.completedPayments || []
        }));
      });

      newSocket.on('payment_refunded', (data) => {
        console.log('💳 Payment refunded:', data);
      });

      // Order updates
      newSocket.on('orders_update', (data) => {
        console.log('📦 Order update received:', data);
        setOrdersData(data);
      });

      newSocket.on('order_payment_completed', (data) => {
        console.log('📦 Order payment completed:', data);
      });

      // Support ticket updates
      newSocket.on('support_tickets_update', (data) => {
        console.log('🎫 Support tickets update received:', data);
        setSupportData(data);
      });

      newSocket.on('new_message', (data) => {
        console.log('💬 New message received:', data);
      });

      newSocket.on('ticket_updated', (data) => {
        console.log('🎫 Ticket updated:', data);
      });

      newSocket.on('ticket_assigned', (data) => {
        console.log('🎫 Ticket assigned:', data);
      });

      newSocket.on('user_typing', (data) => {
        console.log('⌨️ User typing:', data);
      });

      newSocket.on('user_stopped_typing', (data) => {
        console.log('⌨️ User stopped typing:', data);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('❌ Error creating socket connection:', error);
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  // Connect when user is authenticated
  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const value: RealtimeContextType = {
    socket,
    isConnected,
    dashboardData,
    paymentsData,
    ordersData,
    supportData,
    connect,
    disconnect
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};
