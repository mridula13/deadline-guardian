import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Link2, Trash2, Plus, Calendar, Bell } from 'lucide-react'
import { format } from 'date-fns'
import { useTaskStore, useUIStore } from '../store'
import { CATEGORIES } from '../utils/helpers'
import toast from 'react-hot-toast'

const INITIAL = {
  title: '', description: '', category: 'homework',
  dueDate: '', reminderDate: '', links: [],
}

export default function TaskModal() {
  const { editingTask, closeTaskModal } = useUIStore()
  const { createTask, updateTask } = useTaskStore()

  const [form, setForm] = useState(INITIAL)
  const [files, setFiles] = useState([])
  const [linkInput, setLinkInput] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const isEdit = !!editingTask

  useEffect(() => {
    if (editingTask) {
      setForm({
        title:        editingTask.title        || '',
        description:  editingTask.description  || '',
        category:     editingTask.category     || 'homework',
        dueDate:      editingTask.dueDate      ? format(new Date(editingTask.dueDate), 'yyyy-MM-dd')      : '',
        reminderDate: editingTask.reminderDate ? format(new Date(editingTask.reminderDate), 'yyyy-MM-dd') : '',
        links:        editingTask.links        || [],
      })
    }
  }, [editingTask])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addLink = () => {
    if (!linkInput.trim()) return
    if (!linkInput.startsWith('http')) { toast.error('Please enter a valid URL starting with http'); return }
    set('links', [...form.links, linkInput.trim()])
    setLinkInput('')
  }

  const removeLink = (i) => set('links', form.links.filter((_, idx) => idx !== i))

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...newFiles])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim())    { toast.error('Title is required');         return }
    if (!form.dueDate)         { toast.error('Due date is required');       return }
    if (!form.reminderDate)    { toast.error('Reminder date is required');  return }

    setSaving(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'links') fd.append(k, JSON.stringify(v))
      else fd.append(k, v)
    })
    files.forEach(f => fd.append('files', f))

    const result = isEdit
      ? await updateTask(editingTask._id, form) // simple JSON update for edit
      : await createTask(fd)

    setSaving(false)
    if (result?.success !== false) closeTaskModal()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && closeTaskModal()}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-[#231e2e] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="font-display text-xl font-semibold text-gray-800 dark:text-white">
                {isEdit ? 'Edit Task' : 'Add New Task'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the details to {isEdit ? 'update' : 'track'} your deadline</p>
            </div>
            <button onClick={closeTaskModal} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Title */}
            <div>
              <label className="label">Task Title *</label>
              <input className="input" placeholder="e.g. Submit Math Assignment" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={2} placeholder="What does this task involve?" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            {/* Category */}
            <div>
              <label className="label">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.value} type="button"
                    onClick={() => set('category', cat.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      form.category === cat.value
                        ? 'bg-blush-100 border-blush-200 text-blush-400 shadow-sm'
                        : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/20 text-gray-500 dark:text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label flex items-center gap-1"><Calendar size={11} /> Due Date *</label>
                <input className="input text-sm" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} required />
              </div>
              <div>
                <label className="label flex items-center gap-1"><Bell size={11} /> Reminder Date *</label>
                <input className="input text-sm" type="date" value={form.reminderDate} onChange={e => set('reminderDate', e.target.value)} required />
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className="label">Reference Materials</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-white/20 rounded-2xl p-4 text-center cursor-pointer hover:border-blush-300 hover:bg-blush-50/50 dark:hover:bg-blush-400/5 transition-all"
              >
                <Upload size={18} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-400">Click to upload PDFs, PPTs, images…</p>
                <input ref={fileRef} type="file" multiple accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.txt" className="hidden" onChange={handleFileChange} />
              </div>
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {files.map((f, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-peach-50 dark:bg-peach-400/10 text-peach-400 border border-peach-200 dark:border-peach-400/20">
                      {f.name.length > 20 ? f.name.slice(0, 20) + '…' : f.name}
                      <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {isEdit && editingTask?.attachments?.filter(a => !a.isLink).length > 0 && (
                <p className="text-xs text-gray-400 mt-1">{editingTask.attachments.filter(a => !a.isLink).length} existing file(s) attached</p>
              )}
            </div>

            {/* External links */}
            <div>
              <label className="label flex items-center gap-1"><Link2 size={11} /> External Links (Google Drive, PPT…)</label>
              <div className="flex gap-2">
                <input className="input text-sm flex-1" placeholder="https://drive.google.com/…" value={linkInput} onChange={e => setLinkInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())} />
                <button type="button" onClick={addLink} className="btn-ghost flex items-center gap-1 text-sm flex-shrink-0">
                  <Plus size={14} /> Add
                </button>
              </div>
              {form.links.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.links.map((link, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-lavender-50 dark:bg-lavender-400/10 text-lavender-400 border border-lavender-200 dark:border-lavender-400/20 max-w-full">
                      <span className="truncate max-w-[180px]">{link}</span>
                      <button type="button" onClick={() => removeLink(i)}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex gap-3 flex-shrink-0">
            <button type="button" onClick={closeTaskModal} className="btn-ghost flex-1 text-sm">Cancel</button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={saving}
              className="btn-primary flex-1 text-sm"
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Task ✨'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
