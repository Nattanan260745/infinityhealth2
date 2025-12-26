const express = require('express');
const Exercise = require('../models/Exercise');

const router = express.Router();

// Get all exercises
router.get('/', async (req, res) => {
  try {
    const exercises = await Exercise.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get exercises',
    });
  }
});

// Get exercises by type (cardio/weight)
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    const exercises = await Exercise.find({ type }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    console.error('Get exercises by type error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get exercises',
    });
  }
});

// Get exercises by difficulty (easy/medium/hard)
router.get('/difficulty/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    
    const exercises = await Exercise.find({ difficulty }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    console.error('Get exercises by difficulty error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get exercises',
    });
  }
});

// Get exercises by type and difficulty
router.get('/filter', async (req, res) => {
  try {
    const { type, difficulty } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    
    const exercises = await Exercise.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    console.error('Get filtered exercises error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get exercises',
    });
  }
});

// Get single exercise
router.get('/:exerciseId', async (req, res) => {
  try {
    const { exerciseId } = req.params;
    
    const exercise = await Exercise.findById(exerciseId);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }
    
    res.json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get exercise',
    });
  }
});

// Create exercise (Admin)
router.post('/', async (req, res) => {
  try {
    const { type, difficulty, title, description, video_url } = req.body;
    
    const exercise = await Exercise.create({
      type,
      difficulty,
      title,
      description,
      video_url,
    });
    
    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      data: exercise,
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create exercise',
    });
  }
});

// Update exercise (Admin)
router.put('/:exerciseId', async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { type, difficulty, title, description, video_url } = req.body;
    
    const exercise = await Exercise.findById(exerciseId);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }
    
    if (type !== undefined) exercise.type = type;
    if (difficulty !== undefined) exercise.difficulty = difficulty;
    if (title !== undefined) exercise.title = title;
    if (description !== undefined) exercise.description = description;
    if (video_url !== undefined) exercise.video_url = video_url;
    
    await exercise.save();
    
    res.json({
      success: true,
      message: 'Exercise updated successfully',
      data: exercise,
    });
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update exercise',
    });
  }
});

// Delete exercise (Admin)
router.delete('/:exerciseId', async (req, res) => {
  try {
    const { exerciseId } = req.params;
    
    const exercise = await Exercise.findByIdAndDelete(exerciseId);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Exercise deleted successfully',
    });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete exercise',
    });
  }
});

module.exports = router;
