import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, BarChart3, CheckCircle2, Clock3, Sparkles } from 'lucide-react';
import api from '../api/client';

export default function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/analytics');
        setAnalytics(res.data);
      } catch {
        toast.error('Failed to load analytics');
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;
  }

  return (
    <div className="page animate-fade">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Analytics</h1>
          <p className="text-muted">A read on your working rhythm, not just your raw task count.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/tasks')}>
          Open Tasks <ArrowRight size={14} />
        </button>
      </div>

      <div className="analytics-hero">
        <article className="analytics-score-card">
          <span className="section-label">Productivity</span>
          <div className="analytics-score">{analytics?.productivity_score ?? 0}%</div>
          <p className="text-muted text-sm">Completion rate across everything you put on the board.</p>
        </article>
        <article className="analytics-score-card offset-card">
          <span className="section-label">Discipline</span>
          <div className="analytics-score">{analytics?.discipline_score ?? 0}%</div>
          <p className="text-muted text-sm">How consistently deadlines are staying under control.</p>
        </article>
      </div>

      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="analytics-mini-head"><CheckCircle2 size={16} /><span>Completed</span></div>
          <div className="task-score">{analytics?.completed_tasks || 0}</div>
        </div>
        <div className="card">
          <div className="analytics-mini-head"><Clock3 size={16} /><span>Late</span></div>
          <div className="task-score">{analytics?.late_tasks || 0}</div>
        </div>
        <div className="card">
          <div className="analytics-mini-head"><BarChart3 size={16} /><span>Best time</span></div>
          <div className="task-score task-score-label">{analytics?.peak_productive_time || 'No data yet'}</div>
        </div>
      </div>

      <div className="analytics-grid">
        <section className="card">
          <div className="task-column-head">
            <h2>Category Breakdown</h2>
            <span className="badge badge-blue">{analytics?.category_breakdown?.length || 0}</span>
          </div>
          <div className="analytics-bars">
            {analytics?.category_breakdown?.length ? analytics.category_breakdown.map(item => (
              <div key={item.category} className="analytics-bar-row">
                <div className="analytics-bar-copy">
                  <strong>{item.category}</strong>
                  <span className="text-muted text-xs">
                    {item.completed}/{item.total} done, {item.late_count} late
                  </span>
                </div>
                <div className="analytics-bar-track">
                  <div className="analytics-bar-fill" style={{ width: `${item.completion_rate}%` }} />
                </div>
                <span className="analytics-bar-value">{item.completion_rate}%</span>
              </div>
            )) : (
              <div className="empty-inline">No task data yet.</div>
            )}
          </div>
        </section>

        <section className="card">
          <div className="task-column-head">
            <h2>Coaching Notes</h2>
            <span className="badge badge-purple"><Sparkles size={10} /> Live</span>
          </div>
          <div className="analytics-summary">
            <p><strong>Best category:</strong> {analytics?.best_category || 'No data yet'}</p>
            <p><strong>Needs attention:</strong> {analytics?.weakest_category || 'No data yet'}</p>
            <ul className="analytics-suggestions">
              {(analytics?.suggestions || []).map((suggestion, index) => (
                <li key={`${suggestion}-${index}`}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
