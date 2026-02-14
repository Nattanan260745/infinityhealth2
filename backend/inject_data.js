const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'p50148.2013+po1@gmail.com';
    console.log(`Checking for user: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email: email },
        include: { userStats: true }
    });

    if (!user) {
        console.log('❌ User not found! Please Sign Up in the app first.');
        return;
    }

    console.log(`✅ User found (ID: ${user.id}). Injecting data...`);

    // 1. Update Stats (Level 5, some points)
    await prisma.userStats.upsert({
        where: { userId: user.id },
        update: {
            level: 5,
            currentExp: 2500,
            totalPoints: 500,
            currentStreak: 7,
            lastActivityDate: new Date()
        },
        create: {
            userId: user.id,
            level: 5,
            currentExp: 2500,
            totalPoints: 500,
            currentStreak: 7,
            lastActivityDate: new Date()
        }
    });
    console.log('✅ User stats updated (Level 5).');

    // 2. Clear old data to prevent duplicates
    await prisma.healthTracking.deleteMany({ where: { userId: user.id } });

    // 3. Generate 30 days of health data
    const today = new Date();
    console.log('Generating 30 days of health data...');

    for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Randomize data
        const weight = 70 + (Math.random() * 2 - 1); // 69-71 range
        const sleep = 6 + Math.random() * 3; // 6-9 hours
        const water = Math.floor(1500 + Math.random() * 1000); // 1500-2500 ml
        const steps = Math.floor(3000 + Math.random() * 7000); // 3000-10000 steps

        await prisma.healthTracking.create({
            data: {
                userId: user.id,
                trackingDate: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
                weight: parseFloat(weight.toFixed(1)),
                height: 175,
                water: water,
                sleepHours: parseFloat(sleep.toFixed(1)),
                stepsCount: steps
            }
        });
    }
    console.log('✅ Health data generated.');
    console.log('🎉 Account is ready for Google Play Review!');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
