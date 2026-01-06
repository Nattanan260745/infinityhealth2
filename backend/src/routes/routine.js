const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Helper: Get integer userId
const parseId = (id) => parseInt(id, 10);

// Get all routines by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseId(userId);

    const routines = await prisma.routine.findMany({
      where: { userId: uid },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' }
      ]
    });

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
    const uid = parseId(userId);

    const routines = await prisma.routine.findMany({
      where: {
        userId: uid,
        completed: false
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' }
      ]
    });

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
    const uid = parseId(userId); // Ensure userId is int

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const routines = await prisma.routine.findMany({
      where: {
        userId: uid,
        scheduledDate: { gte: startDate, lte: endDate }
      },
      orderBy: { scheduledTime: 'asc' }
    });

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
    const uid = parseId(user_id);

    const routine = await prisma.routine.create({
      data: {
        userId: uid,
        title: title,
        scheduledTime: scheduled_time,
        scheduledDate: scheduled_date || new Date(),
        completed: false
      }
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
    const id = parseId(routineId);
    const { title, scheduled_time, scheduled_date, completed } = req.body;

    const dataUpdate = {};
    if (title !== undefined) dataUpdate.title = title;
    if (scheduled_time !== undefined) dataUpdate.scheduledTime = scheduled_time;
    if (scheduled_date !== undefined) dataUpdate.scheduledDate = scheduled_date;
    if (completed !== undefined) dataUpdate.completed = completed;

    const routine = await prisma.routine.update({
      where: { id: id },
      data: dataUpdate
    });

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
    const id = parseId(routineId);

    const routine = await prisma.routine.update({
      where: { id: id },
      data: { completed: true }
    });

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
    const id = parseId(routineId);

    await prisma.routine.delete({
      where: { id: id }
    });

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
