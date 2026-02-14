const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking 15-Minute Beginner ---');
    const ex1 = await prisma.exercise.findFirst({
        where: { title: { contains: "15-Minute Beginner Full Body", mode: 'insensitive' } }
    });
    console.log(ex1 ? `${ex1.title}: video=${ex1.videoUrl}, thumb=${ex1.thumbnail}` : 'Not Found');

    console.log('\n--- Checking Intermediate/Advanced ---');
    const titles = [
        "INTERMEDIATE WORKOUTS {AT HOME}",
        "Intermediate Level CARDIO Workouts",
        "ADVANCED WORKOUTS {PUSH YOURSELF}"
    ];

    for (const t of titles) {
        const ex = await prisma.exercise.findFirst({
            where: { title: { contains: t, mode: 'insensitive' } }
        });
        console.log(ex ? `${ex.title}: video=${ex.videoUrl}, thumb=${ex.thumbnail}` : `${t} -> Not Found`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
