import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext } from '@/src/context/app-context';
import { AppCard } from '@/src/presentation/components/app-card';
import { CustomButton } from '@/src/presentation/components/custom-button';
import { AppColors } from '@/src/presentation/theme/colors';

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function SurgeryDateScreen() {
  const router = useRouter();
  const { surgeryDate, saveSurgeryDate } = useAppContext();
  const initial = useMemo(
    () => (surgeryDate ? new Date(surgeryDate) : new Date()),
    [surgeryDate],
  );
  const [selected, setSelected] = useState(initial);
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const dateKey = toDateKey(selected);

  const handleSaveDate = async () => {
    await saveSurgeryDate(dateKey);
    router.replace('/(tabs)/home');
  };

  const onChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (date) setSelected(date);
  };

  return (
    <View style={styles.container}>
      <AppCard style={styles.card}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar-clear-outline" size={20} color={AppColors.textPrimary} />
          <Text style={styles.title}>Ameliyat tarihini sec</Text>
        </View>
        <Text style={styles.description}>
          Takvimden tarihi sec. Bu tarih ile 30 gunluk plan olusturulur ve sunucuya kaydedilir.
        </Text>

        <View style={styles.datePreview}>
          <Ionicons name="today-outline" size={22} color={AppColors.info} />
          <Text style={styles.dateText}>{dateKey}</Text>
        </View>

        {Platform.OS === 'web' ? (
          <Text style={styles.webHint}>Web icin tarih secimi: mobil uygulamayi kullan veya tarayici destegi eklenebilir.</Text>
        ) : (
          <>
            {Platform.OS === 'android' ? (
              <Pressable style={styles.openPicker} onPress={() => setShowPicker(true)}>
                <Text style={styles.openPickerText}>Takvimi ac</Text>
              </Pressable>
            ) : null}
            {(Platform.OS === 'ios' || showPicker) && (
              <DateTimePicker
                value={selected}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChange}
                locale="tr-TR"
              />
            )}
          </>
        )}

        <CustomButton title="Kaydet ve Devam Et" onPress={handleSaveDate} icon="checkmark-done-outline" />
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: AppColors.surfaceBlue,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  description: {
    color: AppColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  datePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: AppColors.surfaceWhite,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  openPicker: {
    backgroundColor: AppColors.surfaceYellow,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  openPickerText: {
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  webHint: {
    color: AppColors.textSecondary,
    fontSize: 14,
  },
});
