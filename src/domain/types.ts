export type DailyTask = {
  id: string;
  title: string;
  completed: boolean;
  hint?: string;
  target?: string;
  points?: number;
};

export type TaskPlan = Record<string, DailyTask[]>;

export type AppState = {
  username: string;
  surgeryDate: string | null;
  taskPlan: TaskPlan;
  healthScore: number;
  liverLevel: number;
  streak: number;
};
