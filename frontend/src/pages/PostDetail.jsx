import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';
import { ArrowLeft, ThumbsUp, CheckCircle2, Send, Trash2 } from 'lucide-react';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState({ content: '', code_snippet: '' });
  const [submitting, setSubmitting] = useState(false);
  const createdAtFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    []
  );

  const load = async () => {
    try {
      const res = await api.get(`/community/posts/${id}`);
      setPost(res.data);
    } catch {
      toast.error('Post not found');
      navigate('/community');
    }
    setLoading(false);
  };

  useEffect(() => {
    let active = true;

    const fetchPost = async () => {
      try {
        const res = await api.get(`/community/posts/${id}`);
        if (active) {
          setPost(res.data);
        }
      } catch {
        if (active) {
          toast.error('Post not found');
          navigate('/community');
        }
      }
      if (active) {
        setLoading(false);
      }
    };

    void fetchPost();

    return () => {
      active = false;
    };
  }, [id, navigate]);

  const submitReply = async (e) => {
    e.preventDefault();
    if (!reply.content.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/community/posts/${id}/replies`, reply);
      toast.success('Reply posted!');
      setReply({ content: '', code_snippet: '' });
      load();
    } catch {
      toast.error('Failed to post reply');
    }
    setSubmitting(false);
  };

  const upvote = async (replyId) => {
    try {
      await api.post(`/community/replies/${replyId}/upvote`);
      load();
    } catch {
      toast.error('Could not upvote');
    }
  };

  const accept = async (replyId) => {
    try {
      await api.put(`/community/replies/${replyId}/accept`);
      toast.success('Answer accepted! Post marked as solved ✅');
      load();
    } catch {
      toast.error('Could not accept reply');
    }
  };

  const deletePost = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/community/posts/${id}`);
      toast.success('Post deleted');
      navigate('/community');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatCreatedAt = value => createdAtFormatter.format(new Date(value));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;
  if (!post) return null;

  return (
    <div className="page animate-fade" style={{ maxWidth: 860 }}>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/community')} style={{ marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to Community
      </button>

      {/* Post */}
      <div className="card card-glow" style={{ marginBottom: 28 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{post.title}</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`badge ${post.status === 'solved' ? 'badge-green' : 'badge-yellow'}`}>
              {post.status === 'solved' && <CheckCircle2 size={10} />} {post.status}
            </span>
            {user?.id === post.author_id && (
              <button className="btn btn-danger btn-sm" onClick={deletePost}><Trash2 size={13} /></button>
            )}
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14 }}>{post.description}</p>

        {post.code_snippet && (
          <pre style={{
            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem',
            color: 'var(--text)', overflow: 'auto', whiteSpace: 'pre-wrap', marginBottom: 14
          }}>
            <code>{post.code_snippet}</code>
          </pre>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span className="badge badge-blue">{post.language}</span>
          <span className="text-muted text-xs">Asked by <strong>{post.author?.username}</strong></span>
          <span className="text-muted text-xs">{formatCreatedAt(post.created_at)}</span>
        </div>
      </div>

      {/* Replies */}
      <h2 style={{ fontWeight: 700, marginBottom: 14 }}>
        {post.replies?.length || 0} {post.replies?.length === 1 ? 'Answer' : 'Answers'}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
        {post.replies?.length === 0 && (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <p>No answers yet. Be the first to help!</p>
          </div>
        )}
        {post.replies?.map(r => (
          <div key={r.id} className={`reply-card ${r.is_accepted ? 'accepted' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                  {r.author?.username?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.author?.username}</span>
                <span className="text-muted text-xs">{formatCreatedAt(r.created_at)}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {r.is_accepted && <span className="badge badge-green"><CheckCircle2 size={10} /> Accepted</span>}
                <button className="btn btn-ghost btn-sm" onClick={() => upvote(r.id)} style={{ gap: 4 }}>
                  <ThumbsUp size={13} /> {r.upvotes}
                </button>
                {user?.id === post.author_id && !r.is_accepted && post.status !== 'solved' && (
                  <button className="btn btn-sm" style={{ background: 'var(--green)', color: '#fff' }} onClick={() => accept(r.id)}>
                    <CheckCircle2 size={13} /> Accept
                  </button>
                )}
              </div>
            </div>
            <p style={{ lineHeight: 1.6, fontSize: '0.9rem', marginBottom: 10 }}>{r.content}</p>
            {r.code_snippet && (
              <pre style={{
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                padding: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem',
                color: 'var(--text)', overflow: 'auto', whiteSpace: 'pre-wrap'
              }}>
                <code>{r.code_snippet}</code>
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* Reply form */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Your Answer</h3>
        <form onSubmit={submitReply} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="input-group">
            <label>Explanation *</label>
            <textarea className="input" placeholder="Explain your solution clearly…" value={reply.content}
              onChange={e => setReply(p => ({ ...p, content: e.target.value }))} required style={{ minHeight: 100 }} />
          </div>
          <div className="input-group">
            <label>Code (optional)</label>
            <textarea className="input mono" placeholder="Paste code if applicable…" value={reply.code_snippet}
              onChange={e => setReply(p => ({ ...p, code_snippet: e.target.value }))}
              style={{ minHeight: 100, fontSize: '0.82rem' }} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting} style={{ alignSelf: 'flex-end' }}>
            {submitting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><Send size={14} /> Post Answer</>}
          </button>
        </form>
      </div>
    </div>
  );
}
