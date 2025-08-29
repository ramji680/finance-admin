import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
// import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

// import { sequelize } from '../database/connection';
import authRoutes from '../routes/auth';
// import dashboardRoutes from '../routes/dashboard';
// import restaurantRoutes from '../routes/restaurants';
// import paymentRoutes from '../routes/payments';
// import supportRoutes from '../routes/support';
// import { authenticateToken } from '../middleware/auth';
import { errorHandler } from '../middleware/errorHandler';
// import { setupSocketHandlers } from '../services/socketService';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
// const io = new SocketIOServer(server, {
//   cors: {
//     origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
//     methods: ['GET', 'POST']
//   }
// });

const PORT = process.env['PORT'] || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
// Comment out database-dependent routes for now
// app.use('/api/dashboard', authenticateToken, dashboardRoutes);
// app.use('/api/restaurants', authenticateToken, restaurantRoutes);
// app.use('/api/payments', authenticateToken, paymentRoutes);
// app.use('/api/support', authenticateToken, supportRoutes);

// Socket.io setup
// Comment out for now since it depends on database models
// setupSocketHandlers(io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection and server start
async function startServer() {
  try {
    // Comment out database connection for now
    // await sequelize.authenticate();
    // console.log('✅ Database connection established successfully.');
    
    // Sync database models (in development)
    // if (process.env['NODE_ENV'] === 'development') {
    //   await sequelize.sync({ alter: true });
    //   console.log('✅ Database models synchronized.');
    // }
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env['FRONTEND_URL'] || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  // await sequelize.close();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  // await sequelize.close();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

startServer();
