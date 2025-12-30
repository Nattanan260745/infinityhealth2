const express = require('express');
const HealthTrack = require('../models/HealthTrack');
const User = require('../models/User'); // Import User model

const router = express.Router();

// Helper to find user by custom userId
const getUserByCustomId = async (customUserId) => {
  return await User.findOne({ userId: customUserId });
};

// Get all health records by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await getUserByCustomId(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const records = await HealthTrack.find({ user_id: user._id })
      .sort({ date: -1 });

    res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get health records',
    });
  }
});

// Get today's record
router.get('/user/:userId/today', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await getUserByCustomId(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const record = await HealthTrack.findOne({
      user_id: user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Get today record error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get today record',
    });
  }
});

// Get records by date range
router.get('/user/:userId/range', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const user = await getUserByCustomId(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const records = await HealthTrack.find({
      user_id: user._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error('Get records by range error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get records',
    });
  }
});

// Get record by date
router.get('/user/:userId/date/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;

    const user = await getUserByCustomId(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const record = await HealthTrack.findOne({
      user_id: user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Get record by date error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get record',
    });
  }
});

// Get single record (by ObjectId of the track record itself, no change needed usually, but logic is fine)
router.get('/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;

    const record = await HealthTrack.findById(trackId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get record',
    });
  }
});

// Create or Update health record (upsert by date)
router.post('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, weight, height, water_glass, mood, sleep_hours } = req.body;

    const user = await getUserByCustomId(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const recordDate = new Date(date || new Date());
    const startOfDay = new Date(recordDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(recordDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if record exists for this date
    let record = await HealthTrack.findOne({
      user_id: user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (record) {
      // Update existing
      if (weight !== undefined) record.weight = weight;
      if (height !== undefined) record.height = height;
      if (water_glass !== undefined) record.water_glass = water_glass;
      if (mood !== undefined) record.mood = mood;
      if (sleep_hours !== undefined) record.sleep_hours = sleep_hours;

      await record.save();

      res.json({
        success: true,
        message: 'Health record updated successfully',
        data: record,
      });
    } else {
      // Create new
      record = await HealthTrack.create({
        user_id: user._id,
        date: recordDate,
        weight,
        height,
        water_glass,
        mood,
        sleep_hours,
      });

      res.status(201).json({
        success: true,
        message: 'Health record created successfully',
        data: record,
      });
    }
  } catch (error) {
    console.error('Create/Update health record error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save health record',
    });
  }
});

// Update specific field (add water glass, etc.)
router.patch('/user/:userId/add-water', async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    const user = await getUserByCustomId(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let record = await HealthTrack.findOne({
      user_id: user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!record) {
      record = await HealthTrack.create({
        user_id: user._id,
        date: new Date(),
        water_glass: amount || 1,
      });
    } else {
      record.water_glass = (record.water_glass || 0) + (amount || 1);
      await record.save();
    }

    res.json({
      success: true,
      message: 'Water added successfully',
      data: record,
    });
  } catch (error) {
    console.error('Add water error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add water',
    });
  }
});

// Delete record
router.delete('/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;

    const record = await HealthTrack.findByIdAndDelete(trackId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    res.json({
      success: true,
      message: 'Health record deleted successfully',
    });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete record',
    });
  }
});

module.exports = router;
