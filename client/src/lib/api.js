const API_ROOT = '/api';

export function getSession() {
  try { return JSON.parse(localStorage.getItem('queueless-session') || 'null'); }
  catch { return null; }
}

export function saveSession(session) {
  if (session) localStorage.setItem('queueless-session', JSON.stringify(session));
  else localStorage.removeItem('queueless-session');
}

export async function api(path, options = {}) {
  const session = getSession();
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(options.headers || {})
    },
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}
