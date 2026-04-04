import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';
import { Plus, Code2, Trash2, Globe, Lock, Search } from 'lucide-react';

const LANGS = ['python','javascript','typescript','html','css','java','cpp','go','rust','sql'];

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', language: 'python', is_public: true });
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/projects/' + (langFilter ? `?language=${langFilter}` : ''));
      setProjects(res.data);
    } catch { toast.error('Failed to load projects'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [langFilter]);

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/projects/', form);
      toast.success('Project created!');
      setShowCreate(false);
      setForm({ name: '', description: '', language: 'python', is_public: true });
      navigate(`/editor/${res.data.id}`);
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    setCreating(false);
  };

  const remove = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(p => p.filter(x => x.id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Delete failed'); }
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="page animate-fade">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>My Projects</h1>
          <p className="text-muted">All your code, organized in one place.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar">
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tag-select" style={{ gap: 6 }}>
          <span className={`tag-chip ${langFilter === '' ? 'active' : ''}`} onClick={() => setLangFilter('')}>All</span>
          {LANGS.map(l => (
            <span key={l} className={`tag-chip ${langFilter === l ? 'active' : ''}`} onClick={() => setLangFilter(langFilter === l ? '' : l)}>{l}</span>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Code2 size={48} />
          <h3>No projects found</h3>
          <p>Create your first project to get started</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)} style={{ marginTop: 14 }}>
            <Plus size={14} /> New Project
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map(p => (
            <div key={p.id} className="project-card" onClick={() => navigate(`/editor/${p.id}`)}>
              <div className="project-card-header">
                <div>
                  <h3>{p.name}</h3>
                  <p style={{ marginTop: 4 }}>{p.description || 'No description'}</p>
                </div>
                <div className="project-card-actions">
                  <button className="btn-icon btn-sm" onClick={e => remove(p.id, e)} title="Delete">
                    <Trash2 size={14} style={{ color: 'var(--red)' }} />
                  </button>
                </div>
              </div>
              <div className="project-meta">
                <span className="badge badge-purple">{p.language}</span>
                {p.is_public
                  ? <span className="badge badge-green"><Globe size={10} /> Public</span>
                  : <span className="badge badge-yellow"><Lock size={10} /> Private</span>}
                <span className="text-muted text-xs" style={{ marginLeft: 'auto' }}>
                  {p.files?.length || 0} file{p.files?.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Project</h2>
            <form onSubmit={create} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label>Project Name *</label>
                <input className="input" placeholder="My Awesome Project" value={form.name} onChange={set('name')} required />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea className="input" placeholder="What is this project about?" value={form.description} onChange={set('description')} />
              </div>
              <div className="input-group">
                <label>Primary Language</label>
                <select className="input" value={form.language} onChange={set('language')}>
                  {LANGS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_public} onChange={e => setForm(p => ({ ...p, is_public: e.target.checked }))} />
                Make project public
              </label>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost w-full" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary w-full" disabled={creating}>
                  {creating ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Create & Open Editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
