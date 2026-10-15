import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowRight, Bot, Building2, CheckCircle2, Clock3, LogOut, Search, ShieldCheck, Sparkles, Ticket, Users } from 'lucide-react';
import AuthPanel from './components/AuthPanel.jsx';
import ServiceCard from './components/ServiceCard.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import { api, getSession, saveSession } from './lib/api.js';
import './style.css';

function App() {
  const [session, setSession] = useState(getSession());
  const [services, setServices] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [serviceForm, setServiceForm] = useState({ name: '', category: 'General', description: '', location: '', averageMinutes: 15 });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const role = session?.user?.role;
  const visibleServices = useMemo(() => {
    const needle = search.toLowerCase().trim();
    return services.filter((service) => !needle || [service.name, service.category, service.enterpriseName, service.description, service.location].some((value) => String(value || '').toLowerCase().includes(needle)));
  }, [services, search]);

  async function loadData() {
    if (!session) return;
    setLoading(true); setError('');
    try {
      if (role === 'CUSTOMER') {
        const [serviceList, tokenList] = await Promise.all([api('/services'), api('/tokens/mine')]);
        setServices(serviceList); setTokens(tokenList);
      } else if (role === 'ENTERPRISE') {
        const [serviceList, tokenList] = await Promise.all([api('/services/mine'), api('/tokens/enterprise')]);
        setServices(serviceList); setTokens(tokenList);
      } else if (role === 'ADMIN') {
        setStats(await api('/admin/stats'));
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, [session?.token]);

  async function bookService(service) {
    setNotice(''); setError('');
    try { await api('/tokens', { method: 'POST', body: { serviceId: service._id } }); setNotice(`Token booked for ${service.name}.`); await loadData(); }
    catch (err) { setError(err.message); }
  }

  async function publishService(event) {
    event.preventDefault(); setNotice(''); setError('');
    try {
      await api('/services', { method: 'POST', body: serviceForm });
      setServiceForm({ name: '', category: 'General', description: '', location: '', averageMinutes: 15 });
      setNotice('Your service is published and visible to customers.'); await loadData();
    } catch (err) { setError(err.message); }
  }

  async function changeToken(token, status) {
    setNotice(''); setError('');
    try { await api(`/tokens/${token._id}/status`, { method: 'PATCH', body: { status } }); setNotice(`Token #${token.tokenNumber} updated.`); await loadData(); }
    catch (err) { setError(err.message); }
  }

  function signOut() { saveSession(null); setSession(null); setServices([]); setTokens([]); setStats(null); setNotice(''); setError(''); }

  if (!session) {
    return <div className="auth-layout"><header className="auth-brand"><Brand /><p>Discover services. Skip uncertainty. Manage queues smarter.</p><div className="hero-points"><span><Search size={16} /> Find services quickly</span><span><Ticket size={16} /> Digital tokens</span><span><Sparkles size={16} /> AI assistance</span></div></header><AuthPanel onAuthenticated={setSession} /><footer className="footer">QueueLess · AI-enhanced digital queue management</footer></div>;
  }

  return (
    <div className="app-shell">
      <header className="topbar"><Brand /><div className="topbar-right"><div className="user-chip"><span className="avatar">{session.user.name?.slice(0, 1).toUpperCase()}</span><span><strong>{session.user.name}</strong><small>{roleLabel(role)}</small></span></div><button className="button subtle" onClick={signOut}><LogOut size={16} /> Sign out</button></div></header>
      <main className="page-content">
        <section className="welcome-row"><div><div className="eyebrow">{roleLabel(role)} WORKSPACE</div><h1>{role === 'CUSTOMER' ? 'What service do you need?' : role === 'ENTERPRISE' ? 'Manage your service queue' : 'Platform overview'}</h1><p className="muted">{role === 'CUSTOMER' ? 'Explore published services, book a token, and get helpful answers.' : role === 'ENTERPRISE' ? 'Publish services, manage active tokens, and get operational insights.' : 'Monitor the QueueLess platform at a glance.'}</p></div><div className="welcome-icon"><Activity size={26} /></div></section>
        {(notice || error) && <div className={`alert ${error ? 'error' : 'success'}`}>{error || notice}</div>}
        {role === 'CUSTOMER' && <CustomerDashboard services={visibleServices} tokens={tokens} search={search} setSearch={setSearch} onBook={bookService} loading={loading} />}
        {role === 'ENTERPRISE' && <EnterpriseDashboard services={services} tokens={tokens} form={serviceForm} setForm={setServiceForm} onPublish={publishService} onChangeToken={changeToken} loading={loading} />}
        {role === 'ADMIN' && <AdminDashboard stats={stats} loading={loading} />}
        {role !== 'ADMIN' && <ChatPanel role={role} />}
        <footer className="footer">QueueLess · Waiting-time estimates are approximate and based on active queue length.</footer>
      </main>
    </div>
  );
}

function Brand() {
  return <div className="brand"><div className="brand-mark"><Activity size={21} strokeWidth={2.5} /></div><span>Queue<span className="brand-light">Less</span><small>SMART QUEUE MANAGEMENT</small></span></div>;
}
function roleLabel(role) { return ({ CUSTOMER: 'Customer', ENTERPRISE: 'Enterprise', ADMIN: 'Administrator' })[role] || 'User'; }

function CustomerDashboard({ services, tokens, search, setSearch, onBook, loading }) {
  return <>
    <section className="metric-grid"><Metric icon={<Building2 />} label="Available services" value={services.length} /><Metric icon={<Ticket />} label="Your tokens" value={tokens.length} /><Metric icon={<Clock3 />} label="Currently waiting" value={tokens.filter((token) => token.status === 'WAITING').length} /></section>
    <section className="panel"><div className="panel-heading"><div><div className="eyebrow">SERVICE DIRECTORY</div><h2>Find a service</h2></div><span className="count-badge">{services.length} listed</span></div><div className="search-box"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search service, category, business, or location" /></div>{loading ? <Loading /> : services.length ? <div className="service-grid">{services.map((service) => <ServiceCard key={service._id} service={service} canBook onBook={onBook} />)}</div> : <Empty title="No services published yet" detail="When an enterprise publishes a service, it will appear here." />}</section>
    <section className="panel"><div className="panel-heading"><div><div className="eyebrow">YOUR ACTIVITY</div><h2>Your tokens</h2></div></div>{tokens.length ? <TokenTable tokens={tokens} /> : <Empty title="No tokens yet" detail="Choose a service above to book your first token." />}</section>
  </>;
}

function EnterpriseDashboard({ services, tokens, form, setForm, onPublish, onChangeToken, loading }) {
  const activeCount = tokens.filter((token) => token.status === 'WAITING').length;
  return <>
    <section className="metric-grid"><Metric icon={<Building2 />} label="Your services" value={services.length} /><Metric icon={<Users />} label="Waiting tokens" value={activeCount} /><Metric icon={<Activity />} label="Being served" value={tokens.filter((token) => token.status === 'SERVING').length} /></section>
    <section className="panel"><div className="panel-heading"><div><div className="eyebrow">SERVICE MANAGEMENT</div><h2>Publish a service</h2></div></div><form className="service-form" onSubmit={onPublish}><label>Service name<input required maxLength="120" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. General consultation" /></label><label>Category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Healthcare, banking…" /></label><label>Average minutes<input type="number" min="1" max="480" required value={form.averageMinutes} onChange={(event) => setForm({ ...form, averageMinutes: Number(event.target.value) })} /></label><label>Location<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Branch / address" /></label><label className="span-two">Description<textarea rows="2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What should customers know?" /></label><button className="button primary" type="submit">Publish service <ArrowRight size={16} /></button></form></section>
    <section className="panel"><div className="panel-heading"><div><div className="eyebrow">YOUR CATALOGUE</div><h2>Published services</h2></div></div>{services.length ? <div className="service-grid">{services.map((service) => <ServiceCard key={service._id} service={service} />)}</div> : <Empty title="No services yet" detail="Publish a service to make it discoverable to customers." />}</section>
    <section className="panel"><div className="panel-heading"><div><div className="eyebrow">LIVE OPERATIONS</div><h2>Active queue</h2></div></div>{loading ? <Loading /> : tokens.length ? <div className="queue-list">{tokens.map((token) => <article className="queue-item" key={token._id}><div className="token-number">#{token.tokenNumber}</div><div className="queue-details"><strong>{token.customerName}</strong><span>{token.serviceName}</span></div><span className={`status ${token.status.toLowerCase()}`}>{token.status}</span><div className="queue-actions">{token.status === 'WAITING' && <button className="button small primary" onClick={() => onChangeToken(token, 'SERVING')}>Serve next</button>}{token.status === 'SERVING' && <button className="button small primary" onClick={() => onChangeToken(token, 'COMPLETED')}><CheckCircle2 size={14} /> Complete</button>}</div></article>)}</div> : <Empty title="Your queue is clear" detail="New customer tokens will appear here." />}</section>
  </>;
}

function AdminDashboard({ stats, loading }) {
  if (loading && !stats) return <Loading />;
  return <section className="metric-grid admin-metrics"><Metric icon={<Users />} label="Customers" value={stats?.customers ?? '—'} /><Metric icon={<Building2 />} label="Enterprises" value={stats?.enterprises ?? '—'} /><Metric icon={<Ticket />} label="Services" value={stats?.services ?? '—'} /><Metric icon={<Clock3 />} label="Waiting tokens" value={stats?.waitingTokens ?? '—'} /><Metric icon={<ShieldCheck />} label="Total tokens" value={stats?.allTokens ?? '—'} /></section>;
}
function Metric({ icon, label, value }) { return <article className="metric-card"><div className="metric-icon">{icon}</div><div><div className="metric-value">{value}</div><div className="metric-label">{label}</div></div></article>; }
function TokenTable({ tokens }) { return <div className="table-wrap"><table><thead><tr><th>Token</th><th>Service</th><th>Enterprise</th><th>Status</th><th>Estimated wait</th></tr></thead><tbody>{tokens.map((token) => <tr key={token._id}><td>#{token.tokenNumber}</td><td>{token.serviceName}</td><td>{token.enterpriseId ? String(token.enterpriseName || 'Service provider') : 'Service provider'}</td><td><span className={`status ${token.status.toLowerCase()}`}>{token.status}</span></td><td>{token.status === 'WAITING' ? `${token.estimatedWaitMinutes ?? 0} min` : '—'}</td></tr>)}</tbody></table></div>; }
function Empty({ title, detail }) { return <div className="empty-state"><div className="empty-icon"><Bot size={22} /></div><strong>{title}</strong><p>{detail}</p></div>; }
function Loading() { return <div className="loading-state"><span className="spinner" /> Loading QueueLess data…</div>; }

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
