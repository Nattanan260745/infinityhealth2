const prisma = require('./src/prisma');

async function test() {
    try {
        console.log('Testing Prisma Connection...');
        const userCount = await prisma.user.count();
        console.log('User count:', userCount);

        console.log('Testing Notification Model...');
        if (!prisma.notification) {
            throw new Error('prisma.notification is undefined!');
        }

        const userId = 3; // Assuming user 3 exists based on logs
        const notifications = await prisma.notification.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });
        console.log('Notifications fetched:', notifications);

    } catch (error) {
        console.error('Debug Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
