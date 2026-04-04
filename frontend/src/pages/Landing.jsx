import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false);
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form.username, form.email, form.password);
        toast.success('Account created! Welcome to CodeHub 🚀');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="landing animate-fade">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="sidebar-logo" style={{ padding: 0 }}>
          <div className="logo-icon" style={{ borderRadius: 8 }}>💻</div>
          <span style={{ fontSize: '1.15rem' }}>CodeHub</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { setTab('login'); setShowAuth(true); }}>Log in</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setTab('signup'); setShowAuth(true); }}>Sign up free</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <h1>Code. Collaborate.<br /><span>Ship Together.</span></h1>
        <p>The all-in-one platform to write code, store your projects, ask for help, and help others — all in one place.</p>
        <div className="hero-actions">
          <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '12px 28px' }} onClick={() => { setTab('signup'); setShowAuth(true); }}>
            Get started free →
          </button>
          <button className="btn btn-ghost" style={{ fontSize: '1rem', padding: '12px 28px' }} onClick={() => { setTab('login'); setShowAuth(true); }}>
            Log in
          </button>
        </div>

        {/* Fake code preview */}
        <div className="hero-code-glow">
          <div><span className="code-line-num">1</span><span className="cm"># Welcome to CodeHub</span></div>
          <div><span className="code-line-num">2</span><span className="kw">def </span><span className="fn">solve_together</span>(problem):</div>
          <div><span className="code-line-num">3</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="st">"Ask the community, get answers fast"</span></div>
          <div><span className="code-line-num">4</span>&nbsp;&nbsp;&nbsp;&nbsp;solution = community.<span className="fn">help</span>(problem)</div>
          <div><span className="code-line-num">5</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="kw">return </span>solution.<span className="fn">mark_accepted</span>()</div>
          <div><span className="code-line-num">6</span></div>
          <div><span className="code-line-num">7</span><span className="cm"># Your projects, always safe 🔒</span></div>
          <div><span className="code-line-num">8</span>project.<span className="fn">save</span>() <span className="cm"># stored in the cloud</span></div>
        </div>
      </section>

      {/* Features */}
      <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="features">
          {[
            { icon: '✍️', title: 'Code Editor', desc: 'Full-featured VS Code–powered editor with syntax highlighting for 20+ languages.' },
            { icon: '🗂️', title: 'Project Storage', desc: 'Store and organize all your projects. Access from anywhere, anytime.' },
            { icon: '🆘', title: 'Ask for Help', desc: 'Stuck on a bug? Post your code and get answers from the community instantly.' },
            { icon: '🤝', title: 'Give Help', desc: 'Share your expertise, answer questions, and earn reputation.' },
          ].map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '80px 40px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Ready to start coding?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Join hundreds of developers on CodeHub today.</p>
        <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '13px 32px' }} onClick={() => { setTab('signup'); setShowAuth(true); }}>
          Create free account →
        </button>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="auth-tabs">
              <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Log in</button>
              <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Sign up</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {tab === 'signup' && (
                <div className="input-group">
                  <label>Username</label>
                  <input className="input" placeholder="johndoe" value={form.username} onChange={set('username')} required />
                </div>
              )}
              <div className="input-group">
                <label>Email</label>
                <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={6} />
              </div>
              <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ marginTop: 6 }}>
                {loading ? <span className="spinner" /> : tab === 'login' ? 'Log in' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
