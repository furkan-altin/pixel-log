# 🎮 Pixerlog - The Ultimate Gamer Vault

Pixerlog, oyuncular için geliştirilmiş, modern web teknolojilerini (React, Zustand, Tailwind) ve oyun dünyasının estetiğini (Opera GX style) bir araya getiren yeni nesil bir oyun takip ve kütüphane yönetim platformudur.

> **Canlı Demo:** [(https://pixel-log.netlify.app)](https://pixel-log.netlify.app/?)

---

## 🚀 Öne Çıkan Özellikler

### 🤖 PixelAI & The Oracle (Kahin Sistemi)
"Ne oynayacağım?" kararsızlığına son veren akıllı asistanınız.
- **Kader Zarı (Fate Roll):** PixelAI, kütüphanenizdeki 'Backlog' (Bekleyenler) listesini analiz eder ve size o an oynamanız için bir oyun seçer.
- **Etkileşimli Ödül:** Kahin'in seçtiği kaderi kabul edip oyunu 'Playing' (Oynanıyor) statüsüne alırsanız anında **+30 XP** kazanırsınız!

### 🧬 Holo-Network & DNA Sharing
Veritabanı maliyeti olmadan, kullanıcıların profillerini Base64 kriptografik imzalarla paylaşmasını sağlayan yenilikçi bir sistem. 
- **Holo-DNA:** Mevcut profilini, seviyeni ve favori oyunlarını içeren şifreli bir kod üretir.
- **Holo-Scanner:** Arkadaşlarının kodunu tarayarak 3D interaktif kartlarını görüntülemeni ve oyunlarına doğrudan erişmeni sağlar.

### 📋 Kanban-Style Library Management
Oyun kütüphaneni `@dnd-kit` altyapısı ile sürükle-bırak mantığında yönetin.
- **Dinamik Statüler:** Backlog, Playing, Completed ve Dropped kategorileri arasında pürüzsüz geçiş.
- **Anlık İstatistikler:** Kütüphane dağılımını gösteren interaktif PieChart ve Tür Analizi.

### 📅 GX-Calendar (Release Tracker)
Gelecek oyunları Opera GX estetiğiyle takip edin.
- Tarihe göre gruplandırılmış, görsel odaklı akış.
- Görseli olmayan kayıtların otomatik temizlendiği "High-Quality" filtreleme.

### 🔍 Pro-Search Engine
RAWG API üzerinde çalışan, "Google-level" keskinlikte arama motoru. Filtre çakışmalarını önleyen "Arama Mutlakiyeti" algoritması ile tüm franchise kayıtlarına anında erişim.

---

## 🛠️ Teknik Yığın (Tech Stack)

- **Framework:** ReactJS 18
- **State Management:** Zustand (Persist Middleware ile yerel depolama)
- **Styling:** Tailwind CSS & Framer Motion (3D Kart Efektleri & Animasyonlar)
- **API:** RAWG Video Games Database
- **Charts:** Recharts (Radar & Pie Charts)
- **Drag-and-Drop:** `@dnd-kit`
- **Utility:** Base64 Encoding, html-to-image (ID Kartı İndirme)

---

## 📂 Proje Mimarisi (Architecture)

Proje, profesyonel standartlara uygun olarak şu dosya yapısıyla kurgulanmıştır:

```text
src/
├── Components/    # Atomik UI bileşenleri (HoloCard, Navbar vb.)
├── Pages/         # Sayfa seviyesindeki bileşenler (Home, Library, Profile)
├── store/         # Zustand global state yönetimi
├── Interfaces/    # Veri şemaları ve mock datalar (Standardize veri yapısı)
└── hooks/         # Özel React hookları (useDebounce vb.)
```

🛠️ Kurulum ve Çalıştırma
1. Projeyi klonlayın:

git clone https://github.com/furkan-altin/pixel-log.git

2. Bağımlılıkları yükleyin:

npm install

3. .env dosyası oluşturun ve RAWG API anahtarınızı ekleyin:

VITE_RAWG_API_KEY=senin_api_anahtarin

4. Projeyi başlatın:

npm run dev
