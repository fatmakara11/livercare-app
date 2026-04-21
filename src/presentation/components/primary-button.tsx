import { Pressable, StyleSheet, Text } from 'react-native';

import { AppColors } from '@/src/presentation/theme/colors';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ title, onPress, disabled }: PrimaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled ? styles.buttonPressed : undefined,
        disabled ? styles.buttonDisabled : undefined,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: AppColors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7B5400',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  text: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
