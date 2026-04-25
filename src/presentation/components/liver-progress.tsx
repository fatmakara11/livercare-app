import { useEffect, useMemo, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { LIVER_STAGE_IMAGES } from '@/src/presentation/assets/liver-stages';
import { AppColors } from '@/src/presentation/theme/colors';

type LiverProgressProps = {
  level: number;
};

const STAGES = [1, 2, 3, 4, 5];

const STAGE_CAPTIONS: Record<number, string> = {
  1: 'Evre 1: Baslangic seviyesi, bugun birkac gorevle ivme kazan.',
  2: 'Evre 2: Ilerleme var, rutini korumaya devam et.',
  3: 'Evre 3: Dengeli seviye, yaridan fazlasini tamamladin.',
  4: 'Evre 4: Cok iyi gidis, hedefe cok yakinsin.',
  5: 'Evre 5: En iyi seviye, bu duzeni surdur.',
};

export function LiverProgress({ level }: LiverProgressProps) {
  const safeLevel = Math.max(1, Math.min(level, 5));
  const imageSource = useMemo(() => LIVER_STAGE_IMAGES[safeLevel - 1], [safeLevel]);

  const fade = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fade.setValue(0.35);
    scale.setValue(0.97);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [safeLevel, fade, scale]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageWrap, { opacity: fade, transform: [{ scale }] }]}>
        <Image source={imageSource} style={styles.liverImage} resizeMode="contain" />
      </Animated.View>
      <View style={styles.titleRow}>
        <Ionicons name="medkit-outline" size={18} color={AppColors.info} />
        <Text style={styles.title}>Karaciger gelisim evresi</Text>
      </View>
      <View style={styles.stages}>
        {STAGES.map((stage) => (
          <View
            key={stage}
            style={[styles.stage, stage === safeLevel ? styles.stageActive : undefined]}
          >
            <Text style={[styles.stageLabel, stage === safeLevel ? styles.stageLabelActive : undefined]}>
              {stage}
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.label}>Evre {safeLevel}/5</Text>
      <Text style={styles.caption}>{STAGE_CAPTIONS[safeLevel]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.surfaceWhite,
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#A67C52',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrap: {
    width: '100%',
    alignItems: 'center',
  },
  liverImage: {
    width: '100%',
    height: 180,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  title: {
    color: AppColors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  stages: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  stage: {
    flex: 1,
    height: 12,
    minHeight: 16,
    borderRadius: 999,
    backgroundColor: AppColors.surfaceBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageActive: {
    backgroundColor: AppColors.success,
  },
  stageLabel: {
    fontSize: 10,
    color: AppColors.textMuted,
    fontWeight: '700',
  },
  stageLabelActive: {
    color: AppColors.white,
  },
  label: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  caption: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});
