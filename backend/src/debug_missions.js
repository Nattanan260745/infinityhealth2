const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMissions() {
  try {
    const allMissions = await prisma.mission.findMany({
      where: { isActive: true }
    });
    console.log('--- All Active Missions ---');
    allMissions.forEach(m => {
      console.log(`ID: ${m.id}, Name: "${m.missionName}"`);
    });
    
    // Check all completed missions for today for ANY user
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    const completed = await prisma.userMission.findMany({
      where: {
        status: true,
        createdAt: { gte: start, lte: end }
      },
      include: { mission: true, user: { select: { id: true, username: true } } }
    });
    
    console.log('\n--- Completed Missions Today (All Users) ---');
    completed.forEach(um => {
      console.log(`- User ${um.userId} (${um.user.username}): ${um.mission.missionName} (Progress: ${um.currentProgress}/${um.mission.targetValue})`);
    });

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissions();
