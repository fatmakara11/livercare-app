import { useEffect, useMemo, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

export default function ProfileTabScreen() {
  const router = useRouter();
  const { username, surgeryDate, saveSurgeryDate, liverLevel, healthScore, streak, logout } = useAppContext();
  const initial = useMemo(
    () => (surgeryDate ? new Date(surgeryDate) : new Date()),
    [surgeryDate],
  );
  const [selected, setSelected] = useState(initial);
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  useEffect(() => {
    if (surgeryDate) setSelected(new Date(surgeryDate));
  }, [surgeryDate]);

  const dateKey = toDateKey(selected);

  const handleSave = async () => {
    await saveSurgeryDate(dateKey);
  };

  const onChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (date) setSelected(date);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppCard style={[styles.profileCard, { backgroundColor: AppColors.surfacePink }]}>
        <Image
          source={{ uri: 'https://via.placeholder.com/80x80.png?text=FH' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{username || 'Kullanici'}</Text>
      </AppCard>

      <AppCard style={[styles.card, { backgroundColor: AppColors.surfaceYellow }]}>
        <View style={styles.sectionHead}>
          <Ionicons name="calendar-outline" size={17} color={AppColors.textPrimary} />
          <Text style={styles.sectionTitle}>Ameliyat tarihini sec</Text>
        </View>
        <View style={styles.datePreview}>
          <Ionicons name="today-outline" size={20} color={AppColors.info} />
          <Text style={styles.dateText}>{dateKey}</Text>
        </View>
        {Platform.OS === 'web' ? (
          <Text style={styles.webHint}>Web surumunde tarih secimi sinirli; mobil uygulamayi kullan.</Text>
        ) : (
          <>
            {Platform.OS === 'android' ? (
              <Pressable style={styles.openPicker} onPress={() => setShowPicker(true)}>
                <Text style={styles.openPickerText}>Takvimi ac</Text>
              </Pressable>
            ) : null}
            {(Platform.OS === 'ios' || showPicker) && (
              <DateTimePicker value={selected} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onChange} locale="tr-TR" />
            )}
          </>
        )}
        <View style={styles.buttonRow}>
          <CustomButton title="Profili Guncelle" onPress={handleSave} variant="secondary" icon="create-outline" />
          <CustomButton title="Kaydet" onPress={handleSave} icon="save-outline" />
        </View>
      </AppCard>

      <AppCard style={[styles.card, { backgroundColor: AppColors.surfaceGreen }]}>
        <View style={styles.sectionHead}>
          <Ionicons name="information-circle-outline" size={17} color={AppColors.textPrimary} />
          <Text style={styles.sectionTitle}>Bilgiler</Text>
        </View>
        <Text style={styles.evreNote}>Evre 1 en iyi, Evre 5 en dusuk skor (uygulama ozeti).</Text>
        <View style={styles.statRow}>
          <View style={styles.statLead}>
            <Ionicons name="leaf-outline" size={14} color={AppColors.textSecondary} />
            <Text style={styles.statLabel}>Karaciger evresi</Text>
          </View>
          <Text style={styles.statValue}>{liverLevel}/5</Text>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statLead}>
            <Ionicons name="bar-chart-outline" size={14} color={AppColors.textSecondary} />
            <Text style={styles.statLabel}>Saglik skoru</Text>
          </View>
          <Text style={styles.statValue}>%{healthScore}</Text>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statLead}>
            <Ionicons name="flame-outline" size={14} color={AppColors.textSecondary} />
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <Text style={styles.statValue}>{streak} gun</Text>
        </View>
      </AppCard>

      <CustomButton title="Cikis yap" onPress={handleLogout} variant="secondary" icon="log-out-outline" />
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
  profileCard: {
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: AppColors.surfaceWhite,
  },
  name: {
    color: AppColors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  card: {
    gap: 10,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  datePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: AppColors.surfaceWhite,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  dateText: {
    fontSize: 17,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  openPicker: {
    backgroundColor: AppColors.surfaceBlue,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  openPickerText: {
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  webHint: {
    color: AppColors.textSecondary,
    fontSize: 13,
  },
  buttonRow: {
    gap: 8,
  },
  evreNote: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 17,
  },
  statRow: {
    backgroundColor: AppColors.surfaceWhite,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  statValue: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
});
