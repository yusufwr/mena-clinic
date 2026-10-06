# 🏥 Mena Clinic - Entegre Sağlık ve Klinik Yönetim Sistemi

Modern tıp merkezleri için tasarlanmış; çok dilli (Türkçe, Arapça, İngilizce), rol tabanlı yetkilendirme, hasta portali ve doktor/eczane bazlı muhasebe raporlama altyapısına sahip kapsamlı klinik ekosistemi.

---

## 🌟 Sistem Mimarisi & Portlar

| Port | Uygulama | Teknoloji | Açıklama |
| :--- | :--- | :--- | :--- |
| **3000** | **Mena Clinic Kurumsal Web Sitesi** | Next.js 14, TypeScript, next-intl | Halka açık randevu, doktor tanıtımları, çok dilli arayüz (TR / AR / EN) |
| **3002** | **Hasta Portalı & E-Nabız** | React, Vite, TailwindCSS | Hastanın kendi tıbbi geçmişi, reçeteleri ve laboratuvar sonuçları (HIPAA izole) |
| **3003** | **Klinik Operasyon & Yönetim Paneli** | React, Vite, TailwindCSS | Admin 360° denetim, doktor muayene ücreti & takvim denetimi, muhasebeci hakediş raporları |

---

## 🚀 Öne Çıkan Özellikler

1. **Marka & Tasarım:**
   - Özel dairesel rozet logo ve sıcak şampanya/terrakotta renk paleti.
   - Tüm sistemlerde uluslararası standartlarda tutarlı tipografi ve mikro animasyonlar.

2. **3 Dilde Tam Uyum (TR / AR / EN):**
   - Arapça için otomatik **RTL (Sağdan Sola)** yerleşim.
   - Telefon numaraları ve sayısal değerler için Unicode BiDi izolasyonu.

3. **Yönetici (Admin 360°) Modülü:**
   - Hekim arama, branş filtreleme ve her hekime özel detaylı inceleme penceresi.
   - Muayene ücreti denetimi, haftalık çalışma takvimi ve anlık hasta kuyruğu.
   - Danışma, hasta kabul, eczane stokları, laboratuvar ve denetim günlüklerine tam erişim.

4. **Muhasebeci (Mali Müşavir) Modülü:**
   - **Doktor Bazlı Gelir Raporları:** Hekim başına hasta adedi, muayene hasılatı, %65 hekim hakedişi, %35 klinik payı dökümü.
   - **Eczane Mali Raporu:** İlaç satış cirosu, alış maliyeti (COGS), brüt kar marjı (%58), indirim toplamı ve depo stok değerlemesi.
   - Tek tıkla yazdırma ve PDF dışa aktarma desteği.

---

## 🛠️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucularını başlatın
npm run dev
```

Veya her bir projeyi bağımsız olarak çalıştırmak için:
```bash
# Kurumsal Ana Site (Port 3000)
cd clinic-system && npm run dev

# Hasta Portalı (Port 3002)
cd apps/patient-portal && npm run dev

# Yönetim Paneli (Port 3003)
cd apps/admin-panel && npm run dev
```

---

## 📄 Lisans
Bu proje özel mülkiyet altındadır. Tüm hakları saklıdır © 2026 Mena Clinic.
