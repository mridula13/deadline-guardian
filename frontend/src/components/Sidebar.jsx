import { motion } from 'framer-motion'
import { Shield, LayoutDashboard, ListOrdered, ListTodo, Bell, Sun, Moon, Plus } from 'lucide-react'
import { useUIStore, useReminderStore } from '../store'

const NAV = [
  { id: 'dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'priority',  label: 'Priority List', icon: ListOrdered },
  { id: 'tasks',     label: 'All Tasks',     icon: ListTodo },
]

export default function Sidebar() {
  const { activeTab, setActiveTab, darkMode, toggleDark, openTaskModal } = useUIStore()
  const { unreadCount } = useReminderStore()

  return (
    <aside className="w-64 flex-shrink-0 h-screen bg-white dark:bg-[#231e2e] border-r border-gray-100 dark:border-white/10 flex flex-col shadow-soft">
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blush-200 to-peach-200 flex items-center justify-center shadow-warm">
            <Shield size={20} className="text-blush-400" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-gray-800 dark:text-white leading-tight">Deadline</h1>
            <p className="font-display text-sm text-blush-400 leading-tight">Guardian</p>
          </div>
        </div>
      </div>

      {/* Add Task button */}
      <div className="px-4 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => openTaskModal()}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} />
          Add Task
        </motion.button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
              activeTab === id
                ? 'bg-gradient-to-r from-blush-50 to-peach-50 dark:from-blush-400/10 dark:to-peach-400/10 text-blush-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <Icon size={16} />
            {label}
            {id === 'priority' && (
              <span className="ml-auto text-xs bg-urgent-light text-urgent px-2 py-0.5 rounded-full font-medium">
                hot
              </span>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="p-4 border-t border-gray-100 dark:border-white/10 flex items-center gap-2">
        <button
          onClick={toggleDark}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="flex-1" />
        <div className="relative">
          <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
            <Bell size={16} />
          </button>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-urgent text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lavender-200 to-blush-200 flex items-center justify-center text-xs font-semibold text-lavender-400">
          S
        </div>
      </div>
    </aside>
  )
}
