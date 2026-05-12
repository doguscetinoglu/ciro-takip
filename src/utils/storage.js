const KEYS = {
  entries: 'ciro_entries',
  goals: 'ciro_goals',
};

export function getEntries() {
  return JSON.parse(localStorage.getItem(KEYS.entries) || '[]');
}

export function saveEntry(entry) {
  const entries = getEntries();
  const idx = entries.findIndex(e => e.date === entry.date);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  localStorage.setItem(KEYS.entries, JSON.stringify(entries));
}

export function deleteEntry(date) {
  const entries = getEntries().filter(e => e.date !== date);
  localStorage.setItem(KEYS.entries, JSON.stringify(entries));
}

export function getGoals() {
  return JSON.parse(localStorage.getItem(KEYS.goals) || '{}');
}

export function saveGoal(monthKey, ciroGoal, salesGoal) {
  const goals = getGoals();
  goals[monthKey] = { ciroGoal: Number(ciroGoal), salesGoal: Number(salesGoal) };
  localStorage.setItem(KEYS.goals, JSON.stringify(goals));
}
