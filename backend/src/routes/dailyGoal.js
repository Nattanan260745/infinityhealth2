const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Helper: Get integer userId
const parseId = (id) => parseInt(id, 10);

// Get all daily goals by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseId(userId);

    const goals = await prisma.dailyGoal.findMany({
      where: { userId: uid },
      orderBy: { goalDate: 'desc' }
    });

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
    const uid = parseId(userId);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const goals = await prisma.dailyGoal.findMany({
      where: {
        userId: uid,
        goalDate: { gte: startOfDay, lte: endOfDay }
      },
      orderBy: { createdAt: 'asc' }
    });

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
    const uid = parseId(userId);

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const goals = await prisma.dailyGoal.findMany({
      where: {
        userId: uid,
        goalDate: { gte: startDate, lte: endDate }
      },
      orderBy: { createdAt: 'asc' }
    });

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
    const uid = parseId(userId);

    const goals = await prisma.dailyGoal.findMany({
      where: {
        userId: uid,
        completed: false
      },
      orderBy: { goalDate: 'asc' }
    });

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
    const uid = parseId(user_id);

    const goal = await prisma.dailyGoal.create({
      data: {
        userId: uid,
        title: title,
        goalDate: goal_date || new Date(),
        completed: false
      }
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
    const id = parseId(goalId);
    const { title, goal_date, completed } = req.body;

    const dataUpdate = {};
    if (title !== undefined) dataUpdate.title = title;
    if (goal_date !== undefined) dataUpdate.goalDate = goal_date;
    if (completed !== undefined) dataUpdate.completed = completed;

    const goal = await prisma.dailyGoal.update({
      where: { id: id },
      data: dataUpdate
    });

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
    const id = parseId(goalId);

    const goal = await prisma.dailyGoal.update({
      where: { id: id },
      data: { completed: true }
    });

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
    const id = parseId(goalId);

    await prisma.dailyGoal.delete({
      where: { id: id }
    });

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
