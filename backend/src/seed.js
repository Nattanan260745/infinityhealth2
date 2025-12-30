require('dotenv').config();
const mongoose = require('mongoose');
const Level = require('./models/Level');
const Exercise = require('./models/Exercise');
const Mission = require('./models/Mission');

// ========== LEVELS DATA ==========
// Level 1-10: Beginner (Spring Green #00FF7F)
// Level 11-20: Novice (Cornflower Blue #6495ED)
// Level 21-30: Intermediate (Light Slate Blue #8470FF)
// Level 31-40: Skilled (Orange #FFA500)
// Level 41-50: Advanced (Cyan #00FFFF)
// Level 51-60: Expert (Violet #EE82EE)
// Level 61-70: Master (Dark Violet #9400D3)
// Level 71-80: Grand Master (Magenta #FF00FF)
// Level 81-90: Elite (Red #FF0000)
// Level 91-100: Legendary (Gold #FFD700)

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
    
    // Calculate required exp (increases as level goes up)
    const baseExp = 100;
    const expMultiplier = Math.floor((i - 1) / 10) + 1;
    const required_exp = baseExp * expMultiplier * (1 + (i % 10) * 0.1);
    const roundedExp = Math.round(required_exp / 10) * 10;
    
    const min_exp = cumulativeExp;
    cumulativeExp += roundedExp;
    const max_exp = cumulativeExp;

    levels.push({
      level_id: i,
      name: `Level ${i}`,
      title: tier.title,
      title_th: tier.titleTh,
      color: tier.color,
      hex_code: tier.hex_code,
      min_exp: min_exp,
      max_exp: max_exp,
      required_exp: roundedExp,
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
  // ภารกิจที่ทำได้ทุกวัน รีเซ็ตทุกเที่ยงคืน
  { title: 'Drink Water', type: 'daily', reward_exp: 30, reward_points: 5, start_time: '00:00', end_time: '23:59', description: 'ดื่มน้ำให้ครบ 2,000 ml', target_value: 2000, target_unit: 'ml', min_level: 1, is_active: true },
  { title: 'Step Count', type: 'daily', reward_exp: 50, reward_points: 10, start_time: '00:00', end_time: '23:59', description: 'เดินให้ครบ 5,000 ก้าว', target_value: 5000, target_unit: 'steps', min_level: 1, is_active: true },
  { title: 'Morning Walk', type: 'daily', reward_exp: 40, reward_points: 8, start_time: '06:00', end_time: '09:00', description: 'เดินตอนเช้า 15 นาที', target_value: 15, target_unit: 'minutes', min_level: 1, is_active: true },
  { title: 'Healthy Meal', type: 'daily', reward_exp: 30, reward_points: 6, start_time: '00:00', end_time: '23:59', description: 'ทานอาหารที่ดีต่อสุขภาพ', target_value: 1, target_unit: 'meal', min_level: 1, is_active: true },
  { title: 'Sleep Early', type: 'daily', reward_exp: 40, reward_points: 10, start_time: '21:00', end_time: '23:59', description: 'นอนก่อน 4 ทุ่ม', target_value: 1, target_unit: 'time', min_level: 1, is_active: true },
  { title: 'Stretch Break', type: 'daily', reward_exp: 25, reward_points: 5, start_time: '00:00', end_time: '23:59', description: 'ยืดเส้นยืดสาย 10 นาที', target_value: 10, target_unit: 'minutes', min_level: 1, is_active: true },
  { title: 'No Sugary Drinks', type: 'daily', reward_exp: 35, reward_points: 8, start_time: '00:00', end_time: '23:59', description: 'งดเครื่องดื่มที่มีน้ำตาล', target_value: 1, target_unit: 'day', min_level: 1, is_active: true },
  { title: 'Avoid Fried Food', type: 'daily', reward_exp: 35, reward_points: 8, start_time: '00:00', end_time: '23:59', description: 'งดอาหารทอด', target_value: 1, target_unit: 'day', min_level: 1, is_active: true },

  // =============== CHALLENGE MISSIONS ===============
  // ภารกิจท้าทาย - ปลดล็อคทุก 10 เลเวล
  
  // Level 1-10: Beginner Challenges
  { title: 'First Step', type: 'challenge', reward_exp: 100, reward_points: 25, start_time: '00:00', end_time: '23:59', description: 'ออกกำลังกายครั้งแรก', target_value: 1, target_unit: 'time', min_level: 1, is_active: true },
  { title: 'กินอาหารครบ 5 หมู่', type: 'challenge', reward_exp: 150, reward_points: 30, start_time: '00:00', end_time: '23:59', description: 'กินอาหารให้ครบ 5 หมู่ ติดต่อกัน 3 วัน', target_value: 3, target_unit: 'days', min_level: 1, is_active: true },
  
  // Level 11-20: Novice Challenges
  { title: 'ลดน้ำตาลในอาหาร', type: 'challenge', reward_exp: 200, reward_points: 50, start_time: '00:00', end_time: '23:59', description: 'ลดน้ำตาลในอาหาร 1 มื้อ ติดต่อกัน 7 วัน', target_value: 7, target_unit: 'days', min_level: 11, is_active: true },
  { title: 'Hydration Hero', type: 'challenge', reward_exp: 180, reward_points: 40, start_time: '00:00', end_time: '23:59', description: 'ดื่มน้ำครบทุกวัน 7 วันติด', target_value: 7, target_unit: 'days', min_level: 11, is_active: true },
  
  // Level 21-30: Intermediate Challenges
  { title: 'งดน้ำอัดลม', type: 'challenge', reward_exp: 280, reward_points: 70, start_time: '00:00', end_time: '23:59', description: 'งดน้ำอัดลม 1 วัน ติดต่อกัน 14 วัน', target_value: 14, target_unit: 'days', min_level: 21, is_active: true },
  { title: 'Step Master', type: 'challenge', reward_exp: 300, reward_points: 80, start_time: '00:00', end_time: '23:59', description: 'เดินครบ 10,000 ก้าวใน 1 วัน', target_value: 10000, target_unit: 'steps', min_level: 21, is_active: true },
  
  // Level 31-40: Skilled Challenges
  { title: 'คาร์ดิโอ 30 นาที', type: 'challenge', reward_exp: 400, reward_points: 100, start_time: '00:00', end_time: '23:59', description: 'คาร์ดิโอ 30 นาที 3 วัน/สัปดาห์ ติดต่อกัน 2 สัปดาห์', target_value: 6, target_unit: 'times', min_level: 31, is_active: true },
  { title: 'Workout Warrior', type: 'challenge', reward_exp: 450, reward_points: 120, start_time: '00:00', end_time: '23:59', description: 'ออกกำลังกายติดต่อกัน 14 วัน', target_value: 14, target_unit: 'days', min_level: 31, is_active: true },
  
  // Level 41-50: Advanced Challenges
  { title: 'เวทเทรนนิ่ง', type: 'challenge', reward_exp: 550, reward_points: 140, start_time: '00:00', end_time: '23:59', description: 'เวทเทรนนิ่ง 3 วัน/สัปดาห์ ติดต่อกัน 3 สัปดาห์', target_value: 9, target_unit: 'times', min_level: 41, is_active: true },
  { title: 'Health Master', type: 'challenge', reward_exp: 600, reward_points: 150, start_time: '00:00', end_time: '23:59', description: 'ทำภารกิจ Daily ครบทุกอัน 14 วัน', target_value: 14, target_unit: 'days', min_level: 41, is_active: true },
  
  // Level 51-60: Expert Challenges
  { title: 'กินผักผลไม้ทุกวัน', type: 'challenge', reward_exp: 700, reward_points: 180, start_time: '00:00', end_time: '23:59', description: 'กินผักและผลไม้ทุกวัน 5 วัน ติดต่อกัน 3 สัปดาห์', target_value: 15, target_unit: 'days', min_level: 51, is_active: true },
  { title: 'Marathon Walker', type: 'challenge', reward_exp: 750, reward_points: 200, start_time: '00:00', end_time: '23:59', description: 'เดินรวม 100,000 ก้าวในสัปดาห์', target_value: 100000, target_unit: 'steps', min_level: 51, is_active: true },
  
  // Level 61-70: Master Challenges
  { title: 'งดอาหารแปรรูป', type: 'challenge', reward_exp: 900, reward_points: 250, start_time: '00:00', end_time: '23:59', description: 'งดอาหารแปรรูป 1 สัปดาห์', target_value: 7, target_unit: 'days', min_level: 61, is_active: true },
  { title: 'Perfect Week', type: 'challenge', reward_exp: 1000, reward_points: 300, start_time: '00:00', end_time: '23:59', description: 'ทำภารกิจ Daily ครบทุกอัน 21 วัน', target_value: 21, target_unit: 'days', min_level: 61, is_active: true },
  
  // Level 71-80: Grand Master Challenges
  { title: 'งดหวานจัด', type: 'challenge', reward_exp: 1200, reward_points: 350, start_time: '00:00', end_time: '23:59', description: 'งดหวานจัด 2 สัปดาห์', target_value: 14, target_unit: 'days', min_level: 71, is_active: true },
  { title: 'Body Transformation', type: 'challenge', reward_exp: 1500, reward_points: 400, start_time: '00:00', end_time: '23:59', description: 'ลดน้ำหนัก 3 กก. ใน 1 เดือน', target_value: 3, target_unit: 'kg', min_level: 71, is_active: true },
  
  // Level 81-90: Elite Challenges
  { title: 'นอนอย่างมีคุณภาพ', type: 'challenge', reward_exp: 1800, reward_points: 500, start_time: '00:00', end_time: '23:59', description: 'นอนอย่างมีคุณภาพ 8 ชั่วโมง/คืน เป็นเวลา 15 วัน', target_value: 15, target_unit: 'days', min_level: 81, is_active: true },
  { title: 'Ultimate Fitness', type: 'challenge', reward_exp: 2000, reward_points: 600, start_time: '00:00', end_time: '23:59', description: 'ออกกำลังกาย 60 นาที/วัน 21 วันติด', target_value: 21, target_unit: 'days', min_level: 81, is_active: true },
  
  // Level 91-100: Legendary Challenges
  { title: 'สุขภาพยั่งยืน', type: 'challenge', reward_exp: 3000, reward_points: 800, start_time: '00:00', end_time: '23:59', description: 'สร้างพฤติกรรมสุขภาพแบบยั่งยืนต่อเนื่อง 1 เดือน', target_value: 30, target_unit: 'days', min_level: 91, is_active: true },
  { title: 'Health Legend', type: 'challenge', reward_exp: 5000, reward_points: 1000, start_time: '00:00', end_time: '23:59', description: 'ทำภารกิจทั้งหมดครบ + ออกกำลังกายทุกวัน 30 วัน', target_value: 30, target_unit: 'days', min_level: 91, is_active: true },
];

// ========== SEED FUNCTION ==========
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Level.deleteMany({});
    await Exercise.deleteMany({});
    await Mission.deleteMany({});

    // Insert Levels
    console.log('📊 Seeding Levels...');
    await Level.insertMany(levelsData);
    console.log(`   ✅ ${levelsData.length} levels created`);

    // Insert Exercises
    console.log('🏃 Seeding Exercises...');
    await Exercise.insertMany(exercisesData);
    console.log(`   ✅ ${exercisesData.length} exercises created`);

    // Insert Missions
    console.log('🎯 Seeding Missions...');
    await Mission.insertMany(missionsData);
    console.log(`   ✅ ${missionsData.length} missions created`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Levels:    ${levelsData.length}`);
    console.log(`   Exercises: ${exercisesData.length}`);
    console.log(`   Missions:  ${missionsData.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();

