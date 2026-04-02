import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trash2, Edit3, ExternalLink, FileText, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { useTaskStore, useUIStore } from '../store'
import { URGENCY_CONFIG, CATEGORY_CONFIG, getSmartTip, formatDue, formatCompleted } from '../utils/helpers'

export default function TaskCard({ task, index = 0, showTip = false }) {
  const [expanded, setExpanded] = useState(false)
  const [tip] = useState(() => getSmartTip(task.urgency))
  const { completeTask, uncompleteTask, deleteTask } = useTaskStore()
  const { openTaskModal } = useUIStore()

  const uc  = URGENCY_CONFIG[task.urgency] || URGENCY_CONFIG.green
  const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.other
  const isDone = task.status === 'completed'

  const handleToggle = (e) => {
    e.stopPropagation()
    isDone ? uncompleteTask(task._id) : completeTask(task._id)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirm(`Delete "${task.title}"?`)) deleteTask(task._id)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    openTaskModal(task)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isDone ? 0.65 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`card overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 ${
        isDone ? '' : uc.left
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Completion toggle */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleToggle}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
              isDone
                ? 'bg-safe border-safe'
                : `border-gray-300 dark:border-white/30 hover:border-${task.urgency === 'red' ? 'urgent' : task.urgency === 'orange' ? 'warning' : 'safe'}`
            }`}
          >
            {isDone && <Check size={11} className="text-white" strokeWidth={3} />}
          </motion.button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <h4 className={`font-medium text-gray-800 dark:text-gray-100 leading-snug ${isDone ? 'line-through text-gray-400' : ''}`}>
                {task.title}
              </h4>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${cat.color}`}>
                {cat.emoji} {cat.label}
              </span>
              {!isDone && (
                <span className={`${uc.badge} ml-auto`}>{uc.label}</span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <p className={`text-xs font-medium ${isDone ? 'text-gray-400' : uc.color}`}>
                {isDone ? formatCompleted(task.completedAt) : formatDue(task.dueDate)}
              </p>
              {task.attachments?.length > 0 && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FileText size={11} /> {task.attachments.length} file{task.attachments.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Smart tip for red/orange */}
            {showTip && !isDone && (task.urgency === 'red' || task.urgency === 'orange') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={`mt-2.5 p-2.5 rounded-xl text-xs leading-relaxed ${
                  task.urgency === 'red'
                    ? 'bg-urgent-light text-urgent border border-urgent-border'
                    : 'bg-warning-light text-warning border border-warning-border'
                }`}
              >
                {tip}
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={handleEdit} className="p-1.5 rounded-xl text-gray-400 hover:text-lavender-400 hover:bg-lavender-50 dark:hover:bg-lavender-400/10 transition-all">
              <Edit3 size={14} />
            </button>
            <button onClick={handleDelete} className="p-1.5 rounded-xl text-gray-400 hover:text-urgent hover:bg-urgent-light transition-all">
              <Trash2 size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-100 dark:border-white/10 pt-3 space-y-3 ml-8">
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{task.description}</p>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Due date</span>
                  <p className="font-medium text-gray-700 dark:text-gray-200 mt-0.5">
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Reminder set</span>
                  <p className="font-medium text-gray-700 dark:text-gray-200 mt-0.5">
                    {task.reminderDate ? format(new Date(task.reminderDate), 'MMM d, yyyy') : 'Not set'}
                  </p>
                </div>
              </div>

              {/* Attachments */}
              {task.attachments?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2 font-medium">Reference Materials</p>
                  <div className="flex flex-wrap gap-2">
                    {task.attachments.map((att, i) => (
                      att.isLink ? (
                        <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lavender-50 dark:bg-lavender-400/10 text-lavender-400 text-xs font-medium hover:bg-lavender-100 transition-all">
                          <ExternalLink size={11} /> {att.name.length > 30 ? att.name.slice(0, 30) + '…' : att.name}
                        </a>
                      ) : (
                        <a key={i} href={att.path} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-peach-50 dark:bg-peach-400/10 text-peach-400 text-xs font-medium hover:bg-peach-100 transition-all">
                          <FileText size={11} /> {att.name || att.originalName}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}

              {isDone && task.completedAt && (
                <p className="text-xs text-safe bg-safe-light border border-safe-border px-3 py-1.5 rounded-xl inline-block">
                  ✅ {formatCompleted(task.completedAt)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
