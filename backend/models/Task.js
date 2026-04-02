const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  originalName: { type: String },
  path: { type: String },           // local upload path
  mimetype: { type: String },
  size: { type: Number },
  isLink: { type: Boolean, default: false },
  url: { type: String },            // for external links (Drive, PPT, etc.)
}, { _id: true });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['exam', 'homework', 'assignment', 'project', 'lab', 'quiz', 'other'],
    default: 'other',
  },
  dueDate: { type: Date, required: true },
  reminderDate: { type: Date, required: true },
  // Auto-calculated from dueDate
  urgency: {
    type: String,
    enum: ['red', 'orange', 'green'],
    default: 'green',
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  completedAt: { type: Date, default: null },
  attachments: [attachmentSchema],
  links: [{ type: String }],
  // Reminders fired tracking
  reminders: {
    threeDayFired: { type: Boolean, default: false },
    oneDayFired:   { type: Boolean, default: false },
    sameDayFired:  { type: Boolean, default: false },
  },
}, { timestamps: true });

// ─── Pre-save: auto-calculate urgency ────────────────────────
taskSchema.pre('save', function (next) {
  this.urgency = calcUrgency(this.dueDate);
  next();
});

taskSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.dueDate || (update.$set && update.$set.dueDate)) {
    const due = update.dueDate || update.$set.dueDate;
    const urgency = calcUrgency(new Date(due));
    if (update.$set) update.$set.urgency = urgency;
    else update.urgency = urgency;
  }
  next();
});

function calcUrgency(dueDate) {
  const now = new Date();
  const diff = (new Date(dueDate) - now) / (1000 * 60 * 60); // hours
  if (diff < 0)   return 'red';
  if (diff <= 48)  return 'red';
  if (diff <= 168) return 'orange';
  return 'green';
}

module.exports = mongoose.model('Task', taskSchema);
