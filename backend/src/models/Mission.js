const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },

  type: {
    type: String,
    enum: ['daily', 'challenge'],
    required: true,
  },

  reward_exp: Number,

  reward_points: Number,

  start_time: String,  // เก็บเป็น "HH:MM" format

  end_time: String,  // เก็บเป็น "HH:MM" format

  description: String,

  // สำหรับ Challenge - ต้องมี level ขั้นต่ำถึงจะปลดล็อค
  min_level: {
    type: Number,
    default: 1,
  },

  // Target/Goal ของภารกิจ (เช่น ดื่มน้ำ 2000 ml)
  target_value: {
    type: Number,
    default: 1,
  },

  // หน่วยของ target (ml, steps, minutes, etc.)
  target_unit: {
    type: String,
    default: '',
  },

  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Mission', missionSchema);
