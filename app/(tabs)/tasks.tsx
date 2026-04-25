import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useAppContext } from '@/src/context/app-context';
import { AppCard } from '@/src/presentation/components/app-card';
import { ProgressBar } from '@/src/presentation/components/progress-bar';
import { TaskCard } from '@/src/presentation/components/task-card';
import { AppColors } from '@/src/presentation/theme/colors';

const TASK_EMOJIS: Record<string, string> = {
  'Ilac al': '💊',
  'Su ic': '💧',
  'Egzersiz yap': '🏃',
  'Saglikli beslen': '🥗',
  'Nefes egzersizi yap': '🫁',
};

function findTodayOrFirstDate(dates: string[]) {
  if (!dates.length) return null;
  const today = new Date().toISOString().slice(0, 10);
  return dates.includes(today) ? today : dates[0];
}

export default function TasksTabScreen() {
  const { taskPlan, toggleTask, motivationText } = useAppContext();
  const dates = useMemo(() => Object.keys(taskPlan).sort(), [taskPlan]);
  const [selectedDate, setSelectedDate] = useState<string | null>(() => findTodayOrFirstDate(dates));

  useFocusEffect(
    useCallback(() => {
      setSelectedDate(findTodayOrFirstDate(dates));
    }, [dates]),
  );
  useEffect(() => {
    if (!dates.length) {
      setSelectedDate(null);
      return;
    }

    if (!selectedDate || !dates.includes(selectedDate)) {
      setSelectedDate(findTodayOrFirstDate(dates));
    }
  }, [dates, selectedDate]);

  const selectedIndex = selectedDate ? dates.indexOf(selectedDate) : -1;
  const tasks = selectedDate ? taskPlan[selectedDate] ?? [] : [];
  const completedCount = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? completedCount / tasks.length : 0;
  const isPrevDisabled = selectedIndex <= 0;
  const isNextDisabled = selectedIndex < 0 || selectedIndex >= dates.length - 1;

  const goDay = (direction: -1 | 1) => {
    if (selectedIndex < 0) return;
    const target = selectedIndex + direction;
    if (target >= 0 && target < dates.length) setSelectedDate(dates[target]);
  };

  if (!dates.length) {
    return (
      <View style={styles.emptyContainer}>
        <AppCard style={[styles.emptyCard, { backgroundColor: AppColors.surfaceYellow }]}>
          <Text style={styles.emptyTitle}>Henuz gorev plani yok</Text>
          <Text style={styles.emptyText}>Lutfen once ameliyat tarihini kaydet.</Text>
        </AppCard>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppCard style={[styles.headerCard, { backgroundColor: AppColors.surfaceBlue }]}>
        <View style={styles.headerRow}>
          <Ionicons name="calendar-outline" size={18} color={AppColors.textPrimary} />
          <Text style={styles.title}>Bugunun Gorevleri</Text>
        </View>
        <Text style={styles.date}>{selectedDate ?? '-'}</Text>

        <View style={styles.dayNav}>
          <Pressable
            style={[styles.dayButton, isPrevDisabled ? styles.dayButtonDisabled : undefined]}
            onPress={() => goDay(-1)}
            disabled={isPrevDisabled}
            hitSlop={8}>
            <Ionicons name="chevron-back" size={16} color={AppColors.textPrimary} />
            <Text style={styles.dayButtonText}>Onceki Gun</Text>
          </Pressable>
          <Pressable
            style={[styles.dayButton, isNextDisabled ? styles.dayButtonDisabled : undefined]}
            onPress={() => goDay(1)}
            disabled={isNextDisabled}
            hitSlop={8}>
            <Text style={styles.dayButtonText}>Sonraki Gun</Text>
            <Ionicons name="chevron-forward" size={16} color={AppColors.textPrimary} />
          </Pressable>
        </View>

        <ProgressBar progress={progress} />
        <View style={styles.progressRow}>
          <Ionicons name="stats-chart-outline" size={15} color={AppColors.textSecondary} />
          <Text style={styles.progressText}>Tamamlanma: %{Math.round(progress * 100)}</Text>
        </View>
      </AppCard>

      <View style={styles.list}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            title={task.title}
            emoji={TASK_EMOJIS[task.title] ?? '✅'}
            completed={task.completed}
            onToggle={() => {
              void toggleTask(selectedDate!, task.id);
            }}
            hint={task.hint}
            target={task.target}
            points={task.points}
          />
        ))}
      </View>

      <AppCard style={[styles.footerCard, { backgroundColor: AppColors.surfaceGreen }]}>
        <View style={styles.footerHead}>
          <Ionicons name="sparkles-outline" size={16} color={AppColors.textPrimary} />
          <Text style={styles.footerTitle}>Motivasyon</Text>
        </View>
        <Text style={styles.footerText}>{motivationText}</Text>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    padding: 18,
    gap: 12,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    padding: 18,
  },
  emptyCard: {
    gap: 8,
  },
  emptyTitle: {
    color: AppColors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  emptyText: {
    color: AppColors.textSecondary,
    fontSize: 14,
  },
  headerCard: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 23,
    fontWeight: '800',
  },
  date: {
    color: AppColors.textSecondary,
    fontSize: 14,
  },
  dayNav: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    flex: 1,
    backgroundColor: AppColors.surfaceYellow,
    borderRadius: 999,
    minHeight: 46,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  dayButtonDisabled: {
    opacity: 0.55,
  },
  dayButtonText: {
    color: AppColors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    gap: 10,
  },
  footerCard: {
    gap: 6,
  },
  footerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerTitle: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  footerText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
