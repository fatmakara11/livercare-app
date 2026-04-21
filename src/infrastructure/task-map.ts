import { DailyTask, TaskPlan } from '@/src/domain/types';

type TaskRow = { date: string; title: string; completed: boolean; points?: number };

export function rowsToTaskPlan(rows: TaskRow[]): TaskPlan {
  const plan: TaskPlan = {};
  for (const row of rows) {
    if (!plan[row.date]) plan[row.date] = [];
    plan[row.date].push({
      id: `${row.date}-${row.title}`,
      title: row.title,
      completed: row.completed,
      points: row.points,
    });
  }
  return plan;
}

export function dayTasksPayload(tasks: DailyTask[]) {
  return tasks.map((task) => ({ title: task.title, completed: task.completed }));
}
