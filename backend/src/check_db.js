
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const routines = await prisma.routine.findMany({
      take: 5
    });
    console.log('Routines in DB:', JSON.stringify(routines, null, 2));
    
    const userCount = await prisma.user.count();
    console.log('Total Users:', userCount);
    
    const latestUser = await prisma.user.findFirst({
      orderBy: { id: 'desc' }
    });
    console.log('Latest User:', JSON.stringify(latestUser, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
