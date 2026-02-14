const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Switching to mqdefault for 15-Minute workout...');

    // Use mqdefault.jpg (Medium Quality) - safer than hq sometimes
    const videoUrl = 'https://www.youtube.com/watch?v=8JpD310kG3s';
    const thumbnail = 'https://img.youtube.com/vi/8JpD310kG3s/mqdefault.jpg';

    const update = await prisma.exercise.updateMany({
        where: {
            title: {
                contains: "15-Minute Beginner Full Body",
                mode: 'insensitive'
            }
        },
        data: {
            videoUrl: videoUrl,
            thumbnail: thumbnail
        }
    });

    console.log(`Updated ${update.count} exercises to mqdefault.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
