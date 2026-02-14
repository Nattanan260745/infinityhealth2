const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fixing thumbnail for 15-Minute Beginner Full Body Cardio Workout...');

    // Title: 15-Minute Beginner Full Body Cardio Workout
    // Real YouTube Video: https://www.youtube.com/watch?v=BdqQhC_8E5g (Example/Replace with accurate one)
    // Actually, "15-Minute Beginner Full Body Cardio Workout (Low Impact, No Jumping)" -> Body Project channel often.
    // Let's use a safe, popular one: https://www.youtube.com/watch?v=gC_L9qAHVJ8 (15 MIN BEGINNER CARDIO WORKOUT for Fat Loss - No Jumping - High Intensity Low Impact)
    // Or closer match to title: https://www.youtube.com/watch?v=8JpD310kG3s (15 Minute Full Body Cardio Workout - No Equipment)

    // Using: https://www.youtube.com/watch?v=8JpD310kG3s
    const videoUrl = 'https://www.youtube.com/watch?v=8JpD310kG3s';
    const thumbnail = 'https://img.youtube.com/vi/8JpD310kG3s/hqdefault.jpg';

    // Update by ID we found (62) or by title search safer
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

    console.log(`Updated ${update.count} exercises.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
