const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  level_id: {
    type: Number,
    default: 1,  // ผู้ใช้ใหม่เริ่มที่ level 1
  },
  exp: {
    type: Number,
    default: 0,  // ผู้ใช้ใหม่เริ่มที่ 0 exp
  },
  points: {
    type: Number,
    default: 0,  // ผู้ใช้ใหม่เริ่มที่ 0 points
  },
  profile_img: {
    type: String,
  },
  bio: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Profile', profileSchema);
