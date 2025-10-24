'use client';
import { useState, useEffect, useMemo } from 'react';

// Define a type for our task object
type Task = {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  images?: string[];
};

// Define a type for the priority keys for easy sorting logic
const PRIORITY_ORDER: { [key in NonNullable<Task['priority']>]: number } = {
  high: 3,
  medium: 2,
  low: 1,
};

// This tells TypeScript that the global Window object might have these properties
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Helper to get priority chip classes
const getPriorityChipClasses = (p: Task['priority'] | undefined): string => {
  const safePriority = p || 'low';
  const baseClasses = 'text-xs font-bold py-0.5 px-2 rounded-lg';

  switch (safePriority) {
    case 'high':
      return `${baseClasses} bg-red-100 text-red-500`;
    case 'medium':
      return `${baseClasses} bg-yellow-100 text-yellow-500`;
    case 'low':
    default:
      return `${baseClasses} bg-green-100 text-green-600`;
  }
};

// Icon Components
const TasksIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<NonNullable<Task['priority']>>('medium');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('dueDate');
  const [errors, setErrors] = useState<{ title?: string; description?: string; dueDate?: string; }>({});
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState<'title' | 'description' | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        const text = finalTranscript || interimTranscript;
        if (activeField === 'title') {
          setTitle((prev) => prev + text);
        } else if (activeField === 'description') {
          setDescription((prev) => prev + text);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setActiveField(null);
      };
      recognitionInstance.onend = () => {
        if (isListening) {
          recognitionInstance.start();
        }
      };
      setRecognition(recognitionInstance);
    }
  }, [activeField, isListening]);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      showNotification('Failed to fetch tasks', 'error');
    }
    setLoading(false);
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const startListening = (field: 'title' | 'description') => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }
    setIsListening(true);
    setActiveField(field);
    recognition.start();
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
    setActiveField(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    setImages((prev) => [...prev, ...fileArray]);
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('dueDate', dueDate);
      formData.append('priority', priority);
      images.forEach((image) => {
        formData.append('images', image);
      });
      await fetch('/api/tasks', { method: 'POST', body: formData });
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setImages([]);
      setImagePreviews([]);
      setErrors({});
      showNotification('Task added successfully!');
      fetchTasks();
    } catch (error) {
      console.error('Failed to add task:', error);
      showNotification('Failed to add task', 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setLoading(true);
    try {
      await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      showNotification('Task deleted successfully!');
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      showNotification('Failed to delete task', 'error');
    }
    setLoading(false);
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    setLoading(true);
    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task._id, status: newStatus }),
      });
      showNotification(`Task marked as ${newStatus}!`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      showNotification('Failed to update task', 'error');
    }
    setLoading(false);
  };

  const handleOpenEditModal = (task: Task) => {
    const safeTask: Task = { ...task, priority: task.priority || 'medium' };
    setEditingTask(safeTask);
    setIsModalOpen(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setLoading(true);
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTask),
      });
      setIsModalOpen(false);
      setEditingTask(null);
      showNotification('Task updated successfully!');
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      showNotification('Failed to update task', 'error');
    }
    setLoading(false);
  };

  const isOverdue = (task: Task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today && task.status === 'pending';
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks.filter((task) => filter === 'all' || task.status === filter);

    if (searchTerm.trim()) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          task.description.toLowerCase().includes(lowerCaseSearchTerm),
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'priority') {
        const priorityA = a.priority || 'low';
        const priorityB = b.priority || 'low';
        return PRIORITY_ORDER[priorityB] - PRIORITY_ORDER[priorityA];
      } else if (sortBy === 'status') {
        if (a.status === 'pending' && b.status === 'completed') return -1;
        if (a.status === 'completed' && b.status === 'pending') return 1;
        return 0;
      }
      return 0;
    });

    return result;
  }, [tasks, filter, searchTerm, sortBy]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => isOverdue(t)).length,
  };

  const baseInputClasses = 'w-full p-2 border rounded-md text-sm outline-none box-border';
  const voiceInputClasses = `${baseInputClasses} pr-10`;
  const baseTextareaClasses = `${voiceInputClasses} resize-y min-h-[60px]`;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Success Notification */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-[10000] animate-slide-in-right">
          <div className="bg-teal-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <span className="text-xl">✓</span>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white p-3 rounded-xl shadow-lg">
              <TasksIcon />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-1">My Tasks</h1>
              <p className="text-sm text-slate-500">
                Manage all your projects and to-do items efficiently
              </p>
            </div>
          </div>
          <button
            onClick={fetchTasks}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh tasks"
          >
            <RefreshIcon />
            <span className="hidden sm:inline text-sm font-medium">Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Tasks', value: stats.total, color: 'from-blue-400 to-blue-600', icon: '📊' },
            { label: 'Pending', value: stats.pending, color: 'from-yellow-400 to-yellow-600', icon: '⏳' },
            { label: 'Completed', value: stats.completed, color: 'from-green-400 to-green-600', icon: '✅' },
            { label: 'Overdue', value: stats.overdue, color: 'from-red-400 to-red-600', icon: '⚠️' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
              <div className={`bg-gradient-to-br ${stat.color} text-white text-2xl w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
              <div className="text-slate-500 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Add Task Form */}
          <div className="bg-white rounded-2xl p-6 shadow-xl h-fit border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
              <span className="text-2xl">➕</span>
              Add New Task
            </h2>
            <form onSubmit={handleAddTask} className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-teal-700 font-semibold text-sm">Title</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter task title..."
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setErrors({ ...errors, title: undefined });
                    }}
                    className={`${voiceInputClasses} ${
                      errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => (isListening && activeField === 'title' ? stopListening() : startListening('title'))}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 border-none cursor-pointer text-base p-2 rounded-lg text-white transition-all ${
                      isListening && activeField === 'title' ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'
                    }`}
                    title={isListening && activeField === 'title' ? 'Stop recording' : 'Start voice input'}
                  >
                    {isListening && activeField === 'title' ? '⏹️' : '🎤'}
                  </button>
                </div>
                {errors.title && <span className="text-red-500 text-xs mt-1 block">{errors.title}</span>}
              </div>

              <div>
                <label className="block mb-2 text-teal-700 font-semibold text-sm">Description</label>
                <div className="relative">
                  <textarea
                    placeholder="Enter task description..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setErrors({ ...errors, description: undefined });
                    }}
                    className={`${baseTextareaClasses} ${
                      errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => (isListening && activeField === 'description' ? stopListening() : startListening('description'))}
                    className={`absolute right-2 top-3 border-none cursor-pointer text-base p-2 rounded-lg text-white transition-all ${
                      isListening && activeField === 'description' ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'
                    }`}
                    title={isListening && activeField === 'description' ? 'Stop recording' : 'Start voice input'}
                  >
                    {isListening && activeField === 'description' ? '⏹️' : '🎤'}
                  </button>
                </div>
                {errors.description && <span className="text-red-500 text-xs mt-1 block">{errors.description}</span>}
              </div>

              <div>
                <label className="block mb-2 text-teal-700 font-semibold text-sm">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    setErrors({ ...errors, dueDate: undefined });
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className={`${baseInputClasses} ${
                    errors.dueDate ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                  }`}
                />
                {errors.dueDate && <span className="text-red-500 text-xs mt-1 block">{errors.dueDate}</span>}
              </div>

              <div>
                <label className="block mb-2 text-teal-700 font-semibold text-sm">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as NonNullable<Task['priority']>)}
                  className={`${baseInputClasses} border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100`}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-teal-700 font-semibold text-sm">Attach Images (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className={`${baseInputClasses} p-2 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100`}
                />
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
                        <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white border-none rounded-full w-6 h-6 cursor-pointer text-xs flex items-center justify-center leading-none hover:bg-red-600 shadow-lg"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full p-3 border-none rounded-lg text-sm font-bold transition-all ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 cursor-pointer shadow-lg hover:shadow-xl'
                } text-white`}
              >
                {loading ? '⏳ Processing...' : '✨ Add Task'}
              </button>
            </form>
          </div>

          {/* Tasks List */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex flex-col mb-4 gap-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Your Tasks
              </h2>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'pending', 'completed'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`py-2 px-4 rounded-full border-none text-xs font-semibold cursor-pointer capitalize transition-all shadow-sm ${
                        filter === f
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                          : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                      }`}
                    >
                      {f === 'all' ? `All (${stats.total})` : f === 'pending' ? `Pending (${stats.pending})` : `Done (${stats.completed})`}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="🔍 Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm w-full sm:w-48 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="p-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none"
                  >
                    <option value="dueDate">📅 Sort by Due Date</option>
                    <option value="priority">⚡ Sort by Priority</option>
                    <option value="status">📊 Sort by Status</option>
                  </select>
                </div>
              </div>
            </div>

            {loading && (
              <div className="text-center p-12">
                <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-medium">Loading tasks...</p>
              </div>
            )}

            {!loading && filteredAndSortedTasks.length === 0 && (
              <div className="text-center p-12 bg-gray-50 rounded-xl">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg font-semibold text-slate-600 mb-2">No tasks found</p>
                <p className="text-sm text-slate-400">
                  {filter !== 'all' ? `No ${filter} tasks matching your criteria.` : 'Start by adding your first task!'}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
              {!loading &&
                filteredAndSortedTasks.map((task) => {
                  const overdue = isOverdue(task);
                  const cardClasses =
                    task.status === 'completed'
                      ? 'border-green-300 bg-green-50/50'
                      : overdue
                      ? 'border-red-300 bg-red-50/50'
                      : 'border-gray-200 bg-white';

                  return (
                    <div
                      key={task._id}
                      className={`p-4 rounded-xl border-2 transition-all hover:shadow-xl ${cardClasses}`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h3
                            className={`text-base font-bold mb-2 ${
                              task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </h3>
                          <p
                            className={`text-sm mb-3 ${
                              task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-600'
                            }`}
                          >
                            {task.description}
                          </p>
                          {task.images && task.images.length > 0 && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {task.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`Task image ${idx + 1}`}
                                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-300 cursor-pointer transition-transform hover:scale-110 shadow-md"
                                  onClick={() => setSelectedImage(img)}
                                />
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-2 flex-wrap mt-3">
                            <span className={getPriorityChipClasses(task.priority)}>
                              {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}{' '}
                              {(task.priority || 'LOW').toUpperCase()}
                            </span>
                            <span className="text-xs py-1 px-3 rounded-lg bg-cyan-50 text-teal-700 font-medium border border-cyan-200">
                              📅 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            {overdue && (
                              <span className="text-xs py-1 px-3 bg-red-500 text-white rounded-lg font-bold shadow-md animate-pulse">
                                ⚠️ OVERDUE
                              </span>
                            )}
                            {task.status === 'completed' && (
                              <span className="text-xs py-1 px-3 bg-green-500 text-white rounded-lg font-bold shadow-md">
                                ✅ DONE
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleOpenEditModal(task)}
                            disabled={loading}
                            className="py-2 px-3 text-white border-none rounded-lg cursor-pointer text-sm font-medium transition-all hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 shadow-md"
                            title="Edit Task"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleToggleStatus(task)}
                            disabled={loading}
                            className={`py-2 px-3 text-white border-none rounded-lg cursor-pointer text-sm font-medium transition-all hover:scale-105 ${
                              task.status === 'pending'
                                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                                : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                            } disabled:opacity-50 shadow-md`}
                            title={task.status === 'pending' ? 'Mark Complete' : 'Mark Pending'}
                          >
                            {task.status === 'pending' ? '✓' : '↺'}
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            disabled={loading}
                            className="py-2 px-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-none rounded-lg cursor-pointer text-sm transition-all hover:scale-105 disabled:opacity-50 shadow-md"
                            title="Delete Task"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Enlarged task"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute -top-4 -right-4 bg-white border-none rounded-full w-12 h-12 text-2xl cursor-pointer text-slate-800 font-bold transition-all hover:bg-gray-100 hover:scale-110 shadow-xl"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingTask && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9998] p-4 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <span className="text-3xl">✏️</span>
              Edit Task
            </h2>
            <form onSubmit={handleUpdateTask} className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-teal-700 font-semibold text-sm">Title</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-teal-700 font-semibold text-sm">Description</label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none resize-y min-h-[80px] focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-teal-700 font-semibold text-sm">Due Date</label>
                <input
                  type="date"
                  value={editingTask.dueDate}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-teal-700 font-semibold text-sm">Priority</label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as NonNullable<Task['priority']> })}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              {editingTask.images && editingTask.images.length > 0 && (
                <div className="mt-2">
                  <label className="block mb-2 text-teal-700 font-semibold text-sm">
                    Attached Images
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {editingTask.images.map((img, index) => (
                      <div
                        key={index}
                        className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md hover:shadow-lg transition-shadow"
                      >
                        <img
                          src={img}
                          alt={`Task image ${index}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setSelectedImage(img)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                  }}
                  className="px-6 py-3 bg-gray-500 text-white border-none rounded-lg text-sm font-bold cursor-pointer transition-all hover:bg-gray-600 shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-3 border-none rounded-lg text-sm font-bold transition-all text-white shadow-md hover:shadow-lg ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 cursor-pointer'
                  }`}
                >
                  {loading ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
