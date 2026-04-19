const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Real Data Seeding...');

  // 1. Read thumbnails.json
  const jsonPath = path.join(__dirname, '../thumbnails.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ thumbnails.json not found!');
    return;
  }

  // Handle UTF-16LE if needed, but let's try standard first
  let rawData;
  try {
    rawData = fs.readFileSync(jsonPath, 'utf8');
    // Check if it's UTF-16LE (has null bytes)
    if (rawData.includes('\u0000')) {
      rawData = fs.readFileSync(jsonPath, 'utf16le');
    }
  } catch (err) {
    console.error('❌ Error reading file:', err);
    return;
  }

  // Strip BOM if present
  if (rawData.charCodeAt(0) === 0xFEFF || rawData.charCodeAt(0) === 65279) {
    rawData = rawData.slice(1);
  }

  const exercises = JSON.parse(rawData);
  console.log(`📦 Found ${exercises.length} exercises in JSON.`);

  // 2. Map Categories and Seed them
  const categories = [...new Set(exercises.map(ex => ex.category.categoryName))];
  console.log('📂 Seeding Categories:', categories);

  for (const catName of categories) {
    const existingCat = await prisma.exerciseCategory.findFirst({
      where: { categoryName: catName }
    });
    if (!existingCat) {
      await prisma.exerciseCategory.create({
        data: { categoryName: catName }
      });
    }
  }

  // Get all categories with IDs
  const dbCategories = await prisma.exerciseCategory.findMany();
  const catMap = dbCategories.reduce((acc, cat) => {
    acc[cat.categoryName] = cat.id;
    return acc;
  }, {});

  // 3. Seed Exercises
  console.log('🎬 Seeding Exercises...');
  let count = 0;
  for (const ex of exercises) {
    const youtubeId = ex.videoUrl.split('v=')[1]?.split('&')[0] || '';
    const thumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : '';

    await prisma.exercise.upsert({
      where: { id: ex.id },
      update: {
        title: ex.title,
        videoUrl: ex.videoUrl,
        thumbnail: thumbnail,
        categoryId: catMap[ex.category.categoryName],
        bodyPart: ex.category.categoryName, // Map category name as bodyPart for compatibility
        difficulty: 'intermediate', // Default
        duration: 15, // Default
        description: ex.title
      },
      create: {
        id: ex.id,
        title: ex.title,
        videoUrl: ex.videoUrl,
        thumbnail: thumbnail,
        categoryId: catMap[ex.category.categoryName],
        bodyPart: ex.category.categoryName,
        difficulty: 'intermediate',
        duration: 15,
        description: ex.title
      }
    });
    count++;
  }

  console.log(`✅ Successfully seeded ${count} exercises!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
