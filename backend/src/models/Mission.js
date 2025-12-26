const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },

  type: String,

  reward_exp: Number,

  reward_points: Number,

  start_time: String,  // เก็บเป็น "HH:MM" format

  end_time: String,  // เก็บเป็น "HH:MM" format

  description: String,

  is_active: {
    type: Boolean,
    default: true,  // logical default
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Mission', missionSchema);
