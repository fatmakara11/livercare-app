import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext } from '@/src/context/app-context';
import { AppCard } from '@/src/presentation/components/app-card';
import { LiverProgress } from '@/src/presentation/components/liver-progress';
import { ProgressBar } from '@/src/presentation/components/progress-bar';
import { AppColors } from '@/src/presentation/theme/colors';

export default function HomeTabScreen() {
  const { username, healthScore, liverLevel, motivationText } = useAppContext();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.greeting}>Merhaba, {username || 'Fatma'} 👋</Text>
        <Text style={styles.subText}>{motivationText}</Text>
      </View>

      <LiverProgress level={liverLevel} />

      <AppCard style={[styles.card, styles.scoreCard]}>
        <View style={styles.cardHead}>
          <Ionicons name="pulse-outline" size={18} color={AppColors.textPrimary} />
          <Text style={styles.cardTitle}>Saglik skoru: %{healthScore}</Text>
        </View>
        <ProgressBar progress={healthScore / 100} />
      </AppCard>

      <AppCard style={[styles.card, { backgroundColor: AppColors.surfaceYellow }]}>
        <View style={styles.cardHead}>
          <Ionicons name="bulb-outline" size={18} color={AppColors.textPrimary} />
          <Text style={styles.tipTitle}>Bugunun Ipucu</Text>
        </View>
        <Text style={styles.tipText}>Bugun bol su ic, ilac saatini gecirme.</Text>
      </AppCard>

      <AppCard style={[styles.card, { backgroundColor: AppColors.surfacePink }]}>
        <View style={styles.cardHead}>
          <Ionicons name="heart-outline" size={18} color={AppColors.textPrimary} />
          <Text style={styles.tipTitle}>Durum</Text>
        </View>
        <Text style={styles.tipText}>Iyi gidiyorsun! Her gorev seni daha guclu yapiyor.</Text>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.background,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 18,
    gap: 12,
  },
  hero: {
    gap: 5,
    paddingHorizontal: 2,
  },
  greeting: {
    color: AppColors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  subText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    borderRadius: 22,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreCard: {
    backgroundColor: AppColors.surfaceBlue,
    gap: 10,
  },
  cardTitle: {
    color: AppColors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  tipTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  tipText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 21,
  },
});
