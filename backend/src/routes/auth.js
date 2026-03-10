const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('DEBUG: Register Hit', req.body);
    console.log('DEBUG: JWT_SECRET exists?', !!process.env.JWT_SECRET);
    const { fullName, email, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Split fullName
    let firstName = 'User';
    let lastName = '';
    if (fullName) {
      const parts = fullName.trim().split(' ');
      if (parts.length > 0) firstName = parts[0];
      if (parts.length > 1) lastName = parts.slice(1).join(' ');
    }


    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user and stats transactionally (implicit by nested write)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'user',
        profileImg: '',
        userStats: {
          create: {
            level: 1,
            currentExp: 0,
            totalPoints: 0,
          }
        }
      },
      include: {
        userStats: true
      }
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id }, // Using integer ID
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie (Commented out for Mobile App compatibility)
    // res.cookie('userId', user.id.toString(), {
    //   httpOnly: true,
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    //   sameSite: 'lax',
    // });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        userId: user.id, // Keeping compatibility
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: { userStats: true } // Include stats if needed
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('userId', user.id.toString(), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        userId: user.id,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('userId');
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// Clerk Sync: Get or Create Internal User ID from Email
router.post('/clerk-sync', async (req, res) => {
  try {
    const { email, firstName, lastName, image, pushToken } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: email },
      include: { userStats: true }
    });

    if (!user) {
      console.log('Clerk Sync: Creating new user for', email);
      // Create new user if not exists (Auto-register via Clerk)
      // Hash a dummy password (they use Clerk to login anyway)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('clerk_auth_user_' + Date.now(), salt);

      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: firstName || 'User',
          lastName: lastName || '',
          role: 'user',
          profileImg: image || '',
          pushToken: pushToken || null,
          userStats: {
            create: {
              level: 1,
              currentExp: 0,
              totalPoints: 0,
            }
          }
        },
        include: { userStats: true }
      });
    } else {
      console.log('Clerk Sync: User found', user.id);
      // Optionally update profile image or push token if provided
      const updateData = {};
      if (image && user.profileImg !== image) updateData.profileImg = image;
      if (pushToken && user.pushToken !== pushToken) updateData.pushToken = pushToken;

      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });
      }
    }

    res.json({
      success: true,
      message: 'User synced successfully',
      user: {
        id: user.id, // THE INTERNAL INTEGER ID
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userStats: user.userStats
      }
    });
  } catch (error) {
    console.error('Clerk sync error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Clerk sync failed',
    });
  }
});

module.exports = router;
