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

// Get today's record (Supports client date)
router.get('/user/:userId/today', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query; // Client local date YYYY-MM-DD
    const uid = parseId(userId);

    // Use client date if provided, otherwise server time
    let range;
    if (date) {
      range = getDateRange(date);
    } else {
      range = getTodayRange();
    }
    const { start, end } = range;

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

// ... (Get records by date range is fine) ...

// Creates/Updates Health Record
router.post('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, weight, height, water, sleep_hours, sleepHours, steps_count, stepsCount, id } = req.body;
    const uid = parseId(userId);

    // Normalize keys (frontend handles this, but good to be safe)
    const sleepVal = sleep_hours !== undefined ? sleep_hours : sleepHours;
    const stepsVal = steps_count !== undefined ? steps_count : stepsCount;

    // Use specific date or today
    let targetDate;
    let range;
    if (date) {
      targetDate = new Date(date);
      range = getDateRange(date);
    } else {
      targetDate = new Date();
      range = getTodayRange();
    }

    // Upsert Logic:
    // If ID provided, update that specific record.
    // If NOT provided, try to find record for that DATE.
    // If found, update. If not, create.

    let recordId = id;

    if (!recordId) {
      const existing = await prisma.healthTracking.findFirst({
        where: {
          userId: uid,
          trackingDate: { gte: range.start, lte: range.end }
        }
      });
      if (existing) {
        recordId = existing.id;
      }
    }

    let result;

    const dataPayload = {
      userId: uid,
      trackingDate: targetDate, // Will be overwritten by existing date if update, usually fine as range matches
      ...(weight !== undefined && { weight: parseFloat(weight) }),
      ...(height !== undefined && { height: parseFloat(height) }),
      ...(water !== undefined && { water: parseInt(water) }),
      ...(sleepVal !== undefined && { sleepHours: parseFloat(sleepVal) }),
      ...(stepsVal !== undefined && { stepsCount: parseInt(stepsVal) }),
    };

    if (recordId) {
      // Update
      result = await prisma.healthTracking.update({
        where: { id: recordId },
        data: dataPayload
      });
    } else {
      // Create
      result = await prisma.healthTracking.create({
        data: dataPayload
      });
    }

    res.json({
      success: true,
      data: result,
      message: 'Health data saved successfully'
    });

  } catch (error) {
    console.error('Save health data error:', error);
    res.status(500).json({ success: false, message: 'Failed to save health data' });
  }
});

// ...

// Dashboard Summary (Today vs Yesterday)
router.get('/user/:userId/dashboard', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query; // Client local date
    const uid = parseId(userId);

    let today, yesterday;

    if (date) {
      today = new Date(date);
    } else {
      today = new Date();
    }

    yesterday = new Date(today);
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
