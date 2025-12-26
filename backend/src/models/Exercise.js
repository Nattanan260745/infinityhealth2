const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['cardio', 'weight'],
    required: [true, 'Exercise type is required'],
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Difficulty is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
  },
  video_url: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Exercise', exerciseSchema);
