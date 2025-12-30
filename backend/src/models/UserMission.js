const mongoose = require('mongoose');

const userMissionSchema = new mongoose.Schema({
  user_id: {
    type: String,  // ใช้ custom userId (เช่น "u000004")
    required: true,
  },
  mission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: true,
  },
  progress: {
    type: String,  // เช่น "จำนวนก้าว 50/100"
    default: '',
  },
  mission_status: {
    type: String,
    enum: ['in_progress', 'completed', 'failed'],
    default: 'in_progress',
  },
  completed_at: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Compound index เพื่อให้ user ทำภารกิจเดียวกันซ้ำได้ (ต่อวัน)
userMissionSchema.index({ user_id: 1, mission_id: 1, createdAt: 1 });

module.exports = mongoose.model('UserMission', userMissionSchema);
