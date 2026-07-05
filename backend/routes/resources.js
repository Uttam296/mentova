const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Resource = require('../models/Resource');

// Get all public resources
router.get('/', async (req, res) => {
  try {
    const { category, subject, search, department } = req.query;
    let query = { isPublic: true };
    if (category) query.category = category;
    if (department) query.department = department;
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name role year department avatar')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create resource
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, subject, externalLink, tags, department, isPublic } = req.body;
    const resource = await Resource.create({
      title, description, category, subject, externalLink,
      tags: tags || [],
      department,
      isPublic: isPublic !== false,
      uploadedBy: req.user._id
    });
    await resource.populate('uploadedBy', 'name role year department avatar');
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like/Unlike resource
router.post('/:id/like', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    const idx = resource.likes.indexOf(req.user._id);
    if (idx === -1) resource.likes.push(req.user._id);
    else resource.likes.splice(idx, 1);
    await resource.save();
    res.json({ likes: resource.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete resource
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Not found' });
    if (resource.uploadedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await resource.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
