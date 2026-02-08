const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING FEATURE CHECK ---');
    const userId = 2; // Using known User ID

    // 1. Check Profile Update (Name)
    console.log('\n--- 1. Testing Profile Update ---');
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { firstName: 'TestUpdated' }
        });
        console.log('✅ Profile Updated:', user.firstName);
        // Revert
        await prisma.user.update({ where: { id: userId }, data: { firstName: 'Test' } });
    } catch (e) {
        console.error('❌ Profile Update Failed:', e.message);
    }

    // 2. Check Routine Creation
    console.log('\n--- 2. Testing Routine Creation ---');
    try {
        const routine = await prisma.routine.create({
            data: {
                userId: userId,
                title: 'Test Routine',
                scheduledTime: '08:00',
                scheduledDate: new Date(),
                completed: false
            }
        });
        console.log('✅ Routine Created:', routine.id);
        // Clean up
        await prisma.routine.delete({ where: { id: routine.id } });
    } catch (e) {
        console.error('❌ Routine Creation Failed:', e.message);
    }

    // 3. Check Health Dashboard (HealthTracking)
    console.log('\n--- 3. Testing Health Tracking Input ---');
    try {
        const tracking = await prisma.healthTracking.create({
            data: {
                userId: userId,
                trackingDate: new Date(),
                weight: 70.5,
                height: 175,
                water: 500,
                stepsCount: 1000
            }
        });
        console.log('✅ Health Tracking Created:', tracking.id);
        // Clean up
        await prisma.healthTracking.delete({ where: { id: tracking.id } });
    } catch (e) {
        console.error('❌ Health Tracking Failed:', e.message);
    }

    // 4. Check Exercise Videos
    console.log('\n--- 4. Checking Exercise Videos ---');
    try {
        const exercises = await prisma.exercise.findMany();
        console.log(`Found ${exercises.length} exercises.`);
        if (exercises.length === 0) {
            console.warn('⚠️ No exercises found in database. Run seed script?');
        } else {
            console.log('Sample:', JSON.stringify(exercises[0], null, 2));
        }
    } catch (e) {
        console.error('❌ Exercise list failed:', e.message);
    }

    console.log('\n--- FEATURE CHECK COMPLETE ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
