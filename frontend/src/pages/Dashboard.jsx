import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Code2, FolderKanban, HelpCircle, ListTodo, Plus } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import api from '../api/client';

const EMPTY_STATS = {
  projects: 0,
  help_posts: 0,
  replies_given: 0,
  reputation: 0,
  total_tasks: 0,
  completed_tasks: 0,
  pending_tasks: 0,
  late_tasks: 0,
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, projectsRes, communityRes] = await Promise.all([
          api.get('/users/me/stats'),
          api.get('/projects/'),
          api.get('/community/posts'),
        ]);
        setStats(statsRes.data);
        setRecentProjects(projectsRes.data.slice(0, 4));
        setRecentPosts(communityRes.data.slice(0, 4));
      } catch (error) {
        console.warn('Dashboard data load failed', error);
      }
      setLoading(false);
    };

    load();
  }, []);

  const summaryCards = [
    { icon: 'Projects', emoji: '🗂️', value: stats.projects, color: 'var(--purple-lt)' },
    { icon: 'Help Posts', emoji: '🆘', value: stats.help_posts, color: 'var(--blue)' },
    { icon: 'Replies Given', emoji: '✅', value: stats.replies_given, color: 'var(--green)' },
    { icon: 'Reputation', emoji: '⭐', value: stats.reputation, color: 'var(--yellow)' },
  ];

  return (
    <div className="page animate-fade dashboard-page">
      <div className="page-header">
        <h1>Welcome back, {user?.username}</h1>
        <p className="text-muted">Here&apos;s what your workspace and community footprint look like today.</p>
      </div>

      <div className="stats-grid">
        {summaryCards.map(card => (
          <div className="stat-card" key={card.icon}>
            <div className="stat-icon">{card.emoji}</div>
            <div className="stat-value" style={{ color: card.color }}>{loading ? '—' : card.value}</div>
            <div className="stat-label">{card.icon}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-split">
        <section className="card dashboard-panel">
          <div className="task-column-head">
            <h2>Task Pulse</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>
              Open board <ArrowRight size={14} />
            </button>
          </div>
          <div className="dashboard-task-grid">
            <div className="mini-stat">
              <span className="section-label">Open</span>
              <strong>{loading ? '—' : stats.pending_tasks}</strong>
            </div>
            <div className="mini-stat">
              <span className="section-label">Done</span>
              <strong>{loading ? '—' : stats.completed_tasks}</strong>
            </div>
            <div className="mini-stat">
              <span className="section-label">Late</span>
              <strong>{loading ? '—' : stats.late_tasks}</strong>
            </div>
          </div>
        </section>

        <section className="card dashboard-panel dashboard-panel-accent">
          <span className="section-label">Momentum</span>
          <h2>See where your energy is actually landing.</h2>
          <p className="text-muted">Analytics now comes from your real task history, so the signal and the app finally match.</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/analytics')}>
            <BarChart3 size={14} /> Open Analytics
          </button>
        </section>
      </div>

      <div className="dashboard-columns">
        <section>
          <div className="flex items-center justify-between dashboard-section-head">
            <h2>Recent Projects</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {loading ? <div className="spinner" /> : recentProjects.length === 0 ? (
            <div className="empty-state">
              <FolderKanban size={36} />
              <h3>No projects yet</h3>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/projects?new=1')} style={{ marginTop: 12 }}>
                <Plus size={14} /> Create Project
              </button>
            </div>
          ) : (
            <div className="dashboard-card-stack">
              {recentProjects.map(project => (
                <div
                  key={project.id}
                  className="card dashboard-click-card"
                  onClick={() => navigate(`/editor/${project.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <span className="dashboard-card-title">{project.name}</span>
                    <span className="badge badge-purple">{project.language}</span>
                  </div>
                  <p className="text-muted text-sm dashboard-card-copy">{project.description || 'No description'}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between dashboard-section-head">
            <h2>Community Feed</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/community')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {loading ? <div className="spinner" /> : recentPosts.length === 0 ? (
            <div className="empty-state">
              <HelpCircle size={36} />
              <h3>No posts yet</h3>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/community?ask=1')} style={{ marginTop: 12 }}>
                <Plus size={14} /> Ask for Help
              </button>
            </div>
          ) : (
            <div className="dashboard-card-stack">
              {recentPosts.map(post => (
                <div
                  key={post.id}
                  className="card dashboard-click-card"
                  onClick={() => navigate(`/community/${post.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <span className="dashboard-card-title">{post.title}</span>
                    <span className={`badge ${post.status === 'solved' ? 'badge-green' : 'badge-yellow'}`}>{post.status}</span>
                  </div>
                  <div className="flex items-center gap-1 dashboard-card-copy">
                    <span className="badge badge-blue">{post.language}</span>
                    <span className="text-muted text-xs">{post.replies?.length || 0} replies</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="dashboard-action-row">
          <button className="btn btn-primary" onClick={() => navigate('/editor')}><Code2 size={16} /> New File</button>
          <button className="btn btn-ghost" onClick={() => navigate('/projects?new=1')}><FolderKanban size={16} /> New Project</button>
          <button className="btn btn-ghost" onClick={() => navigate('/community?ask=1')}><HelpCircle size={16} /> Ask for Help</button>
          <button className="btn btn-ghost" onClick={() => navigate('/tasks')}><ListTodo size={16} /> New Task</button>
        </div>
      </div>
    </div>
  );
}
