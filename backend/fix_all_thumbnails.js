const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fixing ALL broken thumbnails...');

    const updates = [
        {
            search: "15-Minute Beginner Full Body",
            video: "https://www.youtube.com/watch?v=8JpD310kG3s",
            thumb: "https://img.youtube.com/vi/8JpD310kG3s/hqdefault.jpg"
        },
        {
            search: "INTERMEDIATE WORKOUTS",
            video: "https://www.youtube.com/watch?v=JgW8t1bVqQ0", // Sample Intermediate
            thumb: "https://img.youtube.com/vi/JgW8t1bVqQ0/hqdefault.jpg"
        },
        {
            search: "Intermediate Level CARDIO",
            video: "https://www.youtube.com/watch?v=50kH47ZztPk", // Sample Cardio
            thumb: "https://img.youtube.com/vi/50kH47ZztPk/hqdefault.jpg"
        },
        {
            search: "ADVANCED WORKOUTS",
            video: "https://www.youtube.com/watch?v=mm47bCaCzpQ", // Sample Advanced
            thumb: "https://img.youtube.com/vi/mm47bCaCzpQ/hqdefault.jpg"
        }
    ];

    for (const item of updates) {
        console.log(`Updating: ${item.search}`);
        const result = await prisma.exercise.updateMany({
            where: {
                title: { contains: item.search, mode: 'insensitive' }
            },
            data: {
                videoUrl: item.video,
                thumbnail: item.thumb
            }
        });
        console.log(`   -> Updated ${result.count} records.`);
    }

    console.log('All fixes applied.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
