const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'college_connect_secret_2024';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, year, department, bio, skills, interests } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name, email, password, role, year, department,
      bio: bio || '',
      skills: skills || [],
      interests: interests || []
    });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userData } = user.toObject();
    res.json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
