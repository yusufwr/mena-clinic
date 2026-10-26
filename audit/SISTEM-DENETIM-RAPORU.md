# Mena Clinic — sistem denetimi

**Tarih:** 26 Ekim 2026, Europe/Istanbul.

Yerel sistemde kayıt güvenliği, yetkilendirme, randevu ve muayene akışı, eczane teslimi, laboratuvar sonuçları ve eşzamanlı kullanım denetlendi. Bulunan sorunlar mevcut sayfa düzeni ve özellik ayrımı korunarak düzeltildi. Ek model ajanı kullanılmadı; eşzamanlılık testindeki süreçler yalnızca yerel test işçileridir.

## Çalışan düzen

| Adres | İşlev |
|---|---|
| http://localhost:3000/tr | Ana site; Türkçe, Arapça ve İngilizce sayfalar |
| http://localhost:3000/tr/patient | Hasta portalı |
| http://localhost:3000/api/health | API ve veri dosyası okuma kontrolü |
| http://localhost:3003 | Yönetici, doktor, eczane ve diğer personel paneli |

3001 ve 3002 başlatılmadı. Sunucular yalnızca yerel loopback adresine bağlanır. 3003 doluysa Vite başka porta geçmez. Bu düzende etkin veri kaynağı `clinic-system/src/data/db.json` dosyasıdır. Depodaki eski `apps/api` ve `apps/patient-portal` uygulamaları ayrı sunucu olarak çalıştırılmadı; Prisma şeması değiştirilmedi, migration veya seed çalıştırılmadı.

## Verilerin korunması

- İşe başlamadan önce JSON veri dosyası ve eski Prisma `dev.db` dosyası `audit/backups/` altına kopyalandı. Bu klasör Git dışında tutulur ve kişisel veriler içerebilir.
- Test kayıtları ayrı veri dosyalarında oluşturuldu. Gerçek kayıtlar yük testi için kullanılmadı veya silinmedi.
- Gerçek JSON dosyasının başlangıç SHA-256 değeri: `8B99A2C001227CAC412197162965BC16819BCDFFAC3AB8DBE5B361E11F5D4155`. Son karşılaştırmada aynı değer doğrulandı.
- İşlemler tek bir okuma/değiştirme/yazma bölümü içinde yapılır. Süreçler arası dosya kilidi kayıp güncellemeleri önler. Başarısız işlem değişikliklerini kaydetmez.
- Yazma geçici dosyada tamamlanır, `fsync` uygulanır, önceki sürüm `.bak` olarak korunur ve dosya yeniden adlandırılarak değiştirilir. Windows/OneDrive geçici kilitleri için sınırlı yeniden deneme vardır; asıl dosyayı silerek değiştirme yapılmaz.
- Veri dosyası bulunamaz veya okunamazsa boş veri tabanı oluşturarak üzerine yazılmaz.
- Okuma önbelleği dosya kimliği, boyutu ve değişiklik zamanı ile doğrulanır. Yazma işlemleri değiştirilemez okuma kopyasının ayrı bir kopyası üzerinde çalışır; başka süreçlerin kayıtları tekrar okunur.

Bu sonuç test kapsamındaki veri kaybı kontrollerini doğrular. Elektrik kesintisi, disk arızası veya OneDrive'ın başka bilgisayardan dosya değiştirmesi ayrıca denenmedi.

## Düzeltilen sorunlar

| Sorun | Sonuç |
|---|---|
| Sunucu arızasında tarayıcıdaki örnek veriye geçip başarılı kayıt gösterilmesi | Yönetim istemcisinde ve hasta/randevu servislerinde sessiz örnek veri yedeği kaldırıldı; başarısız kayıt açıkça hata döndürür. |
| Kolayca taklit edilebilen oturum belirteci | HMAC imzalı, sekiz saat süreli oturumlar ve sunucu tarafında kullanıcı/rol kontrolü eklendi. Hasta oturumunda HttpOnly/SameSite çerezi kullanılır. |
| Yetkisiz hasta, personel veya tıbbi kayıt okuma | Ortak API yetki politikası, hasta sahiplik kontrolü ve rol sınırlamaları eklendi. Personel listesinden parola alanı çıkarıldı. |
| Kimliği bulunmayan PDF isteğinin başka kayda düşmesi | İstenen kayıt yoksa 404 döndürülür. |
| Ayrı süreçlerin aynı dosyaya yazarken güncelleme kaybetmesi | İşlem kuyruğu ve süreçler arası dosya kilidi eklendi; dört süreç testi geçti. |
| İptal edilen randevunun dolu saate yeniden açılması; sıra numarasının tekrar kullanılması | Yeniden açmada çakışma kontrolü ve artan sıra numarası uygulanır. Takvim tarihi ve saat doğrulanır. |
| Muayenenin yanlış hastaya veya hekime ait randevuyu kapatması | Hasta/hekim/randevu ilişkisi denetlenir; aynı randevu ikinci kez muayene kaydı oluşturamaz. Ek not yolu korunur. |
| Doktor ekranında reçetenin yanlış alan adıyla gönderilmesi | İstemci ile API alanları eşleştirildi. Muayene, randevu durumu, reçete ve tetkik istemi aynı işlemde kaydedilir. |
| Reçete tesliminde çift stok düşümü | Teslim durumu ve stok kontrolü aynı işlemde yapılır; yetersiz veya süresi geçmiş stok teslim edilmez. Satış/maliyet tutarı teslim anında saklanır. |
| Laboratuvar sonucunun hasta kaydına yansımaması | Tetkik ile muayene kaydı ilişkilendirildi; sonuç ikisinde birlikte güncellenir. |
| Personel, stok, laboratuvar ve ek not yollarının yerel API'de eksik olması | Kullanılan yollar sunucuda kalıcı işlemlerle tamamlandı. |
| Muayene ücretinin yalnızca ekranda değiştirilmesi | Ücret güncellemesi doğrulanarak sunucuya kaydedilir. |
| Kayıt veya sevk hatasına rağmen başarı bildirimi | İlgili ekranlarda HTTP başarısı denetlenir; başarısızlık kullanıcıya gösterilir. |
| Örnek hastalar ve uydurma gelir/stok rakamları | Örnek klinik geçmişiyle giriş ve sahte başarı kaldırıldı; mali ve stok hesapları kayıtlı verilerden yapılır. |
| Gece yarısı çevresinde yanlış gün | İlgili takvimlerde ortak klinik tarihi kullanılır. |
| Vite üzerinden veri dosyalarına doğrudan erişim | Veri klasörü, yedekler, anahtarlar ve veritabanı dosyaları dosya sunumundan çıkarıldı; doğrudan erişim 403 ile doğrulandı. |

Ortak depolama ve oturum işlemleri `clinicDb.ts`, ortak rol politikası `apiGuard.ts`, stok işlemleri `features/inventory/inventory.server.ts` içinde tutulur. İş kuralları mevcut özellik yollarında kalır. Kullanılmayan tarayıcı örnek veri motoru kaldırıldı. Mevcut kullanıcı değişiklikleri geri alınmadı.

## 300 eşzamanlı kullanıcı testi

Üretim web derlemesiyle, ayrı veri kopyasında **60 ziyaretçi + 60 hasta + 60 doktor + 60 eczacı + 60 yönetici** çalıştırıldı. Oturum gerektiren 240 hesap birbirinden ayrıdır. Oturum açma hazırlığından sonra yaklaşık **31 saniyede 8.792 HTTP isteği**, **0 hata** ile tamamlandı. İstemciler istek grupları arasında yaklaşık bir saniye bekledi; bu sınırsız istek bombardımanı değildir.

| Rol | İstek | Hata | Ortanca yanıt | %95 yanıt sınırı | En uzun yanıt |
|---|---:|---:|---:|---:|---:|
| Hasta | 1.595 | 0 | 13 ms | 1.020 ms | 3.227 ms |
| Doktor | 1.615 | 0 | 11 ms | 1.242 ms | 3.257 ms |
| Eczacı | 1.633 | 0 | 13 ms | 1.311 ms | 3.241 ms |
| Yönetici | 1.597 | 0 | 11 ms | 1.387 ms | 4.234 ms |
| Ziyaretçi | 2.352 | 0 | 76 ms | 396 ms | 5.359 ms |

Akışın sonunda ayrı ayrı **60 randevu, 60 muayene, 60 reçete teslimi ve 60 yeni hasta kaydı** doğrulandı. Testteki 60 stok kaleminin her biri 10'dan tam olarak 9'a indi. Gerçek veri dosyası değişmedi.

İlk denemede ziyaretçi yanıtlarının %95 sınırı 19.123 ms idi. Tekrarlanan dosya okumaları ve oturum anahtarı erişimleri azaltıldıktan sonra aynı senaryoda bu değer 396 ms oldu. Önceki ölçüm `load-results-before-cache.json`, son ölçüm `load-results.json` içindedir.

Bu test 300 ayrı tam tarayıcıda JavaScript, görseller, mobil cihazlar ve internet bağlantılarıyla yapılan uçtan uca test değildir. Otuz saniyelik başarılı test, günlerce kesintisiz çalışma veya daha büyük veri hacmi için garanti vermez. İlk yoğun yazma dalgasında birkaç saniyelik gecikme hâlâ ölçülmüştür.

## Diğer doğrulamalar

- 300 eşzamanlı hasta kaydının tamamı kalıcı olarak bulundu.
- Dört ayrı işletim sistemi sürecinden toplam 300 yazma kayıpsız tamamlandı.
- Aynı saate 300 randevu isteğinde 1 başarı, 299 beklenen çakışma cevabı alındı.
- Aynı reçeteye 300 teslim isteğinde 1 başarı, 299 beklenen çakışma cevabı alındı; stok yalnızca bir kez azaldı.
- İşlem içindeki hata geri alma ve Windows geçici kilit hatası enjeksiyonu geçti.
- Sahte/süresi dolmuş oturum, yanlış parola, rol erişimi, hasta izolasyonu, parola gizleme, eksik PDF kaydı, yinelenen muayene, laboratuvar sonucu ve ücret güncellemesi kontrol edildi.
- Her iki uygulamanın TypeScript kontrolleri ve üretim derlemeleri doğrulandı. API yolları, ortak veri/oturum katmanı ve stok sunucu kodu için hedefli ESLint denetimi geçti; tüm eski ön yüz dosyaları için temiz lint sonucu iddia edilmiyor.
- Derleme sırasında Next.js/next-intl önbellek uyarıları var; derlemeyi durdurmadılar. Yerel geliştirme sunucuları açık bırakılır. Üretim yük ölçümleri geliştirme sunucusunun performans garantisi değildir.

## Kalan sınırlar

1. **Eski tarayıcı kayıtları:** Önceki sürümün `localStorage` kayıtları silinmedi ve doğrulanmadan sunucuya aktarılmadı. Yönetici panelinde bu kayıtlar bulunursa yedek indirme bildirimi gösterilir. Başka tarayıcı profillerinin içeriği bu denetimde incelenmedi; bütün geçmiş eczane kayıtlarının sunucuda bulunduğu iddia edilmez.
2. **Mali rapor:** Tamamlanmış muayenelerin güncel ücretleri ve kayıtlı eczane teslim tutarlarından hesaplanır. Mevcut %65 hekim / %35 klinik paylaşımı korunur. Gerçek tahsilat/iade/indirim defteri veya geçmiş muayeneler için değişmez ücret dökümü değildir.
3. **Eski web personel portalı:** Serbest metin reçete açıklaması klinik not içinde korunur. Stokla eşleşen yapılandırılmış reçete işlemleri için 3003 doktor ekranı kullanılmalıdır.
4. **Dosya yükleme:** Laboratuvar sonuç metni kaydedilir. Gerçek dosya yükleme/saklama akışı tamamlanmış olarak gösterilmez.
5. **Kimlik bilgileri:** Önceden var olan demo parolaları değiştirilmedi. Yerel test hesabı politikası, gerçek kullanıma açılmadan önce ayrıca ele alınmalıdır. Sisteme doğrulanmamış SSL veya HIPAA uygunluğu atfeden bazı ekran metinleri kaldırıldı.
6. **Depolama ve kurtarma:** Dosya tabanlı yapı ve OneDrive konumu korunmuştur. Süreç zorla sonlandırılırsa geride kalan `.lock` dosyası işlemleri güvenli biçimde engelleyebilir. Kurtarmadan önce tüm yazıcı süreçler durdurulmalı, mevcut dosya ve yedekler korunmalı ve seçilen kopya doğrulanmalıdır. Başlangıç yedeğini doğrudan geri yüklemek sonradan oluşan kayıtları kaybettirebilir.

## Yeniden çalıştırma

Normal yerel açılış: proje kökünde `npm run dev`. Bu komut yalnızca 3000 ve 3003'ü başlatır.

Güvenli regresyon denetimi: iki sunucu açıkken `npm run audit:verify`. Gerçek veri dosyasında test yazması yapmaz; geçici kopyalar `audit/backups/` altında kalır. Ayrıntılı sonuç: `verification-results.json`.

Uzun HTTP testinde sırayla `node audit/prepare-load.cjs` çalıştırılır, **yalnızca test için başlatılan** 3000 sunucusuna `CLINIC_DB_PATH` olarak `audit/load-db-path.txt` içindeki ayrı dosya yolu verilir ve `node audit/load-http.cjs` çalıştırılır. Test hesaplarıyla kimlik doğrulanmadan yük betiği yazma aşamasına geçmez. Bitince test sunucusu kapatılır, `CLINIC_DB_PATH` kaldırılır ve normal sunucu yeniden başlatılır. Aynı dosyada iki test koşusu üst üste başlatılmamalıdır.

Mevcut yerel veri için Prisma `setup:db`, reset veya seed komutları kullanılmamalıdır.
