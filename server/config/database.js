const mongoose = require('mongoose');
require('dotenv').config();
const dns = require('dns');
// Use Google's Public DNS servers to resolve MongoDB SRV records, which often fail on Windows with ISP DNS.
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {// || 'mongodb://localhost:27017/staff_management', {
      serverSelectionTimeoutMS: 5000 // Keep this for connection timeout
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Event listeners for better debugging
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected from DB');
});

module.exports = { connectDB };