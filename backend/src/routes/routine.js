const express = require('express');
const Routine = require('../models/Routine');

const router = express.Router();

// Get all routines by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const routines = await Routine.find({ user_id: userId })
      .sort({ scheduled_date: 1, scheduled_time: 1 });
    
    res.json({
      success: true,
      data: routines,
    });
  } catch (error) {
    console.error('Get routines error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get routines',
    });
  }
});

// Get upcoming routines (not completed)
router.get('/user/:userId/upcoming', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const routines = await Routine.find({ 
      user_id: userId,
      completed: false,
    }).sort({ scheduled_date: 1, scheduled_time: 1 });
    
    res.json({
      success: true,
      data: routines,
    });
  } catch (error) {
    console.error('Get upcoming routines error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get upcoming routines',
    });
  }
});

// Get routines by date
router.get('/user/:userId/date/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;
    
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const routines = await Routine.find({ 
      user_id: userId,
      scheduled_date: { $gte: startDate, $lte: endDate },
    }).sort({ scheduled_time: 1 });
    
    res.json({
      success: true,
      data: routines,
    });
  } catch (error) {
    console.error('Get routines by date error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get routines',
    });
  }
});

// Create routine
router.post('/', async (req, res) => {
  try {
    const { user_id, title, scheduled_time, scheduled_date } = req.body;
    
    const routine = await Routine.create({
      user_id,
      title,
      scheduled_time,
      scheduled_date: scheduled_date || new Date(),
      completed: false,
    });
    
    res.status(201).json({
      success: true,
      message: 'Routine created successfully',
      data: routine,
    });
  } catch (error) {
    console.error('Create routine error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create routine',
    });
  }
});

// Update routine
router.put('/:routineId', async (req, res) => {
  try {
    const { routineId } = req.params;
    const { title, scheduled_time, scheduled_date, completed } = req.body;
    
    const routine = await Routine.findById(routineId);
    
    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found',
      });
    }
    
    if (title !== undefined) routine.title = title;
    if (scheduled_time !== undefined) routine.scheduled_time = scheduled_time;
    if (scheduled_date !== undefined) routine.scheduled_date = scheduled_date;
    if (completed !== undefined) routine.completed = completed;
    
    await routine.save();
    
    res.json({
      success: true,
      message: 'Routine updated successfully',
      data: routine,
    });
  } catch (error) {
    console.error('Update routine error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update routine',
    });
  }
});

// Mark routine as completed
router.patch('/:routineId/complete', async (req, res) => {
  try {
    const { routineId } = req.params;
    
    const routine = await Routine.findByIdAndUpdate(
      routineId,
      { completed: true },
      { new: true }
    );
    
    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Routine marked as completed',
      data: routine,
    });
  } catch (error) {
    console.error('Complete routine error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete routine',
    });
  }
});

// Delete routine
router.delete('/:routineId', async (req, res) => {
  try {
    const { routineId } = req.params;
    
    const routine = await Routine.findByIdAndDelete(routineId);
    
    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Routine deleted successfully',
    });
  } catch (error) {
    console.error('Delete routine error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete routine',
    });
  }
});

module.exports = router;
