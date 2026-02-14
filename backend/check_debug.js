const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const exercises = await prisma.exercise.findMany({
        where: { category: { categoryName: 'Cardio' } },
        select: { id: true, title: true, videoUrl: true, thumbnail: true }
    });
    exercises.forEach(e => {
        console.log(`ID:${e.id}|TITLE:${e.title}|URL:${e.videoUrl}|THUMB:${e.thumbnail}`);
    });
    const users = await prisma.user.findMany({
        select: { id: true, email: true, pushToken: true }
    });
    console.log('--- USERS WITH TOKENS ---');
    users.forEach(u => {
        if (u.pushToken) console.log(`USER:${u.email}|TOKEN:${u.pushToken.substring(0, 20)}...`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
