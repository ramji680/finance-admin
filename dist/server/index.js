"use strict";
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');
const dotenv = require('dotenv');
const { sequelize } = require('../database/connection');
const authRoutes = require('../routes/auth').default;
const dashboardRoutes = require('../routes/dashboard').default;
const restaurantRoutes = require('../routes/restaurants').default;
const paymentRoutes = require('../routes/payments').default;
const { initializePaymentRoutes } = require('../routes/payments');
const supportRoutes = require('../routes/support').default;
const userRoutes = require('../routes/users').default;
const { authenticateToken } = require('../middleware/auth');
const { errorHandler } = require('../middleware/errorHandler');
const { setupSocketHandlers } = require('../services/socketService');
const { RealtimeDataService } = require('../services/realtimeDataService');
// Load environment variables
dotenv.config();
const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env['SOCKET_CORS_ORIGIN'] || process.env['FRONTEND_URL'] || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});
const PORT = process.env['PORT'] || 5000;
// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
    max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100000'), // limit each IP to 1000 requests per windowMs (increased for development)
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
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/restaurants', authenticateToken, restaurantRoutes);
// Initialize payment routes with Socket.IO instance
initializePaymentRoutes(io);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/support', authenticateToken, supportRoutes);
app.use('/api/users', authenticateToken, userRoutes);
// Initialize real-time services
const realtimeDataService = new RealtimeDataService(io);
// Note: RazorpayService is initialized within payment routes
// Socket.io setup
setupSocketHandlers(io);
// Error handling middleware
app.use(errorHandler);
// 404 handler
app.use('*', (_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Database connection and server start
async function startServer() {
    try {
        // Test database connection (read-only) - but don't fail if it's not accessible
        let dbError;
        try {
            await sequelize.authenticate();
            console.log('✅ Database connection established successfully.');
        }
        catch (error) {
            dbError = error;
            console.log('⚠️  Database connection failed (continuing without database):');
            console.log(`   Error: ${error.message}`);
            console.log('   The server will run with limited functionality.');
            console.log('   To fix: Check database credentials and firewall settings.');
        }
        // Don't sync models in production - only authenticate connection
        if (process.env['NODE_ENV'] === 'development') {
            console.log('ℹ️ Development mode: Database models will not be synced (read-only mode)');
        }
        // Real-time data broadcasting disabled as requested
        // realtimeDataService.startBroadcasting();
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
            console.log(`🔗 Frontend URL: ${process.env['FRONTEND_URL'] || 'http://localhost:3000'}`);
            console.log(`🔌 Socket.IO enabled with CORS: ${process.env['SOCKET_CORS_ORIGIN'] || process.env['FRONTEND_URL'] || 'http://localhost:3000'}`);
            console.log(`💳 Razorpay integration enabled with Key ID: ${process.env['RAZORPAY_KEY_ID']}`);
            console.log(`📡 Real-time data broadcasting disabled`);
            if (dbError) {
                console.log('');
                console.log('🔧 Database Connection Issues:');
                console.log('   1. Check if MySQL is running on port 3306');
                console.log('   2. Verify firewall allows external connections');
                console.log('   3. Confirm database credentials in .env file');
                console.log('   4. Try using phpMyAdmin web interface instead');
            }
            else {
                console.log('✅ Database connected successfully');
            }
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    realtimeDataService.stopBroadcasting();
    await sequelize.close();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    realtimeDataService.stopBroadcasting();
    await sequelize.close();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
startServer();
//# sourceMappingURL=index.js.map