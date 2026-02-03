const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@infinity.com';
    const password = '123456';

    console.log(`Creating admin user: ${email}...`);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.upsert({
        where: { email: email },
        update: {
            password: hashedPassword,
            role: 'admin',
        },
        create: {
            email,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            dateOfBirth: new Date(),
            gender: 'other',
            role: 'admin',
            userStats: {
                create: {
                    level: 1,
                    currentExp: 0,
                    totalPoints: 0
                }
            }
        },
    });

    console.log('Admin user created successfully:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
