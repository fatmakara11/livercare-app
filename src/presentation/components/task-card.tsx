import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppColors } from '@/src/presentation/theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TaskCardProps = {
  title: string;
  emoji: string;
  completed: boolean;
  onToggle: () => void;
  hint?: string;
  target?: string;
  points?: number;
};

export function TaskCard({ title, emoji, completed, onToggle, hint, target, points }: TaskCardProps) {
  const [open, setOpen] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  return (
    <View style={[styles.card, completed ? styles.cardDone : undefined]}>
      <View style={styles.row}>
        <Pressable style={styles.left} onPress={onToggle} hitSlop={8}>
          <Text style={styles.emoji}>{emoji}</Text>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, completed ? styles.titleDone : undefined]}>{title}</Text>
            {target ? <Text style={styles.target}>{target}</Text> : null}
          </View>
        </Pressable>
        <Pressable onPress={onToggle} hitSlop={10}>
          <Ionicons
            name={completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={completed ? AppColors.success : AppColors.textMuted}
          />
        </Pressable>
      </View>

      {hint ? (
        <Pressable onPress={toggleExpand} style={styles.detailToggle}>
          <Text style={styles.detailToggleText}>{open ? 'Detayi gizle' : 'Detay ve ipucu'}</Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={AppColors.textSecondary} />
        </Pressable>
      ) : null}

      {open && hint ? (
        <View style={styles.detailBox}>
          <Text style={styles.hint}>{hint}</Text>
          {typeof points === 'number' ? (
            <Text style={styles.points}>Son puan kaydi: {points > 0 ? `+${points}` : points}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surfaceWhite,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 56,
    gap: 8,
    shadowColor: '#A67C52',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardDone: {
    backgroundColor: AppColors.surfaceGreen,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  emoji: {
    fontSize: 20,
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  titleDone: {
    color: AppColors.textSecondary,
  },
  target: {
    fontSize: 12,
    color: AppColors.textMuted,
    fontWeight: '600',
  },
  detailToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  detailToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textSecondary,
  },
  detailBox: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.65)',
    padding: 10,
    gap: 4,
  },
  hint: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  points: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
});
