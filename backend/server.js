const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Fix Node.js DNS resolution on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks',    require('./routes/tasks'));
app.use('/api/users',    require('./routes/users'));

// MongoDB connection
// To use Atlas: set MONGODB_URI in your .env file to your Atlas connection string
// e.g. MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/projectmanager
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/projectmanager';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
