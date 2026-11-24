import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Icons, MODULES } from '../components/modules';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) { setError('Enter your user name and password.'); return; }
    setBusy(true);
    setError('');
    try {
      // PublicOnlyRoute redirects to the requested page (or dashboard) once authenticated.
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-hero">
        <h2>Syncfusion React components</h2>
        <p>Track 1,00,000 orders across regions, suppliers and warehouses in real time.</p>
        <div className="hero-icons">
          {MODULES.map((m) => (
            <span key={m.key} className="hero-icon" style={{ color: m.color }} title={m.title}>{Icons[m.key]}</span>
          ))}
        </div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={onSubmit} noValidate>

          <label htmlFor="username">User name</label>
          <input id="username" className="text-input" autoComplete="username" autoFocus value={username}
            onChange={(e) => setUsername(e.target.value)} placeholder="admin" />

          <label htmlFor="password">Password</label>
          <input id="password" className="text-input" type="password" autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />

          {error && <div className="form-error" role="alert">{error}</div>}

          <button type="submit" className="btn-primary" disabled={busy} id="login-btn">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="hint">Demo credentials: <code>admin</code> / <code>admin</code></p>
        </form>
      </section>
    </div>
  );
}
