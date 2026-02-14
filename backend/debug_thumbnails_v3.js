const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const titles = [
        "15-Minute Beginner Full Body Cardio Workout",
        "INTERMEDIATE WORKOUTS {AT HOME}",
        "Intermediate Level CARDIO Workouts",
        "ADVANCED WORKOUTS {PUSH YOURSELF}"
    ];

    const results = [];
    for (const t of titles) {
        const ex = await prisma.exercise.findFirst({
            where: { title: { contains: t.substring(0, 10), mode: 'insensitive' } } // loose match
        });
        if (ex) {
            results.push({
                title: ex.title,
                videoUrl: ex.videoUrl,
                thumbnail: ex.thumbnail
            });
        }
    }
    console.log(JSON.stringify(results, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
