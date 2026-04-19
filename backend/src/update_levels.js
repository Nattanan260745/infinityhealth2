
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetAndCreateLevels() {
  const ranks = [
    { range: [1, 10], name: 'Beginner' },
    { range: [11, 20], name: 'Novice' },
    { range: [21, 30], name: 'Intermediate' },
    { range: [31, 40], name: 'Skilled' },
    { range: [41, 50], name: 'Advanced' },
    { range: [51, 60], name: 'Expert' },
    { range: [61, 70], name: 'Master' },
    { range: [71, 80], name: 'Grand Master' },
    { range: [81, 90], name: 'Elite' },
    { range: [91, 100], name: 'Legendary' }
  ];

  try {
    console.log('Resetting levels table...');
    await prisma.level.deleteMany({});
    
    console.log('Creating 100 new levels...');
    const data = [];
    for (let i = 1; i <= 100; i++) {
      const rank = ranks.find(r => i >= r.range[0] && i <= r.range[1]);
      const minExp = (i - 1) * 1000;
      const maxExp = (i * 1000) - 1;
      const rankName = rank ? rank.name : 'Legendary';

      data.push({
        levelNumber: i,
        levelName: rankName,
        titleTh: rankName,
        color: 'blue',
        hexCode: '#3B82F6',
        minExp: minExp,
        maxExp: maxExp
      });
    }

    await prisma.level.createMany({
      data: data
    });
    
    console.log('Successfully created 100 levels!');
  } catch (error) {
    console.error('Operation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndCreateLevels();
