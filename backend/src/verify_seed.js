const mongoose = require('mongoose');
const HealthTrack = require('./models/HealthTrack');
const User = require('./models/User');
require('dotenv').config();

const connectDB = require('./config/db');

const verifyData = async () => {
    try {
        await connectDB();

        const targetUserId = "u000004";
        const user = await User.findOne({ userId: targetUserId });

        if (!user) {
            console.log(`❌ User ${targetUserId} not found.`);
            process.exit(1);
        }

        console.log(`✅ Found User: ${user.fullName} (${user._id})`);

        const tracks = await HealthTrack.find({ user_id: user._id }).sort({ date: -1 });

        console.log(`Found ${tracks.length} HealthTrack records.`);
        tracks.forEach(t => {
            console.log(`Date: ${t.date.toISOString().split('T')[0]}, Weight: ${t.weight}, Steps: ${t.steps}`);
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyData();
