import { DailyTask, TaskPlan } from '@/src/domain/types';

const TASK_TITLES = ['Ilac al', 'Su ic', 'Egzersiz yap', 'Saglikli beslen'] as const;

export const TASK_HINTS: Record<string, { hint: string; target: string }> = {
  'Ilac al': {
    hint: 'Doktorunun belirttigi saatlerde ilacini almayi unutma.',
    target: 'Doz saati',
  },
  'Su ic': {
    hint: 'Gun boyunca duzenli su icmek yorgunlugu azaltmaya yardimci olur (doktorunun verdigi sinira uy).',
    target: 'Hedef: 2 L / gun',
  },
  'Egzersiz yap': {
    hint: 'Kisa yuruyus veya nefes egzersizleri ile basla; siddeti doktoruna danis.',
    target: '20-30 dk hafif aktivite',
  },
  'Saglikli beslen': {
    hint: 'Islenmis yag ve asiri tuzdan kacin; protein ve sebzeyi dengele.',
    target: '3 ana ogun + hafif ara',
  },
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_IN_MS);
}

export function mergeTaskMetadata(plan: TaskPlan): TaskPlan {
  const next: TaskPlan = {};
  for (const [date, tasks] of Object.entries(plan)) {
    next[date] = tasks.map((task) => {
      const meta = TASK_HINTS[task.title];
      return {
        ...task,
        hint: meta?.hint ?? task.hint,
        target: meta?.target ?? task.target,
      };
    });
  }
  return next;
}

export function generate30DayPlan(surgeryDate: string): TaskPlan {
  const plan: TaskPlan = {};
  const centerDate = new Date(surgeryDate);

  for (let i = -15; i <= -1; i += 1) {
    const day = addDays(centerDate, i);
    const key = formatDateKey(day);
    plan[key] = TASK_TITLES.map((title) => {
      const meta = TASK_HINTS[title];
      return {
        id: `${key}-${title}`,
        title,
        completed: false,
        hint: meta?.hint,
        target: meta?.target,
        points: 0,
      };
    });
  }

  for (let i = 1; i <= 15; i += 1) {
    const day = addDays(centerDate, i);
    const key = formatDateKey(day);
    plan[key] = TASK_TITLES.map((title) => {
      const meta = TASK_HINTS[title];
      return {
        id: `${key}-${title}`,
        title,
        completed: false,
        hint: meta?.hint,
        target: meta?.target,
        points: 0,
      };
    });
  }

  return plan;
}

export function countCompletedTasks(taskPlan: TaskPlan) {
  return Object.values(taskPlan).flat().filter((task) => task.completed).length;
}

export function countAllTasks(taskPlan: TaskPlan) {
  return Object.values(taskPlan).flat().length;
}

export function calculateHealthScore(taskPlan: TaskPlan) {
  const total = countAllTasks(taskPlan);
  if (total === 0) return 0;
  const completed = countCompletedTasks(taskPlan);
  return Math.round((completed / total) * 100);
}

/** 1 = en iyi (saglikli), 5 = en dusuk (kritik) — karaciger gorseli ile uyumlu */
export function calculateLiverLevel(healthScore: number) {
  if (healthScore >= 80) return 1;
  if (healthScore >= 60) return 2;
  if (healthScore >= 40) return 3;
  if (healthScore >= 20) return 4;
  return 5;
}

function previousDateKey(dateKey: string) {
  const date = new Date(dateKey);
  const previous = new Date(date.getTime() - DAY_IN_MS);
  return formatDateKey(previous);
}

export function calculateStreak(taskPlan: TaskPlan) {
  const todayKey = formatDateKey(new Date());
  let currentKey = todayKey;
  let streak = 0;

  while (taskPlan[currentKey]) {
    const dayTasks = taskPlan[currentKey];
    const allDone = dayTasks.length > 0 && dayTasks.every((task) => task.completed);
    if (!allDone) break;
    streak += 1;
    currentKey = previousDateKey(currentKey);
  }

  return streak;
}

export function toggleTaskInPlan(taskPlan: TaskPlan, date: string, taskId: string): TaskPlan {
  const dayTasks = taskPlan[date] ?? [];
  const updatedTasks: DailyTask[] = dayTasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task,
  );

  return {
    ...taskPlan,
    [date]: updatedTasks,
  };
}

export function getMotivationText(healthScore: number) {
  if (healthScore >= 80) return 'Muhteşem ilerliyorsun. Vucudun guclenmeye devam ediyor.';
  if (healthScore >= 60) return 'Harika gidiyorsun. Bu duzeni koru.';
  if (healthScore >= 40) return 'Iyi bir baslangic yaptin. Kucuk adimlar buyuk etki yaratir.';
  if (healthScore >= 20) return 'Yolunda gidiyorsun. Birkac gorev daha tamamla.';
  return 'Bugun bir gorevle basla, her adim cok degerli.';
}
