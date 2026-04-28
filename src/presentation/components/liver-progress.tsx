import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAssets } from 'expo-asset';
import { File } from 'expo-file-system';
import { WebView } from 'react-native-webview';
import { Buffer } from 'buffer';

import { LIVER_STAGE_MODELS } from '@/src/presentation/assets/liver-stages';
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
  const modelSource = useMemo(() => LIVER_STAGE_MODELS[safeLevel - 1], [safeLevel]);

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
        <View style={styles.modelCard}>
          <LiverModelViewer key={`liver-viewer-${safeLevel}`} modelSource={modelSource} level={safeLevel} />
        </View>
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

type LiverModelViewerProps = {
  modelSource: number;
  level: number;
};

type ModelLoadState = 'idle' | 'loading' | 'success' | 'fail';

function buildModelViewerHtml(modelUri: string) {
  const safeUri = modelUri.replace(/"/g, '&quot;');
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #F8FBFF;
      }
      model-viewer {
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <model-viewer
      id="mv"
      src="${safeUri}"
      camera-controls
      touch-action="pan-y"
      auto-rotate
      auto-rotate-delay="0"
      rotation-per-second="24deg"
      interaction-prompt="none"
      shadow-intensity="0.6"
      exposure="1"
      environment-image="neutral"
      camera-orbit="0deg 75deg 130%"
      min-camera-orbit="auto auto 90%"
      max-camera-orbit="auto auto 220%"
      field-of-view="26deg"
      ar="false"
    ></model-viewer>
    <script>
      const post = (payload) => window.ReactNativeWebView?.postMessage(JSON.stringify(payload));
      const mv = document.getElementById('mv');
      mv.addEventListener('load', () => post({ type: 'loaded' }));
      mv.addEventListener('error', () => post({ type: 'error' }));
      window.addEventListener('error', () => post({ type: 'error' }));
    </script>
  </body>
</html>`;
}

function LiverModelViewer({ modelSource, level }: LiverModelViewerProps) {
  const assetSources = useMemo(() => [modelSource], [modelSource]);
  const [assets] = useAssets(assetSources);
  const [loadState, setLoadState] = useState<ModelLoadState>('idle');
  const [modelDataUri, setModelDataUri] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const renderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const html = useMemo(() => (modelDataUri ? buildModelViewerHtml(modelDataUri) : ''), [modelDataUri]);

  const canRender3D = true;

  useEffect(() => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    async function run() {
      if (!canRender3D) return;
      const modelAsset = assets?.[0];
      if (!modelAsset) return;
      setLoadState('loading');
      setModelDataUri(null);
      console.log(`[Liver3D][level=${level}] loading started.`);
      try {
        await modelAsset.downloadAsync();
        const localUri = modelAsset.localUri ?? modelAsset.uri;
        const file = new File(localUri);
        const binaryBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(binaryBuffer).toString('base64');
        if (requestId !== requestIdRef.current) {
          return;
        }
        setModelDataUri(`data:model/gltf-binary;base64,${base64}`);
        if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);
        renderTimeoutRef.current = setTimeout(() => {
          if (requestId !== requestIdRef.current) return;
          setLoadState('fail');
          console.warn(`[Liver3D][level=${level}] mobile render timed out.`);
        }, 16000);
      } catch (error) {
        if (requestId === requestIdRef.current) {
          setLoadState('fail');
          console.warn(`[Liver3D][level=${level}] mobile asset processing failed.`, error);
        }
      }
    }

    void run();

    return () => {
      requestIdRef.current += 1;
      if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);
    };
  }, [assets, canRender3D, level]);

  const handleWebViewMessage = (rawData: string | undefined) => {
    if (!rawData) return;
    try {
      const payload = JSON.parse(rawData) as { type?: string };
      if (payload.type === 'loaded') {
        if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);
        setLoadState('success');
        console.log(`[Liver3D][level=${level}] mobile loaded successfully.`);
      } else if (payload.type === 'error') {
        if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);
        setLoadState('fail');
        console.warn(`[Liver3D][level=${level}] mobile render failed.`);
      }
    } catch {
      // Ignore invalid WebView messages.
    }
  };

  if (!canRender3D || loadState === 'fail' || !modelDataUri) {
    return (
      <View style={styles.fallbackWrap}>
        {loadState === 'loading' || loadState === 'idle' ? (
          <Text style={styles.loadingText}>3D yukleniyor...</Text>
        ) : (
          <Text style={styles.errorText}>3D model yuklenemedi.</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.touchLayer}>
      <WebView
        key={`liver-webview-${level}`}
        style={styles.canvas}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        onMessage={(event) => handleWebViewMessage(event.nativeEvent.data)}
      />
      {loadState === 'loading' ? <Text style={styles.loadingText}>3D yukleniyor...</Text> : null}
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
  modelCard: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FBFF',
  },
  canvas: {
    flex: 1,
  },
  touchLayer: {
    flex: 1,
  },
  fallbackWrap: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    position: 'absolute',
    bottom: 8,
    fontSize: 11,
    color: AppColors.textSecondary,
    backgroundColor: 'rgba(255,255,255,0.78)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  errorText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
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
