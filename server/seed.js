const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB. Seeding users...');
    
    // Clear existing users
    await User.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const users = [
      { name: 'Alice Manager', email: 'manager@test.com', password: hashedPassword, role: 'manager' },
      { name: 'Bob Employee', email: 'employee@test.com', password: hashedPassword, role: 'employee' }
    ];

    await User.insertMany(users);
    console.log('Users seeded! Login with password: "123456"');
    process.exit();
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });