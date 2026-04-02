import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useUIStore, useTaskStore, useReminderStore } from './store'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import PriorityView from './pages/PriorityView'
import AllTasksView from './pages/AllTasksView'
import TaskModal from './components/TaskModal'
import DayModal from './components/DayModal'
import ReminderPanel from './components/ReminderPanel'
import NotificationSetup from './components/NotificationSetup'

export default function App() {
  const { darkMode, activeTab, showTaskModal, showDayModal } = useUIStore()
  const { fetchTasks, fetchAnalytics } = useTaskStore()
  const { fetchReminders, fetchDueReminders } = useReminderStore()

  useEffect(() => {
    // Apply dark mode on mount
    document.documentElement.classList.toggle('dark', darkMode)
  }, [])

  useEffect(() => {
    fetchTasks()
    fetchAnalytics()
    fetchReminders()
    fetchDueReminders()

    // Poll for due reminders every 5 minutes
    const interval = setInterval(() => {
      fetchDueReminders()
      fetchReminders()
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`min-h-screen bg-cream dark:bg-[#1a1625] font-body`}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'priority'  && <PriorityView />}
          {activeTab === 'tasks'     && <AllTasksView />}
        </main>
        <ReminderPanel />
      </div>

      {showTaskModal && <TaskModal />}
      {showDayModal  && <DayModal />}

      <NotificationSetup />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'font-body text-sm',
          style: { borderRadius: '16px', background: '#fff', color: '#1a1a2e', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' },
        }}
      />
    </div>
  )
}
