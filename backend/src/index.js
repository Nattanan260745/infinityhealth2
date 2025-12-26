const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const routineRoutes = require('./routes/routine');
const dailyGoalRoutes = require('./routes/dailyGoal');
const missionRoutes = require('./routes/mission');
const levelRoutes = require('./routes/level');
const exerciseRoutes = require('./routes/exercise');
const healthTrackRoutes = require('./routes/healthTrack');
const notificationRoutes = require('./routes/notification');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:19006'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/routine', routineRoutes);
app.use('/daily-goal', dailyGoalRoutes);
app.use('/mission', missionRoutes);
app.use('/level', levelRoutes);
app.use('/exercise', exerciseRoutes);
app.use('/health-track', healthTrackRoutes);
app.use('/notification', notificationRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'InfinityHealth API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        register: '/auth/register',
        login: '/auth/login',
        logout: '/auth/logout',
      },
      profile: {
        get: '/profile/:userId',
        update: '/profile/:userId',
        addExp: '/profile/:userId/add-exp',
        addPoints: '/profile/:userId/add-points',
      },
      routine: {
        getAll: '/routine/user/:userId',
        getUpcoming: '/routine/user/:userId/upcoming',
        getByDate: '/routine/user/:userId/date/:date',
        create: '/routine',
        update: '/routine/:routineId',
        complete: '/routine/:routineId/complete',
        delete: '/routine/:routineId',
      },
      dailyGoal: {
        getAll: '/daily-goal/user/:userId',
        getToday: '/daily-goal/user/:userId/today',
        getByDate: '/daily-goal/user/:userId/date/:date',
        getIncomplete: '/daily-goal/user/:userId/incomplete',
        create: '/daily-goal',
        update: '/daily-goal/:goalId',
        complete: '/daily-goal/:goalId/complete',
        delete: '/daily-goal/:goalId',
      },
      mission: {
        getAll: '/mission',
        getByType: '/mission/type/:type',
        getOne: '/mission/:missionId',
        create: '/mission',
        update: '/mission/:missionId',
        delete: '/mission/:missionId',
        getUserMissions: '/mission/user/:userId',
        startMission: '/mission/user/:userId/start/:missionId',
        completeMission: '/mission/user/:userId/complete/:missionId',
        failMission: '/mission/user/:userId/fail/:missionId',
        updateProgress: '/mission/user/:userId/progress/:missionId',
      },
      level: {
        getAll: '/level',
        getOne: '/level/:levelId',
        getByExp: '/level/exp/:exp',
        create: '/level',
        update: '/level/:levelId',
        delete: '/level/:levelId',
        seed: '/level/seed',
      },
      exercise: {
        getAll: '/exercise',
        getByType: '/exercise/type/:type',
        getByDifficulty: '/exercise/difficulty/:difficulty',
        filter: '/exercise/filter?type=&difficulty=',
        getOne: '/exercise/:exerciseId',
        create: '/exercise',
        update: '/exercise/:exerciseId',
        delete: '/exercise/:exerciseId',
      },
      healthTrack: {
        getAll: '/health-track/user/:userId',
        getToday: '/health-track/user/:userId/today',
        getByDate: '/health-track/user/:userId/date/:date',
        getByRange: '/health-track/user/:userId/range?startDate=&endDate=',
        getOne: '/health-track/:trackId',
        createOrUpdate: '/health-track/user/:userId',
        addWater: '/health-track/user/:userId/add-water',
        delete: '/health-track/:trackId',
      },
      notification: {
        getAll: '/notification/user/:userId',
        getUnread: '/notification/user/:userId/unread',
        getOne: '/notification/:notificationId',
        create: '/notification',
        markAsRead: '/notification/:notificationId/read',
        markAllAsRead: '/notification/user/:userId/read-all',
        delete: '/notification/:notificationId',
        deleteAll: '/notification/user/:userId/all',
      }
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
