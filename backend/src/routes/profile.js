const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Helper: Get integer userId
const parseId = (id) => parseInt(id, 10);

// Get ALL users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { userStats: true },
      orderBy: { id: 'asc' }
    });

    const profiles = users.map(user => ({
      _id: user.userStats?.id || 0,
      user_id: user.id,
      level_id: user.userStats?.level || 1,
      exp: user.userStats?.currentExp || 0,
      points: user.userStats?.totalPoints || 0,
      profile_img: user.profileImg,
      bio: user.bio,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role // If role exists
      }
    }));

    res.json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Failed to get users' });
  }
});

// Delete user by ID
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseId(userId);

    // Delete user (cascade should handle related data if configured, otherwise might need manual delete)
    // Prisma usually handles cascade if defined in schema.
    await prisma.user.delete({
      where: { id: uid }
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

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

    // Calculate Daily Stats (Reset at midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyMissions = await prisma.userMission.findMany({
      where: {
        userId: uid,
        status: true, // Completed
        completedAt: {
          gte: today // Completed today
        }
      },
      include: {
        mission: true // To get reward points/exp
      }
    });

    const dailyExp = dailyMissions.reduce((sum, um) => sum + (um.mission ? um.mission.rewardExp : 0), 0);
    const dailyPoints = dailyMissions.reduce((sum, um) => sum + (um.mission ? um.mission.rewardPoints : 0), 0);

    // Map to legacy format if needed by frontend
    const profileData = {
      _id: user.userStats.id, // Fake Mongo ID
      user_id: user.id,
      level_id: user.userStats.level,
      exp: user.userStats.currentExp,
      points: user.userStats.totalPoints,
      dailyExp: dailyExp,      // Added
      dailyPoints: dailyPoints, // Added
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

    // Update User (img/bio/name/email)
    const userUpdate = {};
    if (profile_img !== undefined) userUpdate.profileImg = profile_img;
    if (bio !== undefined) userUpdate.bio = bio;
    if (pushToken !== undefined) userUpdate.pushToken = pushToken;
    // Added fields for admin edit
    const { firstName, lastName, email } = req.body;
    if (firstName !== undefined) userUpdate.firstName = firstName;
    if (lastName !== undefined) userUpdate.lastName = lastName;
    if (email !== undefined) userUpdate.email = email;

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

// Add experience points (No auto-level up)
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

    const updatedStats = await prisma.userStats.update({
      where: { userId: uid },
      data: {
        currentExp: newExp
        // Level remains same until manual rank up
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

    const currentLevel = stats.level;
    const currentExp = stats.currentExp;
    const currentPoints = stats.totalPoints;

    // 1. XP Requirement: Must have full XP for current level (Level * 1000)
    // E.g. Level 1 needs 1000 XP to qualify for Level 2.
    const xpRequired = currentLevel * 1000;
    if (currentExp < xpRequired) {
      return res.status(400).json({
        success: false,
        message: `XP not full. Need ${xpRequired} XP to rank up.`,
        details: { needed: xpRequired, current: currentExp }
      });
    }

    // 2. Points Cost: 100 usually, 1000 every 10th level (10, 20, 30...)
    // "Every 10 levels uses 1000 points" -> Level 10 -> 11 cost = 1000? Or 9->10?
    // User: "all levels use 100... except every 10 levels use 1000"
    // Usually means the barrier AT level 10 costs 1000.
    const isBossLevel = (currentLevel % 10 === 0);
    const pointsCost = isBossLevel ? 1000 : 100;

    if (currentPoints < pointsCost) {
      return res.status(400).json({
        success: false,
        message: `Not enough points. Need ${pointsCost} points.`,
        details: { needed: pointsCost, current: currentPoints }
      });
    }

    // 3. Challenge Requirement: Must complete Challenge Mission for CURRENT level
    const challengeMission = await prisma.mission.findFirst({
      where: {
        missionType: 'CHALLENGE',
        requiredLevel: currentLevel,
        isActive: true
      }
    });

    if (challengeMission) {
      const isCompleted = await prisma.userMission.findFirst({
        where: {
          userId: uid,
          missionId: challengeMission.id,
          status: true // Completed
        }
      });

      if (!isCompleted) {
        return res.status(400).json({
          success: false,
          message: `Challenge not completed. Please finish 'Level ${currentLevel} Challenge' first.`
        });
      }
    }

    // All conditions met: Level Up!
    const newLevel = currentLevel + 1;
    const newPoints = currentPoints - pointsCost;

    await prisma.userStats.update({
      where: { userId: uid },
      data: {
        level: newLevel,
        totalPoints: newPoints
      }
    });

    // Optional: Create Level Up Notification
    await prisma.notification.create({
      data: {
        userId: uid,
        type: 'LEVEL_UP',
        title: 'Rank Up Successful! 🎉',
        message: `Congratulations! You are now Level ${newLevel}. Points used: ${pointsCost}.`,
        referenceId: newLevel
      }
    });

    return res.json({
      success: true,
      message: 'Rank Up Successful!',
      data: {
        level: newLevel,
        points: newPoints
      }
    });

  } catch (error) {
    console.error('Rank up error:', error);
    res.status(500).json({ success: false, message: 'Failed to rank up' });
  }
});

module.exports = router;
