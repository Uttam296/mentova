const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all mentors
router.get('/mentors', auth, async (req, res) => {
  try {
    const { department, skills } = req.query;
    let query = { role: 'mentor' };
    if (department) query.department = department;
    if (skills) query.skills = { $in: skills.split(',') };
    const mentors = await User.find(query).select('-password').sort({ rating: -1 });
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  res.json(req.user);
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, skills, interests, linkedIn, github, isAvailable, department, year } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, skills, interests, linkedIn, github, isAvailable, department, year },
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
