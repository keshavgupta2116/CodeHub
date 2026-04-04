import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';
import { Plus, HelpCircle, Search, MessageSquare, CheckCircle2 } from 'lucide-react';

const LANGS = ['python','javascript','typescript','html','css','java','cpp','go','rust','sql'];

export default function Community() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAsk, setShowAsk] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', code_snippet: '', language: 'python' });
  const [posting, setPosting] = useState(false);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (langFilter)   params.set('language', langFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (search)       params.set('search', search);
      const res = await api.get(`/community/posts?${params}`);
      setPosts(res.data);
    } catch { toast.error('Failed to load posts'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [langFilter, statusFilter]);

  const handleSearch = (e) => { e.preventDefault(); load(); };

  const submit = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await api.post('/community/posts', form);
      toast.success('Help request posted!');
      setShowAsk(false);
      setForm({ title: '', description: '', code_snippet: '', language: 'python' });
      load();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    setPosting(false);
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const ago = d => { const s = Math.floor((Date.now() - new Date(d)) / 1000); if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s/60)}m ago`; if (s < 86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`; };

  return (
    <div className="page animate-fade">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Community Help</h1>
          <p className="text-muted">Ask questions, give answers, help each other grow.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAsk(true)}>
          <Plus size={16} /> Ask for Help
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="flex items-center gap-2">
          <form className="search-bar" onSubmit={handleSearch} style={{ flex: 1, maxWidth: 400 }}>
            <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input placeholder="Search help posts…" value={search} onChange={e => setSearch(e.target.value)} />
          </form>
          <div style={{ display: 'flex', gap: 6 }}>
            {['','open','solved'].map(s => (
              <button key={s} className={`tag-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                {s === '' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>
        <div className="tag-select">
          <span className={`tag-chip ${langFilter === '' ? 'active' : ''}`} onClick={() => setLangFilter('')}>All Languages</span>
          {LANGS.map(l => (
            <span key={l} className={`tag-chip ${langFilter === l ? 'active' : ''}`} onClick={() => setLangFilter(langFilter === l ? '' : l)}>{l}</span>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <HelpCircle size={48} />
          <h3>No posts yet</h3>
          <p>Be the first to ask for help!</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAsk(true)} style={{ marginTop: 14 }}>
            <Plus size={14} /> Ask for Help
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {posts.map(p => (
            <div key={p.id} className="post-card" onClick={() => navigate(`/community/${p.id}`)}>
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <h3>{p.title}</h3>
                <span className={`badge ${p.status === 'solved' ? 'badge-green' : 'badge-yellow'}`}>
                  {p.status === 'solved' ? <CheckCircle2 size={10} /> : null} {p.status}
                </span>
              </div>
              <p>{p.description}</p>
              {p.code_snippet && <div className="code-preview">{p.code_snippet}</div>}
              <div className="post-meta">
                <span className="badge badge-blue">{p.language}</span>
                <span className="text-muted text-xs">by <strong>{p.author?.username}</strong></span>
                <span className="text-muted text-xs">{ago(p.created_at)}</span>
                <span className="text-muted text-xs" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MessageSquare size={12} /> {p.replies?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ask for Help modal */}
      {showAsk && (
        <div className="modal-overlay" onClick={() => setShowAsk(false)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <h2>Ask for Help</h2>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label>Title *</label>
                <input className="input" placeholder="What's your question?" value={form.title} onChange={set('title')} required />
              </div>
              <div className="input-group">
                <label>Description *</label>
                <textarea className="input" placeholder="Describe the problem in detail…" value={form.description} onChange={set('description')} required style={{ minHeight: 100 }} />
              </div>
              <div className="input-group">
                <label>Code Snippet</label>
                <textarea className="input mono" placeholder="Paste your code here…" value={form.code_snippet} onChange={set('code_snippet')} style={{ minHeight: 120, fontSize: '0.82rem' }} />
              </div>
              <div className="input-group">
                <label>Language</label>
                <select className="input" value={form.language} onChange={set('language')}>
                  {LANGS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost w-full" onClick={() => setShowAsk(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary w-full" disabled={posting}>
                  {posting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Post Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
