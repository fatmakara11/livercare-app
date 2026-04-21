import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppContext } from '@/src/context/app-context';
import { AppCard } from '@/src/presentation/components/app-card';
import { CustomButton } from '@/src/presentation/components/custom-button';
import { AppColors } from '@/src/presentation/theme/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { bootstrapped, authToken, surgeryDate, login, register } = useAppContext();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!bootstrapped) return;
    if (authToken && surgeryDate) {
      router.replace('/(tabs)/home');
    }
  }, [authToken, bootstrapped, router, surgeryDate]);

  const canSubmit = useMemo(() => user.trim().length >= 2 && password.length >= 4, [user, password]);

  const handleSubmit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === 'register') {
        await register(user.trim(), password);
        router.replace('/surgery-date');
        return;
      }
      const result = await login(user.trim(), password);
      if (result.hasSurgery) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/surgery-date');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata olustu');
    } finally {
      setBusy(false);
    }
  };

  if (!bootstrapped) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[AppColors.surfaceBlue, AppColors.surfacePink, AppColors.surfaceYellow]}
      style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.topRow}>
              <View style={styles.pill}>
                <Ionicons name="heart-outline" size={16} color={AppColors.textPrimary} />
                <Text style={styles.pillText}>Gunluk destek</Text>
              </View>
              <View style={styles.pill}>
                <Ionicons name="calendar-outline" size={16} color={AppColors.textPrimary} />
                <Text style={styles.pillText}>30 gunluk plan</Text>
              </View>
            </View>

            <View style={styles.heroCards}>
              <View style={[styles.miniCard, { backgroundColor: AppColors.surfaceWhite }]}>
                <Text style={styles.miniTitle}>Hedefin net</Text>
                <Text style={styles.miniBody}>Ameliyat oncesi ve sonrasi rutinlerini tek yerde topla.</Text>
              </View>
              <View style={[styles.miniCard, { backgroundColor: AppColors.surfaceWhite }]}>
                <Text style={styles.miniTitle}>Ilerlemeni gor</Text>
                <Text style={styles.miniBody}>Gorevlerini tamamladikca skorun ve karaciger evren guncellenir.</Text>
              </View>
            </View>

            <AppCard style={styles.card}>
              <Text style={styles.cardHead}>Hesabina gir</Text>
              <Text style={styles.offlineNote}>Hesap ve veriler bu cihazda saklanir; internet veya sunucu gerekmez.</Text>
              <Text style={styles.label}>Kullanici adi</Text>
              <TextInput
                value={user}
                onChangeText={setUser}
                autoCapitalize="none"
                placeholder="ornek: fatma"
                placeholderTextColor={AppColors.textMuted}
                style={styles.input}
              />
              <Text style={styles.label}>Sifre</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="En az 4 karakter"
                placeholderTextColor={AppColors.textMuted}
                style={styles.input}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <View style={styles.modeRow}>
                <Pressable onPress={() => setMode('login')} style={[styles.modeChip, mode === 'login' && styles.modeChipOn]}>
                  <Text style={[styles.modeText, mode === 'login' && styles.modeTextOn]}>Giris</Text>
                </Pressable>
                <Pressable
                  onPress={() => setMode('register')}
                  style={[styles.modeChip, mode === 'register' && styles.modeChipOn]}>
                  <Text style={[styles.modeText, mode === 'register' && styles.modeTextOn]}>Kayit ol</Text>
                </Pressable>
              </View>

              <CustomButton
                title={mode === 'login' ? 'Giris yap' : 'Kayit ol ve devam et'}
                onPress={handleSubmit}
                disabled={!canSubmit || busy}
                icon={mode === 'login' ? 'log-in-outline' : 'person-add-outline'}
              />
              {!canSubmit ? (
                <Text style={styles.hint}>Kullanici adi en az 2, sifre en az 4 karakter olmali.</Text>
              ) : null}
            </AppCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    gap: 14,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillText: {
    color: AppColors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  heroCards: {
    gap: 10,
  },
  miniCard: {
    borderRadius: 18,
    padding: 14,
    gap: 6,
    shadowColor: '#A67C52',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  miniTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  miniBody: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  card: {
    backgroundColor: AppColors.surfaceWhite,
    gap: 12,
  },
  cardHead: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 2,
  },
  offlineNote: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 17,
  },
  label: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  input: {
    borderRadius: 14,
    backgroundColor: AppColors.surfaceYellow,
    color: AppColors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: AppColors.surfaceBlue,
    alignItems: 'center',
  },
  modeChipOn: {
    backgroundColor: AppColors.primary,
  },
  modeText: {
    fontWeight: '700',
    color: AppColors.textPrimary,
    fontSize: 13,
  },
  modeTextOn: {
    color: AppColors.white,
  },
});
