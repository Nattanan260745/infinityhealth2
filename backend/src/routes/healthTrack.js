const express = require('express');
const prisma = require('../prisma');
const { checkAndCompleteMission } = require('../utils/missionUtils');

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
    console.log('--- DEBUG SAVE HEALTH ---');
    console.log('Body:', JSON.stringify(req.body));
    const uid = parseId(userId);

    if (isNaN(uid)) {
      console.error('Invalid userId provided:', userId);
      return res.status(400).json({ success: false, message: 'Invalid User ID' });
    }

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
      trackingDate: targetDate,
      ...(weight !== undefined && !isNaN(parseFloat(weight)) && { weight: parseFloat(weight) }),
      ...(height !== undefined && !isNaN(parseFloat(height)) && { height: parseFloat(height) }),
      ...(water !== undefined && !isNaN(parseInt(water, 10)) && { water: parseInt(water, 10) }),
      ...(sleepVal !== undefined && !isNaN(parseFloat(sleepVal)) && { sleepHours: parseFloat(sleepVal) }),
      ...(stepsVal !== undefined && !isNaN(parseInt(stepsVal, 10)) && { stepsCount: parseInt(stepsVal, 10) }),
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



    // Trigger Mission Checks
    if (result) {
      try {
        // Check "Daily Health Record" (New Mission)
        await checkAndCompleteMission(uid, 'บันทึกสุขภาพประจำวัน', 1);

        // Check "Drink Water" (Daily) and any Water Challenge
        if (dataPayload.water) {
          await checkAndCompleteMission(uid, 'ดื่มน้ำให้เพียงพอ', dataPayload.water);
          // Challenge Missions (Mapping from INI file)
          await checkAndCompleteMission(uid, 'ดื่มน้ำเพิ่มจากปกติ ≥ 1 แก้ว', dataPayload.water); // Lv 2
          await checkAndCompleteMission(uid, 'ดื่มน้ำ ≥ 5 แก้ว', dataPayload.water); // Lv 5
          await checkAndCompleteMission(uid, 'ดื่มน้ำ ≥ 6 แก้ว', dataPayload.water); // Lv 12
          await checkAndCompleteMission(uid, 'ดื่มน้ำ ≥ 7 แก้ว', dataPayload.water); // Lv 17
          await checkAndCompleteMission(uid, 'ดื่มน้ำ ≥ 8 แก้ว/วัน', dataPayload.water); // Lv 22, 27
          await checkAndCompleteMission(uid, 'ดื่มน้ำครบเป้า', dataPayload.water); // Lv 33, 53
          await checkAndCompleteMission(uid, 'ดื่มน้ำครบเป้า (≈ 8 แก้ว/วัน)', dataPayload.water); // Lv 43
        }

        // Check "Step Count" (Daily) and Step Challenges
        if (dataPayload.stepsCount) {
          const steps = dataPayload.stepsCount;
          await checkAndCompleteMission(uid, 'เคลื่อนไหวร่างกาย', steps); // New Daily Mission Name

          // Challenge Missions (Mapping from INI file)
          await checkAndCompleteMission(uid, 'เดิน ≥ 1,000 ก้าว', steps); // Lv 4
          await checkAndCompleteMission(uid, 'เดิน ≥ 2,000 ก้าว', steps); // Lv 8
          await checkAndCompleteMission(uid, 'เดิน ≥ 3,000 ก้าว', steps); // Lv 11
          await checkAndCompleteMission(uid, 'เดิน ≥ 4,000 ก้าว', steps); // Lv 16
          await checkAndCompleteMission(uid, 'เดิน ≥ 5,000 ก้าว/วัน', steps); // Lv 21, 26
          await checkAndCompleteMission(uid, 'เดิน ≥ 6,000 ก้าว/วัน', steps); // Lv 31, 35, 41, 45
          await checkAndCompleteMission(uid, 'เดิน ≥ 7,000 ก้าว/วัน', steps); // Lv 51
          await checkAndCompleteMission(uid, 'เดิน ≥ 7,500 ก้าว/วัน', steps); // Lv 61
          await checkAndCompleteMission(uid, 'เดิน ≥ 8,000 ก้าว/วัน', steps); // Lv 66
        }
      } catch (missionError) {
        console.error('Mission trigger error (absorbed):', missionError);
        // We absorb this error because the health data itself was saved successfully.
      }
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
        steps: formatCard('stepsCount', 'steps')
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
        height: true,
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
