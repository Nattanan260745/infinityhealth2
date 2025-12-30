const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
const connectDB = require('./config/db');

const listUsers = async () => {
    try {
        await connectDB();
        const users = await User.find({}, 'userId fullName email');
        console.log('--- User List ---');
        users.forEach(u => {
            console.log(`ID: ${u.userId} | Name: ${u.fullName} | Email: ${u.email} | _id: ${u._id}`);
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listUsers();
