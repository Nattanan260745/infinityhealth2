const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const exercises = await prisma.exercise.findMany({
        select: { id: true, title: true, videoUrl: true, thumbnail: true, category: { select: { categoryName: true } } }
    });
    console.log(JSON.stringify(exercises, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
