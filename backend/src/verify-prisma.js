const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to database...');
    try {
        // Create a new user (using unique email every time or upsert)
        const email = `testuser_${Date.now()}@example.com`;
        const user = await prisma.user.create({
            data: {
                email: email,
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                role: 'user',
                userStats: {
                    create: {
                        level: 1,
                        currentExp: 0,
                        totalPoints: 0
                    }
                }
            },
            include: {
                userStats: true
            }
        });
        console.log('Successfully created user:', user);

        // Read back
        const readUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { userStats: true }
        });
        console.log('Read back user:', readUser);

    } catch (e) {
        console.error('Error during verification:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
