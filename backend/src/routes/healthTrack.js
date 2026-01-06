const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Helper: Get integer userId
const parseId = (id) => parseInt(id, 10);

// Helper: Get today's range
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Helper: Get range for specific date
const getDateRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// === Core Health Tracking APIs ===

// Get all health records by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseId(userId);

    const records = await prisma.healthTracking.findMany({
      where: { userId: uid },
      orderBy: { trackingDate: 'desc' }
    });

    res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({ success: false, message: 'Failed to get records' });
  }
});

// Get today's record
router.get('/user/:userId/today', async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseId(userId);
    const { start, end } = getTodayRange();

    const record = await prisma.healthTracking.findFirst({
      where: {
        userId: uid,
        trackingDate: { gte: start, lte: end }
      }
    });

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Get today record error:', error);
    res.status(500).json({ success: false, message: 'Failed to get record' });
  }
});

// Get records by date range
router.get('/user/:userId/range', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    const uid = parseId(userId);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const records = await prisma.healthTracking.findMany({
      where: {
        userId: uid,
        trackingDate: { gte: start, lte: end }
      },
      orderBy: { trackingDate: 'desc' }
    });

    res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error('Get records by range error:', error);
    res.status(500).json({ success: false, message: 'Failed to get records' });
  }
});

// Create or Update health record (Upsert)
router.post('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, weight, height, water, mood, sleep_hours, steps_count } = req.body;
    const uid = parseId(userId);

    // Date logic
    const recordDate = new Date(date || new Date());
    const { start, end } = getDateRange(recordDate);

    // Mapping fields
    // Frontend might send 'water_glass' or 'water'. Schema uses 'water' (Int, ml?)
    // If frontend sends 'water_glass' (assuming 250ml per glass), convert? 
    // Or did I change frontend? No.
    // Data dictionary says water (Int) ml.
    // Existing code logic: user inputs glasses (approx). 
    // Let's assume input 'water' is in ML or user follows input unit.
    // If incoming body matches Schema, we are good.
    // Keys mapping from likely frontend payload:
    // sleep_hours -> sleepHours
    // steps_count -> stepsCount

    // Check existing
    let record = await prisma.healthTracking.findFirst({
      where: { userId: uid, trackingDate: { gte: start, lte: end } }
    });

    const dataPayload = {
      userId: uid,
      trackingDate: recordDate
    };
    if (weight !== undefined) dataPayload.weight = weight === null ? null : parseFloat(weight);
    if (height !== undefined) dataPayload.height = height === null ? null : parseFloat(height);
    if (water !== undefined) dataPayload.water = water === null ? null : parseInt(water);
    if (mood !== undefined) dataPayload.mood = mood;
    if (sleep_hours !== undefined) dataPayload.sleepHours = sleep_hours === null ? null : parseFloat(sleep_hours);
    if (steps_count !== undefined) dataPayload.stepsCount = steps_count === null ? null : parseInt(steps_count);

    if (record) {
      // Update
      // Exclude userId/trackingDate from update if not needed? Prisma allows it.
      delete dataPayload.userId; // Don't update PK/FK if unnecessary
      delete dataPayload.trackingDate;

      record = await prisma.healthTracking.update({
        where: { id: record.id },
        data: dataPayload
      });
    } else {
      // Create
      record = await prisma.healthTracking.create({
        data: dataPayload
      });
    }

    res.json({
      success: true,
      message: 'Health record saved successfully',
      data: record,
    });
  } catch (error) {
    console.error('Save health record error:', error);
    res.status(500).json({ success: false, message: 'Failed to save record' });
  }
});

// Update specific field - Add Water
router.patch('/user/:userId/add-water', async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body; // ml amount to add
    const uid = parseId(userId);
    const { start, end } = getTodayRange();

    let record = await prisma.healthTracking.findFirst({
      where: { userId: uid, trackingDate: { gte: start, lte: end } }
    });

    const addAmount = parseInt(amount) || 0;

    if (!record) {
      record = await prisma.healthTracking.create({
        data: {
          userId: uid,
          trackingDate: new Date(),
          water: addAmount
        }
      });
    } else {
      record = await prisma.healthTracking.update({
        where: { id: record.id },
        data: {
          water: (record.water || 0) + addAmount
        }
      });
    }

    res.json({
      success: true,
      message: 'Water added successfully',
      data: record,
    });
  } catch (error) {
    console.error('Add water error:', error);
    res.status(500).json({ success: false, message: 'Failed to add water' });
  }
});

// === DASHBOARD & STATS APIs (1.3.6) ===

// Dashboard Summary (Today vs Yesterday)
router.get('/user/:userId/dashboard', async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseId(userId);

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayRange = getDateRange(today);
    const yesterdayRange = getDateRange(yesterday);

    // Fetch Today
    const todayRecord = await prisma.healthTracking.findFirst({
      where: { userId: uid, trackingDate: { gte: todayRange.start, lte: todayRange.end } }
    });

    // Fetch Yesterday
    const yesterdayRecord = await prisma.healthTracking.findFirst({
      where: { userId: uid, trackingDate: { gte: yesterdayRange.start, lte: yesterdayRange.end } }
    });

    // Helper to format comparison
    const formatCard = (key, unit) => ({
      current: todayRecord ? todayRecord[key] || 0 : 0,
      previous: yesterdayRecord ? yesterdayRecord[key] || 0 : 0,
      unit: unit
    });

    res.json({
      success: true,
      data: {
        weight: formatCard('weight', 'kg'),
        sleep: formatCard('sleepHours', 'hr'),
        water: formatCard('water', 'ml'),
        steps: formatCard('stepsCount', 'steps'),
        mood: todayRecord ? todayRecord.mood : null
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to get dashboard data' });
  }
});

// Stats (Avg, Min, Max) for period
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days } = req.query; // 7, 30, 90
    const uid = parseId(userId);

    const parsedDays = parseInt(days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parsedDays);
    startDate.setHours(0, 0, 0, 0);

    // Aggregate
    const aggregations = await prisma.healthTracking.aggregate({
      _avg: { weight: true, sleepHours: true, water: true, stepsCount: true },
      _max: { weight: true, sleepHours: true, water: true, stepsCount: true },
      _min: { weight: true, sleepHours: true, water: true, stepsCount: true },
      where: {
        userId: uid,
        trackingDate: { gte: startDate }
      }
    });

    res.json({
      success: true,
      period: `${parsedDays} days`,
      data: aggregations
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get stats' });
  }
});

// Range (Historical Data for Charts)
router.get('/user/:userId/range', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, days } = req.query;
    const uid = parseId(userId);

    let start, end;

    if (startDate) {
      start = new Date(startDate);
      // Ensure start is valid
      if (isNaN(start.getTime())) {
        start = new Date();
        start.setDate(start.getDate() - 7);
      }
    } else {
      const parsedDays = parseInt(days) || 7;
      start = new Date();
      start.setDate(start.getDate() - parsedDays);
    }
    start.setHours(0, 0, 0, 0);

    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        end = new Date();
      }
    } else {
      end = new Date();
    }
    end.setHours(23, 59, 59, 999);

    const records = await prisma.healthTracking.findMany({
      where: {
        userId: uid,
        trackingDate: { gte: start, lte: end }
      },
      orderBy: { trackingDate: 'asc' },
      select: {
        trackingDate: true,
        weight: true,
        sleepHours: true,
        water: true,
        stepsCount: true
      }
    });

    // Format dates
    const formatted = records.map(r => ({
      ...r,
      date: r.trackingDate.toISOString().split('T')[0] // YYYY-MM-DD
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Range error:', error);
    res.status(500).json({ success: false, message: 'Failed to get range data' });
  }
});

module.exports = router;
