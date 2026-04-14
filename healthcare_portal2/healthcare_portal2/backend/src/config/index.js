require('dotenv').config();
const mongoose = require('mongoose');
const { cloudinaryConfig } = require('./cloudinaryConfig');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }
};

// Initialize Cloudinary config
cloudinaryConfig();

module.exports = {
  connectDB,
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
};
