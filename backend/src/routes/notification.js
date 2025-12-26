const express = require('express');
const Notification = require('../models/Notification');

const router = express.Router();

// Get all notifications by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const notifications = await Notification.find({ user_id: userId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get notifications',
    });
  }
});

// Get unread notifications
router.get('/user/:userId/unread', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const notifications = await Notification.find({ 
      user_id: userId,
      is_read: false,
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get notifications',
    });
  }
});

// Get single notification
router.get('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }
    
    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get notification',
    });
  }
});

// Create notification
router.post('/', async (req, res) => {
  try {
    const { user_id, level_id, routine_id, title, message } = req.body;
    
    const notification = await Notification.create({
      user_id,
      level_id,
      routine_id,
      title,
      message,
    });
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification,
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create notification',
    });
  }
});

// Mark as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { is_read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update notification',
    });
  }
});

// Mark all as read
router.patch('/user/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Notification.updateMany(
      { user_id: userId, is_read: false },
      { is_read: true }
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update notifications',
    });
  }
});

// Delete notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndDelete(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete notification',
    });
  }
});

// Delete all notifications for user
router.delete('/user/:userId/all', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Notification.deleteMany({ user_id: userId });
    
    res.json({
      success: true,
      message: 'All notifications deleted successfully',
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete notifications',
    });
  }
});

module.exports = router;
