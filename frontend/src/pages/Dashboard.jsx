import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Code2, FolderKanban, HelpCircle, MessageSquare, Plus, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ projects: 0, help_posts: 0, replies_given: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p, c] = await Promise.all([
          api.get('/users/me/stats'),
          api.get('/projects/'),
          api.get('/community/posts'),
        ]);
        setStats(s.data);
        setRecentProjects(p.data.slice(0, 4));
        setRecentPosts(c.data.slice(0, 4));
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const langColor = { python:'var(--blue)', javascript:'var(--yellow)', java:'var(--red)', 'c++':'var(--purple-lt)', html:'var(--yellow)' };

  return (
    <div className="page animate-fade" style={{ maxWidth: '1100px' }}>
      <div className="page-header">
        <h1>Welcome back, {user?.username} 👋</h1>
        <p className="text-muted">Here's what's happening on your workspace.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { icon: '🗂️', label: 'Projects', value: stats.projects, color: 'var(--purple-lt)' },
          { icon: '🆘', label: 'Help Posts', value: stats.help_posts, color: 'var(--blue)' },
          { icon: '✅', label: 'Replies Given', value: stats.replies_given, color: 'var(--green)' },
          { icon: '⭐', label: 'Reputation', value: stats.replies_given * 10, color: 'var(--yellow)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{loading ? '—' : s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
            <h2 style={{ fontWeight: 700 }}>Recent Projects</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {loading ? <div className="spinner" /> : recentProjects.length === 0 ? (
            <div className="empty-state">
              <FolderKanban size={36} />
              <h3>No projects yet</h3>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/projects')} style={{ marginTop: 12 }}>
                <Plus size={14} /> Create Project
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentProjects.map(p => (
                <div key={p.id} className="card" style={{ padding: '14px 16px', cursor: 'pointer' }}
                  onClick={() => navigate(`/editor/${p.id}`)}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</span>
                    <span className="badge badge-purple">{p.language}</span>
                  </div>
                  <p className="text-muted text-sm" style={{ marginTop: 4 }}>{p.description || 'No description'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Community Posts */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
            <h2 style={{ fontWeight: 700 }}>Community Feed</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/community')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {loading ? <div className="spinner" /> : recentPosts.length === 0 ? (
            <div className="empty-state">
              <HelpCircle size={36} />
              <h3>No posts yet</h3>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/community')} style={{ marginTop: 12 }}>
                <Plus size={14} /> Ask for Help
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentPosts.map(p => (
                <div key={p.id} className="card" style={{ padding: '14px 16px', cursor: 'pointer' }}
                  onClick={() => navigate(`/community/${p.id}`)}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.title}</span>
                    <span className={`badge ${p.status === 'solved' ? 'badge-green' : 'badge-yellow'}`}>{p.status}</span>
                  </div>
                  <div className="flex items-center gap-1" style={{ marginTop: 6 }}>
                    <span className="badge badge-blue">{p.language}</span>
                    <span className="text-muted text-xs">{p.replies?.length || 0} replies</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 14 }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/editor')}><Code2 size={16} /> New File</button>
          <button className="btn btn-ghost" onClick={() => navigate('/projects')}><FolderKanban size={16} /> New Project</button>
          <button className="btn btn-ghost" onClick={() => navigate('/community')}><HelpCircle size={16} /> Ask for Help</button>
        </div>
      </div>
    </div>
  );
}
