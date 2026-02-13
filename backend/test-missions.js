const { PrismaClient } = require('@prisma/client');
const { checkAndCompleteMission } = require('./src/utils/missionUtils');

const prisma = new PrismaClient();

async function testAutomation() {
    console.log('🧪 Starting Mission Automation Test...');

    // 1. Get a test user (Test User created by seed)
    // We look for 'Test User' or just the first user.
    const user = await prisma.user.findFirst({
        where: { email: 'test@example.com' } // Assuming this is the test user created by seed
    });

    if (!user) {
        // Fallback to any user
        const anyUser = await prisma.user.findFirst();
        if (!anyUser) {
            console.error('❌ No user found to test with. Seed data first.');
            return;
        }
        console.log(`👤 Test User not found, using: ${anyUser.firstName} (ID: ${anyUser.id})`);
        await runTest(anyUser);
    } else {
        console.log(`👤 Testing with user: ${user.firstName} (ID: ${user.id})`);
        await runTest(user);
    }

    await prisma.$disconnect();
}

async function runTest(user) {
    // 2. Simulate Step Count Update
    const testSteps = 8500; // Should trigger Lv 4, Lv 21, Lv 66 (8000)
    console.log(`👟 Simulating ${testSteps} steps...`);

    // Missions to test
    const missionsToTest = [
        'เดิน ≥ 1,000 ก้าว',     // Lv 4 (Target: 1000) -> Should Complete
        'เดิน ≥ 5,000 ก้าว/วัน', // Lv 21 (Target: 5000) -> Should Complete
        'เดิน ≥ 8,000 ก้าว/วัน', // Lv 66 (Target: 8000) -> Should Complete
        'เดิน ≥ 7,500 ก้าว/วัน'  // Lv 61 (Target: 7500) -> Should Complete
    ];

    // Reset these missions first to ensure clean test
    console.log('🔄 Resetting user missions for test...');
    await prisma.userMission.deleteMany({
        where: {
            userId: user.id,
            mission: {
                missionName: { in: missionsToTest }
            }
        }
    });

    // 3. Trigger Checks
    for (const missionName of missionsToTest) {
        console.log(`   Checking mission: "${missionName}"...`);
        await checkAndCompleteMission(user.id, missionName, testSteps);
    }

    // 4. Verify in Database
    console.log('\n🔍 Verifying results in DB...');
    const userMissions = await prisma.userMission.findMany({
        where: {
            userId: user.id,
            mission: {
                missionName: { in: missionsToTest }
            }
        },
        include: { mission: true }
    });

    if (userMissions.length > 0) {
        console.log('✅ Completed Missions:');
        let allPassed = true;
        for (const missionName of missionsToTest) {
            const um = userMissions.find(u => u.mission.missionName === missionName);
            if (um && um.status) {
                console.log(`   ✅ [COMPLETED] ${missionName}`);
            } else {
                console.log(`   ❌ [FAILED] ${missionName} - Not found or not completed.`);
                allPassed = false;
            }
        }
        if (allPassed) console.log('\n🎉 ALL TESTS PASSED!');
    } else {
        console.log('⚠️ No UserMissions found. Test Failed.');
    }
}

testAutomation().catch(console.error);
