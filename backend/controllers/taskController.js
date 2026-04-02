const Task = require('../models/Task');
const Reminder = require('../models/Reminder');
const path = require('path');
const fs = require('fs');

// ─── GET all tasks ────────────────────────────────────────────
exports.getTasks = async (req, res) => {
  try {
    const { category, status, urgency, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status)   filter.status = status;
    if (urgency)  filter.urgency = urgency;
    if (search)   filter.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter).sort({ dueDate: 1 });
    // Refresh urgency on read
    const updated = tasks.map(t => {
      const u = refreshUrgency(t.dueDate);
      if (u !== t.urgency && t.status === 'pending') {
        Task.findByIdAndUpdate(t._id, { urgency: u }).exec();
        t.urgency = u;
      }
      return t;
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET single task ──────────────────────────────────────────
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CREATE task ──────────────────────────────────────────────
exports.createTask = async (req, res) => {
  try {
    const { title, description, category, dueDate, reminderDate, links } = req.body;

    // Process uploaded files
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          name: file.originalname,
          originalName: file.originalname,
          path: `/uploads/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size,
          isLink: false,
        });
      });
    }

    // Process external links
    const parsedLinks = links ? (Array.isArray(links) ? links : JSON.parse(links)) : [];
    parsedLinks.forEach(link => {
      if (link && link.trim()) {
        attachments.push({
          name: link.trim(),
          url: link.trim(),
          isLink: true,
        });
      }
    });

    const task = await Task.create({
      title, description, category, dueDate, reminderDate,
      attachments,
      links: parsedLinks,
    });

    // Schedule reminders
    await scheduleReminders(task);

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── UPDATE task ──────────────────────────────────────────────
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── COMPLETE task ────────────────────────────────────────────
exports.completeTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UNCOMPLETE task ──────────────────────────────────────────
exports.uncompleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: 'pending', completedAt: null },
      { new: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE task ──────────────────────────────────────────────
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    // Delete uploaded files
    task.attachments.forEach(att => {
      if (!att.isLink && att.path) {
        const fullPath = path.join(__dirname, '..', att.path);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    });
    // Remove associated reminders
    await Reminder.deleteMany({ taskId: req.params.id });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET tasks by date ────────────────────────────────────────
exports.getTasksByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end   = new Date(date); end.setHours(23, 59, 59, 999);
    const tasks = await Task.find({ dueDate: { $gte: start, $lte: end } }).sort({ dueDate: 1 });
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET analytics ────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const total     = await Task.countDocuments();
    const completed = await Task.countDocuments({ status: 'completed' });
    const pending   = await Task.countDocuments({ status: 'pending' });
    const red       = await Task.countDocuments({ urgency: 'red',    status: 'pending' });
    const orange    = await Task.countDocuments({ urgency: 'orange', status: 'pending' });
    const green     = await Task.countDocuments({ urgency: 'green',  status: 'pending' });
    const byCat     = await Task.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    res.json({ success: true, data: { total, completed, pending, red, orange, green, byCategory: byCat } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Helpers ──────────────────────────────────────────────────
function refreshUrgency(dueDate) {
  const diff = (new Date(dueDate) - new Date()) / (1000 * 60 * 60);
  if (diff < 0)   return 'red';
  if (diff <= 48)  return 'red';
  if (diff <= 168) return 'orange';
  return 'green';
}

async function scheduleReminders(task) {
  const due = new Date(task.dueDate);
  const reminders = [
    { type: '3-day',    date: new Date(due.getTime() - 3 * 24 * 60 * 60 * 1000), msg: `Heads up! "${task.title}" is due in 3 days.` },
    { type: '1-day',    date: new Date(due.getTime() - 1 * 24 * 60 * 60 * 1000), msg: `Due tomorrow: "${task.title}". Don't forget!` },
    { type: 'same-day', date: new Date(due.setHours(8, 0, 0, 0)),                 msg: `Today is the deadline for "${task.title}"!` },
  ];
  for (const r of reminders) {
    if (r.date > new Date()) {
      await Reminder.create({ taskId: task._id, taskTitle: task.title, type: r.type, scheduledFor: r.date, message: r.msg });
    }
  }
}
