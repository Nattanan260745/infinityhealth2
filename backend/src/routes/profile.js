const express = require('express');
const Profile = require('../models/Profile');

const router = express.Router();

// Get profile by user ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let profile = await Profile.findOne({ user_id: userId });
    
    // If no profile exists, create one
    if (!profile) {
      profile = await Profile.create({ user_id: userId });
    }
    
    res.json({
      success: true,
      data: profile,
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
    const { level_id, exp, points, profile_img, bio } = req.body;
    
    let profile = await Profile.findOne({ user_id: userId });
    
    if (!profile) {
      profile = await Profile.create({ 
        user_id: userId,
        level_id,
        exp,
        points,
        profile_img,
        bio,
      });
    } else {
      if (level_id !== undefined) profile.level_id = level_id;
      if (exp !== undefined) profile.exp = exp;
      if (points !== undefined) profile.points = points;
      if (profile_img !== undefined) profile.profile_img = profile_img;
      if (bio !== undefined) profile.bio = bio;
      
      await profile.save();
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
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
    const { amount } = req.body;
    
    let profile = await Profile.findOne({ user_id: userId });
    
    if (!profile) {
      profile = await Profile.create({ user_id: userId });
    }
    
    profile.exp += amount || 0;
    
    // Level up logic (every 1000 exp = 1 level)
    const newLevel = Math.floor(profile.exp / 1000) + 1;
    if (newLevel > profile.level_id) {
      profile.level_id = newLevel;
    }
    
    await profile.save();
    
    res.json({
      success: true,
      message: 'Experience added successfully',
      data: profile,
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
    const { amount } = req.body;
    
    let profile = await Profile.findOne({ user_id: userId });
    
    if (!profile) {
      profile = await Profile.create({ user_id: userId });
    }
    
    profile.points += amount || 0;
    await profile.save();
    
    res.json({
      success: true,
      message: 'Points added successfully',
      data: profile,
    });
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add points',
    });
  }
});

module.exports = router;
