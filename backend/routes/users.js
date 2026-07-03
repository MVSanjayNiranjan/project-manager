const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/users - Get all users (for assigning tasks / adding members)
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/users/me - Get current user profile
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
