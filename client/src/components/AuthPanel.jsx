import { useState } from 'react';
import { api, saveSession } from '../lib/api.js';

export default function AuthPanel({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('CUSTOMER');
  const [form, setForm] = useState({ name: '', email: '', password: '', enterpriseName: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const path = mode === 'login' ? '/auth/login' : role === 'ENTERPRISE' ? '/auth/register/enterprise' : '/auth/register/customer';
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form;
      const session = await api(path, { method: 'POST', body: payload });
      saveSession(session); onAuthenticated(session);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <section className="auth-card">
      <div className="eyebrow">QUEUELESS ACCOUNT</div>
      <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
      <p className="muted">Sign in to manage your queue or discover services.</p>
      <div className="segmented" role="group" aria-label="Account type">
        <button className={role === 'CUSTOMER' ? 'selected' : ''} onClick={() => setRole('CUSTOMER')} type="button">Customer</button>
        <button className={role === 'ENTERPRISE' ? 'selected' : ''} onClick={() => setRole('ENTERPRISE')} type="button">Enterprise</button>
        <button className={mode === 'login' && role === 'ADMIN' ? 'selected' : ''} onClick={() => { setRole('ADMIN'); setMode('login'); }} type="button">Admin</button>
      </div>
      <form onSubmit={submit} className="form-stack">
        {mode === 'register' && <label>Full name<input name="name" value={form.name} onChange={update} required autoComplete="name" /></label>}
        {mode === 'register' && role === 'ENTERPRISE' && <label>Business name<input name="enterpriseName" value={form.enterpriseName} onChange={update} required /></label>}
        <label>Email address<input type="email" name="email" value={form.email} onChange={update} required autoComplete="email" /></label>
        <label>Password<input type="password" name="password" value={form.password} onChange={update} required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        {error && <div className="alert error">{error}</div>}
        <button className="button primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <p className="auth-switch">{mode === 'login' ? 'New to QueueLess?' : 'Already registered?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); if (role === 'ADMIN') setRole('CUSTOMER'); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
      <p className="tiny-note">Admin accounts are provisioned privately; there is no public admin registration.</p>
    </section>
  );
}
