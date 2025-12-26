const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  avatar: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Auto-generate userId before saving (u000001, u000002, ...)
userSchema.pre('save', async function(next) {
  if (!this.userId) {
    const lastUser = await mongoose.model('User').findOne().sort({ userId: -1 });
    
    if (lastUser && lastUser.userId) {
      // Extract number from last userId (e.g., "u000001" -> 1)
      const lastNumber = parseInt(lastUser.userId.substring(1));
      const newNumber = lastNumber + 1;
      this.userId = 'u' + newNumber.toString().padStart(6, '0');
    } else {
      this.userId = 'u000001';
    }
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
