const express = require('express');
const { connectDB } = require('./config/database');
const { cloudinaryConfig } = require('./config/cloudinary');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

require("dotenv").config();
const port = process.env.PORT || 2000;

// Enhanced CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Routes
const routes = require('./router/router');
app.use('/api/v1', routes);

// Database & Cloudinary
connectDB();
cloudinaryConfig();

// Server Start
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});