const express = require('express');
const prisma = require('../prisma');
const { sendPushNotification } = require('../utils/pushNotification');

const router = express.Router();

// Helper: Get integer userId
const parseId = (id) => parseInt(id, 10);

// Get all notifications by user
router.get('/user/:userId', async (req, res) => {
  console.log(`[GET /user/${req.params.userId}] Request received`);
  try {
    const { userId } = req.params;
    const uid = parseId(userId);
    console.log(`[GET /user/${userId}] Parsed UID:`, uid);

    if (isNaN(uid)) {
      console.error(`[GET /user/${userId}] Invalid ID`);
      return res.status(400).json({ success: false, message: 'Invalid User ID' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`[GET /user/${userId}] Found ${notifications.length} notifications`);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error(`[GET /user/${req.params.userId}] Error:`, error);
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
    const uid = parseId(userId);

    const notifications = await prisma.notification.findMany({
      where: {
        userId: uid,
        isRead: false
      },
      orderBy: { createdAt: 'desc' }
    });

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
    const nid = parseId(notificationId);

    const notification = await prisma.notification.findUnique({
      where: { id: nid }
    });

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

// Create notification AND Send Push
router.post('/', async (req, res) => {
  try {
    const { user_id, type, title, message, reference_id } = req.body;
    const uid = parseId(user_id);

    // 1. Save to Database
    const notification = await prisma.notification.create({
      data: {
        userId: uid,
        type: type || 'SYSTEM',
        title,
        message,
        referenceId: reference_id ? parseInt(reference_id) : null
      }
    });

    // 2. Fetch User's Push Token
    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: { pushToken: true }
    });

    // 3. Send Push Notification (Fire and Forget)
    if (user && user.pushToken) {
      console.log(`Sending push to user ${uid} (Token: ${user.pushToken})`);
      sendPushNotification(user.pushToken, title, message, { notificationId: notification.id });
    } else {
      console.log(`User ${uid} has no push token. Skipping push.`);
    }

    res.status(201).json({
      success: true,
      message: 'Notification created and sent successfully',
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
    const nid = parseId(notificationId);

    const notification = await prisma.notification.update({
      where: { id: nid },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(404).json({ // 404 is likely if update fails due to not found
      success: false,
      message: 'Notification not found or failed to update',
    });
  }
});

// Mark all as read
router.patch('/user/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseId(userId);

    await prisma.notification.updateMany({
      where: {
        userId: uid,
        isRead: false
      },
      data: { isRead: true }
    });

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
    const nid = parseId(notificationId);

    await prisma.notification.delete({
      where: { id: nid }
    });

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
    const uid = parseId(userId);

    await prisma.notification.deleteMany({
      where: { userId: uid }
    });

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
