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
    // Derived from challenge missions.ini
    // Lv 1
    { missionName: 'ขยับร่างกาย ≥ 5 นาที', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ขยับร่างกาย ≥ 5 นาที', targetValue: 5, targetUnit: 'minutes', requiredLevel: 1, isActive: true },
    // Lv 2
    { missionName: 'ดื่มน้ำเพิ่มจากปกติ ≥ 1 แก้ว', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดื่มน้ำเพิ่มจากปกติ ≥ 1 แก้ว', targetValue: 1, targetUnit: 'glass', requiredLevel: 2, isActive: true },
    // Lv 3
    { missionName: 'หยุดจอ (มือถือ/คอม) ติดต่อกัน ≥ 10 นาที', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'หยุดจอ (มือถือ/คอม) ติดต่อกัน ≥ 10 นาที', targetValue: 10, targetUnit: 'minutes', requiredLevel: 3, isActive: true },
    // Lv 4
    { missionName: 'เดิน ≥ 1,000 ก้าว', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เดิน ≥ 1,000 ก้าว', targetValue: 1000, targetUnit: 'steps', requiredLevel: 4, isActive: true },
    // Lv 5
    { missionName: 'ดื่มน้ำ ≥ 5 แก้ว', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดื่มน้ำ ≥ 5 แก้ว', targetValue: 1250, targetUnit: 'ml', requiredLevel: 5, isActive: true }, // Approx 250ml per glass
    // Lv 6
    { missionName: 'ขยับร่างกาย ≥ 10 นาที', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ขยับร่างกาย ≥ 10 นาที', targetValue: 10, targetUnit: 'minutes', requiredLevel: 6, isActive: true },
    // Lv 7
    { missionName: 'เลือกอาหารที่ไม่ทอด/ไม่หวาน ≥ 1 มื้อ', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เลือกอาหารที่ไม่ทอด/ไม่หวาน ≥ 1 มื้อ', targetValue: 1, targetUnit: 'meal', requiredLevel: 7, isActive: true },
    // Lv 8
    { missionName: 'เดิน ≥ 2,000 ก้าว', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เดิน ≥ 2,000 ก้าว', targetValue: 2000, targetUnit: 'steps', requiredLevel: 8, isActive: true },
    // Lv 9
    { missionName: 'พักผ่อนหรือผ่อนคลาย ≥ 10 นาที', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'พักผ่อนหรือผ่อนคลาย ≥ 10 นาที', targetValue: 10, targetUnit: 'minutes', requiredLevel: 9, isActive: true },
    // Lv 10
    { missionName: 'ทำ Daily Mission ใดก็ได้ ≥ 1 รายการ', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ทำ Daily Mission ใดก็ได้ ≥ 1 รายการ', targetValue: 1, targetUnit: 'mission', requiredLevel: 10, isActive: true },

    // Lv 11
    { missionName: 'เดิน ≥ 3,000 ก้าว', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เดิน ≥ 3,000 ก้าว', targetValue: 3000, targetUnit: 'steps', requiredLevel: 11, isActive: true },
    // Lv 12
    { missionName: 'ดื่มน้ำ ≥ 6 แก้ว', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดื่มน้ำ ≥ 6 แก้ว', targetValue: 1500, targetUnit: 'ml', requiredLevel: 12, isActive: true },
    // Lv 13
    { missionName: 'หยุดจอ ≥ 15 นาที', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'หยุดจอ ≥ 15 นาที', targetValue: 15, targetUnit: 'minutes', requiredLevel: 13, isActive: true },
    // Lv 14
    { missionName: 'นอน ≥ 6 ชั่วโมง', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'นอน ≥ 6 ชั่วโมง', targetValue: 6, targetUnit: 'hours', requiredLevel: 14, isActive: true },
    // Lv 15
    { missionName: 'ขยับร่างกาย ≥ 10 นาที', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ขยับร่างกาย ≥ 10 นาที (ทำ 3 วัน)', targetValue: 3, targetUnit: 'days', requiredLevel: 15, isActive: true },
    // Lv 16
    { missionName: 'เดิน ≥ 4,000 ก้าว', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เดิน ≥ 4,000 ก้าว', targetValue: 4000, targetUnit: 'steps', requiredLevel: 16, isActive: true },
    // Lv 17
    { missionName: 'ดื่มน้ำ ≥ 7 แก้ว', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดื่มน้ำ ≥ 7 แก้ว', targetValue: 1750, targetUnit: 'ml', requiredLevel: 17, isActive: true },
    // Lv 18
    { missionName: 'ผ่อนคลาย/หายใจลึก ≥ 10 นาที', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ผ่อนคลาย/หายใจลึก ≥ 10 นาที', targetValue: 10, targetUnit: 'minutes', requiredLevel: 18, isActive: true },
    // Lv 19
    { missionName: 'นอน–ตื่นเวลาใกล้เคียงกัน (±1 ชม.)', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'นอน–ตื่นเวลาใกล้เคียงกัน (±1 ชม.)', targetValue: 1, targetUnit: 'consistency', requiredLevel: 19, isActive: true },
    // Lv 20
    { missionName: 'Self-Care Planner Review – ระดับต้น', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'Self-Care Planner Review – ระดับต้น', targetValue: 1, targetUnit: 'review', requiredLevel: 20, isActive: true },

    // Lv 21
    { missionName: 'เดิน ≥ 5,000 ก้าว/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เดิน ≥ 5,000 ก้าว/วัน', targetValue: 5000, targetUnit: 'steps', requiredLevel: 21, isActive: true },
    // Lv 22
    { missionName: 'ดื่มน้ำ ≥ 8 แก้ว/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดื่มน้ำ ≥ 8 แก้ว/วัน', targetValue: 2000, targetUnit: 'ml', requiredLevel: 22, isActive: true },
    // Lv 23
    { missionName: 'ขยับร่างกาย/ออกกำลังกาย ≥ 15 นาที', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ขยับร่างกาย/ออกกำลังกาย ≥ 15 นาที', targetValue: 15, targetUnit: 'minutes', requiredLevel: 23, isActive: true },
    // Lv 24
    { missionName: 'นอน ≥ 6.5 ชั่วโมง', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'นอน ≥ 6.5 ชั่วโมง', targetValue: 6.5, targetUnit: 'hours', requiredLevel: 24, isActive: true },
    // Lv 25
    { missionName: 'เลือกอาหารดี ≥ 2 มื้อ/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เลือกอาหารดี ≥ 2 มื้อ/วัน', targetValue: 2, targetUnit: 'meal', requiredLevel: 25, isActive: true },
    // Lv 26
    { missionName: 'เดิน ≥ 5,000 ก้าว/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เดิน ≥ 5,000 ก้าว/วัน (ทำ 3 วัน)', targetValue: 3, targetUnit: 'days', requiredLevel: 26, isActive: true },
    // Lv 27
    { missionName: 'ดื่มน้ำ ≥ 8 แก้ว/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดื่มน้ำ ≥ 8 แก้ว/วัน (ทำ 3 วัน)', targetValue: 3, targetUnit: 'days', requiredLevel: 27, isActive: true },
    // Lv 28
    { missionName: 'พักผ่อน/ผ่อนคลาย ≥ 15 นาที', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'พักผ่อน/ผ่อนคลาย ≥ 15 นาที', targetValue: 15, targetUnit: 'minutes', requiredLevel: 28, isActive: true },
    // Lv 29
    { missionName: 'นอน–ตื่นเวลาใกล้เคียงกัน (±45 นาที)', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'นอน–ตื่นเวลาใกล้เคียงกัน (±45 นาที)', targetValue: 1, targetUnit: 'consistency', requiredLevel: 29, isActive: true },
    // Lv 30
    { missionName: 'ทำ Daily Mission ≥ 2 รายการ/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ทำ Daily Mission ≥ 2 รายการ/วัน', targetValue: 2, targetUnit: 'mission', requiredLevel: 30, isActive: true },

    // Lv 31
    { missionName: 'เดิน ≥ 6,000 ก้าว/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เดิน ≥ 6,000 ก้าว/วัน', targetValue: 6000, targetUnit: 'steps', requiredLevel: 31, isActive: true },
    // Lv 32
    { missionName: 'ออกกำลังกาย ≥ 20 นาที', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ออกกำลังกาย ≥ 20 นาที', targetValue: 20, targetUnit: 'minutes', requiredLevel: 32, isActive: true },
    // Lv 33
    { missionName: 'ดื่มน้ำครบเป้า', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดื่มน้ำครบเป้า', targetValue: 2000, targetUnit: 'ml', requiredLevel: 33, isActive: true },
    // Lv 34
    { missionName: 'นอน ≥ 7 ชั่วโมง', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'นอน ≥ 7 ชั่วโมง', targetValue: 7, targetUnit: 'hours', requiredLevel: 34, isActive: true },
    // Lv 35
    { missionName: 'เดิน ≥ 6,000 ก้าว/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เดิน ≥ 6,000 ก้าว/วัน (ทำ 5 วัน)', targetValue: 5, targetUnit: 'days', requiredLevel: 35, isActive: true },
    // Lv 36
    { missionName: 'ออกกำลังกาย ≥ 30 นาที', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ออกกำลังกาย ≥ 30 นาที', targetValue: 30, targetUnit: 'minutes', requiredLevel: 36, isActive: true },
    // Lv 37
    { missionName: 'เลือกอาหารตามสัดส่วนเหมาะสม', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เลือกอาหารตามสัดส่วนเหมาะสม (เช่น 2:1:1)', targetValue: 1, targetUnit: 'meal', requiredLevel: 37, isActive: true },
    // Lv 38
    { missionName: 'พักจริง (ไม่จอ/ไม่งาน) ≥ 20 นาที', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'พักจริง (ไม่จอ/ไม่งาน) ≥ 20 นาที', targetValue: 20, targetUnit: 'minutes', requiredLevel: 38, isActive: true },
    // Lv 39
    { missionName: 'ดูแลสุขภาพครบ 3 มิติในวันเดียว', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดูแลสุขภาพครบ 3 มิติในวันเดียว (ขยับ–กิน–พัก)', targetValue: 3, targetUnit: 'dimensions', requiredLevel: 39, isActive: true },
    // Lv 40
    { missionName: 'Self-Care Planner Review – ระดับกลาง', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'Self-Care Planner Review – ระดับกลาง', targetValue: 1, targetUnit: 'review', requiredLevel: 40, isActive: true },

    // Lv 41
    { missionName: 'เดิน ≥ 6,000 ก้าว/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เดิน ≥ 6,000 ก้าว/วัน (ทำ 4 วัน)', targetValue: 4, targetUnit: 'days', requiredLevel: 41, isActive: true },
    // Lv 42
    { missionName: 'ออกกำลังกาย ≥ 20 นาที/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ออกกำลังกาย ≥ 20 นาที/วัน', targetValue: 20, targetUnit: 'minutes', requiredLevel: 42, isActive: true },
    // Lv 43
    { missionName: 'ดื่มน้ำครบเป้า (≈ 8 แก้ว/วัน)', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดื่มน้ำครบเป้า (≈ 8 แก้ว/วัน)', targetValue: 2000, targetUnit: 'ml', requiredLevel: 43, isActive: true },
    // Lv 44
    { missionName: 'นอน ≥ 7 ชั่วโมง/คืน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'นอน ≥ 7 ชั่วโมง/คืน', targetValue: 7, targetUnit: 'hours', requiredLevel: 44, isActive: true },
    // Lv 45
    { missionName: 'เดิน ≥ 6,000 ก้าว/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เดิน ≥ 6,000 ก้าว/วัน (ทำ 5 วัน)', targetValue: 5, targetUnit: 'days', requiredLevel: 45, isActive: true },
    // Lv 46
    { missionName: 'ออกกำลังกาย ≥ 30 นาที/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ออกกำลังกาย ≥ 30 นาที/วัน', targetValue: 30, targetUnit: 'minutes', requiredLevel: 46, isActive: true },
    // Lv 47
    { missionName: 'เลือกอาหารตามสัดส่วนเหมาะสม', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เลือกอาหารตามสัดส่วนเหมาะสม (ทำ 4 วัน)', targetValue: 4, targetUnit: 'days', requiredLevel: 47, isActive: true },
    // Lv 48
    { missionName: 'พักจริง (ไม่จอ/ไม่งาน) ≥ 20 นาที/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'พักจริง (ไม่จอ/ไม่งาน) ≥ 20 นาที/วัน', targetValue: 20, targetUnit: 'minutes', requiredLevel: 48, isActive: true },
    // Lv 49
    { missionName: 'ดูแลสุขภาพครบ 3 มิติในวันเดียว', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดูแลสุขภาพครบ 3 มิติในวันเดียว (ทำ 3 วัน)', targetValue: 3, targetUnit: 'days', requiredLevel: 49, isActive: true },
    // Lv 50
    { missionName: 'ทำ Daily Mission ≥ 70% ของวันที่ใช้งาน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ทำ Daily Mission ≥ 70% ของวันที่ใช้งาน', targetValue: 70, targetUnit: 'percent', requiredLevel: 50, isActive: true },

    // Lv 51
    { missionName: 'เดิน ≥ 7,000 ก้าว/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เดิน ≥ 7,000 ก้าว/วัน', targetValue: 7000, targetUnit: 'steps', requiredLevel: 51, isActive: true },
    // Lv 52
    { missionName: 'ออกกำลังกาย ≥ 30 นาที/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ออกกำลังกาย ≥ 30 นาที/วัน', targetValue: 30, targetUnit: 'minutes', requiredLevel: 52, isActive: true },
    // Lv 53
    { missionName: 'ดื่มน้ำครบเป้า', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดื่มน้ำครบเป้า (ทำ 6 วัน)', targetValue: 6, targetUnit: 'days', requiredLevel: 53, isActive: true },
    // Lv 54
    { missionName: 'นอน ≥ 7 ชั่วโมง/คืน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'นอน ≥ 7 ชั่วโมง/คืน (ทำ 4 คืน)', targetValue: 4, targetUnit: 'nights', requiredLevel: 54, isActive: true },
    // Lv 55
    { missionName: 'วางแผนกิจกรรมสุขภาพล่วงหน้า', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'วางแผนกิจกรรมสุขภาพล่วงหน้า (Planner)', targetValue: 1, targetUnit: 'plan', requiredLevel: 55, isActive: true },
    // Lv 56
    { missionName: 'เลือกอาหารให้เหมาะกับกิจกรรม', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เลือกอาหารให้เหมาะกับกิจกรรมของวันนั้น', targetValue: 1, targetUnit: 'meal', requiredLevel: 56, isActive: true },
    // Lv 57
    { missionName: 'ออกกำลังกายตามแผนที่ตั้งเอง', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ออกกำลังกายตามแผนที่ตั้งเอง', targetValue: 1, targetUnit: 'class', requiredLevel: 57, isActive: true },
    // Lv 58
    { missionName: 'ดูแลสุขภาพครบ 4 มิติในวันเดียว', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดูแลสุขภาพครบ 4 มิติในวันเดียว (ขยับ–กิน–ดื่ม–พัก)', targetValue: 4, targetUnit: 'dimensions', requiredLevel: 58, isActive: true },
    // Lv 59
    { missionName: 'ปรับกิจกรรมจากระดับพลังงาน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ปรับกิจกรรมจากระดับพลังงาน/ความล้าของวันนั้น', targetValue: 1, targetUnit: 'adjustment', requiredLevel: 59, isActive: true },
    // Lv 60
    { missionName: 'Self-Care Planner Review – ระดับคุณภาพ', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'Self-Care Planner Review – ระดับคุณภาพ', targetValue: 1, targetUnit: 'review', requiredLevel: 60, isActive: true },

    // Lv 61
    { missionName: 'เดิน ≥ 7,500 ก้าว/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เดิน ≥ 7,500 ก้าว/วัน', targetValue: 7500, targetUnit: 'steps', requiredLevel: 61, isActive: true },
    // Lv 62
    { missionName: 'ออกกำลังกายตาม “เป้าหมายเฉพาะตน”', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ออกกำลังกายตาม “เป้าหมายเฉพาะตน” (เช่น คาร์ดิโอ/แรงต้าน/ผ่อนคลาย) ≥ 30 นาที', targetValue: 30, targetUnit: 'minutes', requiredLevel: 62, isActive: true },
    // Lv 63
    { missionName: 'ดื่มน้ำสัมพันธ์กับกิจกรรมของวัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดื่มน้ำสัมพันธ์กับกิจกรรมของวัน (มากขึ้นในวันออกกำลัง)', targetValue: 1, targetUnit: 'check', requiredLevel: 63, isActive: true },
    // Lv 64
    { missionName: 'นอนคุณภาพดี ≥ 7 ชั่วโมง', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'นอนคุณภาพดี ≥ 7 ชั่วโมง (เข้านอนสม่ำเสมอ/ไม่จอก่อนนอน)', targetValue: 7, targetUnit: 'hours', requiredLevel: 64, isActive: true },
    // Lv 65
    { missionName: 'ดูแลสุขภาพครบ 4 มิติในวันเดียว', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดูแลสุขภาพครบ 4 มิติในวันเดียว (ทำ 4 วัน)', targetValue: 4, targetUnit: 'days', requiredLevel: 65, isActive: true },
    // Lv 66
    { missionName: 'เดิน ≥ 8,000 ก้าว/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เดิน ≥ 8,000 ก้าว/วัน', targetValue: 8000, targetUnit: 'steps', requiredLevel: 66, isActive: true },
    // Lv 67
    { missionName: 'ออกกำลังกายโดย “ปรับความหนักเอง”', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ออกกำลังกายโดย “ปรับความหนักเอง” ให้ไม่ล้าสะสม', targetValue: 1, targetUnit: 'check', requiredLevel: 67, isActive: true },
    // Lv 68
    { missionName: 'ปรับแผนสุขภาพจากข้อมูลจริง', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ปรับแผนสุขภาพจากข้อมูลจริง (ก้าว/เวลา/พลังงาน)', targetValue: 1, targetUnit: 'plan', requiredLevel: 68, isActive: true },
    // Lv 69
    { missionName: 'รักษาสมดุล “วันทำงาน–วันพัก”', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'รักษาสมดุล “วันทำงาน–วันพัก”', targetValue: 4, targetUnit: 'days', requiredLevel: 69, isActive: true },
    // Lv 70
    { missionName: 'ทำตามแผนสุขภาพที่ตั้งเอง', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ทำตามแผนสุขภาพที่ตั้งเอง (Planner-Driven Day)', targetValue: 5, targetUnit: 'days', requiredLevel: 70, isActive: true },
    // Lv 71
    { missionName: 'Daily Mission Completion ≥ 80%', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'Daily Mission Completion ≥ 80% (ต่อเนื่อง 7 วัน)', targetValue: 7, targetUnit: 'days', requiredLevel: 71, isActive: true },
    // Lv 72
    { missionName: 'เดินเฉลี่ย ≥ 8,000 ก้าว/วัน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'เดินเฉลี่ย ≥ 8,000 ก้าว/วัน (1 สัปดาห์)', targetValue: 8000, targetUnit: 'avg_steps', requiredLevel: 72, isActive: true },
    // Lv 73
    { missionName: 'ออกกำลังกายโดยไม่เกิดความล้าสะสม', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ออกกำลังกายโดยไม่เกิดความล้าสะสม', targetValue: 5, targetUnit: 'days', requiredLevel: 73, isActive: true },
    // Lv 74
    { missionName: 'นอน–ตื่นเป็นเวลาเดียวกัน (±30 นาที)', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'นอน–ตื่นเป็นเวลาเดียวกัน (±30 นาที)', targetValue: 5, targetUnit: 'nights', requiredLevel: 74, isActive: true },
    // Lv 75
    { missionName: 'ทดลองกิจกรรมสุขภาพใหม่ที่ “เหมาะกับตน”', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ทดลองกิจกรรมสุขภาพใหม่ที่ “เหมาะกับตน”', targetValue: 1, targetUnit: 'activity', requiredLevel: 75, isActive: true },
    // Lv 76
    { missionName: 'รักษาพฤติกรรมหลักโดยไม่ต้องแจ้งเตือน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'รักษาพฤติกรรมหลักโดยไม่ต้องแจ้งเตือน', targetValue: 5, targetUnit: 'days', requiredLevel: 76, isActive: true },
    // Lv 77
    { missionName: 'ปรับพฤติกรรมทันทีเมื่อรู้สึกล้า/ตึง', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ปรับพฤติกรรมทันทีเมื่อรู้สึกล้า/ตึง', targetValue: 4, targetUnit: 'days', requiredLevel: 77, isActive: true },
    // Lv 78
    { missionName: 'ดูแลสุขภาพครบ 4 มิติอย่างสมดุล', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ดูแลสุขภาพครบ 4 มิติอย่างสมดุล', targetValue: 4, targetUnit: 'dimensions', requiredLevel: 78, isActive: true },
    // Lv 79
    { missionName: 'ประเมินและเลือก “กิจกรรมหลักที่เหมาะกับตนที่สุด”', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ประเมินและเลือก “กิจกรรมหลักที่เหมาะกับตนที่สุด”', targetValue: 1, targetUnit: 'selection', requiredLevel: 79, isActive: true },
    // Lv 80
    { missionName: 'Self-Care Planner Review – ระดับ Personalization', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'Self-Care Planner Review – ระดับ Personalization', targetValue: 1, targetUnit: 'review', requiredLevel: 80, isActive: true },

    // Lv 81
    { missionName: 'Daily Mission Completion ≥ 85%', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'Daily Mission Completion ≥ 85% (ต่อเนื่อง 7 วัน)', targetValue: 7, targetUnit: 'days', requiredLevel: 81, isActive: true },
    // Lv 82
    { missionName: 'รักษา “วันสมดุล” (ขยับ–กิน–ดื่ม–พัก ครบ)', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'รักษา “วันสมดุล” (ขยับ–กิน–ดื่ม–พัก ครบ)', targetValue: 4, targetUnit: 'days', requiredLevel: 82, isActive: true },
    // Lv 83
    { missionName: 'นอน–ตื่นสม่ำเสมอ (±30 นาที)', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'นอน–ตื่นสม่ำเสมอ (±30 นาที)', targetValue: 5, targetUnit: 'nights', requiredLevel: 83, isActive: true },
    // Lv 84
    { missionName: 'รักษาพฤติกรรมหลักโดย ไม่พึ่งการแจ้งเตือน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'รักษาพฤติกรรมหลักโดย ไม่พึ่งการแจ้งเตือน', targetValue: 5, targetUnit: 'days', requiredLevel: 84, isActive: true },
    // Lv 85
    { missionName: 'ปรับกิจกรรมตามสัญญาณร่างกาย (ไม่ฝืน/ไม่ละเลย)', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ปรับกิจกรรมตามสัญญาณร่างกาย', targetValue: 4, targetUnit: 'days', requiredLevel: 85, isActive: true },
    // Lv 86
    { missionName: 'รักษาสมดุล “วันทำงาน–วันพัก” ตลอดสัปดาห์', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'รักษาสมดุล “วันทำงาน–วันพัก” ตลอดสัปดาห์', targetValue: 1, targetUnit: 'week', requiredLevel: 86, isActive: true },
    // Lv 87
    { missionName: 'ทำ Daily Mission ต่อนเนื่องโดย ไม่มี Penalty', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ทำ Daily Mission ต่อนเนื่องโดย ไม่มี Penalty (7 วัน)', targetValue: 7, targetUnit: 'days', requiredLevel: 87, isActive: true },
    // Lv 88
    { missionName: 'ถ่ายทอด/ชวนผู้อื่นทำกิจกรรมสุขภาพ', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ถ่ายทอด/ชวนผู้อื่นทำกิจกรรมสุขภาพอย่างน้อย 1 ครั้ง', targetValue: 1, targetUnit: 'time', requiredLevel: 88, isActive: true },
    // Lv 89
    { missionName: 'ประเมินและคงไว้ซึ่ง “กิจกรรมหลักของฉัน”', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ประเมินและคงไว้ซึ่ง “กิจกรรมหลักของฉัน”', targetValue: 3, targetUnit: 'days', requiredLevel: 89, isActive: true },

    // Lv 90
    { missionName: 'Planner + Daily Mission Completion ≥ 90%', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'Planner + Daily Mission Completion ≥ 90%', targetValue: 90, targetUnit: 'percent', requiredLevel: 90, isActive: true },
    // Lv 91
    { missionName: 'รักษาพฤติกรรมหลักใน “วันที่ยุ่ง/มีอุปสรรค”', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'รักษาพฤติกรรมหลักใน “วันที่ยุ่ง/มีอุปสรรค”', targetValue: 4, targetUnit: 'days', requiredLevel: 91, isActive: true },
    // Lv 92
    { missionName: 'ปรับแผนสุขภาพอย่างยืดหยุ่นเมื่อมีการเปลี่ยนแปลง', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ปรับแผนสุขภาพอย่างยืดหยุ่นเมื่อมีการเปลี่ยนแปลง', targetValue: 3, targetUnit: 'days', requiredLevel: 92, isActive: true },
    // Lv 93
    { missionName: 'รักษา Streak สุขภาพโดยรวม', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'รักษา Streak สุขภาพโดยรวม (21 วัน)', targetValue: 21, targetUnit: 'days', requiredLevel: 93, isActive: true },
    // Lv 94
    { missionName: 'คงระดับพลังงานชีวิต “ไม่ล้าสะสม”', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'คงระดับพลังงานชีวิต “ไม่ล้าสะสม”', targetValue: 5, targetUnit: 'days', requiredLevel: 94, isActive: true },
    // Lv 95
    { missionName: 'ตัดสินใจเลือกพฤติกรรมสุขภาพได้เองโดยไม่ต้องเตือน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ตัดสินใจเลือกพฤติกรรมสุขภาพได้เองโดยไม่ต้องเตือน', targetValue: 5, targetUnit: 'days', requiredLevel: 95, isActive: true },
    // Lv 96
    { missionName: 'กลับสู่กิจวัตรสุขภาพได้ภายใน 24 ชม. เมื่อพลาด', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'กลับสู่กิจวัตรสุขภาพได้ภายใน 24 ชม. เมื่อพลาด', targetValue: 2, targetUnit: 'times', requiredLevel: 96, isActive: true },
    // Lv 97
    { missionName: 'ทำหน้าที่สนับสนุน/เป็นแรงบันดาลใจด้านสุขภาพ', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'ทำหน้าที่สนับสนุน/เป็นแรงบันดาลใจด้านสุขภาพ', targetValue: 1, targetUnit: 'time', requiredLevel: 97, isActive: true },
    // Lv 98
    { missionName: 'สรุปบทเรียนสุขภาพจากข้อมูลจริงของตน', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'สรุปบทเรียนสุขภาพจากข้อมูลจริงของตน', targetValue: 1, targetUnit: 'submission', requiredLevel: 98, isActive: true },
    // Lv 99
    { missionName: 'รักษาวิถีชีวิตสุขภาพในแบบที่ตนเลือก', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'รักษาวิถีชีวิตสุขภาพในแบบที่ตนเลือก (7 วัน)', targetValue: 7, targetUnit: 'days', requiredLevel: 99, isActive: true },
    // Lv 100
    { missionName: 'Sustainable Lifestyle Master Review', missionType: 'CHALLENGE', rewardExp: 0, rewardPoints: 0, startTime: '00:00', endTime: '23:59', description: 'Sustainable Lifestyle Master Review', targetValue: 1, targetUnit: 'review', requiredLevel: 100, isActive: true },
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
