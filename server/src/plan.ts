const TASK_TITLES = ['Ilac al', 'Su ic', 'Egzersiz yap', 'Saglikli beslen'] as const;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_IN_MS);
}

export function buildPlanDates(surgeryDate: string) {
  const center = new Date(surgeryDate);
  const keys: string[] = [];
  for (let i = -15; i <= -1; i += 1) keys.push(formatDateKey(addDays(center, i)));
  for (let i = 1; i <= 15; i += 1) keys.push(formatDateKey(addDays(center, i)));
  return keys;
}

export function defaultTasksForDate(dateKey: string) {
  return TASK_TITLES.map((title) => ({
    task_date: dateKey,
    title,
    completed: false,
    points: 0,
  }));
}

export function liverLevelFromScore(healthScore: number) {
  if (healthScore >= 80) return 1;
  if (healthScore >= 60) return 2;
  if (healthScore >= 40) return 3;
  if (healthScore >= 20) return 4;
  return 5;
}

export function pointsForTask(completed: boolean) {
  return completed ? 10 : -2;
}
