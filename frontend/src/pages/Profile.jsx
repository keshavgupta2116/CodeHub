import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import toast from 'react-hot-toast';
import { FolderKanban, HelpCircle, MessageSquare, Edit2, Save } from 'lucide-react';

export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ projects: 0, help_posts: 0, replies_given: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const isMe = !username || username === me?.username;

  useEffect(() => {
    const load = async () => {
      try {
        if (isMe) {
          const [u, s] = await Promise.all([api.get('/users/me'), api.get('/users/me/stats')]);
          setProfile(u.data); setBio(u.data.bio || ''); setStats(s.data);
        } else {
          const res = await api.get(`/users/${username}`);
          setProfile(res.data); setBio(res.data.bio || '');
        }
      } catch { toast.error('User not found'); navigate('/dashboard'); }
      setLoading(false);
    };
    load();
  }, [username]);

  const saveBio = async () => {
    setSaving(true);
    try {
      await api.put('/users/me', { bio });
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to update'); }
    setSaving(false);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;
  if (!profile) return null;

  const initials = profile.username?.[0]?.toUpperCase() || '?';
  const joined = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="page animate-fade" style={{ maxWidth: 800 }}>
      {/* Banner + avatar */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div className="profile-banner" />
        <div style={{ padding: '50px 24px 24px', position: 'relative' }}>
          <div className="profile-avatar-lg">{initials}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 8 }}>{profile.username}</h1>
              <p className="text-muted text-sm">{profile.email}</p>
              <p className="text-muted text-xs" style={{ marginTop: 4 }}>Joined {joined}</p>
            </div>
            {isMe && !editing && (
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                <Edit2 size={14} /> Edit Profile
              </button>
            )}
          </div>

          {/* Bio */}
          <div style={{ marginTop: 16 }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <textarea className="input" value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Tell others about yourself…" rows={3} style={{ maxWidth: 500 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={saveBio} disabled={saving}>
                    {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><Save size={13} /> Save</>}
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ color: profile.bio ? 'var(--text)' : 'var(--text-muted)', lineHeight: 1.6 }}>
                {profile.bio || (isMe ? 'No bio yet. Click Edit Profile to add one.' : 'No bio.')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats (only for own profile) */}
      {isMe && (
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          {[
            { icon: '🗂️', label: 'Projects',     value: stats.projects,      color: 'var(--purple-lt)', route: '/projects' },
            { icon: '🆘', label: 'Help Posts',    value: stats.help_posts,    color: 'var(--blue)',      route: '/community' },
            { icon: '✅', label: 'Replies Given', value: stats.replies_given, color: 'var(--green)',     route: '/community' },
            { icon: '⭐', label: 'Reputation',    value: stats.replies_given * 10, color: 'var(--yellow)', route: null },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ cursor: s.route ? 'pointer' : 'default' }}
              onClick={() => s.route && navigate(s.route)}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/projects')}>
          <FolderKanban size={15} /> My Projects
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/community')}>
          <HelpCircle size={15} /> Community Posts
        </button>
      </div>
    </div>
  );
}
