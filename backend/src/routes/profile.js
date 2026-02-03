const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Helper: Get integer userId
const parseId = (id) => parseInt(id, 10);

// Get profile by user ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseId(userId);

    // Fetch User and Stats
    let user = await prisma.user.findUnique({
      where: { id: uid },
      include: { userStats: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if UserStats exists, if not create
    if (!user.userStats) {
      // Create default stats
      const newStats = await prisma.userStats.create({
        data: { userId: uid }
      });
      user.userStats = newStats;
    }

    // Map to legacy format if needed by frontend
    const profileData = {
      _id: user.userStats.id, // Fake Mongo ID
      user_id: user.id,
      level_id: user.userStats.level,
      exp: user.userStats.currentExp,
      points: user.userStats.totalPoints,
      profile_img: user.profileImg,
      bio: user.bio,
      user: { // Extra info
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    };

    res.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get profile',
    });
  }
});

// Update profile
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseId(userId);
    const { level_id, exp, points, profile_img, bio, pushToken } = req.body;

    // Update UserStats
    const statsUpdate = {};
    if (level_id !== undefined) statsUpdate.level = level_id;
    if (exp !== undefined) statsUpdate.currentExp = exp;
    if (points !== undefined) statsUpdate.totalPoints = points;

    if (Object.keys(statsUpdate).length > 0) {
      await prisma.userStats.upsert({
        where: { userId: uid },
        update: statsUpdate,
        create: { userId: uid, ...statsUpdate }
      });
    }

    // Update User (img/bio)
    const userUpdate = {};
    if (profile_img !== undefined) userUpdate.profileImg = profile_img;
    if (bio !== undefined) userUpdate.bio = bio;
    if (pushToken !== undefined) userUpdate.pushToken = pushToken;

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: uid },
        data: userUpdate
      });
    }

    // Return updated
    const updatedUser = await prisma.user.findUnique({
      where: { id: uid },
      include: { userStats: true }
    });

    const profileData = {
      user_id: updatedUser.id,
      level_id: updatedUser.userStats ? updatedUser.userStats.level : 1,
      exp: updatedUser.userStats ? updatedUser.userStats.currentExp : 0,
      points: updatedUser.userStats ? updatedUser.userStats.totalPoints : 0,
      profile_img: updatedUser.profileImg,
      bio: updatedUser.bio
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profileData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
});

// Add experience points
router.post('/:userId/add-exp', async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseId(userId);
    const { amount } = req.body;

    const stats = await prisma.userStats.upsert({
      where: { userId: uid },
      update: {},
      create: { userId: uid }
    });

    const newExp = stats.currentExp + (amount || 0);

    // Level up logic (Simple: every 1000 exp = 1 level, OR use Level table)
    // Legacy code used: floor(exp / 1000) + 1
    // New logic: Use DB table `Level` (preferred) or keep legacy simple math?
    // Let's stick to legacy math for this specific endpoint unless I want to query `Level` table.
    // The previous prompt said "Level logic" in Mission used the table. Consistency suggests using the table.
    // However, for speed/compatibility with this specific route (which might be used by debug tools), I'll match mission.js logic if possible.
    // But `mission.js` queries `prisma.level`.

    // Let's use `prisma.level` for consistency.
    // Level logic using centralized utility
    const { calculateLevelWithCap } = require('../utils/levelUtils');
    const newLevel = await calculateLevelWithCap(stats.level, newExp, uid);

    const updatedStats = await prisma.userStats.update({
      where: { userId: uid },
      data: {
        currentExp: newExp,
        level: newLevel
      }
    });

    res.json({
      success: true,
      message: 'Experience added successfully',
      data: {
        exp: updatedStats.currentExp,
        level_id: updatedStats.level
      },
    });
  } catch (error) {
    console.error('Add exp error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add experience',
    });
  }
});

// Add points
router.post('/:userId/add-points', async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseId(userId);
    const { amount } = req.body;

    const stats = await prisma.userStats.upsert({
      where: { userId: uid },
      update: { totalPoints: { increment: amount || 0 } },
      create: { userId: uid, totalPoints: amount || 0 }
    });

    res.json({
      success: true,
      message: 'Points added successfully',
      data: {
        points: stats.totalPoints
      },
    });
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add points',
    });
  }
});

// Manual Rank Up Endpoint
router.post('/rank-up/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseId(userId);

    const stats = await prisma.userStats.findUnique({ where: { userId: uid } });
    if (!stats) return res.status(404).json({ success: false, message: 'User stats not found' });

    // Try to calculate new level with Manual Flag = TRUE
    const { calculateLevelWithCap } = require('../utils/levelUtils');
    const newLevel = await calculateLevelWithCap(stats.level, stats.currentExp, uid, true);

    if (newLevel > stats.level) {
      // Success! Level Up
      await prisma.userStats.update({
        where: { userId: uid },
        data: { level: newLevel }
      });

      return res.json({
        success: true,
        message: 'Rank Up Successful!',
        data: { level: newLevel }
      });
    } else {
      // Conditions not met (e.g. Challenge not done)
      return res.status(400).json({
        success: false,
        message: 'Rank up conditions not met. Complete the challenge first.'
      });
    }
  } catch (error) {
    console.error('Rank up error:', error);
    res.status(500).json({ success: false, message: 'Failed to rank up' });
  }
});

module.exports = router;
