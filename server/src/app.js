import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import stageRoutes from './routes/stageRoutes.js';
import universityRoutes from './routes/universityRoutes.js';
import shortlistRoutes from './routes/shortlistRoutes.js';
import lockRoutes from './routes/lockRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import counsellorRoutes from './routes/counsellorRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS Configuration - Allow Vite frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (simple)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AI Counsellor backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// API ROUTES
// ============================================

// Auth routes (signup, login, me)
app.use('/api/auth', authRoutes);

// Profile routes (onboarding)
app.use('/api/profile', profileRoutes);

// Stage routes - User journey stages
app.use('/api/stage', stageRoutes);

// Universities routes
app.use('/api/universities', universityRoutes);

// Shortlist routes - User shortlist management
app.use('/api/shortlist', shortlistRoutes);

// Lock routes - University locking system
app.use('/api/lock', lockRoutes);

// Tasks routes - Task management
app.use('/api/tasks', taskRoutes);

// AI Counsellor routes - AI-powered university counselling
app.use('/api/ai/counsellor', counsellorRoutes);

// Applications routes placeholder
app.get('/api/applications', (req, res) => {
  res.status(200).json({
    message: 'Get applications endpoint - TODO: implement',
    data: []
  });
});

app.post('/api/applications', (req, res) => {
  res.status(200).json({
    message: 'Create application endpoint - TODO: implement',
    data: null
  });
});

// AI Counsellor routes placeholder
app.post('/api/counsellor/chat', (req, res) => {
  res.status(200).json({
    message: 'Chat endpoint - TODO: implement',
    data: null
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

export default app;
