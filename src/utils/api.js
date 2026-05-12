const BASE = '/api';

async function request(path, method = 'GET', body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const getEntries  = ()            => request('/entries');
export const saveEntry   = (entry)       => request('/entries', 'POST', entry);
export const deleteEntry = (date)        => request('/entries', 'DELETE', { date });

export const getGoals  = ()                          => request('/goals');
export const saveGoal  = (monthKey, ciroGoal, salesGoal) =>
  request('/goals', 'POST', { monthKey, ciroGoal: Number(ciroGoal), salesGoal: Number(salesGoal) });
