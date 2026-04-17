const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Seeding...');

  // 1. Seed Levels (1-100)
  const levelCount = await prisma.level.count();
  if (levelCount === 0) {
    console.log('📊 Seeding Levels...');
    const levels = [];
    for (let i = 1; i <= 100; i++) {
      levels.push({
        levelNumber: i,
        levelName: `Level ${i}`,
        titleTh: i <= 10 ? 'มือใหม่' : i <= 30 ? 'ผู้พัฒนา' : i <= 60 ? 'ผู้เชี่ยวชาญ' : 'ตำนาน',
        minExp: (i - 1) * 1000,
        maxExp: i * 1000 - 1,
        color: '#7DD1E0',
        hexCode: '#7DD1E0'
      });
    }
    await prisma.level.createMany({ data: levels });
  }

  // 2. Seed Exercise Categories
  const catCount = await prisma.exerciseCategory.count();
  if (catCount === 0) {
    console.log('📂 Seeding Exercise Categories...');
    await prisma.exerciseCategory.createMany({
      data: [
        { id: 1, categoryName: 'Cardio' },
        { id: 2, categoryName: 'Strength' },
        { id: 3, categoryName: 'Flexibility' },
        { id: 4, categoryName: 'Yoga' }
      ]
    });
  }

  // 3. Seed Exercises (Clips)
  const exCount = await prisma.exercise.count();
  if (exCount === 0) {
    console.log('🎬 Seeding Exercises...');
    await prisma.exercise.createMany({
      data: [
        {
          title: 'Morning Cardio Blast',
          categoryId: 1,
          videoUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
          thumbnail: 'https://img.youtube.com/vi/ml6cT4AZdqI/maxresdefault.jpg',
          difficulty: 'beginner',
          bodyPart: 'Cardio',
          duration: 15,
          description: 'A quick 15-minute cardio session to start your day with energy.'
        },
        {
          title: 'Full Body Strength',
          categoryId: 2,
          videoUrl: 'https://www.youtube.com/watch?v=q20pLhdoEno',
          thumbnail: 'https://img.youtube.com/vi/q20pLhdoEno/maxresdefault.jpg',
          difficulty: 'intermediate',
          bodyPart: 'Full Body',
          duration: 30,
          description: 'Build muscle and strength with this comprehensive full body workout.'
        },
        {
          title: '10 Minute Abs Workout',
          categoryId: 2,
          videoUrl: 'https://www.youtube.com/watch?v=1f8yoFFdkLU',
          thumbnail: 'https://img.youtube.com/vi/1f8yoFFdkLU/maxresdefault.jpg',
          difficulty: 'beginner',
          bodyPart: 'Abs',
          duration: 10,
          description: 'Get those abs burning with this intense 10-minute core session.'
        }
      ]
    });
  }

  // 4. Seed Missions
  const missionCount = await prisma.mission.count();
  if (missionCount === 0) {
    console.log('🎯 Seeding Missions...');
    await prisma.mission.createMany({
      data: [
        {
          missionName: 'ดื่มน้ำ 8 แก้ว',
          missionType: 'DAILY',
          requiredLevel: 1,
          rewardExp: 100,
          rewardPoints: 10,
          targetValue: 8,
          targetUnit: 'แก้ว',
          description: 'รักษาความชุ่มชื้นของร่างกายด้วยการดื่มน้ำให้ครบ 8 แก้วต่อวัน',
          isActive: true
        },
        {
          missionName: 'เดิน 5,000 ก้าว',
          missionType: 'DAILY',
          requiredLevel: 1,
          rewardExp: 200,
          rewardPoints: 20,
          targetValue: 5000,
          targetUnit: 'ก้าว',
          description: 'ขยับร่างกายให้มากขึ้นด้วยการเดินให้ครบ 5,000 ก้าว',
          isActive: true
        },
        {
          missionName: 'ออกกำลังกายครบ 30 นาที',
          missionType: 'DAILY',
          requiredLevel: 1,
          rewardExp: 300,
          rewardPoints: 50,
          targetValue: 30,
          targetUnit: 'นาที',
          description: 'เผาผลาญแคลอรี่ด้วยการออกกำลังกายต่อเนื่อง 30 นาที',
          isActive: true
        },
        {
          missionName: 'พิชิตเลเวล 1: ก้าวแรกสู่สุขภาพดี',
          missionType: 'CHALLENGE',
          requiredLevel: 1,
          rewardExp: 500,
          rewardPoints: 100,
          targetValue: 1,
          targetUnit: 'ครั้ง',
          description: 'ออกกำลังกายตามคลิปใดก็ได้ 1 ครั้ง เพื่อผ่านเลเวล 1',
          isActive: true
        }
      ]
    });
  }

  console.log('✅ Seeding Completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
