/**
 * BuildMart Database Seed Script
 * Run: node seed.js
 * Creates admin user + demo user
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/buildmart';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Dynamically require models after connection
    const User = require('./models/User');

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@buildmart.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@buildmart.com',
        password: 'admin123',
        role: 'admin',
        phone: '9876543210'
      });
      console.log('✅ Admin user created: admin@buildmart.com / admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create demo user
    const userExists = await User.findOne({ email: 'user@buildmart.com' });
    if (!userExists) {
      await User.create({
        name: 'Demo User',
        email: 'user@buildmart.com',
        password: 'user123',
        role: 'user',
        phone: '9876543211'
      });
      console.log('✅ Demo user created: user@buildmart.com / user123');
    } else {
      console.log('ℹ️  Demo user already exists');
    }

    console.log('\n🎉 Seed complete!');
    console.log('👉 Now start the server: npm run dev');
    console.log('👉 Then visit admin panel and click "Seed Sample Products"');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
