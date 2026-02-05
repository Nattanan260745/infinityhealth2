const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Latest Health Records ---');

    // 1. Find the most recently active user (or just list last 5 records)
    const lastRecords = await prisma.healthTracking.findMany({
        take: 5,
        orderBy: { trackingDate: 'desc' },
        include: { user: true }
    });

    if (lastRecords.length === 0) {
        console.log('No health records found.');
        return;
    }

    console.log(`Found ${lastRecords.length} recent records:`);
    lastRecords.forEach(r => {
        console.log(`User: ${r.user.firstName} (ID: ${r.userId}) | Date: ${r.trackingDate.toISOString().split('T')[0]}`);
        console.log(`\tWeight: ${r.weight}, Height: ${r.height}, Water: ${r.water}, Steps: ${r.stepsCount}`);
    });

    // 2. Specific check for today
    console.log('\n--- Checking Today\'s Record ---');
    // Assuming the user is likely one of the above, let's pick the first one
    const targetUserId = lastRecords[0].userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRecord = await prisma.healthTracking.findFirst({
        where: {
            userId: targetUserId,
            trackingDate: { gte: today }
        }
    });

    console.log(`Target User ID: ${targetUserId}`);
    if (todayRecord) {
        console.log('Today Record Found:', todayRecord);
        console.log('Is Height Present?', todayRecord.height !== null ? 'YES' : 'NO');
    } else {
        console.log('No record found for today for thi suser.');
    }

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
