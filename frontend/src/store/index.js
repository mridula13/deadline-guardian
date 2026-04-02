import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL
const API = `${BASE_URL}/api/tasks`

export const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  analytics: null,
  selectedDate: null,
  dayTasks: [],

  // ─── Fetch all tasks ───────────────────────────────────────
  fetchTasks: async (filters = {}) => {
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams(filters).toString()
      const { data } = await axios.get(`${API}?${params}`)
      set({ tasks: data.data, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, loading: false })
    }
  },

  // ─── Fetch tasks by date ───────────────────────────────────
  fetchDayTasks: async (date) => {
    try {
      const { data } = await axios.get(`${API}/date/${date}`)
      set({ dayTasks: data.data, selectedDate: date })
    } catch (err) {
      console.error(err)
    }
  },

  // ─── Create task ───────────────────────────────────────────
  createTask: async (formData) => {
    try {
      const { data } = await axios.post(API, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      set(state => ({ tasks: [data.data, ...state.tasks] }))
      toast.success('Task added! 🎉')
      return { success: true, task: data.data }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
      return { success: false }
    }
  },

  // ─── Update task ───────────────────────────────────────────
  updateTask: async (id, updates) => {
    try {
      const { data } = await axios.put(`${API}/${id}`, updates)
      set(state => ({
        tasks: state.tasks.map(t => t._id === id ? data.data : t),
      }))
      toast.success('Task updated!')
      return { success: true }
    } catch (err) {
      toast.error('Failed to update task')
      return { success: false }
    }
  },

  // ─── Complete task ─────────────────────────────────────────
  completeTask: async (id) => {
    try {
      const { data } = await axios.patch(`${API}/${id}/complete`)
      set(state => ({
        tasks: state.tasks.map(t => t._id === id ? data.data : t),
        dayTasks: state.dayTasks.map(t => t._id === id ? data.data : t),
      }))
      toast.success('Task completed! ✅')
    } catch (err) {
      toast.error('Failed to complete task')
    }
  },

  // ─── Uncomplete task ───────────────────────────────────────
  uncompleteTask: async (id) => {
    try {
      const { data } = await axios.patch(`${API}/${id}/uncomplete`)
      set(state => ({
        tasks: state.tasks.map(t => t._id === id ? data.data : t),
        dayTasks: state.dayTasks.map(t => t._id === id ? data.data : t),
      }))
      toast('Marked as pending')
    } catch (err) {
      toast.error('Failed to update task')
    }
  },

  // ─── Delete task ───────────────────────────────────────────
  deleteTask: async (id) => {
    try {
      await axios.delete(`${API}/${id}`)
      set(state => ({
        tasks: state.tasks.filter(t => t._id !== id),
        dayTasks: state.dayTasks.filter(t => t._id !== id),
      }))
      toast.success('Task deleted')
    } catch (err) {
      toast.error('Failed to delete task')
    }
  },

  // ─── Fetch analytics ──────────────────────────────────────
  fetchAnalytics: async () => {
    try {
      const { data } = await axios.get(`${API}/analytics`)
      set({ analytics: data.data })
    } catch (err) {
      console.error(err)
    }
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
  clearDayTasks: () => set({ dayTasks: [], selectedDate: null }),
}))

// ─── Reminder store ───────────────────────────────────────────
export const useReminderStore = create((set) => ({
  reminders: [],
  unreadCount: 0,

  fetchReminders: async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/reminders`)
      const unread = data.data.filter(r => !r.read).length
      set({ reminders: data.data, unreadCount: unread })
    } catch (err) {
      console.error(err)
    }
  },

  fetchDueReminders: async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/reminders/due`)
      if (data.data.length > 0) {
        // Trigger browser notifications if permitted
        data.data.forEach(r => {
          if (Notification.permission === 'granted') {
            new Notification('🛡️ Deadline Guardian', { body: r.message, icon: '/favicon.ico' })
          }
        })
      }
    } catch (err) {}
  },

  markRead: async (id) => {
    try {
      await axios.patch(`${BASE_URL}/api/reminders/${id}/read`)
      set(state => ({
        reminders: state.reminders.map(r => r._id === id ? { ...r, read: true } : r),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch (err) {}
  },

  markAllRead: async () => {
    try {
      await axios.patch(`${BASE_URL}/api/reminders/read-all`)
      set(state => ({
        reminders: state.reminders.map(r => ({ ...r, read: true })),
        unreadCount: 0,
      }))
    } catch (err) {}
  },
}))

// ─── UI / theme store ─────────────────────────────────────────
export const useUIStore = create((set) => ({
  darkMode: localStorage.getItem('darkMode') === 'true',
  showTaskModal: false,
  editingTask: null,
  showDayModal: false,
  activeTab: 'dashboard',
  searchQuery: '',

  toggleDark: () => set(state => {
    const next = !state.darkMode
    localStorage.setItem('darkMode', String(next))
    document.documentElement.classList.toggle('dark', next)
    return { darkMode: next }
  }),
  openTaskModal: (task = null) => set({ showTaskModal: true, editingTask: task }),
  closeTaskModal: () => set({ showTaskModal: false, editingTask: null }),
  openDayModal: () => set({ showDayModal: true }),
  closeDayModal: () => set({ showDayModal: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}))
