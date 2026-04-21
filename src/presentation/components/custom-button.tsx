import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppColors } from '@/src/presentation/theme/colors';

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  icon?: keyof typeof Ionicons.glyphMap;
};

export function CustomButton({ title, onPress, disabled, variant = 'primary', icon }: CustomButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && !disabled ? styles.pressed : undefined,
        disabled ? styles.disabled : undefined,
      ]}
      onPress={onPress}
      hitSlop={8}
      disabled={disabled}>
      {icon ? (
        <Ionicons
          name={icon}
          size={16}
          color={variant === 'secondary' ? AppColors.textPrimary : AppColors.white}
        />
      ) : null}
      <Text style={[styles.text, variant === 'secondary' ? styles.textSecondary : undefined]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 18,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 3,
    shadowColor: '#A67C52',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  primary: {
    backgroundColor: AppColors.primary,
  },
  secondary: {
    backgroundColor: AppColors.surfaceBlue,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  textSecondary: {
    color: AppColors.textPrimary,
  },
});
