const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Start seeding history...');

    // 1. Get ALL users to ensure the logged-in user gets data
    const users = await prisma.user.findMany();

    if (users.length === 0) {
        console.log('No users found, creating dummy user...');
        const newUser = await prisma.user.create({
            data: {
                fullname: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashedpassword',
            }
        });
        users.push(newUser);
    }

    console.log(`Found ${users.length} users. Seeding for all...`);

    for (const user of users) {
        console.log(`Seeding for User ID: ${user.id}`);

        // 2. Generate 90 days of data
        const days = 90;
        const today = new Date();

        const moods = ['Happy', 'Sad', 'Neutral', 'Excited', 'Tired'];

        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i); // Go back i days

            // Simulate realistic data
            // Weight: 70kg +/- random variation, maybe trending down slightly
            const weightBase = 70;
            const weightTrend = i * 0.05; // Was heavier in the past
            const weightNoise = (Math.random() - 0.5) * 1.5;
            const weight = parseFloat((weightBase + weightTrend + weightNoise).toFixed(1));

            // Sleep: 4-10 hours
            const sleep = parseFloat((Math.random() * (9 - 5) + 5).toFixed(1));

            // Water: 1000 - 3000 ml
            const water = Math.floor(Math.random() * (3000 - 1000) + 1000);

            // Steps: 2000 - 15000
            const steps = Math.floor(Math.random() * (15000 - 2000) + 2000);

            // Mood
            const mood = moods[Math.floor(Math.random() * moods.length)];

            // Upsert logic (similar to backend but simplified for seeding)
            // We check date range to avoid duplicates if re-run
            const start = new Date(date); start.setHours(0, 0, 0, 0);
            const end = new Date(date); end.setHours(23, 59, 59, 999);

            const existing = await prisma.healthTracking.findFirst({
                where: {
                    userId: user.id,
                    trackingDate: { gte: start, lte: end }
                }
            });

            if (existing) {
                // Update
                await prisma.healthTracking.update({
                    where: { id: existing.id },
                    data: { weight, height: 180, water, sleepHours: sleep, stepsCount: steps, mood }
                });
            } else {
                // Create
                await prisma.healthTracking.create({
                    data: {
                        userId: user.id,
                        trackingDate: date,
                        weight,
                        height: 180,
                        water,
                        sleepHours: sleep,
                        stepsCount: steps,
                        mood
                    }
                });
            }
        }

        console.log(`✅ Seeded ${days} days of history for User ${user.id}`);
    }

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
