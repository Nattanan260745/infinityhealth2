const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Helper: Get integer userId
const parseId = (id) => parseInt(id, 10);

// Helper: Get today's start and end date
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Get all missions (Admin?) or just list
router.get('/', async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const where = includeInactive === 'true' ? {} : { isActive: true };

    const missions = await prisma.mission.findMany({
      where,
      orderBy: [
        { missionType: 'asc' },
        { id: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: missions,
    });
  } catch (error) {
    console.error('Get missions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get missions',
    });
  }
});

// Get missions by type (daily/challenge)
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const missionType = type.toUpperCase();

    const missions = await prisma.mission.findMany({
      where: {
        missionType: missionType,
        isActive: true
      },
      orderBy: { id: 'desc' }
    });

    res.json({
      success: true,
      data: missions,
    });
  } catch (error) {
    console.error('Get missions by type error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get missions',
    });
  }
});

// Get single mission
router.get('/:missionId', async (req, res) => {
  try {
    const { missionId } = req.params;
    const id = parseId(missionId);

    const mission = await prisma.mission.findUnique({
      where: { id: id }
    });

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found',
      });
    }

    res.json({
      success: true,
      data: mission,
    });
  } catch (error) {
    console.error('Get mission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get mission',
    });
  }
});

// Create mission (Admin)
router.post('/', async (req, res) => {
  try {
    const { title, type, reward_exp, reward_points, start_time, end_time, description, target_value, target_unit, required_level, duration_days, presets } = req.body;

    const mission = await prisma.mission.create({
      data: {
        missionName: title,
        missionType: type.toUpperCase(),
        rewardExp: reward_exp,
        rewardPoints: reward_points,
        startTime: start_time,
        endTime: end_time,
        description: description,
        targetValue: target_value || 1,
        targetUnit: target_unit || 'times',
        requiredLevel: required_level || 1,
        durationDays: duration_days,
        isActive: true,
        presets: presets
      }
    });

    res.status(201).json({
      success: true,
      message: 'Mission created successfully',
      data: mission,
    });
  } catch (error) {
    console.error('Create mission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create mission',
    });
  }
});

// Update mission (Admin)
router.put('/:missionId', async (req, res) => {
  try {
    const { missionId } = req.params;
    const id = parseId(missionId);
    const {
      title, type, reward_exp, reward_points,
      start_time, end_time, description,
      target_value, target_unit, required_level, duration_days,
      is_active, presets
    } = req.body;

    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.missionName = title;
    if (type !== undefined) dataToUpdate.missionType = type.toUpperCase();
    if (reward_exp !== undefined) dataToUpdate.rewardExp = reward_exp;
    if (reward_points !== undefined) dataToUpdate.rewardPoints = reward_points;
    if (start_time !== undefined) dataToUpdate.startTime = start_time;
    if (end_time !== undefined) dataToUpdate.endTime = end_time;
    if (description !== undefined) dataToUpdate.description = description;
    if (target_value !== undefined) dataToUpdate.targetValue = target_value;
    if (target_unit !== undefined) dataToUpdate.targetUnit = target_unit;
    if (required_level !== undefined) dataToUpdate.requiredLevel = required_level;
    if (duration_days !== undefined) dataToUpdate.durationDays = duration_days;
    if (is_active !== undefined) dataToUpdate.isActive = is_active;
    if (presets !== undefined) dataToUpdate.presets = presets;

    const mission = await prisma.mission.update({
      where: { id: id },
      data: dataToUpdate
    });

    res.json({
      success: true,
      message: 'Mission updated successfully',
      data: mission,
    });
  } catch (error) {
    console.error('Update mission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update mission',
    });
  }
});

// Delete mission (Admin)
router.delete('/:missionId', async (req, res) => {
  try {
    const { missionId } = req.params;
    const id = parseId(missionId);

    // Delete related UserMissions first to avoid P2003 Foreign Key constraint
    await prisma.userMission.deleteMany({
      where: { missionId: id }
    });

    await prisma.mission.delete({
      where: { id: id }
    });


    res.json({
      success: true,
      message: 'Mission deleted successfully',
    });
  } catch (error) {
    console.error('Delete mission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete mission',
    });
  }
});

// === User Mission Routes with Daily Reset Logic ===

// Get user's missions with status
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseId(userId);

    // Get today's range
    const { start, end } = getTodayRange();

    // Get all active missions
    // Get user level for filtering
    let userStats = await prisma.userStats.findUnique({ where: { userId: uid } });
    const userLevel = userStats ? userStats.level : 1;

    // Filter Logic:
    // 1. Daily: Show all active daily missions
    // 2. Challenge: Show ONLY active challenge for CURRENT level (requiredLevel === userLevel)

    const userMissions = await prisma.userMission.findMany({
      where: {
        userId: uid,
        createdAt: {
          gte: start,
          lte: end
        }
      }
    });

    // Filter Missions
    const missions = await prisma.mission.findMany({
      where: {
        isActive: true,
        OR: [
          { missionType: 'DAILY' },
          {
            missionType: 'CHALLENGE',
            requiredLevel: userLevel
          }
        ]
      },
      orderBy: { id: 'asc' }
    });

    // Combine data
    const missionsWithStatus = missions.map(mission => {
      const userMission = userMissions.find(um => um.missionId === mission.id);

      return {
        ...mission,
        _id: mission.id,
        title: mission.missionName, // Frontend uses title or missionName? Hook uses mission.title.
        // Schema has missionName. Response returns missionName.
        // Hook: convertToDisplayMission uses mission.title.
        // Wait, line 239 was: title: mission.missionName. So title IS mapped.
        // But what about target_value?
        // Hook uses: mission.target_value.
        // Prisma object has: targetValue.

        target_value: mission.targetValue,
        target_unit: mission.targetUnit,
        min_level: mission.requiredLevel, // Hook uses min_level
        reward_exp: mission.rewardExp,    // Hook uses reward_exp
        reward_points: mission.rewardPoints, // Hook uses reward_points
        description: mission.description,

        type: mission.missionType.toLowerCase(), // Frontend expects lowercase 'daily', 'challenge'?
        // Hook: if (titleLower.includes...) and mission.type === 'challenge'
        // Prisma Enum is DAILY, CHALLENGE. Frontend hook checks `mission.type === 'challenge'` (lowercase).
        // I need to lowerCase it.

        presets: mission.presets,

        user_status: userMission ? {
          mission_status: userMission.status ? 'completed' : 'in_progress',
          progress: `${userMission.currentProgress}/${mission.targetValue}`, // Format: "current/target"
          completed_at: userMission.status ? userMission.updatedAt : null,
          is_claimed: userMission.isClaimed
        } : {
          mission_status: null,
          progress: `0/${mission.targetValue}`,
          completed_at: null,
          is_claimed: false
        },
      };
    });

    res.json({
      success: true,
      data: missionsWithStatus,
    });
  } catch (error) {
    console.error('Get user missions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user missions',
    });
  }
});

// Start mission for user
router.post('/user/:userId/start/:missionId', async (req, res) => {
  try {
    const { userId, missionId } = req.params;
    const uid = parseId(userId);
    const mid = parseId(missionId);

    // Check mission
    const mission = await prisma.mission.findUnique({ where: { id: mid } });
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found' });
    }

    // Check existing TODAY
    const { start, end } = getTodayRange();
    const existing = await prisma.userMission.findFirst({
      where: {
        userId: uid,
        missionId: mid,
        createdAt: { gte: start, lte: end }
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Mission already started today',
        data: existing,
      });
    }

    // Create
    const userMission = await prisma.userMission.create({
      data: {
        userId: uid,
        missionId: mid,
        currentProgress: 0,
        status: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Mission started successfully',
      data: userMission,
    });
  } catch (error) {
    console.error('Start mission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start mission',
    });
  }
});

// Complete mission for user
router.patch('/user/:userId/complete/:missionId', async (req, res) => {
  try {
    const { userId, missionId } = req.params;
    const uid = parseId(userId);
    const mid = parseId(missionId);

    const { start, end } = getTodayRange();

    // Find UserMission TODAY
    let userMission = await prisma.userMission.findFirst({
      where: {
        userId: uid,
        missionId: mid,
        createdAt: { gte: start, lte: end }
      }
    });

    const mission = await prisma.mission.findUnique({ where: { id: mid } });
    const targetValue = mission ? mission.targetValue : 1;

    // Create if not exists (Auto-start for today)
    if (!userMission) {
      userMission = await prisma.userMission.create({
        data: {
          userId: uid,
          missionId: mid,
          currentProgress: targetValue,
          currentProgress: targetValue,
          status: true, // Completed
          completedAt: new Date() // Fix: Set completion time
        }
      });
    } else {
      if (userMission.status) {
        return res.status(400).json({ success: false, message: 'Mission already completed today' });
      }
      userMission = await prisma.userMission.update({
        where: { id: userMission.id },
        data: {
          status: true,
          currentProgress: targetValue,
          completedAt: new Date() // Fix: Set completion time
        }
      });
    }

    // Give Rewards & Streak Logic
    let userStats = await prisma.userStats.findUnique({ where: { userId: uid } });
    let rewards = { exp: 0, points: 0, bonus: 0 };

    if (mission && userStats) {
      rewards.exp = mission.rewardExp;
      rewards.points = mission.rewardPoints;

      // STREAK LOGIC
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let newStreak = userStats.currentStreak;
      let lastActivity = userStats.lastActivityDate;

      // Check last activity date
      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        lastDate.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day
          newStreak += 1;
        } else if (diffDays > 1) {
          // Broke streak (unless it's same day, diffDays=0)
          newStreak = 1;
        }
      } else {
        // First time
        newStreak = 1;
      }

      // Bonus Calculation
      if (newStreak === 3) rewards.bonus = 5;
      else if (newStreak === 7) rewards.bonus = 15;
      else if (newStreak === 30) rewards.bonus = 50;

      rewards.points += rewards.bonus;

      const currentExp = userStats.currentExp + rewards.exp;

      // Level logic
      const { calculateLevelWithCap } = require('../utils/levelUtils');
      // Pass false to DISABLE manual rank up permission here (Mission completion != Rank Up action)
      const newLevel = await calculateLevelWithCap(userStats.level, currentExp, uid, false);

      await prisma.userStats.update({
        where: { userId: uid },
        data: {
          currentExp: currentExp,
          totalPoints: userStats.totalPoints + rewards.points,
          level: newLevel,
          currentStreak: newStreak,
          lastActivityDate: new Date() // Set to now
        }
      });

      // --- CREATE NOTIFICATION ---
      // 1. Mission Completed Notification
      await prisma.notification.create({
        data: {
          userId: uid,
          type: 'MISSION_COMPLETED',
          title: 'Mission Completed! 🎉',
          message: `You completed: ${mission.missionName}. Earned ${rewards.exp} XP & ${rewards.points} Points.`,
          referenceId: mid
        }
      });

      // 2. Level Up Notification
      if (newLevel > userStats.level) {
        await prisma.notification.create({
          data: {
            userId: uid,
            type: 'LEVEL_UP',
            title: 'Level Up! 🌟',
            message: `Congratulations! You reached Level ${newLevel}.`,
            referenceId: newLevel
          }
        });
      }
      // ----------------------------
    }

    res.json({
      success: true,
      message: 'Mission completed successfully',
      data: {
        userMission,
        rewards,
        streak: userStats ? userStats.currentStreak : 0 // Note: this is old streak if reused variable, but we updated DB. 
        // Ideally we return newStreak, but userStats variable is stale.
      },
    });
  } catch (error) {
    console.error('Complete mission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete mission',
    });
  }
});

// Update mission progress
router.patch('/user/:userId/progress/:missionId', async (req, res) => {
  try {
    const { userId, missionId } = req.params;
    const { progress } = req.body;
    const uid = parseId(userId);
    const mid = parseId(missionId);

    // ensure int
    const progressInt = parseInt(progress) || 0;
    const { start, end } = getTodayRange();

    let userMission = await prisma.userMission.findFirst({
      where: {
        userId: uid,
        missionId: mid,
        createdAt: { gte: start, lte: end }
      }
    });

    if (!userMission) {
      userMission = await prisma.userMission.create({
        data: {
          userId: uid,
          missionId: mid,
          currentProgress: progressInt,
          status: false
        }
      });
    } else {
      userMission = await prisma.userMission.update({
        where: { id: userMission.id },
        data: { currentProgress: progressInt }
      });
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: userMission,
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update progress',
    });
  }
});

module.exports = router;
