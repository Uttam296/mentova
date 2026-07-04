const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  message: { type: String },
  goals: [{ type: String }],
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mentorship', mentorshipSchema);
