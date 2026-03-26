const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'neon-export.json');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Cannot find ${filePath}.`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log('Read JSON data. Starting FULL database import...');

  try {
    console.log(`Importing static categories...`);
    for (const lvl of data.levels) { await prisma.level.upsert({ where: { id: lvl.id }, update: lvl, create: lvl }); }
    for (const cat of data.exerciseCategories) { await prisma.exerciseCategory.upsert({ where: { id: cat.id }, update: cat, create: cat }); }
    for (const ex of data.exercises) { await prisma.exercise.upsert({ where: { id: ex.id }, update: ex, create: ex }); }
    for (const mission of data.missions) { await prisma.mission.upsert({ where: { id: mission.id }, update: mission, create: mission }); }

    console.log(`Importing users and core stats...`);
    for (const u of data.users) { await prisma.user.upsert({ where: { id: u.id }, update: u, create: u }); }
    for (const st of data.userStats) { await prisma.userStats.upsert({ where: { id: st.id }, update: st, create: st }); }

    console.log(`Importing associated user data (health tracking, routines, goals, missions, points, notifications)...`);
    for (const r of data.healthTracking) { await prisma.healthTracking.upsert({ where: { id: r.id }, update: r, create: r }); }
    for (const r of data.routines) { await prisma.routine.upsert({ where: { id: r.id }, update: r, create: r }); }
    for (const r of data.dailyGoals) { await prisma.dailyGoal.upsert({ where: { id: r.id }, update: r, create: r }); }
    for (const r of data.userMissions) { await prisma.userMission.upsert({ where: { id: r.id }, update: r, create: r }); }
    for (const r of data.pointHistory) { await prisma.pointHistory.upsert({ where: { id: r.id }, update: r, create: r }); }
    for (const r of data.notifications) { await prisma.notification.upsert({ where: { id: r.id }, update: r, create: r }); }

    console.log('Syncing PostgreSQL ID sequences...');
    const tables = [
      { name: 'levels', col: 'level_id' },
      { name: 'users', col: 'user_id' },
      { name: 'user_stats', col: 'stat_id' },
      { name: 'missions', col: 'mission_id' },
      { name: 'exercise_categories', col: 'category_id' },
      { name: 'exercise_videos', col: 'video_id' },
      { name: 'health_tracking', col: 'tracking_id' },
      { name: 'routines', col: 'routine_id' },
      { name: 'daily_goals', col: 'goal_id' },
      { name: 'user_missions', col: 'user_mission_id' },
      { name: 'point_history', col: 'history_id' },
      { name: 'notifications', col: 'notification_id' }
    ];

    for (const table of tables) {
      await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${table.name}"', '${table.col}'), coalesce(max(${table.col}),0) + 1, false) FROM "${table.name}";`);
    }

    console.log('✅ Import completely successful! ALL Neon DB data is now in your Local DB.');
  } catch (err) {
    console.error('❌ Error during import:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
