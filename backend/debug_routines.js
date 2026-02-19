const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching all routines...");
    const routines = await prisma.routine.findMany();
    console.log(JSON.stringify(routines, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
