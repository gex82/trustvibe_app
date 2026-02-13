'use client';

import React from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { adminAuth, maybeConnectAdminEmulators } from '../../../lib/firebase';
import { useAdminGuard } from '../../../lib/useAdminGuard';

export default function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const guard = useAdminGuard();

  React.useEffect(() => {
    if (!guard.loading && guard.isAuthenticated && guard.isAdmin) {
      window.location.href = '/users';
    }
  }, [guard.isAdmin, guard.isAuthenticated, guard.loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      maybeConnectAdminEmulators();
      await signInWithEmailAndPassword(adminAuth, email, password);
      window.location.href = '/users';
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <main className="container">
      <section className="card" style={{ maxWidth: 480, margin: '64px auto' }}>
        <h1>Admin Login</h1>
        <p className="muted">Use an admin account seeded in emulator data.</p>
        <form className="grid" onSubmit={onSubmit}>
          <input data-testid="admin-login-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
          <input data-testid="admin-login-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" style={inputStyle} />
          <button data-testid="admin-login-submit" className="btn btn-primary" type="submit">
            Sign in
          </button>
        </form>
        {error ? <p data-testid="admin-login-error" className="muted">{error}</p> : null}
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#132c40',
  color: '#f4f8fc',
  border: '1px solid #2c4867',
  borderRadius: 10,
  padding: '10px 12px',
};
