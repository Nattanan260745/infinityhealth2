const { PrismaClient } = require('@prisma/client');
const { checkAndCompleteMission } = require('./src/utils/missionUtils');

const prisma = new PrismaClient();

async function testDailyMissions() {
    console.log('🧪 Starting Daily Mission Automation Test...');

    const user = await prisma.user.findFirst({
        where: { email: 'test@example.com' }
    });

    if (!user) {
        console.error('❌ No user found.');
        return;
    }
    console.log(`👤 Testing with user: ${user.firstName} (ID: ${user.id})`);

    // Reset Daily Missions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.userMission.deleteMany({
        where: {
            userId: user.id,
            mission: {
                missionType: 'DAILY'
            },
            createdAt: { gte: today }
        }
    });
    console.log('🔄 Reset Daily Missions for today.');

    // 1. Test "ดื่มน้ำให้เพียงพอ" (2000 ml)
    console.log('💧 Testing Water Mission...');
    await checkAndCompleteMission(user.id, 'ดื่มน้ำให้เพียงพอ', 2500);

    // 2. Test "เคลื่อนไหวร่างกาย" (10000 steps)
    console.log('👟 Testing Steps Mission...');
    await checkAndCompleteMission(user.id, 'เคลื่อนไหวร่างกาย', 10500);

    // 3. Test "บันทึกสุขภาพประจำวัน" (1 time)
    console.log('📝 Testing Daily Health Record...');
    await checkAndCompleteMission(user.id, 'บันทึกสุขภาพประจำวัน', 1);

    // 4. Test "บันทึกกิจวัตรหรือเป้าหมายประจำวัน" (1 time)
    console.log('📅 Testing Routine/Goal Mission...');
    await checkAndCompleteMission(user.id, 'บันทึกกิจวัตรหรือเป้าหมายประจำวัน', 1);

    // 5. Test "รักษาความสม่ำเสมอ (Streak Mission)" (3 missions completed)
    console.log('🔥 Testing Streak Mission...');
    // We already completed 4 above. This logic usually runs at the end of checking another mission.
    // Let's trigger it manually or rely on checkAndCompleteMission internal call?
    // checkAndCompleteMission calls checkStreakMission at the end.
    // So if the above calls worked, Streak should be checked automatically each time.
    // Let's verify DB.

    console.log('\n🔍 Verifying results in DB...');
    const userMissions = await prisma.userMission.findMany({
        where: {
            userId: user.id,
            mission: {
                missionType: 'DAILY'
            },
            createdAt: { gte: today }
        },
        include: { mission: true }
    });

    const expected = [
        'ดื่มน้ำให้เพียงพอ',
        'เคลื่อนไหวร่างกาย',
        'บันทึกสุขภาพประจำวัน',
        'บันทึกกิจวัตรหรือเป้าหมายประจำวัน',
        'รักษาความสม่ำเสมอ (Streak Mission)'
    ];

    let allPassed = true;
    for (const name of expected) {
        const found = userMissions.find(um => um.mission.missionName === name);
        if (found && found.status) {
            console.log(`   ✅ [COMPLETED] ${name}`);
        } else {
            console.log(`   ❌ [FAILED] ${name} - Not found or not completed.`);
            allPassed = false;
        }
    }

    if (allPassed) console.log('\n🎉 ALL DAILY MISSION TESTS PASSED!');
    else console.log('\n⚠️ Some tests failed.');

    await prisma.$disconnect();
}

testDailyMissions().catch(console.error);
