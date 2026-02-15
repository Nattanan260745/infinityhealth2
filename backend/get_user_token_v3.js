const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'p50148.2013+polo1@gmail.com';
    console.log(`Checking user: ${email}`);

    // User model has firstName, lastName, email, pushToken. NO username.
    const user = await prisma.user.findFirst({
        where: { email: email },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            pushToken: true
        }
    });

    if (user) {
        console.log('User Found:', user);
    } else {
        console.log('User NOT found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
