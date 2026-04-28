# Vital Horizon: Karaciger Ameliyati Hazirlik ve Iyilesme Takip Uygulamasi

## 1. Proje Basligi
Vital Horizon, karaciger ameliyati oncesi ve sonrasi 30 gunluk sureci gunluk gorevlerle takip etmeyi hedefleyen mobil saglik uygulamasidir.

## 2. Proje Ozeti
Bu proje, kullanicinin ameliyat surecinde gunluk saglik aliskanliklarini surdurmesini destekleyen modern ve basit bir mobil arayuz sunar. Uygulama, gorev tamamlama durumuna gore saglik skoru ve karaciger seviyesi uretir, boylece kullanici kendi ilerlemesini net bicimde gorebilir.

## 3. Problem Tanimi
Ameliyat surecinde kullanicilarin en buyuk zorluklarindan biri, gunluk rutinleri duzenli sekilde takip etmek ve motivasyonu surdurmektir. Geleneksel not alma veya daginik takip yontemleri:
- gorevlerin unutulmasina,
- ilerlemenin olculememesine,
- surecin psikolojik olarak daha zor hissedilmesine neden olur.

Vital Horizon, bu problemi tek ekranda gorev takibi, skor ve durum gostergeleri ile sade bir deneyime indirger.

## 4. Amaclar
- Ameliyat oncesi 15 gun ve ameliyat sonrasi 15 gun icin toplam 30 gunluk bir plan akisi sunmak.
- Gunluk gorev tamamlama sistemi ile kullanicinin surece aktif katilimini artirmak.
- Gorev tamamlama oranina gore saglik skoru ve karaciger seviyesini dinamik hesaplamak.
- Kullaniciya motive edici, renkli ve beginner-friendly bir mobil deneyim saglamak.
- Backend bagimsiz ilk surumle hizli prototipleme yapip sonraki faza teknik zemin hazirlamak.

SWOT analizi ayri dokuman olarak paylasilmistir: `docs/swot-analizi.md`.

## 5. Temel Kavramlar
- **30 gunluk plan sistemi:** Ameliyat tarihine gore 15 gun once + 15 gun sonra.
- **Gorev tamamlama:** Gunluk gorevlerin checkbox/toggle ile isaretlenmesi.
- **Saglik skoru (0-100):** Tamamlanan gorev oranina gore hesaplanan puan.
- **Karaciger seviyesi (1-5):** Saglik skoruna bagli durum seviyesi.
- **Streak:** Ardisik gunlerde gorev tamamlama surekliligi.
- **Context tabanli state:** Frontend global durum yonetimi.

## 6. Kullanilan Teknolojiler
- **React Native (Expo SDK 54)**
- **Expo Router** (file-based routing)
- **React Navigation** (Bottom Tabs + Stack)
- **TypeScript**
- **Context API** (global state)
- **@expo/vector-icons** (ikon sistemi)
- **ESLint** (kod kalite kontrolu)
- **Cihaz-ici giris:** kullanici adi + sifre `AsyncStorage` + `expo-secure-store` ile bu telefonda saklanir (sunucu gerekmez).
- **Opsiyonel:** `server/` klasorunde Node.js + Express + PostgreSQL ornek API (su an mobil uygulama baglamaz).

### Calistirma Komutlari
```bash
npm install
npx expo start
```

Development build (gercek GLB 3D):

```bash
npm run start:dev-client
```

Expo ile gelen paketleri (`expo-secure-store`, `@react-native-async-storage/async-storage` vb.) guncellerken **`npm install paket@latest` yerine** `npx expo install paket` kullan; aksi halde SDK ile uyumsuz surum olusabilir.

Opsiyonel:
```bash
npm run android
npm run ios
npm run web
npm run lint
npm run server:dev
```

### Opsiyonel: `server/` API ve PostgreSQL
Mobil uygulama su an **uzak API kullanmaz**. Deney veya gelecek senkron icin yerelde API calistirmak istersen: `server/.env.example` dosyasini `server/.env` yap, `DATABASE_URL` ve `JWT_SECRET` doldur, `server/sql/init.sql` ile semayi yukle, `npm run server:dev` ile baslat.

### Karaciger gorselleri
Expo Go akisinda karaciger karti `assets/liver/liver_stage_1.png` ... `liver_stage_5.png` fallback gorsellerini kullanir. Development build profilinde `_optimized.glb` dosyalari gercek 3D olarak acilir; ayrintilar icin `assets/liver/README.md` ve `eas.json`.

## 7. Proje Kapsami
### Dahil Olanlar (Mevcut Faz)
- Kayit / giris (cihazda, `expo-secure-store` oturum + `AsyncStorage` hesap ve profil verisi; sifre ozeti `js-sha256` ile)
- Ameliyat tarihi ekraninda tarih secici (`@react-native-community/datetimepicker`); profil sekmesinde ayni secici ve cikis
- Home / Tasks / Profile / Ipuclari sekmeleri; gunluk hatirlatma izni ve yerel zamanlama (`expo-notifications`)
- Gorev kartlarinda ipucu, hedef ve puan ozeti; karaciger evresi gorseli (1–5)
- Pastel tema, kart tabanli modern arayuz

### Kapsam Disi / Sinirlar
- Tibbi tavsiye veya tani niteliginde icerik yoktur; metinler genel yasam tarzi ve hatirlatma amaclidir.
- Uretim push bildirimleri ve EAS yapilandirmasi ayri kurulum gerektirir; simdiki faz yerel zamanlanmis bildirimlere odaklanir.

## 8. Beklenen Ciktilar
- Karaciger ameliyati surecine ozel calisan bir mobil frontend prototipi
- Kullanici ilerlemesini olculebilir hale getiren gorev + skor modeli
- Gelistirmeye acik, katmanli ve beginner-friendly proje yapisi
- Sonraki backend fazina teknik olarak hazir bir UI/UX altyapisi

## 9. Katkida Bulunanlar
- **Fatma Kara** - Proje sahibi, urun vizyonu ve tasarim yonu
- **Cursor AI Assistant** - Frontend uygulama gelistirme ve dokumantasyon destegi

## 10. Kaynaklar
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 11. Anahtar Kelimeler
Karaciger ameliyati, mobil saglik, React Native, Expo, hasta takibi, gorev yonetimi, iyilesme sureci, health score, liver level, Context API
