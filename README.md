# 🛡️ Deadline Guardian — Smart Academic Planner

A production-quality full-stack web application to help students manage deadlines, exams, and assignments with smart urgency detection, reminders, and a beautiful pastel UI.

---

## ✨ Features

- **📅 Calendar Dashboard** — FullCalendar monthly view with color-coded tasks
- **🔴🟠🟢 Urgency System** — Auto-detects Red (< 48h), Orange (this week), Green (next week+)
- **💡 Smart Tips** — Urgent messages & study advice appear on critical tasks
- **🔔 Reminder System** — 3-day, 1-day, and same-day reminders + browser notifications
- **📎 Reference Materials** — Attach PDFs, PPTs, images + external links (Google Drive etc.)
- **✅ Completion Tracking** — Mark done with completion timestamp
- **🔍 Search & Filter** — Filter by category, urgency, and status
- **📊 Analytics** — Live stats: total, completed, critical counts
- **🌙 Dark Mode** — Full dark mode toggle
- **Priority List** — All tasks sorted by urgency in one view

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18 + Vite                         |
| Styling    | Tailwind CSS (custom pastel palette)    |
| Animation  | Framer Motion                           |
| State      | Zustand                                 |
| Calendar   | FullCalendar (React)                    |
| Dates      | date-fns                                |
| Backend    | Node.js + Express                       |
| Database   | MongoDB + Mongoose                      |
| Uploads    | Multer (local storage, 20MB limit)      |

---

## 📁 Project Structure

```
deadline-guardian/
├── backend/
│   ├── controllers/
│   │   └── taskController.js     # Full CRUD + analytics + file handling
│   ├── models/
│   │   ├── Task.js               # Mongoose schema w/ auto urgency
│   │   └── Reminder.js           # Reminder model
│   ├── routes/
│   │   ├── tasks.js              # Task API routes + Multer
│   │   └── reminders.js          # Reminder API routes
│   ├── uploads/                  # File upload directory (auto-created)
│   ├── server.js                 # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx           # Navigation sidebar
    │   │   ├── TaskCard.jsx          # Reusable task card w/ tips
    │   │   ├── TaskModal.jsx         # Create/edit task modal
    │   │   ├── DayModal.jsx          # Calendar day click modal
    │   │   ├── ReminderPanel.jsx     # Slide-out reminder panel
    │   │   └── NotificationSetup.jsx # Browser notification prompt
    │   ├── pages/
    │   │   ├── Dashboard.jsx         # Calendar + stats + upcoming
    │   │   ├── PriorityView.jsx      # Tasks sorted by urgency
    │   │   └── AllTasksView.jsx      # Search + filter all tasks
    │   ├── store/
    │   │   └── index.js              # Zustand stores (tasks, reminders, UI)
    │   ├── utils/
    │   │   └── helpers.js            # Urgency logic, tips, formatting
    │   ├── styles/
    │   │   └── globals.css           # Tailwind + FullCalendar overrides
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

---

### 1. Clone & Install

```bash
# Clone the project
git clone <your-repo>
cd deadline-guardian

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Configure Environment

```bash
# In backend/
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/deadline-guardian
CLIENT_URL=http://localhost:5173
```

For **MongoDB Atlas** (cloud), replace MONGO_URI with your Atlas connection string:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/deadline-guardian
```

---

### 3. Start MongoDB (if local)

```bash
# macOS with Homebrew
brew services start mongodb-community

# Windows
net start MongoDB

# Or use Docker
docker run -d -p 27017:27017 --name mongo mongo:latest
```

---

### 4. Run the App

Open **two terminal windows**:

```bash
# Terminal 1 — Backend
cd deadline-guardian/backend
npm run dev
# → API running at http://localhost:5000

# Terminal 2 — Frontend
cd deadline-guardian/frontend
npm run dev
# → App running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 API Reference

| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| GET    | /api/tasks                     | Get all tasks (filterable)|
| GET    | /api/tasks/analytics           | Get stats                |
| GET    | /api/tasks/date/:date          | Get tasks for a date     |
| GET    | /api/tasks/:id                 | Get single task          |
| POST   | /api/tasks                     | Create task (multipart)  |
| PUT    | /api/tasks/:id                 | Update task              |
| PATCH  | /api/tasks/:id/complete        | Mark complete            |
| PATCH  | /api/tasks/:id/uncomplete      | Mark pending             |
| DELETE | /api/tasks/:id                 | Delete task              |
| GET    | /api/reminders                 | Get all reminders        |
| GET    | /api/reminders/due             | Get due reminders        |
| PATCH  | /api/reminders/:id/read        | Mark reminder read       |
| PATCH  | /api/reminders/read-all        | Mark all reminders read  |

---

## 🎨 Color System

| Urgency | Condition           | Color  |
|---------|---------------------|--------|
| 🔴 Red   | Due in < 48 hours   | `#ff4757` |
| 🟠 Orange| Due within 7 days   | `#ff7f50` |
| 🟢 Green | Due next week+      | `#2ed573` |

---

## 📦 Build for Production

```bash
# Build frontend
cd frontend
npm run build

# Serve with Express (add to backend/server.js):
# app.use(express.static(path.join(__dirname, '../frontend/dist')))
```

---

## 🧩 Sample Task Data

Seed your database with this sample data via MongoDB shell:

```javascript
db.tasks.insertMany([
  {
    title: "Linear Algebra Final Exam",
    description: "Chapters 1-8, focus on eigenvectors",
    category: "exam",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    reminderDate: new Date(),
    urgency: "red",
    status: "pending"
  },
  {
    title: "Operating Systems Assignment 3",
    description: "Implement a basic scheduler",
    category: "assignment",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    reminderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    urgency: "orange",
    status: "pending"
  },
  {
    title: "Web Dev Project Proposal",
    description: "Write 2-page proposal for semester project",
    category: "project",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    reminderDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    urgency: "green",
    status: "pending"
  }
])
```

---

## 🤝 Contributing

Pull requests welcome! For major changes, open an issue first.

---

## 📄 License

MIT
