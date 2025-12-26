const express = require('express');
const Level = require('../models/Level');

const router = express.Router();

// Get all levels
router.get('/', async (req, res) => {
  try {
    const levels = await Level.find().sort({ level_id: 1 });
    
    res.json({
      success: true,
      data: levels,
    });
  } catch (error) {
    console.error('Get levels error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get levels',
    });
  }
});

// Get level by level_id
router.get('/:levelId', async (req, res) => {
  try {
    const { levelId } = req.params;
    
    const level = await Level.findOne({ level_id: levelId });
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found',
      });
    }
    
    res.json({
      success: true,
      data: level,
    });
  } catch (error) {
    console.error('Get level error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get level',
    });
  }
});

// Get level by exp (find which level a user belongs to)
router.get('/exp/:exp', async (req, res) => {
  try {
    const { exp } = req.params;
    const expValue = parseInt(exp);
    
    const level = await Level.findOne({
      min_exp: { $lte: expValue },
      max_exp: { $gte: expValue },
    });
    
    if (!level) {
      // If no level found, get the highest level
      const highestLevel = await Level.findOne().sort({ level_id: -1 });
      return res.json({
        success: true,
        data: highestLevel,
      });
    }
    
    res.json({
      success: true,
      data: level,
    });
  } catch (error) {
    console.error('Get level by exp error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get level',
    });
  }
});

// Create level (Admin)
router.post('/', async (req, res) => {
  try {
    const { level_id, name, title, color, hex_code, min_exp, max_exp, required_points, required_exp } = req.body;
    
    // Check if level_id already exists
    const existingLevel = await Level.findOne({ level_id });
    if (existingLevel) {
      return res.status(400).json({
        success: false,
        message: 'Level ID already exists',
      });
    }
    
    const level = await Level.create({
      level_id,
      name,
      title,
      color,
      hex_code,
      min_exp,
      max_exp,
      required_points,
      required_exp,
    });
    
    res.status(201).json({
      success: true,
      message: 'Level created successfully',
      data: level,
    });
  } catch (error) {
    console.error('Create level error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create level',
    });
  }
});

// Update level (Admin)
router.put('/:levelId', async (req, res) => {
  try {
    const { levelId } = req.params;
    const { name, title, color, hex_code, min_exp, max_exp, required_points, required_exp } = req.body;
    
    const level = await Level.findOne({ level_id: levelId });
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found',
      });
    }
    
    if (name !== undefined) level.name = name;
    if (title !== undefined) level.title = title;
    if (color !== undefined) level.color = color;
    if (hex_code !== undefined) level.hex_code = hex_code;
    if (min_exp !== undefined) level.min_exp = min_exp;
    if (max_exp !== undefined) level.max_exp = max_exp;
    if (required_points !== undefined) level.required_points = required_points;
    if (required_exp !== undefined) level.required_exp = required_exp;
    
    await level.save();
    
    res.json({
      success: true,
      message: 'Level updated successfully',
      data: level,
    });
  } catch (error) {
    console.error('Update level error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update level',
    });
  }
});

// Delete level (Admin)
router.delete('/:levelId', async (req, res) => {
  try {
    const { levelId } = req.params;
    
    const level = await Level.findOneAndDelete({ level_id: levelId });
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Level deleted successfully',
    });
  } catch (error) {
    console.error('Delete level error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete level',
    });
  }
});

// Seed default levels (Admin)
router.post('/seed', async (req, res) => {
  try {
    const defaultLevels = [
      { level_id: 1, name: 'beginner', title: 'มือใหม่เพิ่งเริ่มต้น', color: 'white', hex_code: '#FFFFFF', min_exp: 0, max_exp: 500, required_points: 0, required_exp: 0 },
      { level_id: 2, name: 'novice', title: 'เริ่มคุ้นเคย', color: 'green', hex_code: '#4CAF50', min_exp: 501, max_exp: 1500, required_points: 200, required_exp: 500 },
      { level_id: 3, name: 'intermediate', title: 'ระดับกลาง', color: 'blue', hex_code: '#2196F3', min_exp: 1501, max_exp: 3000, required_points: 500, required_exp: 1500 },
      { level_id: 4, name: 'advanced', title: 'ระดับสูง', color: 'purple', hex_code: '#9C27B0', min_exp: 3001, max_exp: 5000, required_points: 1000, required_exp: 3000 },
      { level_id: 5, name: 'expert', title: 'ผู้เชี่ยวชาญ', color: 'orange', hex_code: '#FF9800', min_exp: 5001, max_exp: 8000, required_points: 2000, required_exp: 5000 },
      { level_id: 6, name: 'master', title: 'ปรมาจารย์', color: 'gold', hex_code: '#FFD700', min_exp: 8001, max_exp: 999999, required_points: 5000, required_exp: 8000 },
    ];
    
    // Clear existing levels and insert new ones
    await Level.deleteMany({});
    await Level.insertMany(defaultLevels);
    
    res.status(201).json({
      success: true,
      message: 'Default levels seeded successfully',
      data: defaultLevels,
    });
  } catch (error) {
    console.error('Seed levels error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to seed levels',
    });
  }
});

module.exports = router;
