const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking latest 5 users for push tokens...');
    const users = await prisma.user.findMany({
        orderBy: { id: 'desc' },
        take: 5,
        select: {
            id: true,
            firstName: true,
            lastName: true,
            pushToken: true
        }
    });
    console.log('Latest 5 users:', users);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
