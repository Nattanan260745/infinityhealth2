const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Levels
  console.log('Creating Levels...');
  const levels = [];
  for (let i = 1; i <= 20; i++) {
    levels.push({
      levelNumber: i,
      levelName: `Level ${i}`,
      minExp: (i - 1) * 1000,
      maxExp: i * 1000 - 1,
    });
  }

  for (const lvl of levels) {
    await prisma.level.upsert({
      where: { id: lvl.levelNumber }, // Assuming id maps to levelNumber roughly, or findFirst
      update: {}, // Don't update if exists
      create: {
        levelNumber: lvl.levelNumber,
        levelName: lvl.levelName,
        minExp: lvl.minExp,
        maxExp: lvl.maxExp,
        titleTh: `เลเวล ${lvl.levelNumber}`,
        hexCode: '#FFD700'
      }
    });
  }

  // 2. Fetch All Keys Users to Seed Data For
  console.log('Fetching all users...');
  let users = await prisma.user.findMany();

  // If no users, create one
  if (users.length === 0) {
    console.log('No users found. Creating Test User...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    const newUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date('1995-01-01'),
        gender: 'male',
        role: 'user',
        userStats: {
          create: {
            level: 5,
            currentExp: 2500,
            totalPoints: 500,
            currentStreak: 7,
            lastActivityDate: new Date()
          }
        }
      },
      include: { userStats: true }
    });
    users = [newUser];
  }

  console.log(`Found ${users.length} users to seed.`);

  // 3. Create Health Sample Data (Past 30 Days) for EACH user
  const today = new Date();

  for (const user of users) {
    console.log(`Generating data for user: ${user.firstName} (ID: ${user.id})`);
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(12, 0, 0, 0); // Noon

      // Randomize data
      const weight = 70 + (Math.random() * 2 - 1); // 69-71 range
      const sleep = 6 + Math.random() * 3; // 6-9 hours
      const water = Math.floor(1500 + Math.random() * 1000); // 1500-2500 ml
      const steps = Math.floor(3000 + Math.random() * 7000); // 3000-10000 steps
      const moodEnum = ['Happy', 'Sad', 'Neutral', 'Excited', 'Tired'];
      const mood = moodEnum[Math.floor(Math.random() * moodEnum.length)];

      // Check existing
      const existing = await prisma.healthTracking.findFirst({
        where: {
          userId: user.id,
          trackingDate: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999))
          }
        }
      });

      if (!existing) {
        await prisma.healthTracking.create({
          data: {
            userId: user.id,
            trackingDate: new Date(today.getTime() - i * 24 * 60 * 60 * 1000), // Reset date
            weight: parseFloat(weight.toFixed(1)),
            height: 175,
            water: water,
            sleepHours: parseFloat(sleep.toFixed(1)),
            stepsCount: steps,
            mood: mood
          }
        });
      }
    }
  }

  // 4. Create Missions
  console.log('Creating Missions...');
  const missions = [
    { name: 'Drink Water', type: 'DAILY', target: 2000, unit: 'ml', exp: 50, points: 10 },
    { name: 'Walk 10k', type: 'DAILY', target: 10000, unit: 'steps', exp: 100, points: 20 },
    { name: 'Sleep 8 Hours', type: 'DAILY', target: 8, unit: 'hours', exp: 80, points: 15 },
    { name: 'Marathon Challenge', type: 'CHALLENGE', target: 42, unit: 'km', exp: 500, points: 100, level: 5 },
  ];

  for (const m of missions) {
    await prisma.mission.create({
      data: {
        missionName: m.name,
        missionType: m.type,
        requiredLevel: m.level || 1,
        rewardExp: m.exp,
        rewardPoints: m.points,
        targetValue: m.target,
        targetUnit: m.unit,
        isActive: true
      }
    });
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
