import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  calculateStreak,
  getMotivationText,
  mergeTaskMetadata,
  toggleTaskInPlan,
} from '@/src/application/health';
import { AppState } from '@/src/domain/types';
import { clearAuthSession, loadAuthSession, saveAuthSession } from '@/src/infrastructure/auth-storage';
import { apiJson } from '@/src/infrastructure/api';
import { dayTasksPayload, rowsToTaskPlan } from '@/src/infrastructure/task-map';
import { scheduleDailyReminders } from '@/src/notifications/reminders';

type AuthResponse = {
  token: string;
  user: {
    id: number;
    username: string;
  };
};

type MeResponse = {
  user: { id: number; username: string } | null;
  surgeryDate: string | null;
  health: { health_score: number; liver_level: number } | null;
};

type TasksResponse = {
  tasks: Array<{ date: string; title: string; completed: boolean; points?: number }>;
};

type SyncResponse = {
  healthScore: number;
  liverLevel: number;
};

type AppContextValue = AppState & {
  authToken: string | null;
  userId: number | null;
  bootstrapped: boolean;
  login: (username: string, password: string) => Promise<{ hasSurgery: boolean }>;
  register: (username: string, password: string) => Promise<{ hasSurgery: boolean }>;
  logout: () => Promise<void>;
  saveSurgeryDate: (date: string) => Promise<void>;
  toggleTask: (date: string, taskId: string) => Promise<void>;
  motivationText: string;
  completedTasks: number;
  totalTasks: number;
  streak: number;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: PropsWithChildren) {
  const [username, setUsername] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [surgeryDate, setSurgeryDate] = useState<string | null>(null);
  const [taskPlan, setTaskPlan] = useState<AppState['taskPlan']>({});
  const [healthScore, setHealthScore] = useState(0);
  const [liverLevel, setLiverLevel] = useState(1);
  const [bootstrapped, setBootstrapped] = useState(false);
  const dayRef = useRef(new Date().toISOString().slice(0, 10));

  const completedTasks = useMemo(
    () => Object.values(taskPlan).flat().filter((task) => task.completed).length,
    [taskPlan],
  );
  const totalTasks = useMemo(() => Object.values(taskPlan).flat().length, [taskPlan]);
  const motivationText = useMemo(() => getMotivationText(healthScore), [healthScore]);
  const streak = useMemo(() => calculateStreak(taskPlan), [taskPlan]);

  const loadRemoteState = useCallback(
    async (token: string) => {
      const [me, tasks] = await Promise.all([
        apiJson<MeResponse>('/me', { token }),
        apiJson<TasksResponse>('/me/tasks', { token }),
      ]);
      const nextPlan = mergeTaskMetadata(rowsToTaskPlan(tasks.tasks));
      setTaskPlan(nextPlan);
      setUserId(me.user?.id ?? null);
      setUsername(me.user?.username ?? '');
      setSurgeryDate(me.surgeryDate ?? null);
      setHealthScore(me.health?.health_score ?? 0);
      setLiverLevel(me.health?.liver_level ?? 1);
      return { hasSurgery: Boolean(me.surgeryDate) };
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { token } = await loadAuthSession();
        if (!token) {
          if (!cancelled) setBootstrapped(true);
          return;
        }

        setAuthToken(token);
        await loadRemoteState(token);
      } catch {
        await clearAuthSession();
        if (!cancelled) {
          setAuthToken(null);
          setUsername('');
          setUserId(null);
          setSurgeryDate(null);
          setTaskPlan({});
          setHealthScore(0);
          setLiverLevel(1);
        }
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!bootstrapped) return;
    void scheduleDailyReminders();
  }, [bootstrapped]);

  useEffect(() => {
    if (!authToken) return;
    const timer = setInterval(() => {
      const nowDay = new Date().toISOString().slice(0, 10);
      if (nowDay !== dayRef.current) {
        dayRef.current = nowDay;
        void loadRemoteState(authToken);
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, [authToken, loadRemoteState]);

  const saveSurgeryDate = useCallback(
    async (date: string) => {
      if (!authToken) throw new Error('Oturum bulunamadi');
      await apiJson('/me/surgery-date', {
        method: 'PUT',
        token: authToken,
        body: { surgeryDate: date },
      });
      await loadRemoteState(authToken);
    },
    [authToken, loadRemoteState],
  );

  const toggleTask = useCallback(
    async (date: string, taskId: string) => {
      if (!authToken) throw new Error('Oturum bulunamadi');
      const nextPlan = toggleTaskInPlan(taskPlan, date, taskId);
      setTaskPlan(nextPlan);
      const dayTasks = nextPlan[date] ?? [];
      const result = await apiJson<SyncResponse>('/me/tasks/sync', {
        method: 'POST',
        token: authToken,
        body: {
          date,
          tasks: dayTasksPayload(dayTasks),
        },
      });
      setHealthScore(result.healthScore);
      setLiverLevel(result.liverLevel);
    },
    [authToken, taskPlan],
  );

  const login = useCallback(
    async (user: string, pass: string) => {
      const result = await apiJson<AuthResponse>('/auth/login', {
        method: 'POST',
        body: { username: user.trim(), password: pass },
      });
      await saveAuthSession(result.token, result.user.username);
      setAuthToken(result.token);
      setUsername(result.user.username);
      setUserId(result.user.id);
      return loadRemoteState(result.token);
    },
    [loadRemoteState],
  );

  const register = useCallback(
    async (user: string, pass: string) => {
      const result = await apiJson<AuthResponse>('/auth/register', {
        method: 'POST',
        body: { username: user.trim(), password: pass },
      });
      await saveAuthSession(result.token, result.user.username);
      setAuthToken(result.token);
      setUsername(result.user.username);
      setUserId(result.user.id);
      return loadRemoteState(result.token);
    },
    [loadRemoteState],
  );

  const logout = useCallback(async () => {
    await clearAuthSession();
    setAuthToken(null);
    setUsername('');
    setUserId(null);
    setSurgeryDate(null);
    setTaskPlan({});
    setHealthScore(0);
    setLiverLevel(1);
  }, []);

  const value: AppContextValue = {
    username,
    surgeryDate,
    taskPlan,
    healthScore,
    liverLevel,
    streak,
    authToken,
    userId,
    bootstrapped,
    login,
    register,
    logout,
    saveSurgeryDate,
    toggleTask,
    motivationText,
    completedTasks,
    totalTasks,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return context;
}
