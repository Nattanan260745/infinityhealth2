const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  
  try {
    // Core
    const users = await prisma.user.findMany();
    const userStats = await prisma.userStats.findMany();
    const levels = await prisma.level.findMany();
    const missions = await prisma.mission.findMany();
    const exerciseCategories = await prisma.exerciseCategory.findMany();
    const exercises = await prisma.exercise.findMany();

    // Associated Data
    const healthTracking = await prisma.healthTracking.findMany();
    const routines = await prisma.routine.findMany();
    const dailyGoals = await prisma.dailyGoal.findMany();
    const userMissions = await prisma.userMission.findMany();
    const pointHistory = await prisma.pointHistory.findMany();
    const notifications = await prisma.notification.findMany();
    
    const data = {
      users,
      userStats,
      levels,
      missions,
      exerciseCategories,
      exercises,
      healthTracking,
      routines,
      dailyGoals,
      userMissions,
      pointHistory,
      notifications
    };
    
    const outPath = path.join(__dirname, 'neon-export.json');
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Exported ${users.length} users and ALL related data (Health: ${healthTracking.length}, Routines: ${routines.length}, Goals: ${dailyGoals.length}, UserMissions: ${userMissions.length}, PointHistory: ${pointHistory.length}, Notifications: ${notifications.length})`);
  } catch (error) {
    console.error('Failed to export:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
