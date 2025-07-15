const express = require('express');
const { connectDB } = require('./config/database'); // Fixed typo
const { cloudinaryConfig } = require('./config/cloudinary');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// Middleware (must come before routes)
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Database connections
connectDB(); // Fixed function name
cloudinaryConfig();

// Routes mounting
const routes = require('./router/router');
app.use('/api/v1', routes); // All routes now under /api/v1

// Start server (should be last)
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});