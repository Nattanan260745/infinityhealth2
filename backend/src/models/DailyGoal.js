const mongoose = require('mongoose');

const dailyGoalSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  goal_date: {
    type: Date,
    required: [true, 'Goal date is required'],
    default: Date.now,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('DailyGoal', dailyGoalSchema);
