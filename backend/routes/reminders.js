const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// GET all reminders (optionally unread only)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.unread === 'true' ? { read: false } : {};
    const reminders = await Reminder.find(filter).sort({ scheduledFor: 1 }).populate('taskId', 'title dueDate urgency status');
    res.json({ success: true, data: reminders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET due reminders (scheduledFor <= now, not yet read)
router.get('/due', async (req, res) => {
  try {
    const due = await Reminder.find({ scheduledFor: { $lte: new Date() }, read: false })
      .populate('taskId', 'title dueDate urgency status');
    res.json({ success: true, data: due });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH mark reminder as read
router.patch('/:id/read', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!reminder) return res.status(404).json({ success: false, message: 'Reminder not found' });
    res.json({ success: true, data: reminder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH mark all reminders as read
router.patch('/read-all', async (req, res) => {
  try {
    await Reminder.updateMany({ read: false }, { read: true });
    res.json({ success: true, message: 'All reminders marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
