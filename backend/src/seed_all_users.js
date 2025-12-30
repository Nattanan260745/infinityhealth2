const mongoose = require('mongoose');
const HealthTrack = require('./models/HealthTrack');
const User = require('./models/User');
require('dotenv').config();

const connectDB = require('./config/db');

const seedData = async () => {
    try {
        await connectDB();

        // Get ALL users
        const users = await User.find({});
        console.log(`✅ Found ${users.length} users to seed.`);

        const today = new Date();

        for (const user of users) {
            console.log(`🔹 Seeding for user: ${user.fullName} (${user.userId})`);

            const records = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                date.setHours(0, 0, 0, 0);

                // Random Helpers
                const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(1);
                const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

                // Generate Data
                const weight = parseFloat(randomFloat(79.5, 81.0));
                const sleep_hours = parseFloat(randomFloat(6.5, 8.0));
                const water_glass = randomInt(6, 9);
                const steps = randomInt(4000, 8500);

                records.push({
                    user_id: user._id,
                    date: date,
                    weight,
                    height: 175,
                    sleep_hours,
                    water_glass,
                    steps,
                    mood: randomInt(3, 5)
                });
            }

            // Upsert records
            for (const record of records) {
                await HealthTrack.findOneAndUpdate(
                    { user_id: record.user_id, date: record.date },
                    record,
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
            }
            console.log(`   ✅ Seeded 7 days for ${user.userId}`);
        }

        console.log('✅ ALL Seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error(`❌ Error seeding data: ${error.message}`);
        process.exit(1);
    }
};

seedData();
