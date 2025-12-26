const express = require('express');
const DailyGoal = require('../models/DailyGoal');

const router = express.Router();

// Get all daily goals by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const goals = await DailyGoal.find({ user_id: userId })
      .sort({ goal_date: -1 });
    
    res.json({
      success: true,
      data: goals,
    });
  } catch (error) {
    console.error('Get daily goals error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get daily goals',
    });
  }
});

// Get today's goals
router.get('/user/:userId/today', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const goals = await DailyGoal.find({ 
      user_id: userId,
      goal_date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: 1 });
    
    res.json({
      success: true,
      data: goals,
    });
  } catch (error) {
    console.error('Get today goals error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get today goals',
    });
  }
});

// Get goals by date
router.get('/user/:userId/date/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;
    
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const goals = await DailyGoal.find({ 
      user_id: userId,
      goal_date: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: 1 });
    
    res.json({
      success: true,
      data: goals,
    });
  } catch (error) {
    console.error('Get goals by date error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get goals',
    });
  }
});

// Get incomplete goals
router.get('/user/:userId/incomplete', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const goals = await DailyGoal.find({ 
      user_id: userId,
      completed: false,
    }).sort({ goal_date: 1 });
    
    res.json({
      success: true,
      data: goals,
    });
  } catch (error) {
    console.error('Get incomplete goals error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get incomplete goals',
    });
  }
});

// Create daily goal
router.post('/', async (req, res) => {
  try {
    const { user_id, title, goal_date } = req.body;
    
    const goal = await DailyGoal.create({
      user_id,
      title,
      goal_date: goal_date || new Date(),
      completed: false,
    });
    
    res.status(201).json({
      success: true,
      message: 'Daily goal created successfully',
      data: goal,
    });
  } catch (error) {
    console.error('Create daily goal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create daily goal',
    });
  }
});

// Update daily goal
router.put('/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { title, goal_date, completed } = req.body;
    
    const goal = await DailyGoal.findById(goalId);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Daily goal not found',
      });
    }
    
    if (title !== undefined) goal.title = title;
    if (goal_date !== undefined) goal.goal_date = goal_date;
    if (completed !== undefined) goal.completed = completed;
    
    await goal.save();
    
    res.json({
      success: true,
      message: 'Daily goal updated successfully',
      data: goal,
    });
  } catch (error) {
    console.error('Update daily goal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update daily goal',
    });
  }
});

// Mark goal as completed
router.patch('/:goalId/complete', async (req, res) => {
  try {
    const { goalId } = req.params;
    
    const goal = await DailyGoal.findByIdAndUpdate(
      goalId,
      { completed: true },
      { new: true }
    );
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Daily goal not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Daily goal marked as completed',
      data: goal,
    });
  } catch (error) {
    console.error('Complete daily goal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete daily goal',
    });
  }
});

// Delete daily goal
router.delete('/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    
    const goal = await DailyGoal.findByIdAndDelete(goalId);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Daily goal not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Daily goal deleted successfully',
    });
  } catch (error) {
    console.error('Delete daily goal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete daily goal',
    });
  }
});

module.exports = router;
