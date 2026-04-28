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
  calculateHealthScore,
  calculateLiverLevel,
  calculateStreak,
  generate30DayPlan,
  getMotivationText,
  mergeTaskMetadata,
  toggleTaskInPlan,
} from '@/src/application/health';
import { AppState } from '@/src/domain/types';
import {
  clearAuthSession,
  loadAuthSession,
  LOCAL_SESSION_TOKEN,
  saveAuthSession,
} from '@/src/infrastructure/auth-storage';
import { apiJson } from '@/src/infrastructure/api';
import {
  loadLocalProfile,
  registerLocalAccount,
  saveLocalProfile,
  verifyLocalLogin,
} from '@/src/infrastructure/local-auth-store';
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
  tasks: { date: string; title: string; completed: boolean; points?: number }[];
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

  const applyLocalProfile = useCallback(async (name: string) => {
    const profile = await loadLocalProfile(name);
    const nextPlan = mergeTaskMetadata(profile.taskPlan);
    const nextHealthScore = calculateHealthScore(nextPlan);
    const nextLiverLevel = calculateLiverLevel(nextHealthScore);

    setUsername(name);
    setUserId(null);
    setSurgeryDate(profile.surgeryDate);
    setTaskPlan(nextPlan);
    setHealthScore(nextHealthScore);
    setLiverLevel(nextLiverLevel);

    return { hasSurgery: Boolean(profile.surgeryDate) };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { token, username: savedUsername } = await loadAuthSession();
        if (!token) {
          if (!cancelled) setBootstrapped(true);
          return;
        }

        setAuthToken(token);
        if (token === LOCAL_SESSION_TOKEN) {
          if (!savedUsername) {
            await clearAuthSession();
            if (!cancelled) {
              setAuthToken(null);
              setUsername('');
            }
            return;
          }
          await applyLocalProfile(savedUsername);
        } else {
          await loadRemoteState(token);
        }
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
  }, [applyLocalProfile, loadRemoteState]);

  useEffect(() => {
    if (!bootstrapped) return;
    void scheduleDailyReminders();
  }, [bootstrapped]);

  useEffect(() => {
    if (!authToken || authToken === LOCAL_SESSION_TOKEN) return;
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
      if (authToken === LOCAL_SESSION_TOKEN) {
        if (!username) throw new Error('Yerel profil bulunamadi');
        const nextPlan = mergeTaskMetadata(generate30DayPlan(date));
        const nextHealthScore = calculateHealthScore(nextPlan);
        const nextLiverLevel = calculateLiverLevel(nextHealthScore);
        setSurgeryDate(date);
        setTaskPlan(nextPlan);
        setHealthScore(nextHealthScore);
        setLiverLevel(nextLiverLevel);
        await saveLocalProfile(username, { surgeryDate: date, taskPlan: nextPlan });
        return;
      }
      await apiJson('/me/surgery-date', {
        method: 'PUT',
        token: authToken,
        body: { surgeryDate: date },
      });
      await loadRemoteState(authToken);
    },
    [authToken, loadRemoteState, username],
  );

  const toggleTask = useCallback(
    async (date: string, taskId: string) => {
      if (!authToken) throw new Error('Oturum bulunamadi');
      const nextPlan = toggleTaskInPlan(taskPlan, date, taskId);
      setTaskPlan(nextPlan);
      if (authToken === LOCAL_SESSION_TOKEN) {
        if (!username) throw new Error('Yerel profil bulunamadi');
        const nextHealthScore = calculateHealthScore(nextPlan);
        const nextLiverLevel = calculateLiverLevel(nextHealthScore);
        setHealthScore(nextHealthScore);
        setLiverLevel(nextLiverLevel);
        await saveLocalProfile(username, { surgeryDate, taskPlan: nextPlan });
        return;
      }
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
    [authToken, surgeryDate, taskPlan, username],
  );

  const login = useCallback(
    async (user: string, pass: string) => {
      const normalizedUsername = user.trim();
      try {
        const result = await apiJson<AuthResponse>('/auth/login', {
          method: 'POST',
          body: { username: normalizedUsername, password: pass },
        });
        await saveAuthSession(result.token, result.user.username);
        setAuthToken(result.token);
        setUsername(result.user.username);
        setUserId(result.user.id);
        return loadRemoteState(result.token);
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes('Sunucuya ulasilamadi')) {
          throw error;
        }
        const ok = await verifyLocalLogin(normalizedUsername, pass);
        if (!ok) {
          throw new Error('Sunucu kapali ve yerel hesap bulunamadi. Once Kayit ol ile yerel hesap ac.');
        }
        await saveAuthSession(LOCAL_SESSION_TOKEN, normalizedUsername);
        setAuthToken(LOCAL_SESSION_TOKEN);
        return applyLocalProfile(normalizedUsername);
      }
    },
    [applyLocalProfile, loadRemoteState],
  );

  const register = useCallback(
    async (user: string, pass: string) => {
      const normalizedUsername = user.trim();
      try {
        const result = await apiJson<AuthResponse>('/auth/register', {
          method: 'POST',
          body: { username: normalizedUsername, password: pass },
        });
        await saveAuthSession(result.token, result.user.username);
        setAuthToken(result.token);
        setUsername(result.user.username);
        setUserId(result.user.id);
        return loadRemoteState(result.token);
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes('Sunucuya ulasilamadi')) {
          throw error;
        }
        await registerLocalAccount(normalizedUsername, pass);
        await saveAuthSession(LOCAL_SESSION_TOKEN, normalizedUsername);
        setAuthToken(LOCAL_SESSION_TOKEN);
        return applyLocalProfile(normalizedUsername);
      }
    },
    [applyLocalProfile, loadRemoteState],
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
