const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ========== LEVELS DATA ==========
const generateLevels = () => {
    const tiers = [
        { minLevel: 1, maxLevel: 10, title: 'Beginner', titleTh: 'มือใหม่เพิ่งเริ่มต้น', color: 'Spring Green', hex_code: '#00FF7F' },
        { minLevel: 11, maxLevel: 20, title: 'Novice', titleTh: 'ผู้มีประสบการณ์', color: 'Cornflower Blue', hex_code: '#6495ED' },
        { minLevel: 21, maxLevel: 30, title: 'Intermediate', titleTh: 'ผู้ฝึกหนักวินัยระดับกลาง', color: 'Light Slate Blue', hex_code: '#8470FF' },
        { minLevel: 31, maxLevel: 40, title: 'Skilled', titleTh: 'ผู้มีทักษะระดับกลาง', color: 'Orange', hex_code: '#FFA500' },
        { minLevel: 41, maxLevel: 50, title: 'Advanced', titleTh: 'มีทักษะดี', color: 'Cyan', hex_code: '#00FFFF' },
        { minLevel: 51, maxLevel: 60, title: 'Expert', titleTh: 'ขั้นสูง', color: 'Violet', hex_code: '#EE82EE' },
        { minLevel: 61, maxLevel: 70, title: 'Master', titleTh: 'ผู้เชี่ยวชาญ', color: 'Dark Violet', hex_code: '#9400D3' },
        { minLevel: 71, maxLevel: 80, title: 'Grand Master', titleTh: 'ปรมาจารย์', color: 'Magenta', hex_code: '#FF00FF' },
        { minLevel: 81, maxLevel: 90, title: 'Elite', titleTh: 'ขั้นแนวหน้า', color: 'Red', hex_code: '#FF0000' },
        { minLevel: 91, maxLevel: 100, title: 'Legendary', titleTh: 'ตำนาน', color: 'Gold', hex_code: '#FFD700' },
    ];

    const levels = [];
    let cumulativeExp = 0;

    for (let i = 1; i <= 100; i++) {
        const tier = tiers.find(t => i >= t.minLevel && i <= t.maxLevel);

        const baseExp = 100;
        const expMultiplier = Math.floor((i - 1) / 10) + 1;
        const required_exp = baseExp * expMultiplier * (1 + (i % 10) * 0.1);
        const roundedExp = Math.round(required_exp / 10) * 10;

        const min_exp = cumulativeExp;
        cumulativeExp += roundedExp;
        const max_exp = cumulativeExp;

        levels.push({
            levelNumber: i,
            levelName: tier.title,
            titleTh: tier.titleTh,
            color: tier.color,
            hexCode: tier.hex_code,
            minExp: min_exp,
            maxExp: max_exp,
        });
    }

    return levels;
};

const levelsData = generateLevels();

// ========== EXERCISES DATA ==========
const exercisesData = [
    // CARDIO - Easy
    { type: 'cardio', difficulty: 'easy', title: 'Walking', description: 'เดินเร็วอย่างต่อเนื่อง เหมาะสำหรับผู้เริ่มต้น' },
    { type: 'cardio', difficulty: 'easy', title: 'Jumping Jacks', description: 'กระโดดตบมือเหนือศีรษะ ช่วยเพิ่มอัตราการเต้นหัวใจ' },
    { type: 'cardio', difficulty: 'easy', title: 'March in Place', description: 'เดินอยู่กับที่ ยกเข่าสูง เหมาะสำหรับอบอุ่นร่างกาย' },
    { type: 'cardio', difficulty: 'easy', title: 'Step Touch', description: 'ก้าวซ้าย-ขวา ช่วยเพิ่มการเคลื่อนไหว' },
    // CARDIO - Medium
    { type: 'cardio', difficulty: 'medium', title: 'Jogging', description: 'วิ่งเหยาะในจังหวะสม่ำเสมอ' },
    { type: 'cardio', difficulty: 'medium', title: 'High Knees', description: 'วิ่งยกเข่าสูง เพิ่มความเข้มข้น' },
    { type: 'cardio', difficulty: 'medium', title: 'Butt Kicks', description: 'วิ่งส้นเท้าแตะก้น' },
    { type: 'cardio', difficulty: 'medium', title: 'Mountain Climbers', description: 'ท่าปีนเขา เพิ่มความแข็งแรงและ cardio พร้อมกัน' },
    { type: 'cardio', difficulty: 'medium', title: 'Jump Rope', description: 'กระโดดเชือก เผาผลาญแคลอรี่สูง' },
    // CARDIO - Hard
    { type: 'cardio', difficulty: 'hard', title: 'Burpees', description: 'ท่าออกกำลังกายเต็มรูปแบบ เผาผลาญสูงสุด' },
    { type: 'cardio', difficulty: 'hard', title: 'Sprint Intervals', description: 'วิ่งเร็วสลับพัก เพิ่มความอดทน' },
    { type: 'cardio', difficulty: 'hard', title: 'Box Jumps', description: 'กระโดดขึ้นกล่อง เพิ่มพลังขา' },
    { type: 'cardio', difficulty: 'hard', title: 'Tuck Jumps', description: 'กระโดดพับเข่า เพิ่มความระเบิด' },
    // WEIGHT - Easy
    { type: 'weight', difficulty: 'easy', title: 'Wall Push-ups', description: 'วิดพื้นติดผนัง เหมาะสำหรับผู้เริ่มต้น' },
    { type: 'weight', difficulty: 'easy', title: 'Bodyweight Squats', description: 'สควอทโดยใช้น้ำหนักตัว' },
    { type: 'weight', difficulty: 'easy', title: 'Glute Bridges', description: 'ยกสะโพก เสริมกล้ามเนื้อก้น' },
    { type: 'weight', difficulty: 'easy', title: 'Knee Push-ups', description: 'วิดพื้นบนเข่า' },
    { type: 'weight', difficulty: 'easy', title: 'Standing Calf Raises', description: 'ยกส้นเท้า เสริมน่อง' },
    // WEIGHT - Medium
    { type: 'weight', difficulty: 'medium', title: 'Push-ups', description: 'วิดพื้นมาตรฐาน' },
    { type: 'weight', difficulty: 'medium', title: 'Lunges', description: 'ก้าวย่อขา เสริมกล้ามเนื้อขา' },
    { type: 'weight', difficulty: 'medium', title: 'Plank', description: 'ท่าแพลงค์ เสริมแกนกลางลำตัว' },
    { type: 'weight', difficulty: 'medium', title: 'Dumbbell Rows', description: 'ยกดัมเบลล์ เสริมหลัง' },
    { type: 'weight', difficulty: 'medium', title: 'Dumbbell Shoulder Press', description: 'ยกดัมเบลล์เหนือศีรษะ' },
    { type: 'weight', difficulty: 'medium', title: 'Bicep Curls', description: 'ยกดัมเบลล์ เสริมต้นแขน' },
    { type: 'weight', difficulty: 'medium', title: 'Tricep Dips', description: 'ดิปหลังแขน เสริมหลังแขน' },
    // WEIGHT - Hard
    { type: 'weight', difficulty: 'hard', title: 'Diamond Push-ups', description: 'วิดพื้นมือชิด เน้นหลังแขน' },
    { type: 'weight', difficulty: 'hard', title: 'Pistol Squats', description: 'สควอทขาเดียว' },
    { type: 'weight', difficulty: 'hard', title: 'Pull-ups', description: 'ดึงข้อ เสริมหลังและแขน' },
    { type: 'weight', difficulty: 'hard', title: 'Deadlifts', description: 'เดดลิฟต์ เสริมหลังและขา' },
    { type: 'weight', difficulty: 'hard', title: 'Weighted Squats', description: 'สควอทพร้อมน้ำหนัก' },
    { type: 'weight', difficulty: 'hard', title: 'Muscle-ups', description: 'ดึงข้อแบบยก เสริมทั้งตัว' },
];

// ========== MISSIONS DATA ==========
const missionsData = [
    // =============== DAILY MISSIONS ===============
    { missionName: 'Drink Water', missionType: 'DAILY', rewardExp: 30, rewardPoints: 5, startTime: '00:00', endTime: '23:59', description: 'ดื่มน้ำให้ครบ 2,000 ml', targetValue: 2000, targetUnit: 'ml', requiredLevel: 1, isActive: true },
    { missionName: 'Step Count', missionType: 'DAILY', rewardExp: 50, rewardPoints: 10, startTime: '00:00', endTime: '23:59', description: 'เดินให้ครบ 5,000 ก้าว', targetValue: 5000, targetUnit: 'steps', requiredLevel: 1, isActive: true },
    { missionName: 'Morning Walk', missionType: 'DAILY', rewardExp: 40, rewardPoints: 8, startTime: '06:00', endTime: '09:00', description: 'เดินตอนเช้า 15 นาที', targetValue: 15, targetUnit: 'minutes', requiredLevel: 1, isActive: true },
    { missionName: 'Healthy Meal', missionType: 'DAILY', rewardExp: 30, rewardPoints: 6, startTime: '00:00', endTime: '23:59', description: 'ทานอาหารที่ดีต่อสุขภาพ', targetValue: 1, targetUnit: 'meal', requiredLevel: 1, isActive: true },
    { missionName: 'Sleep Early', missionType: 'DAILY', rewardExp: 40, rewardPoints: 10, startTime: '21:00', endTime: '23:59', description: 'นอนก่อน 4 ทุ่ม', targetValue: 1, targetUnit: 'time', requiredLevel: 1, isActive: true },
    { missionName: 'Stretch Break', missionType: 'DAILY', rewardExp: 25, rewardPoints: 5, startTime: '00:00', endTime: '23:59', description: 'ยืดเส้นยืดสาย 10 นาที', targetValue: 10, targetUnit: 'minutes', requiredLevel: 1, isActive: true },
    { missionName: 'No Sugary Drinks', missionType: 'DAILY', rewardExp: 35, rewardPoints: 8, startTime: '00:00', endTime: '23:59', description: 'งดเครื่องดื่มที่มีน้ำตาล', targetValue: 1, targetUnit: 'day', requiredLevel: 1, isActive: true },
    { missionName: 'Avoid Fried Food', missionType: 'DAILY', rewardExp: 35, rewardPoints: 8, startTime: '00:00', endTime: '23:59', description: 'งดอาหารทอด', targetValue: 1, targetUnit: 'day', requiredLevel: 1, isActive: true },

    // =============== CHALLENGE MISSIONS ===============
    // Level 1-10
    { missionName: 'First Step', missionType: 'CHALLENGE', rewardExp: 100, rewardPoints: 25, startTime: '00:00', endTime: '23:59', description: 'ออกกำลังกายครั้งแรก', targetValue: 1, targetUnit: 'time', requiredLevel: 1, isActive: true },
    { missionName: 'กินอาหารครบ 5 หมู่', missionType: 'CHALLENGE', rewardExp: 150, rewardPoints: 30, startTime: '00:00', endTime: '23:59', description: 'กินอาหารให้ครบ 5 หมู่ ติดต่อกัน 3 วัน', targetValue: 3, targetUnit: 'days', requiredLevel: 1, isActive: true },
    // Level 11-20
    { missionName: 'ลดน้ำตาลในอาหาร', missionType: 'CHALLENGE', rewardExp: 200, rewardPoints: 50, startTime: '00:00', endTime: '23:59', description: 'ลดน้ำตาลในอาหาร 1 มื้อ ติดต่อกัน 7 วัน', targetValue: 7, targetUnit: 'days', requiredLevel: 11, isActive: true },
    { missionName: 'Hydration Hero', missionType: 'CHALLENGE', rewardExp: 180, rewardPoints: 40, startTime: '00:00', endTime: '23:59', description: 'ดื่มน้ำครบทุกวัน 7 วันติด', targetValue: 7, targetUnit: 'days', requiredLevel: 11, isActive: true },
    // Level 21-30
    { missionName: 'งดน้ำอัดลม', missionType: 'CHALLENGE', rewardExp: 280, rewardPoints: 70, startTime: '00:00', endTime: '23:59', description: 'งดน้ำอัดลม 1 วัน ติดต่อกัน 14 วัน', targetValue: 14, targetUnit: 'days', requiredLevel: 21, isActive: true },
    { missionName: 'Step Master', missionType: 'CHALLENGE', rewardExp: 300, rewardPoints: 80, startTime: '00:00', endTime: '23:59', description: 'เดินครบ 10,000 ก้าวใน 1 วัน', targetValue: 10000, targetUnit: 'steps', requiredLevel: 21, isActive: true },
    // Level 31-40
    { missionName: 'คาร์ดิโอ 30 นาที', missionType: 'CHALLENGE', rewardExp: 400, rewardPoints: 100, startTime: '00:00', endTime: '23:59', description: 'คาร์ดิโอ 30 นาที 3 วัน/สัปดาห์ ติดต่อกัน 2 สัปดาห์', targetValue: 6, targetUnit: 'times', requiredLevel: 31, isActive: true },
    { missionName: 'Workout Warrior', missionType: 'CHALLENGE', rewardExp: 450, rewardPoints: 120, startTime: '00:00', endTime: '23:59', description: 'ออกกำลังกายติดต่อกัน 14 วัน', targetValue: 14, targetUnit: 'days', requiredLevel: 31, isActive: true },
    // Level 41-50
    { missionName: 'เวทเทรนนิ่ง', missionType: 'CHALLENGE', rewardExp: 550, rewardPoints: 140, startTime: '00:00', endTime: '23:59', description: 'เวทเทรนนิ่ง 3 วัน/สัปดาห์ ติดต่อกัน 3 สัปดาห์', targetValue: 9, targetUnit: 'times', requiredLevel: 41, isActive: true },
    { missionName: 'Health Master', missionType: 'CHALLENGE', rewardExp: 600, rewardPoints: 150, startTime: '00:00', endTime: '23:59', description: 'ทำภารกิจ Daily ครบทุกอัน 14 วัน', targetValue: 14, targetUnit: 'days', requiredLevel: 41, isActive: true },
    // Level 51-60
    { missionName: 'กินผักผลไม้ทุกวัน', missionType: 'CHALLENGE', rewardExp: 700, rewardPoints: 180, startTime: '00:00', endTime: '23:59', description: 'กินผักและผลไม้ทุกวัน 5 วัน ติดต่อกัน 3 สัปดาห์', targetValue: 15, targetUnit: 'days', requiredLevel: 51, isActive: true },
    { missionName: 'Marathon Walker', missionType: 'CHALLENGE', rewardExp: 750, rewardPoints: 200, startTime: '00:00', endTime: '23:59', description: 'เดินรวม 100,000 ก้าวในสัปดาห์', targetValue: 100000, targetUnit: 'steps', requiredLevel: 51, isActive: true },
    // Level 61-70
    { missionName: 'งดอาหารแปรรูป', missionType: 'CHALLENGE', rewardExp: 900, rewardPoints: 250, startTime: '00:00', endTime: '23:59', description: 'งดอาหารแปรรูป 1 สัปดาห์', targetValue: 7, targetUnit: 'days', requiredLevel: 61, isActive: true },
    { missionName: 'Perfect Week', missionType: 'CHALLENGE', rewardExp: 1000, rewardPoints: 300, startTime: '00:00', endTime: '23:59', description: 'ทำภารกิจ Daily ครบทุกอัน 21 วัน', targetValue: 21, targetUnit: 'days', requiredLevel: 61, isActive: true },
    // Level 71-80
    { missionName: 'งดหวานจัด', missionType: 'CHALLENGE', rewardExp: 1200, rewardPoints: 350, startTime: '00:00', endTime: '23:59', description: 'งดหวานจัด 2 สัปดาห์', targetValue: 14, targetUnit: 'days', requiredLevel: 71, isActive: true },
    { missionName: 'Body Transformation', missionType: 'CHALLENGE', rewardExp: 1500, rewardPoints: 400, startTime: '00:00', endTime: '23:59', description: 'ลดน้ำหนัก 3 กก. ใน 1 เดือน', targetValue: 3, targetUnit: 'kg', requiredLevel: 71, isActive: true },
    // Level 81-90
    { missionName: 'นอนอย่างมีคุณภาพ', missionType: 'CHALLENGE', rewardExp: 1800, rewardPoints: 500, startTime: '00:00', endTime: '23:59', description: 'นอนอย่างมีคุณภาพ 8 ชั่วโมง/คืน เป็นเวลา 15 วัน', targetValue: 15, targetUnit: 'days', requiredLevel: 81, isActive: true },
    { missionName: 'Ultimate Fitness', missionType: 'CHALLENGE', rewardExp: 2000, rewardPoints: 600, startTime: '00:00', endTime: '23:59', description: 'ออกกำลังกาย 60 นาที/วัน 21 วันติด', targetValue: 21, targetUnit: 'days', requiredLevel: 81, isActive: true },
    // Level 91-100
    { missionName: 'สุขภาพยั่งยืน', missionType: 'CHALLENGE', rewardExp: 3000, rewardPoints: 800, startTime: '00:00', endTime: '23:59', description: 'สร้างพฤติกรรมสุขภาพแบบยั่งยืนต่อเนื่อง 1 เดือน', targetValue: 30, targetUnit: 'days', requiredLevel: 91, isActive: true },
    { missionName: 'Health Legend', missionType: 'CHALLENGE', rewardExp: 5000, rewardPoints: 1000, startTime: '00:00', endTime: '23:59', description: 'ทำภารกิจทั้งหมดครบ + ออกกำลังกายทุกวัน 30 วัน', targetValue: 30, targetUnit: 'days', requiredLevel: 91, isActive: true },
];

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data (optional, but good for idempotent runs)
    await prisma.level.deleteMany({});
    await prisma.exercise.deleteMany({});
    await prisma.mission.deleteMany({});

    // Seed Levels
    console.log('📊 Seeding Levels...');
    await prisma.level.createMany({ data: levelsData });
    console.log(`   ✅ ${levelsData.length} levels created`);

    // Seed Exercises
    console.log('🏃 Seeding Exercises...');
    await prisma.exercise.createMany({ data: exercisesData });
    console.log(`   ✅ ${exercisesData.length} exercises created`);

    // Seed Missions
    console.log('🎯 Seeding Missions...');
    await prisma.mission.createMany({ data: missionsData });
    console.log(`   ✅ ${missionsData.length} missions created`);

    console.log('\n🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
