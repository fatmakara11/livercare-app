# Karaciger model ve gorselleri

Bu klasorde iki farkli varlik seti bulunur:

- `liver_stage_1.png` ... `liver_stage_5.png`: 3D model yuklenemezse kullanilan fallback gorselleri.
- `Meshy_AI_*_optimized.glb`: mobil performansi icin optimize edilmis 3D modeller.

## Expo Go vs development build

- **Expo Go:** Home ekraninda yalnizca fallback `png` gorseller kullanilir (stabil ve hizli akis).
- **Development build (opsiyonel):** `_optimized.glb` modelleri gercek 3D olarak render edilir.

Development build profilleri `eas.json` dosyasinda tanimlidir. 3D, profile env ile acilir:

- `EXPO_PUBLIC_ENABLE_3D_NATIVE=1` -> GLB 3D aktif
- `EXPO_PUBLIC_ENABLE_3D_NATIVE=0` -> fallback PNG aktif

## Optimizasyon notu

Orijinal `Meshy_AI_*.glb` dosyalari su islemlerle optimize edilir:

- `meshopt` sikistirma
- `simplify-ratio=0.35` ile low-poly sadelestirme
- texture boyutunu en fazla `1024px` ile sinirlama
- texture formatini `webp` olarak tekrar sikistirma
- `center --pivot center` ile model pivotunu merkeze alma
