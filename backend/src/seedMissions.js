const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Starting Mission Seeding...');

  // Delete existing missions first to avoid duplicates
  await prisma.userMission.deleteMany({});
  await prisma.mission.deleteMany({});
  console.log('🗑️  Cleared old missions.');

  const missions = [
    // === DAILY MISSIONS ===
    { missionName: 'บันทึกสุขภาพประจำวัน', missionType: 'DAILY', requiredLevel: 1, rewardExp: 50, rewardPoints: 5, targetValue: 1, targetUnit: 'ครั้ง', description: 'บันทึกข้อมูลสุขภาพของคุณวันนี้' },
    { missionName: 'ดื่มน้ำให้เพียงพอ', missionType: 'DAILY', requiredLevel: 1, rewardExp: 100, rewardPoints: 10, targetValue: 8, targetUnit: 'แก้ว', description: 'ดื่มน้ำให้ครบ 8 แก้วต่อวัน' },
    { missionName: 'ออกกำลังกายครบ 30 นาที', missionType: 'DAILY', requiredLevel: 1, rewardExp: 300, rewardPoints: 50, targetValue: 30, targetUnit: 'นาที', description: 'ออกกำลังกายต่อเนื่อง 30 นาที' },
    { missionName: 'รักษาความสม่ำเสมอ (Streak Mission)', missionType: 'DAILY', requiredLevel: 1, rewardExp: 150, rewardPoints: 20, targetValue: 3, targetUnit: 'ภารกิจ', description: 'ทำภารกิจให้ครบ 3 อย่างในวันนี้' },

    // === CHALLENGE MISSIONS (by Level) ===
    // Level 1
    { missionName: 'พิชิตเลเวล 1: ก้าวแรกสู่สุขภาพดี', missionType: 'CHALLENGE', requiredLevel: 1, rewardExp: 500, rewardPoints: 100, targetValue: 1, targetUnit: 'ครั้ง', description: 'ออกกำลังกายตามคลิปใดก็ได้ 1 ครั้ง' },
    // Level 2
    { missionName: 'ดื่มน้ำเพิ่มจากปกติ ≥ 1 แก้ว', missionType: 'CHALLENGE', requiredLevel: 2, rewardExp: 500, rewardPoints: 100, targetValue: 1, targetUnit: 'แก้ว', description: 'ดื่มน้ำเพิ่มจากปกติอย่างน้อย 1 แก้ว' },
    // Level 3
    { missionName: 'ออกกำลังกาย 2 ครั้ง', missionType: 'CHALLENGE', requiredLevel: 3, rewardExp: 600, rewardPoints: 120, targetValue: 2, targetUnit: 'ครั้ง', description: 'ออกกำลังกายให้ครบ 2 ครั้ง' },
    // Level 4
    { missionName: 'เดิน ≥ 1,000 ก้าว', missionType: 'CHALLENGE', requiredLevel: 4, rewardExp: 600, rewardPoints: 120, targetValue: 1000, targetUnit: 'ก้าว', description: 'เดินให้ครบ 1,000 ก้าว' },
    // Level 5
    { missionName: 'ดื่มน้ำ ≥ 5 แก้ว', missionType: 'CHALLENGE', requiredLevel: 5, rewardExp: 700, rewardPoints: 150, targetValue: 5, targetUnit: 'แก้ว', description: 'ดื่มน้ำให้ครบ 5 แก้ว' },
    // Level 6-7
    { missionName: 'ออกกำลังกาย 3 ครั้ง', missionType: 'CHALLENGE', requiredLevel: 6, rewardExp: 700, rewardPoints: 150, targetValue: 3, targetUnit: 'ครั้ง', description: 'ออกกำลังกายให้ครบ 3 ครั้ง' },
    // Level 8
    { missionName: 'เดิน ≥ 2,000 ก้าว', missionType: 'CHALLENGE', requiredLevel: 8, rewardExp: 800, rewardPoints: 180, targetValue: 2000, targetUnit: 'ก้าว', description: 'เดินให้ครบ 2,000 ก้าว' },
    // Level 11
    { missionName: 'เดิน ≥ 3,000 ก้าว', missionType: 'CHALLENGE', requiredLevel: 11, rewardExp: 900, rewardPoints: 200, targetValue: 3000, targetUnit: 'ก้าว', description: 'เดินให้ครบ 3,000 ก้าว' },
    // Level 12
    { missionName: 'ดื่มน้ำ ≥ 6 แก้ว', missionType: 'CHALLENGE', requiredLevel: 12, rewardExp: 900, rewardPoints: 200, targetValue: 6, targetUnit: 'แก้ว', description: 'ดื่มน้ำให้ครบ 6 แก้ว' },
    // Level 16
    { missionName: 'เดิน ≥ 4,000 ก้าว', missionType: 'CHALLENGE', requiredLevel: 16, rewardExp: 1000, rewardPoints: 250, targetValue: 4000, targetUnit: 'ก้าว', description: 'เดินให้ครบ 4,000 ก้าว' },
    // Level 17
    { missionName: 'ดื่มน้ำ ≥ 7 แก้ว', missionType: 'CHALLENGE', requiredLevel: 17, rewardExp: 1000, rewardPoints: 250, targetValue: 7, targetUnit: 'แก้ว', description: 'ดื่มน้ำให้ครบ 7 แก้ว' },
    // Level 21
    { missionName: 'เดิน ≥ 5,000 ก้าว/วัน', missionType: 'CHALLENGE', requiredLevel: 21, rewardExp: 1200, rewardPoints: 300, targetValue: 5000, targetUnit: 'ก้าว', description: 'เดินให้ครบ 5,000 ก้าวต่อวัน' },
    // Level 22
    { missionName: 'ดื่มน้ำ ≥ 8 แก้ว/วัน', missionType: 'CHALLENGE', requiredLevel: 22, rewardExp: 1200, rewardPoints: 300, targetValue: 8, targetUnit: 'แก้ว', description: 'ดื่มน้ำให้ครบ 8 แก้วต่อวัน' },
    // Level 31
    { missionName: 'เดิน ≥ 6,000 ก้าว/วัน', missionType: 'CHALLENGE', requiredLevel: 31, rewardExp: 1500, rewardPoints: 400, targetValue: 6000, targetUnit: 'ก้าว', description: 'เดินให้ครบ 6,000 ก้าวต่อวัน' },
    // Level 33
    { missionName: 'ดื่มน้ำครบเป้า', missionType: 'CHALLENGE', requiredLevel: 33, rewardExp: 1500, rewardPoints: 400, targetValue: 8, targetUnit: 'แก้ว', description: 'ดื่มน้ำครบเป้าหมายประจำวัน' },
    // Level 43
    { missionName: 'ดื่มน้ำครบเป้า (≈ 8 แก้ว/วัน)', missionType: 'CHALLENGE', requiredLevel: 43, rewardExp: 1800, rewardPoints: 500, targetValue: 8, targetUnit: 'แก้ว', description: 'ดื่มน้ำครบเป้าประมาณ 8 แก้วต่อวัน' },
    // Level 51
    { missionName: 'เดิน ≥ 7,000 ก้าว/วัน', missionType: 'CHALLENGE', requiredLevel: 51, rewardExp: 2000, rewardPoints: 600, targetValue: 7000, targetUnit: 'ก้าว', description: 'เดินให้ครบ 7,000 ก้าวต่อวัน' },
    // Level 61
    { missionName: 'เดิน ≥ 7,500 ก้าว/วัน', missionType: 'CHALLENGE', requiredLevel: 61, rewardExp: 2500, rewardPoints: 700, targetValue: 7500, targetUnit: 'ก้าว', description: 'เดินให้ครบ 7,500 ก้าวต่อวัน' },
    // Level 66
    { missionName: 'เดิน ≥ 8,000 ก้าว/วัน', missionType: 'CHALLENGE', requiredLevel: 66, rewardExp: 3000, rewardPoints: 800, targetValue: 8000, targetUnit: 'ก้าว', description: 'เดินให้ครบ 8,000 ก้าวต่อวัน' },
  ];

  for (const m of missions) {
    await prisma.mission.create({
      data: { ...m, isActive: true }
    });
  }

  console.log(`✅ Successfully seeded ${missions.length} missions!`);
}

main()
  .catch((e) => {
    console.error('❌ Mission Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
