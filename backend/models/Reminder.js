const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  taskTitle: { type: String, required: true },
  type: {
    type: String,
    enum: ['3-day', '1-day', 'same-day', 'custom'],
    required: true,
  },
  scheduledFor: { type: Date, required: true },
  read: { type: Boolean, default: false },
  message: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
