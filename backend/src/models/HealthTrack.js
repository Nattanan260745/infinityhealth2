const mongoose = require('mongoose');

const healthTrackSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  weight: {
    type: Number,  // น้ำหนัก (kg)
  },
  height: {
    type: Number,  // ส่วนสูง (cm)
  },
  water_glass: {
    type: Number,  // ปริมาณน้ำที่ดื่ม (แก้ว)
  },
  sleep_hours: {
    type: Number,  // ชั่วโมงการนอน
  },
  steps: {
    type: Number,  // จำนวนก้าว
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('HealthTrack', healthTrackSchema);
