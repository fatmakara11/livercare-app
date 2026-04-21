import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  calculateHealthScore,
  calculateLiverLevel,
  calculateStreak,
  countAllTasks,
  countCompletedTasks,
  generate30DayPlan,
  getMotivationText,
  mergeTaskMetadata,
  toggleTaskInPlan,
} from '@/src/application/health';
import { AppState } from '@/src/domain/types';
import { clearAuthSession, loadAuthSession, LOCAL_SESSION_TOKEN, saveAuthSession } from '@/src/infrastructure/auth-storage';
import {
  loadLocalProfile,
  registerLocalAccount,
  saveLocalProfile,
  verifyLocalLogin,
} from '@/src/infrastructure/local-auth-store';
import { scheduleDailyReminders } from '@/src/notifications/reminders';

type AppContextValue = AppState & {
  authToken: string | null;
  userId: number | null;
  bootstrapped: boolean;
  login: (username: string, password: string) => Promise<{ hasSurgery: boolean }>;
  register: (username: string, password: string) => Promise<{ hasSurgery: boolean }>;
  logout: () => Promise<void>;
  saveSurgeryDate: (date: string) => Promise<void>;
  toggleTask: (date: string, taskId: string) => void;
  motivationText: string;
  completedTasks: number;
  totalTasks: number;
  streak: number;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: PropsWithChildren) {
  const [username, setUsername] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId] = useState<number | null>(null);
  const [surgeryDate, setSurgeryDate] = useState<string | null>(null);
  const [taskPlan, setTaskPlan] = useState<AppState['taskPlan']>({});
  const [bootstrapped, setBootstrapped] = useState(false);

  const healthScore = useMemo(() => calculateHealthScore(taskPlan), [taskPlan]);
  const liverLevel = useMemo(() => calculateLiverLevel(healthScore), [healthScore]);
  const completedTasks = useMemo(() => countCompletedTasks(taskPlan), [taskPlan]);
  const totalTasks = useMemo(() => countAllTasks(taskPlan), [taskPlan]);
  const motivationText = useMemo(() => getMotivationText(healthScore), [healthScore]);
  const streak = useMemo(() => calculateStreak(taskPlan), [taskPlan]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { token, username: storedName } = await loadAuthSession();
        if (!token || !storedName) {
          if (!cancelled) setBootstrapped(true);
          return;
        }
        if (token !== LOCAL_SESSION_TOKEN) {
          await clearAuthSession();
          if (!cancelled) setBootstrapped(true);
          return;
        }
        if (cancelled) return;
        setAuthToken(token);
        setUsername(storedName);
        const profile = await loadLocalProfile(storedName);
        if (cancelled) return;
        if (profile.surgeryDate) {
          const dateString = String(profile.surgeryDate).slice(0, 10);
          setSurgeryDate(dateString);
          if (profile.taskPlan && Object.keys(profile.taskPlan).length > 0) {
            setTaskPlan(mergeTaskMetadata(profile.taskPlan));
          } else {
            setTaskPlan(generate30DayPlan(dateString));
          }
        } else {
          setSurgeryDate(null);
          setTaskPlan({});
        }
      } catch {
        await clearAuthSession();
        if (!cancelled) {
          setAuthToken(null);
          setUsername('');
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
    if (!bootstrapped || !username || authToken !== LOCAL_SESSION_TOKEN) return;
    const id = setTimeout(() => {
      void saveLocalProfile(username, { surgeryDate, taskPlan });
    }, 450);
    return () => clearTimeout(id);
  }, [bootstrapped, authToken, username, surgeryDate, taskPlan]);

  useEffect(() => {
    if (!bootstrapped) return;
    void scheduleDailyReminders();
  }, [bootstrapped]);

  const saveSurgeryDate = useCallback(async (date: string) => {
    setSurgeryDate(date);
    setTaskPlan(generate30DayPlan(date));
  }, []);

  const toggleTask = useCallback((date: string, taskId: string) => {
    setTaskPlan((previousPlan) => toggleTaskInPlan(previousPlan, date, taskId));
  }, []);

  const login = useCallback(async (user: string, pass: string) => {
    const name = user.trim();
    const ok = await verifyLocalLogin(name, pass);
    if (!ok) throw new Error('Kullanici adi veya sifre hatali');
    await saveAuthSession(LOCAL_SESSION_TOKEN, name);
    setAuthToken(LOCAL_SESSION_TOKEN);
    setUsername(name);
    const profile = await loadLocalProfile(name);
    if (profile.surgeryDate) {
      const dateString = String(profile.surgeryDate).slice(0, 10);
      setSurgeryDate(dateString);
      if (profile.taskPlan && Object.keys(profile.taskPlan).length > 0) {
        setTaskPlan(mergeTaskMetadata(profile.taskPlan));
      } else {
        setTaskPlan(generate30DayPlan(dateString));
      }
      return { hasSurgery: true };
    }
    setSurgeryDate(null);
    setTaskPlan({});
    return { hasSurgery: false };
  }, []);

  const register = useCallback(async (user: string, pass: string) => {
    const name = user.trim();
    await registerLocalAccount(name, pass);
    await saveAuthSession(LOCAL_SESSION_TOKEN, name);
    setAuthToken(LOCAL_SESSION_TOKEN);
    setUsername(name);
    setSurgeryDate(null);
    setTaskPlan({});
    return { hasSurgery: false };
  }, []);

  const logout = useCallback(async () => {
    await clearAuthSession();
    setAuthToken(null);
    setUsername('');
    setSurgeryDate(null);
    setTaskPlan({});
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
