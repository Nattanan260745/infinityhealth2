const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Helper: Get integer ID
const parseId = (id) => parseInt(id, 10);

// Get all exercises
router.get('/', async (req, res) => {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { id: 'desc' } // Prisma uses 'id', not 'createdAt' usually, unless we added createdAt. 
      // Schema doesn't have createdAt for Exercise, so we sort by ID desc.
    });

    const formattedExercises = exercises.map(ex => ({
      ...ex,
      type: ex.bodyPart
    }));

    res.json({
      success: true,
      data: formattedExercises,
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

    const exercises = await prisma.exercise.findMany({
      where: { bodyPart: type },
      orderBy: { id: 'desc' }
    });

    const formattedExercises = exercises.map(ex => ({
      ...ex,
      type: ex.bodyPart
    }));

    res.json({
      success: true,
      data: formattedExercises,
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

    const exercises = await prisma.exercise.findMany({
      where: { difficulty: difficulty },
      orderBy: { id: 'desc' }
    });

    const formattedExercises = exercises.map(ex => ({
      ...ex,
      type: ex.bodyPart
    }));

    res.json({
      success: true,
      data: formattedExercises,
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
    if (type) filter.bodyPart = type;
    if (difficulty) filter.difficulty = difficulty;

    const exercises = await prisma.exercise.findMany({
      where: filter,
      orderBy: { id: 'desc' }
    });

    const formattedExercises = exercises.map(ex => ({
      ...ex,
      type: ex.bodyPart
    }));

    res.json({
      success: true,
      data: formattedExercises,
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
    const id = parseId(exerciseId);

    const exercise = await prisma.exercise.findUnique({
      where: { id: id }
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    res.json({
      success: true,
      data: {
        ...exercise,
        type: exercise.bodyPart
      },
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
    const { 
      type, 
      difficulty, 
      title, 
      description, 
      video_url, 
      videoUrl, 
      thumbnail, 
      video_thumbnail,
      difficulty_level,
      bodyPart: reqBodyPart,
      duration, 
      duration_minutes 
    } = req.body;

    const exercise = await prisma.exercise.create({
      data: {
        title,
        categoryId: 1, // Default category
        videoUrl: videoUrl || video_url,
        thumbnail: thumbnail || video_thumbnail,
        difficulty: difficulty || difficulty_level || 'beginner',
        bodyPart: type || reqBodyPart || 'cardio',
        duration: duration ? parseInt(duration) : (duration_minutes ? parseInt(duration_minutes) : 0),
        description,
      },
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
    const id = parseId(exerciseId);
    const { type, difficulty, title, description, video_url, thumbnail, duration } = req.body;

    const dataToUpdate = {};
    if (type !== undefined) dataToUpdate.bodyPart = type;
    if (difficulty !== undefined) dataToUpdate.difficulty = difficulty;
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (video_url !== undefined) dataToUpdate.videoUrl = video_url;
    if (thumbnail !== undefined) dataToUpdate.thumbnail = thumbnail;
    if (duration !== undefined) dataToUpdate.duration = parseInt(duration) || 0;

    const exercise = await prisma.exercise.update({
      where: { id: id },
      data: dataToUpdate
    });

    res.json({
      success: true,
      message: 'Exercise updated successfully',
      data: exercise,
    });
  } catch (error) {
    console.error('Update exercise error:', error);
    // Handle record not found
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }
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
    const id = parseId(exerciseId);

    await prisma.exercise.delete({
      where: { id: id }
    });

    res.json({
      success: true,
      message: 'Exercise deleted successfully',
    });
  } catch (error) {
    console.error('Delete exercise error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete exercise',
    });
  }
});

module.exports = router;
