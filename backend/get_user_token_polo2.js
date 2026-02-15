const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Search by firstName since we don't know the exact email
    const name = 'Po';
    const lastName = 'Lo2';
    console.log(`Checking user: ${name} ${lastName}`);

    const user = await prisma.user.findFirst({
        where: {
            firstName: name,
            lastName: lastName
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            pushToken: true
        }
    });

    if (user) {
        console.log('User Found:', user);
    } else {
        console.log('User NOT found. Trying to list all users to find match...');
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
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
