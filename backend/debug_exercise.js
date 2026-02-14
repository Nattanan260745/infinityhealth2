const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const title = "15-Minute Beginner Full Body Cardio Workout";
    console.log(`Searching for: ${title}`);

    // layout query to be loose just in case of minor typos or whitespace
    const exercises = await prisma.exercise.findMany({
        where: {
            title: {
                contains: "15-Minute Beginner Full Body",
                mode: 'insensitive'
            }
        }
    });

    console.log("Found exercises:", exercises);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
