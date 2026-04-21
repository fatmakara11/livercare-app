import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { tipsTr } from '@/src/content/tips-tr';
import { AppCard } from '@/src/presentation/components/app-card';
import { AppColors } from '@/src/presentation/theme/colors';

const tips = tipsTr;

export default function TipsTabScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Kisa ipucları</Text>
      <Text style={styles.sub}>Genel yasam tarzi onerileri; tibbi karar yerine gecmez.</Text>
      {tips.map((tip, index) => (
        <AppCard key={`${tip.title}-${index}`} style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="leaf-outline" size={18} color={AppColors.success} />
            <Text style={styles.title}>{tip.title}</Text>
          </View>
          <Text style={styles.body}>{tip.body}</Text>
        </AppCard>
      ))}
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
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  sub: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  card: {
    gap: 8,
    backgroundColor: AppColors.surfaceYellow,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  body: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 21,
  },
});
