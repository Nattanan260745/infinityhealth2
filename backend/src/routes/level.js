const express = require('express');
const prisma = require('../prisma'); // Use Prisma client

const router = express.Router();

// Helper to map Prisma Level to API format (snake_case)
const mapLevel = (level) => {
  if (!level) return null;
  return {
    ...level,
    level_id: level.levelNumber, // Map levelNumber to level_id
    min_exp: level.minExp,
    max_exp: level.maxExp,
    // Add other fields if needed by frontend
  };
};

// Get all levels
router.get('/', async (req, res) => {
  try {
    const levels = await prisma.level.findMany({
      orderBy: { levelNumber: 'asc' }
    });

    res.json({
      success: true,
      data: levels.map(mapLevel),
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
    const id = parseInt(levelId, 10);

    const level = await prisma.level.findFirst({
      where: { levelNumber: id }
    });

    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found',
      });
    }

    res.json({
      success: true,
      data: mapLevel(level),
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
    const expValue = parseInt(exp, 10);

    // Find level where minExp <= exp and maxExp >= exp
    const level = await prisma.level.findFirst({
      where: {
        minExp: { lte: expValue },
        maxExp: { gte: expValue },
      }
    });

    if (!level) {
      // If no level found (e.g. exceeded max level), get the highest level
      const highestLevel = await prisma.level.findFirst({
        orderBy: { levelNumber: 'desc' }
      });
      return res.json({
        success: true,
        data: mapLevel(highestLevel),
      });
    }

    res.json({
      success: true,
      data: mapLevel(level),
    });
  } catch (error) {
    console.error('Get level by exp error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get level',
    });
  }
});

// Create level (Admin) - Adapted for Prisma
router.post('/', async (req, res) => {
  try {
    const { level_id, name, title, color, hex_code, min_exp, max_exp } = req.body;

    const existingLevel = await prisma.level.findFirst({
      where: { levelNumber: level_id }
    });

    if (existingLevel) {
      return res.status(400).json({
        success: false,
        message: 'Level ID already exists',
      });
    }

    const level = await prisma.level.create({
      data: {
        levelNumber: level_id,
        levelName: name,
        titleTh: title,
        color: color,
        hexCode: hex_code,
        minExp: min_exp,
        maxExp: max_exp
      }
    });

    res.status(201).json({
      success: true,
      message: 'Level created successfully',
      data: mapLevel(level),
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
    const id = parseInt(levelId, 10);
    const { name, title, color, hex_code, min_exp, max_exp } = req.body;

    // Check existence by findFirst
    const existing = await prisma.level.findFirst({ where: { levelNumber: id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.levelName = name;
    if (title !== undefined) dataToUpdate.titleTh = title;
    if (color !== undefined) dataToUpdate.color = color;
    if (hex_code !== undefined) dataToUpdate.hexCode = hex_code;
    if (min_exp !== undefined) dataToUpdate.minExp = min_exp;
    if (max_exp !== undefined) dataToUpdate.maxExp = max_exp;

    const level = await prisma.level.update({
      where: { id: existing.id }, // Update by PK
      data: dataToUpdate
    });

    res.json({
      success: true,
      message: 'Level updated successfully',
      data: mapLevel(level),
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
    const id = parseInt(levelId, 10);

    const existing = await prisma.level.findFirst({ where: { levelNumber: id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }

    await prisma.level.delete({
      where: { id: existing.id }
    });

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
    // Implement if needed, but we already have data
    res.status(200).json({ message: 'Seeding skipped as data exists' });
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
});

module.exports = router;
