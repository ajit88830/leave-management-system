const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

// Load .env
dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI missing in .env file");
  process.exit(1);
}

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🌐 Connected to MongoDB Atlas"))
  .catch(err => {
    console.error("❌ MongoDB Atlas Connection Error:", err);
    process.exit(1);
  });

async function seedUsers() {
  try {
    console.log("Deleting old users...");
    await User.deleteMany();

    console.log("Inserting test users...");
    await User.insertMany([
      {
        name: "Test Employee",
        email: "employee@test.com",
        password: "123456",
        role: "employee",
        department: "IT"
      },
      {
        name: "Test Manager",
        email: "manager@test.com",
        password: "123456",
        role: "manager",
        department: "HR"
      }
    ]);

    console.log("✅ Users created successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedUsers();
