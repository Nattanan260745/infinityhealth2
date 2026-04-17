const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function masterFix() {
  try {
    console.log('--- [MASTER FIX] Scanning Database ---');
    
    // 1. Find the latest active user
    const latestUser = await prisma.userStats.findFirst({
      orderBy: { lastActivityDate: 'desc' },
      include: { user: true }
    });
    
    if (!latestUser) {
      console.log('No active user found.');
      return;
    }
    
    const userId = latestUser.userId;
    console.log(`Active User ID: ${userId} (${latestUser.user.firstName || 'User'})`);

    // 2. Find ALL missions that might be the Streak Mission
    const streakMissions = await prisma.mission.findMany({
      where: { missionName: { contains: 'รักษาความสม่ำเสมอ' } }
    });
    
    console.log(`\nFound ${streakMissions.length} matching missions:`);
    streakMissions.forEach(m => console.log(` - ID: ${m.id}, Name: "${m.missionName}"`));
    
    const streakIds = streakMissions.map(m => m.id);

    // 3. Find today's UserMission records for these IDs
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const userMissions = await prisma.userMission.findMany({
      where: {
        userId: userId,
        missionId: { in: streakIds },
        createdAt: { gte: start, lte: end }
      }
    });

    console.log(`\nFound ${userMissions.length} streak mission records for today:`);
    for (const um of userMissions) {
      console.log(` - Record ID: ${um.id}, Mission ID: ${um.missionId}, Progress: ${um.currentProgress}, Status: ${um.status}`);
      
      // 4. FORCE FIX: If progress > 3, update it now
      if (um.currentProgress > 3) {
        console.log(`   >>> FORCING FIX for Record ID ${um.id}: setting progress to 3`);
        await prisma.userMission.update({
          where: { id: um.id },
          data: { currentProgress: 3 }
        });
      }
    }
    
    if (userMissions.length === 0) {
      console.log('No records found for today. Checking without date filter...');
      const allStreak = await prisma.userMission.findMany({
        where: { userId, missionId: { in: streakIds } },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      allStreak.forEach(um => console.log(` - ID: ${um.id}, CreatedAt: ${um.createdAt}, Progress: ${um.currentProgress}`));
    }

    console.log('\n--- [MASTER FIX] Done ---');

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

masterFix();
