import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { useTaskStore, useUIStore } from '../store'
import TaskCard from './TaskCard'

export default function DayModal() {
  const { dayTasks, selectedDate, clearDayTasks } = useTaskStore()
  const { closeDayModal, openTaskModal } = useUIStore()

  const close = () => {
    closeDayModal()
    clearDayTasks()
  }

  const displayDate = selectedDate
    ? format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d, yyyy')
    : ''

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && close()}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-[#231e2e] rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/10 flex items-start justify-between flex-shrink-0">
            <div>
              <h3 className="font-display text-xl font-semibold text-gray-800 dark:text-white">{displayDate}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''} due</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { close(); setTimeout(() => openTaskModal(), 100) }}
                className="btn-primary flex items-center gap-1.5 text-sm py-2 px-3"
              >
                <Plus size={14} /> Add
              </button>
              <button onClick={close} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Tasks */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {dayTasks.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">📅</p>
                <p className="text-gray-500 font-medium">No tasks on this day</p>
                <p className="text-gray-400 text-sm mt-1">Click "Add" to create one!</p>
              </div>
            ) : (
              dayTasks.map((task, i) => (
                <TaskCard key={task._id} task={task} index={i} showTip />
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
