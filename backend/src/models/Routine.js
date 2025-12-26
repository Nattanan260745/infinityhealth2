const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  scheduled_time: {
    type: String,  // เก็บเป็น "HH:MM" format
    required: [true, 'Scheduled time is required'],
  },
  scheduled_date: {
    type: Date,
    default: Date.now,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Routine', routineSchema);
