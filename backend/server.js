import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Import database connection
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import qrCodeRoutes from './routes/qrCodeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io for real-time features
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.MOBILE_APP_URL || 'http://localhost:8081'
    ],
    methods: ['GET', 'POST']
  }
});

// Store active navigation sessions
const activeNavigationSessions = new Map();
const onlineUsers = new Map();

// ============ SOCKET.IO EVENTS ============

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins the server
  socket.on('user:join', (userData) => {
    onlineUsers.set(socket.id, {
      socketId: socket.id,
      userId: userData.userId,
      name: userData.name,
      timestamp: new Date()
    });
    
    io.emit('users:online-count', onlineUsers.size);
    console.log(`Total online users: ${onlineUsers.size}`);
  });

  // Start navigation session
  socket.on('navigation:start', (navigationData) => {
    const sessionId = `${socket.id}_${Date.now()}`;
    activeNavigationSessions.set(sessionId, {
      sessionId,
      userId: navigationData.userId,
      locationId: navigationData.locationId,
      startTime: new Date(),
      userSocketId: socket.id,
      lastUpdate: new Date(),
      route: []
    });

    socket.emit('navigation:session-started', {
      sessionId,
      message: 'Navigation session started'
    });

    io.emit('navigation:active-count', activeNavigationSessions.size);
  });

  // Update user location during navigation
  socket.on('navigation:location-update', (locationData) => {
    const { sessionId, latitude, longitude, accuracy } = locationData;
    
    if (activeNavigationSessions.has(sessionId)) {
      const session = activeNavigationSessions.get(sessionId);
      session.route.push({
        latitude,
        longitude,
        accuracy,
        timestamp: new Date()
      });
      session.lastUpdate = new Date();

      // Broadcast location update to all connected clients
      io.emit('navigation:location-updated', {
        sessionId,
        location: { latitude, longitude, accuracy }
      });
    }
  });

  // End navigation session
  socket.on('navigation:end', (navigationData) => {
    const { sessionId } = navigationData;
    
    if (activeNavigationSessions.has(sessionId)) {
      const session = activeNavigationSessions.get(sessionId);
      const duration = (new Date() - session.startTime) / 1000; // in seconds

      socket.emit('navigation:session-ended', {
        sessionId,
        duration,
        routeData: session.route,
        message: 'Navigation session ended'
      });

      activeNavigationSessions.delete(sessionId);
      io.emit('navigation:active-count', activeNavigationSessions.size);
    }
  });

  // Real-time search broadcast
  socket.on('search:query', (searchData) => {
    const { query } = searchData;
    
    socket.broadcast.emit('search:user-searching', {
      query,
      userCount: onlineUsers.size
    });
  });

  // Get active navigation sessions count
  socket.on('get:active-sessions', () => {
    socket.emit('active-sessions:count', {
      count: activeNavigationSessions.size,
      sessions: Array.from(activeNavigationSessions.values()).map(s => ({
        sessionId: s.sessionId,
        userId: s.userId,
        locationId: s.locationId,
        duration: (new Date() - s.startTime) / 1000
      }))
    });
  });

  // User disconnects
  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    
    // Clean up navigation sessions for this user
    for (const [sessionId, session] of activeNavigationSessions.entries()) {
      if (session.userSocketId === socket.id) {
        activeNavigationSessions.delete(sessionId);
      }
    }

    io.emit('users:online-count', onlineUsers.size);
    io.emit('navigation:active-count', activeNavigationSessions.size);
    console.log(`User disconnected: ${socket.id}, Total online: ${onlineUsers.size}`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`Socket error from ${socket.id}:`, error);
  });
});

// ============ MIDDLEWARE ============

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.MOBILE_APP_URL || 'http://localhost:8081'
  ],
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============ ROUTES ============

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
    activeUsers: onlineUsers.size,
    activeSessions: activeNavigationSessions.size
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/qrcodes', qrCodeRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// ============ DATABASE CONNECTION & SERVER START ============

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✓ Database connected');

    // Start HTTP server with Socket.io
    httpServer.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║       RaahVia Backend Server Ready!    ║
║                                        ║
║  🚀 Server running on port: ${PORT}          
║  🌐 Environment: ${process.env.NODE_ENV}       
║  📡 Socket.io: Active                 ║
║  💾 Database: Connected                ║
╚════════════════════════════════════════╝
      `);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down gracefully...');
      httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, httpServer, io };
