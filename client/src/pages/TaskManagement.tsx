import React, { useState, useEffect } from 'react';

interface Task {
  id: string;
  type: string;
  subject: string;
  dueAt?: string;
  assignee: {
    id: string;
    fullName: string;
  };
  notes?: string;
  createdAt: string;
}

export const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    type: 'call',
    subject: '',
    dueAt: '',
    assignedTo: '',
    notes: '',
  });

  const taskTypes = ['call', 'email', 'meeting', 'follow_up', 'demo', 'other'];

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);

      const response = await fetch(`/api/v1/tasks?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const result = await response.json();
        setTasks(result.data || result);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          type: 'call',
          subject: '',
          dueAt: '',
          assignedTo: '',
          notes: '',
        });
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const getTaskTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      call: '📞',
      email: '📧',
      meeting: '🤝',
      follow_up: '🔄',
      demo: '🖥️',
      other: '📋',
    };
    return icons[type] || '📋';
  };

  const isOverdue = (dueAt?: string) => {
    if (!dueAt) return false;
    return new Date(dueAt) < new Date();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>

      {/* Task Type Filter */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded text-sm ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All Tasks
          </button>
          {taskTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-2 rounded text-sm capitalize ${
                filter === type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {getTaskTypeIcon(type)} {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                {taskTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="datetime-local"
                placeholder="Due Date"
                value={formData.dueAt}
                onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Assigned To (User ID)"
                required
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows={3}
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Create Task
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks Grid */}
      <div className="grid gap-4">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`bg-white border rounded-lg p-4 ${
              isOverdue(task.dueAt) ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{getTaskTypeIcon(task.type)}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{task.subject}</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {task.type.replace('_', ' ')} • Assigned to {task.assignee.fullName}
                  </p>
                  {task.dueAt && (
                    <p className={`text-sm ${
                      isOverdue(task.dueAt) ? 'text-red-600 font-medium' : 'text-gray-500'
                    }`}>
                      Due: {new Date(task.dueAt).toLocaleString()}
                      {isOverdue(task.dueAt) && ' (Overdue)'}
                    </p>
                  )}
                  {task.notes && (
                    <p className="text-sm text-gray-600 mt-2">{task.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  Edit
                </button>
                <button className="text-green-600 hover:text-green-800 text-sm">
                  Complete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl">📋</span>
          <h3 className="text-lg font-medium text-gray-900 mt-4">No tasks found</h3>
          <p className="text-gray-500">Create your first task to get started.</p>
        </div>
      )}
    </div>
  );
};