import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, FolderKanban, HelpCircle, ListTodo, Save } from 'lucide-react';
import toast from 'react-hot-toast';
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

export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const isMe = !username || username === me?.username;

  useEffect(() => {
    const load = async () => {
      try {
        if (isMe) {
          const [userRes, statsRes] = await Promise.all([api.get('/users/me'), api.get('/users/me/stats')]);
          setProfile(userRes.data);
          setBio(userRes.data.bio || '');
          setStats(statsRes.data);
        } else {
          const res = await api.get(`/users/${username}`);
          setProfile(res.data);
          setBio(res.data.bio || '');
        }
      } catch {
        toast.error('User not found');
        navigate('/dashboard');
      }
      setLoading(false);
    };

    load();
  }, [isMe, navigate, username]);

  const saveBio = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/me', { bio });
      setProfile(res.data);
      toast.success('Profile updated');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;
  }

  if (!profile) return null;

  const initials = profile.username?.[0]?.toUpperCase() || '?';
  const joined = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="page animate-fade" style={{ maxWidth: 880 }}>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div className="profile-banner" />
        <div style={{ padding: '50px 24px 24px', position: 'relative' }}>
          <div className="profile-avatar-lg">{initials}</div>
          <div className="flex items-center justify-between profile-header-row">
            <div>
              <h1 className="profile-title">{profile.username}</h1>
              <p className="text-muted text-sm">{profile.email}</p>
              <p className="text-muted text-xs" style={{ marginTop: 4 }}>Joined {joined}</p>
            </div>
            {isMe && !editing && (
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                <Edit2 size={14} /> Edit Profile
              </button>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            {editing ? (
              <div className="profile-editor">
                <textarea
                  className="input"
                  value={bio}
                  onChange={event => setBio(event.target.value)}
                  placeholder="Tell others what you like building and where you can help."
                  rows={3}
                />
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={saveBio} disabled={saving}>
                    {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><Save size={13} /> Save</>}
                  </button>
                </div>
              </div>
            ) : (
              <p className="profile-bio">
                {profile.bio || (isMe ? 'No bio yet. Add a few lines so collaborators know your style.' : 'No bio yet.')}
              </p>
            )}
          </div>
        </div>
      </div>

      {isMe && (
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          {[
            { label: 'Projects', value: stats.projects, color: 'var(--purple-lt)', route: '/projects', emoji: '🗂️' },
            { label: 'Help Posts', value: stats.help_posts, color: 'var(--blue)', route: '/community', emoji: '🆘' },
            { label: 'Replies Given', value: stats.replies_given, color: 'var(--green)', route: '/community', emoji: '✅' },
            { label: 'Reputation', value: stats.reputation, color: 'var(--yellow)', route: '/analytics', emoji: '⭐' },
          ].map(item => (
            <div
              key={item.label}
              className="stat-card"
              style={{ cursor: item.route ? 'pointer' : 'default' }}
              onClick={() => item.route && navigate(item.route)}
            >
              <div className="stat-icon">{item.emoji}</div>
              <div className="stat-value" style={{ color: item.color }}>{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {isMe && (
        <div className="profile-task-strip">
          <div className="mini-stat">
            <span className="section-label">Tasks open</span>
            <strong>{stats.pending_tasks}</strong>
          </div>
          <div className="mini-stat">
            <span className="section-label">Tasks done</span>
            <strong>{stats.completed_tasks}</strong>
          </div>
          <div className="mini-stat">
            <span className="section-label">Running late</span>
            <strong>{stats.late_tasks}</strong>
          </div>
        </div>
      )}

      <div className="flex gap-2 profile-links">
        <button className="btn btn-ghost" onClick={() => navigate('/projects')}>
          <FolderKanban size={15} /> My Projects
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/community')}>
          <HelpCircle size={15} /> Community Posts
        </button>
        {isMe && (
          <button className="btn btn-ghost" onClick={() => navigate('/tasks')}>
            <ListTodo size={15} /> Task Board
          </button>
        )}
      </div>
    </div>
  );
}
