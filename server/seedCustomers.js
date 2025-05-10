import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from './models/Customer.js';
import User from './models/User.js';

dotenv.config(); // Loads .env from the current directory (server/)

// Connect to your MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function seed() {
  try {
    // Find a user to assign as createdBy (replace with your user's email or _id)
    const user = await User.findOne({ email: 'atulya1202112@gmail.com' }); // <-- change this!
    if (!user) throw new Error('User not found!');

    // Example customers to seed
    const customers = [
      {
        name: 'Atul Nag',
        email: 'atulknag@gmail.com',
        phone: '1234567890',
        spend: 10000,
        visits: 5,
        lastOrderDate: new Date('2025-05-01'), // REQUIRED
        createdBy: user._id
      },
      {
        name: 'Tanvi Nag',
        email: 'crazyatulya@gmail.com',
        phone: '0987654321',
        spend: 15000,
        visits: 10,
        lastOrderDate: new Date('2024-04-15'), // REQUIRED
        createdBy: user._id
      }
      // Add more customers as needed, lastOrderDate is required
    ];

    // Insert customers
    await Customer.insertMany(customers);
    console.log('Customers seeded!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.disconnect();
  }
}

seed();