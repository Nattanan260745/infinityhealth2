const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Levels
  console.log('Creating Levels...');
  const levels = [];

  // Define Color Hex Codes
  const getLevelColor = (lvl) => {
    if (lvl <= 10) return '#CD7F32'; // Bronze
    if (lvl <= 20) return '#C0C0C0'; // Silver
    if (lvl <= 30) return '#FFD700'; // Gold
    if (lvl <= 40) return '#E5E4E2'; // Platinum
    if (lvl <= 50) return '#50C878'; // Emerald
    if (lvl <= 60) return '#0F52BA'; // Sapphire
    if (lvl <= 70) return '#E0115F'; // Ruby
    if (lvl <= 80) return '#9966CC'; // Amethyst
    if (lvl <= 90) return '#00CED1'; // Diamond
    if (lvl <= 99) return '#1C1C1C'; // Obsidian
    if (lvl === 100) return '#FF00FF'; // Infinity
    return '#FFFFFF';
  };

  // Define Color Names (Text)
  const getLevelColorName = (lvl) => {
    if (lvl <= 10) return 'Bronze';
    if (lvl <= 20) return 'Silver';
    if (lvl <= 30) return 'Gold';
    if (lvl <= 40) return 'Platinum';
    if (lvl <= 50) return 'Emerald';
    if (lvl <= 60) return 'Sapphire';
    if (lvl <= 70) return 'Ruby';
    if (lvl <= 80) return 'Amethyst';
    if (lvl <= 90) return 'Diamond';
    if (lvl <= 99) return 'Obsidian';
    if (lvl === 100) return 'Infinity';
    return 'Unknown';
  };

  const getLevelName = (lvl) => {
    if (lvl <= 10) return `Beginner ${lvl}`;
    if (lvl <= 20) return `Rookie ${lvl}`;
    if (lvl <= 30) return `Regular ${lvl}`;
    if (lvl <= 40) return `Advanced ${lvl}`;
    if (lvl <= 50) return `Veteran ${lvl}`;
    if (lvl <= 60) return `Elite ${lvl}`;
    if (lvl <= 70) return `Master ${lvl}`;
    if (lvl <= 80) return `Grandmaster ${lvl}`;
    if (lvl <= 90) return `Legend ${lvl}`;
    if (lvl <= 99) return `Titan ${lvl}`;
    if (lvl === 100) return `Infinity God`;
    return `Level ${lvl}`;
  };

  for (let i = 1; i <= 100; i++) {
    levels.push({
      levelNumber: i,
      levelName: getLevelName(i),
      minExp: (i - 1) * 1000,
      maxExp: i * 1000 - 1,
      colorHex: getLevelColor(i),
      colorName: getLevelColorName(i)
    });
  }

  for (const lvl of levels) {
    await prisma.level.upsert({
      where: { id: lvl.levelNumber },
      update: {
        levelName: lvl.levelName,
        hexCode: lvl.colorHex,
        color: lvl.colorName, // Update text name
        titleTh: `เลเวล ${lvl.levelNumber}`
      },
      create: {
        levelNumber: lvl.levelNumber,
        levelName: lvl.levelName,
        minExp: lvl.minExp,
        maxExp: lvl.maxExp,
        titleTh: `เลเวล ${lvl.levelNumber}`,
        hexCode: lvl.colorHex,
        color: lvl.colorName // Create with text name
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
            stepsCount: steps
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
    { name: 'Ironman Challenge', type: 'CHALLENGE', target: 100, unit: 'km', exp: 1000, points: 200, level: 10 },
    { name: 'Titan Challenge', type: 'CHALLENGE', target: 500, unit: 'km', exp: 5000, points: 500, level: 20 },
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

  // 5. Create Exercise Categories & Videos
  console.log('Creating Exercises...');
  const categories = [
    { name: 'Cardio', icon: 'https://cdn-icons-png.flaticon.com/512/2548/2548536.png' },
    { name: 'Strength', icon: 'https://cdn-icons-png.flaticon.com/512/2548/2548455.png' },
    { name: 'Yoga', icon: 'https://cdn-icons-png.flaticon.com/512/2548/2548515.png' }
  ];

  for (const cat of categories) {
    const createdCat = await prisma.exerciseCategory.create({
      data: { categoryName: cat.name, iconUrl: cat.icon }
    });

    // Create Sample Videos for each category
    const videos = [];
    if (cat.name === 'Cardio') {
      videos.push(
        { title: 'HIIT Workout', url: 'https://www.youtube.com/watch?v=BdqQhC_8E5g', thumb: 'https://img.youtube.com/vi/BdqQhC_8E5g/hqdefault.jpg', difficulty: 'Hard', duration: 20, bodyPart: 'cardio' },
        { title: 'Running Basics', url: 'https://www.youtube.com/watch?v=_kGESn8ArrU', thumb: 'https://img.youtube.com/vi/_kGESn8ArrU/hqdefault.jpg', difficulty: 'Easy', duration: 15, bodyPart: 'cardio' }
      );
    } else if (cat.name === 'Strength') {
      videos.push(
        { title: 'Full Body Workout', url: 'https://www.youtube.com/watch?v=UItWltVZZmE', thumb: 'https://img.youtube.com/vi/UItWltVZZmE/hqdefault.jpg', difficulty: 'Medium', duration: 30, bodyPart: 'weight_full_body' },
        { title: 'Push Up Guide', url: 'https://www.youtube.com/watch?v=IODxDxX7oi4', thumb: 'https://img.youtube.com/vi/IODxDxX7oi4/hqdefault.jpg', difficulty: 'Medium', duration: 10, bodyPart: 'weight_upper_body' }
      );
    } else {
      videos.push(
        { title: 'Morning Yoga', url: 'https://www.youtube.com/watch?v=sTANio_2E0Q', thumb: 'https://img.youtube.com/vi/sTANio_2E0Q/hqdefault.jpg', difficulty: 'Easy', duration: 15, bodyPart: 'weight_core' },
        { title: 'Stretching for Beginners', url: 'https://www.youtube.com/watch?v=g_tea8ZNk5A', thumb: 'https://img.youtube.com/vi/g_tea8ZNk5A/hqdefault.jpg', difficulty: 'Easy', duration: 10, bodyPart: 'weight_full_body' }
      );
    }

    for (const v of videos) {
      await prisma.exercise.create({
        data: {
          categoryId: createdCat.id,
          title: v.title,
          videoUrl: v.url,
          thumbnail: v.thumb,
          difficulty: v.difficulty,
          bodyPart: v.bodyPart,
          duration: v.duration,
          description: `A great ${v.difficulty} ${cat.name} workout.`
        }
      });
    }
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
