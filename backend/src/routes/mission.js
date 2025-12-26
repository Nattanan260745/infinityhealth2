const express = require('express');
const Mission = require('../models/Mission');
const UserMission = require('../models/UserMission');
const Profile = require('../models/Profile');

const router = express.Router();

// Get all missions
router.get('/', async (req, res) => {
  try {
    const missions = await Mission.find({ is_active: true })
      .sort({ type: 1, createdAt: -1 });
    
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
    
    const missions = await Mission.find({ type, is_active: true })
      .sort({ createdAt: -1 });
    
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
    
    const mission = await Mission.findById(missionId);
    
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
    const { title, type, reward_exp, reward_points, start_time, end_time, description } = req.body;
    
    const mission = await Mission.create({
      title,
      type,
      reward_exp,
      reward_points,
      start_time,
      end_time,
      description,
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
    const { title, type, reward_exp, reward_points, start_time, end_time, description, is_active } = req.body;
    
    const mission = await Mission.findById(missionId);
    
    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found',
      });
    }
    
    if (title !== undefined) mission.title = title;
    if (type !== undefined) mission.type = type;
    if (reward_exp !== undefined) mission.reward_exp = reward_exp;
    if (reward_points !== undefined) mission.reward_points = reward_points;
    if (start_time !== undefined) mission.start_time = start_time;
    if (end_time !== undefined) mission.end_time = end_time;
    if (description !== undefined) mission.description = description;
    if (is_active !== undefined) mission.is_active = is_active;
    
    await mission.save();
    
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
    
    const mission = await Mission.findByIdAndDelete(missionId);
    
    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found',
      });
    }
    
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

// === User Mission Routes ===

// Get user's missions with status
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get all active missions
    const missions = await Mission.find({ is_active: true });
    
    // Get user's completed missions for today
    const userMissions = await UserMission.find({
      user_id: userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
    
    // Combine data
    const missionsWithStatus = missions.map(mission => {
      const userMission = userMissions.find(
        um => um.mission_id.toString() === mission._id.toString()
      );
      
      return {
        ...mission.toObject(),
        user_status: userMission ? {
          mission_status: userMission.mission_status,
          progress: userMission.progress,
          completed_at: userMission.completed_at,
        } : {
          mission_status: null,
          progress: '',
          completed_at: null,
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
    
    // Check if mission exists
    const mission = await Mission.findById(missionId);
    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found',
      });
    }
    
    // Check if user already started this mission today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const existingUserMission = await UserMission.findOne({
      user_id: userId,
      mission_id: missionId,
      createdAt: { $gte: startOfDay },
    });
    
    if (existingUserMission) {
      return res.status(400).json({
        success: false,
        message: 'Mission already started today',
        data: existingUserMission,
      });
    }
    
    // Create user mission
    const userMission = await UserMission.create({
      user_id: userId,
      mission_id: missionId,
      mission_status: 'in_progress',
      progress: '',
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
    
    // Get today's user mission
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    let userMission = await UserMission.findOne({
      user_id: userId,
      mission_id: missionId,
      createdAt: { $gte: startOfDay },
    });
    
    // If not started, create and complete
    if (!userMission) {
      userMission = await UserMission.create({
        user_id: userId,
        mission_id: missionId,
        mission_status: 'completed',
        progress: '100/100',
        completed_at: new Date(),
      });
    } else if (userMission.mission_status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Mission already completed',
      });
    } else {
      userMission.mission_status = 'completed';
      userMission.progress = '100/100';
      userMission.completed_at = new Date();
      await userMission.save();
    }
    
    // Get mission to add rewards
    const mission = await Mission.findById(missionId);
    
    if (mission) {
      // Add rewards to user profile
      let profile = await Profile.findOne({ user_id: userId });
      
      if (profile) {
        profile.exp += mission.reward_exp;
        profile.points += mission.reward_points;
        
        // Level up logic
        const newLevel = Math.floor(profile.exp / 1000) + 1;
        if (newLevel > profile.level_id) {
          profile.level_id = newLevel;
        }
        
        await profile.save();
      }
    }
    
    res.json({
      success: true,
      message: 'Mission completed successfully',
      data: {
        userMission,
        rewards: {
          exp: mission?.reward_exp || 0,
          points: mission?.reward_points || 0,
        },
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
    const { progress, mission_status } = req.body;
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    let userMission = await UserMission.findOne({
      user_id: userId,
      mission_id: missionId,
      createdAt: { $gte: startOfDay },
    });
    
    if (!userMission) {
      userMission = await UserMission.create({
        user_id: userId,
        mission_id: missionId,
        progress: progress || '',
        mission_status: mission_status || 'in_progress',
      });
    } else {
      if (progress !== undefined) userMission.progress = progress;
      if (mission_status !== undefined) userMission.mission_status = mission_status;
      await userMission.save();
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

// Mark mission as failed
router.patch('/user/:userId/fail/:missionId', async (req, res) => {
  try {
    const { userId, missionId } = req.params;
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    let userMission = await UserMission.findOne({
      user_id: userId,
      mission_id: missionId,
      createdAt: { $gte: startOfDay },
    });
    
    if (!userMission) {
      userMission = await UserMission.create({
        user_id: userId,
        mission_id: missionId,
        mission_status: 'failed',
      });
    } else {
      userMission.mission_status = 'failed';
      await userMission.save();
    }
    
    res.json({
      success: true,
      message: 'Mission marked as failed',
      data: userMission,
    });
  } catch (error) {
    console.error('Fail mission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update mission',
    });
  }
});

module.exports = router;
