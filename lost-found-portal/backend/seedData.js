/**
 * Seed Script — populates the DB with demo data for testing
 * Usage: node seedData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Item = require('./models/Item');

const SAMPLE_USERS = [
  { name: 'Admin User', email: 'admin@campus.edu', password: 'admin123', role: 'admin', phone: '+91 98765 00000' },
  { name: 'Rahul Kumar', email: 'rahul@student.edu', password: 'pass123', phone: '+91 98765 11111' },
  { name: 'Priya Sharma', email: 'priya@student.edu', password: 'pass123', phone: '+91 98765 22222' },
];

const SAMPLE_ITEMS = (userIds) => [
  {
    title: 'Blue HP Laptop',
    description: 'Blue HP laptop with sticker of a cat on the lid. Left in the library 2nd floor near the window.',
    category: 'electronics', status: 'lost',
    location: 'Main Library, 2nd Floor', date: new Date('2025-01-15'),
    userId: userIds[1], resolved: false,
  },
  {
    title: 'Brown Leather Wallet',
    description: 'Brown leather wallet found near the canteen. Contains some cash and student ID.',
    category: 'wallet', status: 'found',
    location: 'College Canteen', date: new Date('2025-01-16'),
    userId: userIds[2], resolved: false,
  },
  {
    title: 'Red Backpack',
    description: 'Red Wildcraft backpack with books inside. Lost during the inter-college fest.',
    category: 'bags', status: 'lost',
    location: 'Auditorium', date: new Date('2025-01-10'),
    userId: userIds[1], resolved: true,
  },
  {
    title: 'Set of Keys',
    description: 'Key ring with 3 keys and a small blue Doraemon keychain. Found near CS department.',
    category: 'keys', status: 'found',
    location: 'CS Department Corridor', date: new Date('2025-01-18'),
    userId: userIds[2], resolved: false,
  },
  {
    title: 'JBL Earphones',
    description: 'Black JBL wireless earbuds in a white charging case. Lost in lab.',
    category: 'electronics', status: 'lost',
    location: 'Computer Lab 3', date: new Date('2025-01-17'),
    userId: userIds[1], resolved: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = await User.create(SAMPLE_USERS);
    console.log(`Created ${users.length} users`);

    // Create items
    const items = await Item.create(SAMPLE_ITEMS(users.map(u => u._id)));
    console.log(`Created ${items.length} items`);

    console.log('\n✅ Seed complete!');
    console.log('─────────────────────────────────');
    console.log('Admin login: admin@campus.edu / admin123');
    console.log('User login:  rahul@student.edu / pass123');
    console.log('─────────────────────────────────');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
