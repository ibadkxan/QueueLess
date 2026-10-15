import { useState } from 'react';
import { api } from '../lib/api.js';

export default function ChatPanel({ role }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: role === 'CUSTOMER' ? 'Hi! I can help you find services, explain token status, and estimate waiting times.' : 'Hi! I can summarize your active queue and suggest ways to improve operations.' }]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function send(event) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || busy) return;
    const next = [...messages, { role: 'user', content: message }];
    setMessages(next); setDraft(''); setBusy(true); setError('');
    try {
      const result = await api('/ai/chat', { method: 'POST', body: { message } });
      setMessages([...next, { role: 'assistant', content: result.answer, provider: result.provider }]);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <section className="panel chat-panel">
      <div className="panel-heading"><div><div className="eyebrow">AI ASSISTANT</div><h2>{role === 'CUSTOMER' ? 'Find your service faster' : 'Queue operations assistant'}</h2></div><span className="online-dot">● AI</span></div>
      <div className="chat-messages" aria-live="polite">
        {messages.map((item, index) => <div key={`${index}-${item.role}`} className={`chat-message ${item.role}`}><div className="message-role">{item.role === 'assistant' ? 'QueueLess AI' : 'You'}</div><p>{item.content}</p>{item.provider && <small>Answered by {item.provider}</small>}</div>)}
        {busy && <div className="chat-message assistant"><p>Thinking…</p></div>}
      </div>
      {error && <div className="alert error">{error}</div>}
      <form className="chat-form" onSubmit={send}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={role === 'CUSTOMER' ? 'e.g. Find a banking service…' : 'e.g. Summarize my active queue…'} maxLength={1500} /><button className="button primary" disabled={busy || !draft.trim()}>Send</button></form>
      <p className="tiny-note">AI answers can be imperfect. Use the dashboard controls to make bookings or change queue status.</p>
    </section>
  );
}
