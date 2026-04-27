import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';
import { ArrowRight, Braces, Check, Code2, GitBranch, Sparkles } from 'lucide-react';

function MagneticButton({
  children,
  href,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
}) {
  const className = `magnetic-btn magnetic-${variant} magnetic-${size}`;

  if (href) {
    return (
      <a
        className={className}
        href={href}
      >
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      <span>{children}</span>
    </button>
  );
}

export default function Landing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const authMode = searchParams.get('auth');
  const showAuth = authMode === 'login' || authMode === 'signup';
  const tab = useMemo(() => (authMode === 'signup' ? 'signup' : 'login'), [authMode]);

  const closeAuth = () => {
    setSearchParams({}, { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back.');
      } else {
        await register(form.username, form.email, form.password);
        toast.success('Account created. Your bench is ready.');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  return (
    <div className="landing landing-reveal">
      <div className="paper-grain" />

      <nav className="landing-nav" aria-label="Primary navigation">
        <a className="brand-mark" href="/">
          <span className="brand-stamp"><Code2 size={18} /></span>
          <span>CodeHub</span>
        </a>
        <div className="nav-actions" aria-label="Account actions">
          <MagneticButton variant="ghost" size="sm" href="/?auth=login">Log in</MagneticButton>
          <MagneticButton variant="primary" size="sm" href="/?auth=signup">Join bench</MagneticButton>
        </div>
      </nav>

      <main>
        <section className="hero editorial-band">
          <div className="hero-kicker">Shared code rooms for practical builders</div>
          <div className="hero-layout">
            <div className="hero-copy">
              <h1>
                Build in public.
                <span>Debug in good company.</span>
              </h1>
              <p>
                CodeHub gives students and makers one rough-edged place to save projects,
                ask precise questions, and turn lonely errors into solved work.
              </p>
              <div className="hero-actions">
                <MagneticButton variant="primary" size="lg" href="/?auth=signup">
                  Start a workspace <ArrowRight size={17} />
                </MagneticButton>
                <MagneticButton variant="ghost" size="lg" href="/?auth=login">
                  Return to code
                </MagneticButton>
              </div>
            </div>

            <aside className="hero-ledger" aria-label="CodeHub workspace preview">
              <div className="ledger-label">Live bench</div>
              <div className="ledger-row">
                <span>open projects</span>
                <strong>18</strong>
              </div>
              <div className="ledger-row offset">
                <span>answers shipped</span>
                <strong>73</strong>
              </div>
              <div className="ledger-code">
                <span className="code-dot" />
                <pre>{`function unblock(thread) {
  return thread
    .withContext()
    .shipAnswer();
}`}</pre>
              </div>
            </aside>
          </div>
          <div className="rotated-note">No sterile dashboards</div>
        </section>

        <section className="proof-strip" aria-label="CodeHub capabilities">
          <article>
            <Braces size={22} />
            <h2>Editor first</h2>
            <p>Draft, revise, and keep files where your project context already lives.</p>
          </article>
          <article className="proof-featured">
            <GitBranch size={22} />
            <h2>Projects with memory</h2>
            <p>Every snippet has a home, every bug report has a trail, every fix can be found again.</p>
          </article>
          <article>
            <Sparkles size={22} />
            <h2>Help that reads code</h2>
            <p>Ask with the exact language, snippet, and status instead of shouting into a void.</p>
          </article>
        </section>

        <section className="manifesto">
          <div className="quote-mark">"</div>
          <p>
            The best developer tools do not pretend the work is frictionless.
            They make the friction visible, shared, and easier to finish.
          </p>
          <svg className="hand-underline" viewBox="0 0 420 30" role="img" aria-label="Hand drawn underline">
            <path d="M5 18C70 8 135 25 201 14C269 3 329 20 415 11" />
          </svg>
        </section>

        <section className="split-cta">
          <div>
            <span className="section-label">Ship the next thing</span>
            <h2>Open the editor, post the blocker, keep moving.</h2>
          </div>
          <ul className="check-list">
            <li><Check size={16} /> Project storage without ceremony</li>
            <li><Check size={16} /> Community questions with code attached</li>
            <li><Check size={16} /> A workspace that feels built, not rented</li>
          </ul>
          <MagneticButton variant="primary" size="lg" href="/?auth=signup">
            Create your bench
          </MagneticButton>
        </section>
      </main>

      {showAuth && (
        <div className="modal-overlay" onClick={closeAuth}>
          <div className="modal auth-modal" onClick={(event) => event.stopPropagation()}>
            <div className="auth-tabs">
              <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setSearchParams({ auth: 'login' }, { replace: true })}>Log in</button>
              <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setSearchParams({ auth: 'signup' }, { replace: true })}>Sign up</button>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              {tab === 'signup' && (
                <div className="input-group">
                  <label>Username</label>
                  <input className="input" placeholder="maya_codes" value={form.username} onChange={set('username')} required />
                </div>
              )}
              <div className="input-group">
                <label>Email</label>
                <input className="input" type="email" placeholder="you@codehub.dev" value={form.email} onChange={set('email')} required />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input className="input" type="password" placeholder="At least 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
              </div>
              <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : tab === 'login' ? 'Log in' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
