import mongoose from 'mongoose';
import Customer from './models/Customer.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleCustomers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    spend: 1500,
    visits: 5,
    lastOrderDate: new Date('2024-03-01'),
    tags: ['vip', 'frequent'],
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA'
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    spend: 800,
    visits: 3,
    lastOrderDate: new Date('2024-02-15'),
    tags: ['regular'],
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA'
    }
  },
  {
    name: 'Bob Wilson',
    email: 'bob@example.com',
    spend: 2500,
    visits: 8,
    lastOrderDate: new Date('2024-03-10'),
    tags: ['vip', 'whale'],
    location: {
      city: 'Chicago',
      state: 'IL',
      country: 'USA'
    }
  }
];

async function seedCustomers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/xenoreach');
    console.log('Connected to MongoDB');

    // Clear existing customers
    await Customer.deleteMany({});
    console.log('Cleared existing customers');

    // Insert new customers
    const customers = await Customer.insertMany(sampleCustomers);
    console.log(`Added ${customers.length} customers`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding customers:', err);
    process.exit(1);
  }
}

seedCustomers(); 