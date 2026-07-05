const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Mentorship = require('../models/Mentorship');
const User = require('../models/User');

// Request mentorship
router.post('/request', auth, async (req, res) => {
  try {
    const { mentorId, message, goals } = req.body;
    const existing = await Mentorship.findOne({ mentor: mentorId, mentee: req.user._id, status: { $in: ['pending', 'accepted'] } });
    if (existing) return res.status(400).json({ message: 'Request already exists' });
    const mentorship = await Mentorship.create({
      mentor: mentorId,
      mentee: req.user._id,
      message,
      goals: goals || []
    });
    await mentorship.populate(['mentor', 'mentee']);
    res.status(201).json(mentorship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my mentorships
router.get('/my', auth, async (req, res) => {
  try {
    const query = req.user.role === 'mentor'
      ? { mentor: req.user._id }
      : { mentee: req.user._id };
    const mentorships = await Mentorship.find(query)
      .populate('mentor', 'name email avatar department year bio skills')
      .populate('mentee', 'name email avatar department year bio')
      .sort({ createdAt: -1 });
    res.json(mentorships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) return res.status(404).json({ message: 'Not found' });
    if (mentorship.mentor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    mentorship.status = status;
    await mentorship.save();
    res.json(mentorship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit review
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) return res.status(404).json({ message: 'Not found' });
    mentorship.rating = rating;
    mentorship.review = review;
    await mentorship.save();
    // Update mentor rating
    const allReviews = await Mentorship.find({ mentor: mentorship.mentor, rating: { $exists: true } });
    const avgRating = allReviews.reduce((sum, m) => sum + m.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(mentorship.mentor, { rating: avgRating, reviewCount: allReviews.length });
    res.json(mentorship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
