import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle2, ListTodo, Plus, Trash2 } from 'lucide-react';
import api from '../api/client';

const EMPTY_FORM = { title: '', category: 'Work', deadline: '' };
const CATEGORIES = ['Work', 'Study', 'Personal'];

export default function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const [taskRes, analyticsRes] = await Promise.all([api.get('/tasks'), api.get('/analytics')]);
      setTasks(taskRes.data);
      setAnalytics(analyticsRes.data);
    } catch {
      toast.error('Failed to load tasks');
    }
    setLoading(false);
  };

  useEffect(() => {
    let active = true;

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const [taskRes, analyticsRes] = await Promise.all([api.get('/tasks'), api.get('/analytics')]);
        if (active) {
          setTasks(taskRes.data);
          setAnalytics(analyticsRes.data);
        }
      } catch {
        if (active) {
          toast.error('Failed to load tasks');
        }
      }
      if (active) {
        setLoading(false);
      }
    };

    void fetchTasks();

    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => ({
    pending: tasks.filter(task => task.status !== 'done'),
    done: tasks.filter(task => task.status === 'done'),
  }), [tasks]);

  const setField = key => event => {
    setForm(prev => ({ ...prev, [key]: event.target.value }));
  };

  const createTask = async (event) => {
    event.preventDefault();
    setCreating(true);
    try {
      await api.post('/tasks', {
        title: form.title,
        category: form.category,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      });
      toast.success('Task added');
      setForm(EMPTY_FORM);
      setShowCreate(false);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not create task');
    }
    setCreating(false);
  };

  const updateTask = async (task, updates) => {
    setUpdatingId(task.id);
    try {
      await api.put(`/tasks/${task.id}`, updates);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not update task');
    }
    setUpdatingId(null);
  };

  const removeTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    setUpdatingId(taskId);
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted');
      const analyticsRes = await api.get('/analytics');
      setAnalytics(analyticsRes.data);
    } catch {
      toast.error('Could not delete task');
    }
    setUpdatingId(null);
  };

  const renderTask = (task) => {
    const isDone = task.status === 'done';
    const isLate = !isDone && task.deadline && new Date(task.deadline) < new Date();
    const busy = updatingId === task.id;

    return (
      <article key={task.id} className={`task-card ${isDone ? 'is-done' : ''} ${isLate ? 'is-late' : ''}`}>
        <div className="task-card-main">
          <button
            type="button"
            className={`task-toggle ${isDone ? 'is-done' : ''}`}
            onClick={() => updateTask(task, { status: isDone ? 'pending' : 'done' })}
            disabled={busy}
            aria-label={isDone ? 'Mark as pending' : 'Mark as done'}
          >
            <CheckCircle2 size={16} />
          </button>
          <div className="task-copy">
            <h3>{task.title}</h3>
            <div className="task-meta-row">
              <span className="badge badge-purple">{task.category}</span>
              {task.deadline ? (
                <span className={`badge ${isLate ? 'badge-red' : 'badge-blue'}`}>
                  <Calendar size={10} />
                  {new Date(task.deadline).toLocaleString()}
                </span>
              ) : (
                <span className="badge badge-yellow">No deadline</span>
              )}
            </div>
          </div>
        </div>
        <div className="task-actions">
          <button
            type="button"
            className="btn-icon btn-sm"
            onClick={() => updateTask(task, {
              category: CATEGORIES[(CATEGORIES.indexOf(task.category) + 1) % CATEGORIES.length],
            })}
            disabled={busy}
            title="Cycle category"
          >
            <ListTodo size={14} />
          </button>
          <button
            type="button"
            className="btn-icon btn-sm"
            onClick={() => removeTask(task.id)}
            disabled={busy}
            title="Delete task"
          >
            <Trash2 size={14} style={{ color: 'var(--red)' }} />
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="page animate-fade">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Tasks</h1>
          <p className="text-muted">Track the work that turns all the ideas into shipped code.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost" onClick={() => navigate('/analytics')}>View Analytics</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <span className="section-label">Open now</span>
          <div className="task-score">{analytics?.total_tasks - analytics?.completed_tasks || 0}</div>
          <p className="text-muted text-sm">Active tasks still on your board.</p>
        </div>
        <div className="card">
          <span className="section-label">Finished</span>
          <div className="task-score">{analytics?.completed_tasks || 0}</div>
          <p className="text-muted text-sm">Tasks you have already closed out.</p>
        </div>
        <div className="card">
          <span className="section-label">Late</span>
          <div className="task-score">{analytics?.late_tasks || 0}</div>
          <p className="text-muted text-sm">Tasks that need a reset or a push.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <ListTodo size={48} />
          <h3>No tasks yet</h3>
          <p>Start with one concrete next step and build the board from there.</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)} style={{ marginTop: 14 }}>
            <Plus size={14} /> Add your first task
          </button>
        </div>
      ) : (
        <div className="task-board">
          <section className="task-column">
            <div className="task-column-head">
              <h2>In motion</h2>
              <span className="badge badge-yellow">{grouped.pending.length}</span>
            </div>
            <div className="task-stack">
              {grouped.pending.length ? grouped.pending.map(renderTask) : <div className="empty-inline">Nothing pending.</div>}
            </div>
          </section>

          <section className="task-column">
            <div className="task-column-head">
              <h2>Done</h2>
              <span className="badge badge-green">{grouped.done.length}</span>
            </div>
            <div className="task-stack">
              {grouped.done.length ? grouped.done.map(renderTask) : <div className="empty-inline">No completed tasks yet.</div>}
            </div>
          </section>
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={event => event.stopPropagation()}>
            <h2>New Task</h2>
            <form onSubmit={createTask} className="auth-form">
              <div className="input-group">
                <label>Title *</label>
                <input className="input" value={form.title} onChange={setField('title')} placeholder="Ship project settings panel" required />
              </div>
              <div className="input-group">
                <label>Category</label>
                <select className="input" value={form.category} onChange={setField('category')}>
                  {CATEGORIES.map(category => <option key={category}>{category}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Deadline</label>
                <input className="input" type="datetime-local" value={form.deadline} onChange={setField('deadline')} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-ghost w-full" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary w-full" disabled={creating}>
                  {creating ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
