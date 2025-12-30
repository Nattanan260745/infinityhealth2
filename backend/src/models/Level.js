const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  level_id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Level name is required'],
    trim: true,
  },
  title: {
    type: String,
  },
  title_th: {
    type: String,
  },
  color: {
    type: String,
  },
  hex_code: {
    type: String,
  },
  min_exp: {
    type: Number,
  },
  max_exp: {
    type: Number,
  },
  required_points: {
    type: Number,
  },
  required_exp: {
    type: Number,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Level', levelSchema);
