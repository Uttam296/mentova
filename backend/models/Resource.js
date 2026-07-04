const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Notes', 'Past Papers', 'Books', 'Videos', 'Career', 'Research', 'Projects', 'Other'],
    required: true
  },
  subject: { type: String, required: true },
  fileUrl: { type: String, default: '' },
  externalLink: { type: String, default: '' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downloads: { type: Number, default: 0 },
  tags: [{ type: String }],
  department: { type: String },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', resourceSchema);
