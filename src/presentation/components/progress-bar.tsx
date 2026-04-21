import { StyleSheet, View } from 'react-native';

import { AppColors } from '@/src/presentation/theme/colors';

type ProgressBarProps = {
  progress: number;
};

export function ProgressBar({ progress }: ProgressBarProps) {
  const safeProgress = Math.max(0, Math.min(progress, 1));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${safeProgress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 12,
    borderRadius: 999,
    backgroundColor: AppColors.surfacePink,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: AppColors.success,
    borderRadius: 999,
  },
});
