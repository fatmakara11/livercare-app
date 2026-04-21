import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { AppColors } from '@/src/presentation/theme/colors';

type AppCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function AppCard({ children, style }: AppCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surfaceWhite,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(160, 143, 122, 0.18)',
    shadowColor: '#A67C52',
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 4,
  },
});
