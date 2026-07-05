const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// Get conversation
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).sort({ timestamp: 1 }).populate('sender', 'name avatar role').populate('receiver', 'name avatar role');
    // Mark as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content
    });
    await message.populate('sender', 'name avatar role');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all conversations
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).populate('sender', 'name avatar role year').populate('receiver', 'name avatar role year').sort({ timestamp: -1 });

    const conversationMap = {};
    messages.forEach(msg => {
      const otherId = msg.sender._id.toString() === req.user._id.toString()
        ? msg.receiver._id.toString()
        : msg.sender._id.toString();
      if (!conversationMap[otherId]) {
        conversationMap[otherId] = {
          user: msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender,
          lastMessage: msg,
          unread: 0
        };
      }
      if (!msg.isRead && msg.receiver._id.toString() === req.user._id.toString()) {
        conversationMap[otherId].unread++;
      }
    });

    res.json(Object.values(conversationMap));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
