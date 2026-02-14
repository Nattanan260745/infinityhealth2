const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Check test user
    console.log('Checking test@example.com...');
    const testUser = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    if (testUser) {
        const isValid = await bcrypt.compare('123456', testUser.password);
        console.log(`User: ${testUser.email}, Exists: Yes, Password (123456) Valid: ${isValid}`);
    } else {
        console.log('User: test@example.com, Exists: No');
    }

    // Check admin user
    console.log('\nChecking admin@infinity.com...');
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@infinity.com' } });
    if (adminUser) {
        const isValid = await bcrypt.compare('123456', adminUser.password);
        console.log(`User: ${adminUser.email}, Exists: Yes, Password (123456) Valid: ${isValid}`);
    } else {
        console.log('User: admin@infinity.com, Exists: No');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
