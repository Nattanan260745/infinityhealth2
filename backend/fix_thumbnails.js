const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fixing thumbnails...');

    // Known Cardio videos from seed.js
    // We will update by Title to ensure correct URL

    // 1. HIIT Workout
    await prisma.exercise.updateMany({
        where: { title: 'HIIT Workout' },
        data: { videoUrl: 'https://www.youtube.com/watch?v=BdqQhC_8E5g' }
    });

    // 2. Running Basics
    await prisma.exercise.updateMany({
        where: { title: 'Running Basics' },
        data: { videoUrl: 'https://www.youtube.com/watch?v=_kGESn8ArrU' }
    });

    // 3. 20-Minute Full Body Dumbbell Workout
    await prisma.exercise.updateMany({
        where: { title: { contains: 'Full Body Dumbbell' } },
        data: { videoUrl: 'https://www.youtube.com/watch?v=UItWltVZZmE' } // Using strength URL as fallback or specific if known
    });

    // Also General Fix: If videoUrl starts with "https://img.youtube.com", try to extract ID and fix? 
    // Format: https://img.youtube.com/vi/<ID>/hqdefault.jpg
    // Target: https://www.youtube.com/watch?v=<ID>

    const badExercises = await prisma.exercise.findMany({
        where: { videoUrl: { startsWith: 'https://img.youtube.com' } }
    });

    console.log(`Found ${badExercises.length} exercises with image URL in videoUrl field.`);

    for (const ex of badExercises) {
        const match = ex.videoUrl.match(/vi\/([^\/]+)\//);
        if (match && match[1]) {
            const videoId = match[1];
            const correctUrl = `https://www.youtube.com/watch?v=${videoId}`;
            console.log(`Fixing ID ${ex.id}: ${ex.videoUrl} -> ${correctUrl}`);
            await prisma.exercise.update({
                where: { id: ex.id },
                data: { videoUrl: correctUrl }
            });
        }
    }

    console.log('Fix complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
