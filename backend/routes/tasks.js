const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ctrl = require('../controllers/taskController');

// ─── Multer setup for file uploads ───────────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`File type ${ext} not allowed`));
  },
});

// Routes
router.get('/',           ctrl.getTasks);
router.get('/analytics',  ctrl.getAnalytics);
router.get('/date/:date', ctrl.getTasksByDate);
router.get('/:id',        ctrl.getTask);
router.post('/',          upload.array('files', 10), ctrl.createTask);
router.put('/:id',        upload.array('files', 10), ctrl.updateTask);
router.patch('/:id/complete',   ctrl.completeTask);
router.patch('/:id/uncomplete', ctrl.uncompleteTask);
router.delete('/:id',     ctrl.deleteTask);

module.exports = router;
