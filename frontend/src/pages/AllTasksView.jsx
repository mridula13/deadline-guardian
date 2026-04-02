import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'
import { useTaskStore, useUIStore } from '../store'
import { CATEGORIES, URGENCY_CONFIG } from '../utils/helpers'
import TaskCard from '../components/TaskCard'

const STATUS_FILTERS = [
  { value: 'all',       label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'completed', label: 'Completed' },
]

const URGENCY_FILTERS = [
  { value: 'all',    label: 'Any urgency' },
  { value: 'red',    label: '🔴 Critical' },
  { value: 'orange', label: '🟠 Urgent' },
  { value: 'green',  label: '🟢 On track' },
]

export default function AllTasksView() {
  const { tasks } = useTaskStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (statusFilter !== 'all'  && t.status   !== statusFilter)  return false
      if (catFilter    !== 'all'  && t.category  !== catFilter)     return false
      if (urgencyFilter !== 'all' && t.urgency   !== urgencyFilter) return false
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
          !t.description?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }).sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1
      if (a.status !== 'completed' && b.status === 'completed') return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
  }, [tasks, search, statusFilter, catFilter, urgencyFilter])

  const clearFilters = () => {
    setSearch(''); setStatusFilter('all'); setCatFilter('all'); setUrgencyFilter('all')
  }
  const hasFilters = search || statusFilter !== 'all' || catFilter !== 'all' || urgencyFilter !== 'all'

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="font-display text-3xl font-semibold text-gray-800 dark:text-white">All Tasks</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{filtered.length} task{filtered.length !== 1 ? 's' : ''} shown</p>
      </motion.div>

      {/* Search + filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card p-4 mb-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-10 text-sm"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1.5">
            {STATUS_FILTERS.map(f => (
              <button key={f.value} onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === f.value
                    ? 'bg-blush-200 text-blush-400'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200'
                }`}>{f.label}</button>
            ))}
          </div>
          <div className="w-px bg-gray-200 dark:bg-white/10 mx-1" />
          <div className="flex flex-wrap gap-1.5">
            {[{ value: 'all', label: 'All categories' }, ...CATEGORIES].map(cat => (
              <button key={cat.value} onClick={() => setCatFilter(cat.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  catFilter === cat.value
                    ? 'bg-lavender-200 text-lavender-400'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200'
                }`}>
                {cat.value !== 'all' ? cat.emoji + ' ' : ''}{cat.label}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto px-3 py-1.5 rounded-xl text-xs text-urgent bg-urgent-light flex items-center gap-1">
              <X size={11} /> Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500 font-medium">No tasks match your filters.</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task, i) => (
            <TaskCard key={task._id} task={task} index={i} showTip />
          ))}
        </div>
      )}
    </div>
  )
}
