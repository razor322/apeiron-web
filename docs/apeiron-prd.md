# Product Requirements Document (PRD)

# Apeiron — Cosmic Exploration Website

**Tagline:** *Sebesar apa semesta, sekecil apa kita.*  
**Versi dokumen:** 1.0  
**Status:** Draft untuk validasi dan implementasi MVP  
**Tanggal:** 14 Oktober 2026  
**Bahasa produk awal:** Bahasa Indonesia  
**Platform:** Website responsif, desktop dan mobile  

---

## 1. Ringkasan Produk

Apeiron adalah website edukasi astronomi yang menggabungkan pengalaman *scrollytelling*, visualisasi kosmik, fakta ilmiah, dan data astronomi dari sumber yang dapat diverifikasi. Pengunjung memulai dari satu titik cahaya, lalu mengikuti perjalanan visual dari Bumi, Tata Surya, bintang, Bimasakti, hingga alam semesta teramati.

Produk ini tidak dimaksudkan menjadi simulasi astronomi profesional atau planetarium yang presisi secara visual. Apeiron adalah pengalaman edukasi publik: data ilmiah harus dapat ditelusuri, sedangkan visualisasi boleh menggunakan skala logaritmik agar rentang ukuran dan jarak yang luar biasa lebar dapat dipahami manusia.

### 1.1 Masalah yang ingin diselesaikan

Informasi astronomi sering tersebar di berbagai situs, memakai angka yang sulit dibayangkan, dan disajikan tanpa alur eksplorasi yang konsisten. Website astronomi yang hanya mengandalkan artikel atau galeri gambar juga belum tentu membantu pengunjung merasakan perbedaan skala antara Bumi, Tata Surya, bintang, dan galaksi.

Apeiron menjawab masalah tersebut dengan:

- Perjalanan visual yang menyusun konsep astronomi berdasarkan skala.
- Fakta singkat, satuan yang mudah dipahami, dan sumber yang jelas.
- Visual dari sumber astronomi tepercaya yang dilengkapi metadata dan kredit.
- Interaksi ringan yang membantu pengunjung memahami angka, waktu, dan jarak.
- Pengalaman yang tetap dapat digunakan pada ponsel dengan kemampuan grafis terbatas.

### 1.2 Nilai utama

**Kagum tanpa mengorbankan akurasi.** Animasi membuat skala kosmik terasa, sementara setiap klaim ilmiah dapat diperiksa melalui sumber dan konteksnya.

### 1.3 Prinsip produk

1. **Science first:** setiap fakta memiliki sumber dan konteks, termasuk apakah nilainya eksak, estimasi, atau hasil perhitungan.
2. **Quiet by design:** ruang kosong, gerakan lambat, dan satu aksen amber; hindari estetika arcade atau antarmuka yang penuh panel.
3. **Progressive enhancement:** konten inti tersedia meskipun WebGL, animasi intensif, atau koneksi eksternal gagal.
4. **Mobile-inclusive:** kualitas pengalaman tidak bergantung pada perangkat kelas atas.
5. **Transparent data:** waktu data diambil, metode perhitungan, satuan, dan kredit visual dijelaskan ketika relevan.
6. **Privacy by default:** MVP tidak memerlukan akun atau mengumpulkan data pribadi untuk menjelajahi kosmos.

---

## 2. Tujuan, Non-Tujuan, dan Ukuran Keberhasilan

### 2.1 Tujuan produk

- Membantu pengunjung memahami urutan skala kosmik dari Bumi hingga alam semesta teramati.
- Mengubah fakta astronomi menjadi pengalaman interaktif yang menarik, mudah diingat, dan bisa diverifikasi.
- Menyediakan pintu masuk ke topik astronomi seperti planet, bintang, lubang hitam, nebula, galaksi, eksoplanet, komet/asteroid, dan materi gelap.
- Menyajikan beberapa data aktual atau katalog yang diperbarui melalui provider tepercaya.
- Menjaga waktu muat, aksesibilitas, dan kegunaan pada perangkat beragam.

### 2.2 Non-tujuan MVP

- Bukan perangkat lunak navigasi antariksa, sistem observatorium, atau alat penentu orbit untuk keperluan operasional.
- Bukan simulasi 3D dengan jarak dan ukuran seluruh benda yang proporsional dalam satu ruang koordinat.
- Tidak menyediakan akun pengguna, profil, komentar, forum, atau fitur komunitas.
- Tidak membangun backend microservices terpisah untuk setiap provider data.
- Tidak menjanjikan seluruh informasi astronomi bersifat real-time.
- Tidak menyediakan layanan newsletter aktif sebelum provider, persetujuan pengguna, kebijakan privasi, dan mekanisme berhenti berlangganan ditentukan.
- Tidak mencakup CMS atau dashboard editorial di MVP; fakta awal dikelola melalui data bertipe di repositori.

### 2.3 North-star metric

**Journey Completion Rate:** persentase sesi yang mencapai section penutup perjalanan kosmik.

Metrik ini tidak boleh menjadi alasan untuk memaksa scroll, menghalangi aksesibilitas, atau memulai animasi yang tidak diminta pengguna.

### 2.4 Metrik keberhasilan awal

Target berikut adalah sasaran awal untuk diuji, bukan data historis atau jaminan hasil.

| Area | Metrik | Target awal |
|---|---|---:|
| Aktivasi | Pengunjung mulai perjalanan setelah membuka landing page | ≥ 35% |
| Penyelesaian | Pengunjung yang mulai lalu mencapai section penutup | ≥ 25% |
| Eksplorasi | Pengunjung membuka minimal satu halaman/topik detail | ≥ 15% |
| Performa | LCP p75 pada perangkat mobile yang didukung | ≤ 2,5 detik |
| Interaksi | INP p75 | ≤ 200 ms |
| Stabilitas visual | CLS p75 | ≤ 0,1 |
| Kegagalan teknis | Error frontend yang menghalangi pengalaman inti | < 1% sesi |
| Akurasi konten | Fakta yang ditampilkan dengan sumber, satuan, dan konteks yang sesuai | 100% fakta terpublikasi |
| Aksesibilitas | Konten inti dapat digunakan tanpa gerakan scroll intensif | Lulus pengujian manual |

Metrik performa mengikuti Core Web Vitals sebagai panduan pengukuran. Target akhir perlu dikonfirmasi dengan data lapangan dan perangkat target.

---

## 3. Target Pengguna dan Kebutuhan

### 3.1 Segmen utama

**Penjelajah awam**  
Ingin mengetahui hal-hal besar tentang alam semesta tanpa harus membaca materi akademis panjang.

**Pelajar dan mahasiswa**  
Membutuhkan penjelasan visual untuk ukuran, jarak, tahun cahaya, sejarah kosmik, dan benda langit.

**Pengunjung visual-first**  
Tertarik oleh desain, fotografi, dan pengalaman interaktif; membutuhkan fakta singkat dan jalur eksplorasi lanjutan.

### 3.2 Kebutuhan pengguna

- “Saya ingin melihat perbedaan skala Bumi dengan lingkungan kosmik yang lebih besar.”
- “Saya ingin tahu apakah angka yang ditampilkan adalah fakta pasti atau estimasi.”
- “Saya ingin melihat gambar astronomi yang menarik dan mengetahui sumber serta kreditnya.”
- “Saya ingin menjelajah topik tertentu tanpa kehilangan konteks dari perjalanan utama.”
- “Saya ingin pengalaman ini tetap berjalan di ponsel saya, meskipun animasi 3D harus dikurangi.”

### 3.3 Bahasa dan lokalisasi

- Bahasa antarmuka MVP: Bahasa Indonesia.
- Nama ilmiah, nama objek, singkatan, dan satuan mengikuti konvensi ilmiah yang tepat.
- Angka menggunakan format lokal yang konsisten, namun nilai mentah, satuan, dan sumber tetap dapat diperiksa.
- Struktur teks harus siap dilokalisasi pada fase lanjutan, tetapi lokalisasi penuh bukan syarat MVP.

---

## 4. Ruang Lingkup Produk dan Navigasi

### 4.1 Struktur informasi

1. **Beranda / Cosmic Journey**
   - Hero dan tujuh bab perjalanan skala kosmik.
   - Navbar minimal.
   - Indikator tahap dan skala.
   - Progress perjalanan yang dapat digunakan untuk navigasi.
2. **Jelajahi Kosmos**
   - Grid kategori objek astronomi.
   - Kartu dengan fakta pemancing, visual, dan tautan detail.
3. **Halaman Topik**
   - Definisi singkat, fakta utama, ilustrasi/foto, istilah, sumber, serta tautan topik terkait.
4. **Angka yang Bikin Diam**
   - Strip atau rangkaian fakta kuantitatif dengan konteks.
5. **Kalender Kosmik**
   - Analogi sejarah alam semesta dalam satu tahun kalender.
6. **Kamu Terbuat dari Bintang**
   - Penjelasan edukatif mengenai asal-usul unsur kimia.
7. **Laboratorium Kosmik**
   - Kalkulator edukasi yang menampilkan asumsi dan metode.
8. **Cosmos Today**
   - Gambar astronomi pilihan/harian dan konten metadata dari provider yang tersedia.
9. **Tentang & Sumber**
   - Tujuan proyek, sumber data, metodologi, kredit visual, dan batasan visualisasi.

### 4.2 Prioritas scope

- **P0 — MVP:** dibutuhkan untuk rilis publik pertama.
- **P1 — Setelah MVP:** memperkaya eksplorasi berdasarkan hasil pengujian.
- **P2 — Lanjutan:** fitur yang meningkatkan kedalaman data atau pengembalian pengunjung, tetapi bukan syarat peluncuran.

---

## 5. Persyaratan Fungsional

### 5.1 Cosmic Journey (P0)

**FR-CJ-01 — Hero**  
Beranda menampilkan satu titik cahaya di tengah latar gelap, tagline “Sebesar apa semesta, sekecil apa kita.”, kalimat pembuka “Kamu ada di sini.”, serta petunjuk untuk mulai menjelajah.

**FR-CJ-02 — Tujuh tahap perjalanan**  
Perjalanan utama memiliki urutan: Hero, Bumi, Tata Surya, Bintang, Bimasakti, Alam Semesta Teramati, Penutup.

**FR-CJ-03 — Satu visual stage berkelanjutan**  
Visual utama dapat tetap berada di layar saat konten tiap tahap berubah, sehingga gerakan terasa sebagai satu perjalanan. Implementasi tidak harus membuat scene 3D baru untuk setiap bab.

**FR-CJ-04 — Progress navigasi**  
Pengunjung dapat melihat tahap yang sedang aktif dan berpindah langsung ke tahap yang dipilih. Kontrol harus dapat digunakan dengan keyboard dan memiliki label aksesibel.

**FR-CJ-05 — Indikator skala**  
Sistem menampilkan skala yang relevan untuk tahap aktif, misalnya diameter, jarak, atau orde magnitudo. Indikator tidak boleh menyesatkan seolah seluruh jarak divisualisasikan secara linear.

**FR-CJ-06 — Teks edukasi ringkas**  
Setiap tahap memiliki satu kalimat utama, angka kunci jika relevan, unit, dan tautan “Sumber data” atau “Pelajari fakta”.

**FR-CJ-07 — Skala visual**  
Bila diperlukan, transformasi visual menggunakan skala logaritmik atau transisi konseptual. UI harus mengungkapkan bahwa ukuran/jarak pada visual tidak selalu proporsional.

**FR-CJ-08 — Reduced motion**  
Saat `prefers-reduced-motion: reduce` aktif, nonaktifkan pinning/scrubbing yang agresif dan gunakan transisi sederhana. Semua teks dan navigasi tetap tersedia.

### 5.2 Desain dan navigasi global (P0)

**FR-UI-01 — Navbar minimal**  
Navbar memuat logo Apeiron, tautan Jelajah, Tentang, dan kontrol animasi. Navbar berawal transparan dan dapat berganti latar saat konten bergerak, tanpa menyebabkan perubahan layout mendadak.

**FR-UI-02 — Toggle animasi**  
Pengguna dapat mengurangi atau menonaktifkan animasi non-esensial. Preferensi ini berlaku untuk sesi atau disimpan lokal hanya jika implementasinya diperlukan dan dijelaskan.

**FR-UI-03 — Toggle suara**  
Jika suara atmosfer ditambahkan, suara harus dalam keadaan mati secara default, tidak diputar otomatis, dan memiliki kontrol yang jelas. Fitur suara dapat ditunda jika tidak mendukung MVP.

**FR-UI-04 — Responsif**  
UI harus mendukung lebar layar mobile, tablet, laptop, serta desktop tanpa memotong fakta atau navigasi penting.

### 5.3 Jelajahi Kosmos dan halaman topik (P0/P1)

**FR-EXP-01 — Grid topik**  
Grid menampilkan kategori Planet, Bintang, Lubang Hitam, Nebula, Galaksi, Eksoplanet, Komet dan Asteroid, serta Materi Gelap.

**FR-EXP-02 — Kartu topik**  
Kartu menampilkan judul, visual kecil, fakta pemancing yang bersumber, dan tautan untuk membuka halaman topik.

**FR-EXP-03 — Halaman topik**  
Halaman detail menjelaskan konsep dengan bahasa awam, istilah, fakta yang dapat diverifikasi, sumber, kredit visual, dan topik terkait.

**FR-EXP-04 — Kondisi konten**  
Kartu dan halaman memiliki loading, empty, error, dan fallback image state. Gagal mengambil data tidak boleh menghilangkan navigasi atau konten statis utama.

### 5.4 Fakta kosmik dan kalender kosmik (P1)

**FR-FACT-01 — Fakta kuantitatif**  
Setiap fakta menampilkan angka, satuan, penjelasan singkat, jenis nilai (misalnya estimasi), sumber, dan tanggal verifikasi.

**FR-FACT-02 — Kalender kosmik**  
Alam semesta divisualisasikan sebagai satu tahun. Setiap peristiwa memiliki tanggal/posisi relatif, sumber, dan catatan bahwa ini merupakan analogi skala waktu.

**FR-FACT-03 — Unsur dalam tubuh**  
Konten menjelaskan asal-usul unsur kimia melalui proses astrofisika dengan sumber ilmiah yang layak. Hindari penyederhanaan berlebihan seperti menyatakan seluruh atom tubuh secara harfiah berasal dari satu jenis ledakan bintang.

### 5.5 Kalkulator edukasi (P1)

**FR-CALC-01 — Usia di planet lain**  
Pengunjung memasukkan usia dalam tahun Bumi, memilih planet, lalu melihat perkiraan jumlah tahun planet tersebut. Rumus dan periode orbit yang digunakan harus ditampilkan.

**FR-CALC-02 — Waktu perjalanan**  
Pengunjung memilih tujuan dan model kecepatan, lalu melihat estimasi waktu. Hasil harus menyatakan bahwa perhitungan adalah ilustrasi sederhana dan tidak mempertimbangkan seluruh kendala misi seperti percepatan, lintasan, atau kebutuhan energi.

**FR-CALC-03 — Validasi input**  
Input menerima rentang nilai yang wajar, memberikan pesan error yang terbaca, dan tidak menimbulkan error jika kosong atau bukan angka.

**Catatan:** kalkulator “berat di planet lain” bisa ditambahkan kemudian. Jika tersedia, gunakan istilah berat/gaya gravitasi secara benar dan bedakan dari massa.

### 5.6 Data astronomi eksternal (P0/P1)

**FR-DATA-01 — Data provider terisolasi**  
Setiap provider eksternal memiliki adapter terpisah untuk mengambil, memvalidasi, memetakan, dan menormalkan data.

**FR-DATA-02 — API server-side**  
Kredensial dan permintaan eksternal yang memerlukan kontrol akses harus diproses di server melalui Next.js Route Handlers. Jangan menaruh API key privat pada bundle browser.

**FR-DATA-03 — APOD**  
Bagian Cosmos Today menampilkan gambar/video APOD yang tersedia, tanggal, judul, penjelasan, kredit/hak cipta bila disediakan, alt text, serta tautan ke halaman resmi. Provider harus mengikuti dokumentasi API APOD terkini, bukan mengandalkan endpoint legacy yang akan diarsipkan.

**FR-DATA-04 — NASA Image and Video Library**  
Pencarian visual menggunakan API resmi NASA Image and Video Library. Simpan informasi asset URL, metadata, deskripsi, dan kredit yang dibutuhkan. Pilih aset yang sesuai untuk penggunaan web dan fallback.

**FR-DATA-05 — JPL Horizons**  
Data posisi/ephemeris hanya ditambahkan setelah parameter kueri, waktu, satuan, zona waktu, respons, dan hasil validasi disepakati. UI harus menyebut waktu yang dihitung atau dirujuk.

**FR-DATA-06 — Katalog eksoplanet**  
Integrasi NASA Exoplanet Archive menggunakan kueri terbatas dan terstruktur. UI memberi tanggal/waktu sinkronisasi atau konteks bahwa nilai berasal dari katalog, bukan pengamatan real-time.

**FR-DATA-07 — Data asteroid/close approach**  
Jika dimasukkan, gunakan API JPL Small-Body Database/Close-Approach Data atau sumber resmi relevan; batasi kueri pada rentang dan filter yang digunakan produk.

**FR-DATA-08 — Cache**  
Setiap provider memiliki TTL berdasarkan karakter data dan batas penggunaan. Nilai TTL awal harus dapat dikonfigurasi dan ditinjau kembali setelah observasi.

**FR-DATA-09 — Ketahanan provider**  
Saat provider timeout, mengembalikan error, atau mencapai batas request, tampilkan cache yang masih layak jika tersedia, atau fallback state yang jelas. Dilarang mengganti kegagalan data dengan angka live palsu.

**FR-DATA-10 — Metadata dan provenance**  
Fakta dan media harus mempertahankan minimal: provider/sumber, URL sumber, tanggal pengambilan/verifikasi, unit, dan kredit/hak penggunaan bila relevan.

### 5.7 Cosmos Today (P0)

**FR-TODAY-01 — Konten astronomi pilihan**  
Halaman menampilkan konten APOD terkini yang berhasil diperoleh, dengan tanggal publikasi, penjelasan ringkas, sumber, dan kredit.

**FR-TODAY-02 — Media non-gambar**  
Jika provider memberi konten video atau tipe media lain yang tidak dapat ditampilkan dengan cara yang sama seperti gambar, UI menyesuaikan komponennya atau menyediakan tautan resmi.

**FR-TODAY-03 — Fallback**  
Jika API gagal, tampilkan item tersimpan yang masih layak beserta keterangan tanggal, atau pesan error yang tidak menyalahkan pengguna.

### 5.8 Sumber, kredit, dan metodologi (P0)

**FR-TRUST-01 — Sumber fakta**  
Semua fakta kuantitatif terpublikasi memiliki tautan sumber yang relevan.

**FR-TRUST-02 — Status angka**  
Bedakan nilai pengukuran, estimasi, nilai perkiraan, dan hasil perhitungan. Gunakan pembulatan yang sesuai presisi sumber.

**FR-TRUST-03 — Kredit gambar**  
Tampilkan kredit di dekat gambar atau tersedia secara jelas melalui pola UI yang mudah ditemukan. Kredit tidak boleh hanya tersimpan di metadata tersembunyi.

**FR-TRUST-04 — Halaman metodologi**  
Jelaskan bahwa visualisasi dapat menggunakan skala logaritmik, elemen artistik, atau komposisi citra dan bukan selalu representasi proporsional.

**FR-TRUST-05 — Penggunaan hak cipta**  
Sebelum publikasi, cek hak penggunaan pada aset individu. Jangan menganggap semua materi yang berasal dari situs pemerintah atau lembaga astronomi otomatis bebas dari semua batasan.

---

## 6. Sumber Data dan Kebijakan Integrasi

### 6.1 Sumber prioritas

| Data | Provider awal | Pemakaian | Strategi |
|---|---|---|---|
| Foto dan penjelasan harian | NASA APOD / API APOD terkini | Cosmos Today | Adapter khusus, cache, metadata dan kredit |
| Gambar benda langit | NASA Image and Video Library | Hero pendukung, kartu, halaman topik | Cari berdasarkan kata kunci dan metadata; pilih aset manual saat perlu |
| Posisi/ephemeris benda Tata Surya | NASA/JPL Horizons | Data terhitung dan animasi lanjutan | Server-side, parameter terbatas, timestamp jelas |
| Katalog eksoplanet | NASA Exoplanet Archive TAP | Halaman eksoplanet | Kueri terstruktur, normalisasi unit, cache katalog |
| Asteroid dan close approach | JPL SSD/CNEOS API | Halaman asteroid | Query terfilter, cache, versi respons diperiksa |
| Gambar tambahan | ESA/Hubble atau penyedia resmi yang sesuai | Detail topik | Catat lisensi/kredit per aset |

### 6.2 Syarat provider

Sebelum provider masuk produksi, tim harus mencatat:

- Endpoint dan dokumentasi resmi.
- Apakah memerlukan API key dan cara melindunginya.
- Batas request, fair-use policy, dan kebutuhan identitas `User-Agent`.
- Format respons dan cara memeriksa versi.
- TTL, timeout, retry policy, dan fallback.
- Metadata kredit dan izin penggunaan media.
- Pemilik adapter dan prosedur bila endpoint berubah.

### 6.3 Catatan khusus APOD per 14 Oktober 2026

Portal NASA menyatakan API APOD telah berpindah ke endpoint WordPress `https://science.nasa.gov/wp-json/wp/v2/apod-basic` per 10 September 2026 dan API APOD legacy dijadwalkan diarsipkan pada 1 Desember 2026. Implementasi baru harus merujuk dokumentasi APOD terbaru dan mengisolasi perubahan ini dalam adapter. Jangan menjadikan endpoint legacy sebagai dependency baru.

### 6.4 Kebijakan JPL

JPL SSD API memiliki fair-use policy. Aplikasi perlu mengurangi permintaan berulang, menggunakan cache jika memungkinkan, menangani error/rate limit dengan backoff, mengirim `User-Agent` spesifik aplikasi yang menyertakan produk, versi, dan kontak, serta memeriksa nilai versi dalam payload bila tersedia. Dokumentasi JPL juga menyatakan API tidak boleh di-embed langsung di website sesuai kebijakan CORS; akses harus melalui server aplikasi.

### 6.5 Data statis vs data dinamis

- **Data statis yang dikurasi:** diameter rata-rata Bumi, jarak Proxima Centauri yang dibulatkan, penjelasan unit, timeline ilmiah. Disimpan sebagai data bertipe dengan sumber, tanggal verifikasi, dan catatan ketidakpastian.
- **Data katalog yang berubah:** daftar eksoplanet dan katalog objek. Ambil berkala dengan cache, bukan setiap render pengunjung.
- **Data berdasarkan waktu:** ephemeris. Waktu yang diminta dan zona waktunya harus menjadi bagian dari metadata hasil.
- **Data editorial harian:** APOD. Sinkronkan sesuai kebutuhan; fallback ke data tersimpan yang tanggalnya terlihat.

---

## 7. Prinsip UI dan Sistem Desain

### 7.1 Palet warna

| Token | Warna | Penggunaan |
|---|---|---|
| `color-void` | `#05060A` | Latar utama |
| `color-starlight` | `#E8E4DC` | Teks utama |
| `color-dust` | `#8A8D98` | Teks sekunder dan label |
| `color-amber` | `#E8A15B` | Aksen tunggal, titik penting, fokus visual |

Jangan menambah banyak aksen warna dekoratif. Warna tambahan hanya boleh muncul pada konten gambar, grafik data yang memerlukan pembedaan semantik, dan indikator status yang aksesibel.

### 7.2 Tipografi

- Heading dan angka editorial: Instrument Serif atau Fraunces.
- Isi dan label: Geist atau Inter.
- Data teknis, unit, waktu, dan orde magnitudo: JetBrains Mono.
- Font lokal atau subset WOFF2 dianjurkan untuk mengendalikan ukuran unduhan dan mencegah flash/pergeseran layout.

### 7.3 Prinsip komposisi

- Angka besar berfungsi sebagai elemen utama, bukan hiasan tanpa konteks.
- Ruang kosong lega dan kepadatan UI rendah.
- Gerakan lambat dan memiliki tujuan naratif.
- Kontras teks tetap memadai terhadap latar.
- Informasi penting tidak disampaikan hanya melalui warna atau gerakan.
- Tidak menggunakan suara otomatis.

### 7.4 Motion design

- GSAP ScrollTrigger mengendalikan progres scrollytelling, pinning, dan scrub hanya pada mode gerakan normal.
- Three.js dipakai untuk visual 3D yang punya nilai edukasi jelas; hindari membangun scene kompleks jika gambar atau CSS sudah cukup.
- Gunakan satu visual stage berkelanjutan jika memungkinkan.
- Scene dan tekstur 3D dimuat secara lazy.
- Reduced-motion mode mengganti pergerakan panjang dengan pergantian konten yang sederhana.
- Kontrol animasi tersedia dan semua interaksi tetap bisa digunakan dengan keyboard.

---

## 8. Arsitektur Teknis Awal

### 8.1 Stack yang dipilih

- **Framework:** Next.js App Router.
- **Bahasa:** TypeScript dengan strict mode.
- **UI:** React dan Tailwind CSS; komponen aksesibel dapat dibangun dengan Radix UI/shadcn/ui jika sesuai.
- **Animasi:** GSAP dan ScrollTrigger.
- **3D:** Three.js, dengan lazy loading dan fallback.
- **Validasi:** Zod atau validator bertipe setara pada batas data eksternal.
- **Testing:** unit/integration test dan Playwright untuk alur browser penting.
- **Hosting awal:** layanan yang mendukung deployment Next.js. Verifikasi limit build, fungsi server, bandwidth, dan kebijakan cache sesuai tier yang dipilih.
- **Database:** tidak wajib untuk MVP karena fakta statis dikurasi di repo dan data eksternal disajikan lewat cache.

Versi paket spesifik ditetapkan saat bootstrap dan dipatok dalam lockfile. Sebelum rilis, validasi kompatibilitas versi Next.js, React, GSAP, Three.js, dan hosting.

### 8.2 Pola arsitektur

Gunakan pendekatan *feature-driven layered architecture* dalam satu aplikasi:

- `app/`: route, layout, dan Route Handlers.
- `features/cosmic-journey/`: bab perjalanan, stage, animasi, hooks.
- `features/explorer/`: daftar kategori dan halaman topik.
- `features/cosmic-facts/`: data fakta dan komponen fakta.
- `features/calculators/`: kalkulator dan rumus.
- `lib/astronomy/providers/`: adapter per sumber.
- `lib/astronomy/schemas/`: validasi respons eksternal.
- `lib/astronomy/units/`: konversi dan pemformatan satuan.
- `lib/astronomy/citations/`: metadata sumber dan kredit.
- `lib/cache/`: konfigurasi dan strategi cache.
- `components/ui/`: komponen visual yang digunakan lintas fitur.

### 8.3 Alur data

1. Komponen/halaman memanggil fungsi data internal atau Route Handler.
2. Adapter provider melakukan permintaan server-side.
3. Timeout, status HTTP, dan schema respons diverifikasi.
4. Respons diubah menjadi model data internal yang stabil.
5. Cache dipakai sesuai TTL provider.
6. UI menampilkan data, timestamp, sumber, dan status fallback bila perlu.

UI tidak boleh membaca struktur respons mentah provider secara langsung. Perubahan provider harus terbatas pada adapter dan tes terkait.

### 8.4 Keamanan dasar

- Jangan expose API key privat melalui `NEXT_PUBLIC_*`.
- Validasi seluruh query params dan batasi ukuran/rentang input.
- Hindari Route Handler sebagai proxy terbuka ke URL arbitrer.
- Terapkan timeout dan batas panjang respons pada provider.
- Sanitasi HTML jika metadata pihak ketiga ditampilkan; utamakan teks biasa.
- Simpan secret di environment variables platform.
- Jangan mengirim data personal jika fitur inti tidak membutuhkannya.

### 8.5 Observabilitas

Untuk MVP, gunakan logging server terstruktur dan pemantauan error frontend/server yang tidak merekam data sensitif. Catat provider, status, durasi, cache hit/miss, dan error class. Jangan menyimpan API key atau respons berisi informasi sensitif dalam log.

---

## 9. Kebutuhan Non-Fungsional

### 9.1 Performa

- Muat HTML, teks, navigasi, dan gambar hero lebih dahulu; load 3D sesuai kebutuhan.
- Terapkan dynamic import pada scene yang berat.
- Sediakan poster/fallback untuk scene yang gagal atau tidak didukung.
- Optimalkan tekstur, ukuran gambar, font, dan jumlah draw call.
- Hentikan atau kurangi render ketika tab tersembunyi jika relevan.
- Hindari permintaan API yang berulang untuk data yang tidak berubah.

### 9.2 Aksesibilitas

- Gunakan struktur heading semantik dan landmark halaman.
- Semua kontrol interaktif dapat dioperasikan dengan keyboard.
- Fokus keyboard terlihat.
- Tombol progress memiliki nama aksesibel.
- Gambar informatif memiliki alt text; dekorasi memiliki alt kosong atau ditandai dekoratif.
- Kontras warna teks memadai.
- Status pemuatan dan error diumumkan secara tepat kepada teknologi bantu.
- Konten tidak bergantung pada gerakan, suara, atau WebGL.
- Hormati `prefers-reduced-motion`.

### 9.3 Responsivitas

- Semua alur penting diuji mulai lebar 320 px hingga desktop lebar.
- Pada layar kecil, indikator skala dan progress dapat dipadatkan tetapi tidak menghalangi teks.
- Scene 3D harus menyesuaikan rasio, resolusi render, dan kualitas berdasarkan kemampuan perangkat.

### 9.4 Reliability dan fallback

- Kegagalan API eksternal tidak boleh membuat seluruh landing page gagal.
- Pengguna melihat tanggal data lama bila data cache digunakan.
- Error provider ditangani tanpa retry loop agresif.
- Konten inti tersedia dari data statis saat service pihak ketiga tidak tersedia.

### 9.5 SEO dan berbagi

- Halaman utama dan detail topik memiliki title, description, canonical jika diperlukan, serta Open Graph metadata.
- Konten inti dirender agar dapat diindeks tanpa membutuhkan scroll animation berjalan.
- Hindari menjadikan semua informasi hanya tersedia dalam canvas WebGL.

### 9.6 Privasi

- Tidak perlu akun untuk MVP.
- Analytics, jika digunakan, harus minimal, transparan, dan tidak mengumpulkan data yang tidak diperlukan.
- Newsletter membutuhkan consent eksplisit dan kebijakan privasi sebelum diaktifkan.

---

## 10. Model Data Konseptual

### 10.1 `CosmicFact`

```ts
type CosmicFact = {
  id: string;
  title: string;
  value?: number | string;
  displayValue: string;
  unit?: string;
  summary: string;
  scaleStage?: "earth" | "solar-system" | "star" | "galaxy" | "universe";
  confidenceType: "measured" | "estimated" | "approximate" | "calculated";
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string; // ISO date
  methodologyNote?: string;
};
```

### 10.2 `AstronomyMedia`

```ts
type AstronomyMedia = {
  id: string;
  title: string;
  mediaType: "image" | "video" | "other";
  previewUrl?: string;
  originalUrl?: string;
  sourceName: string;
  sourceUrl: string;
  credit?: string;
  rightsNote?: string;
  altText: string;
  publishedAt?: string;
  retrievedAt: string;
};
```

### 10.3 `AstronomySnapshot`

```ts
type AstronomySnapshot<T> = {
  data: T;
  provider: string;
  sourceUrl: string;
  retrievedAt: string;
  computedFor?: string;
  stale: boolean;
  attribution?: string;
};
```

Jenis TypeScript ini adalah kontrak internal ilustratif. Final schema perlu disesuaikan dengan respons yang benar-benar dikembalikan provider saat implementasi.

---

## 11. Risiko, Asumsi, dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| API atau format provider berubah | Data tidak tampil atau rusak | Adapter terpisah, schema validation, tes kontrak, pantau dokumentasi |
| Batas request atau layanan tidak tersedia | Konten dinamis gagal dimuat | Cache, backoff, fallback, concurrency dibatasi |
| Hak gambar tidak jelas | Risiko kepatuhan dan reputasi | Verifikasi setiap aset dan simpan kredit/rights note |
| 3D terlalu berat pada HP | Pengunjung pergi atau perangkat melambat | Lazy load, adaptive quality, fallback CSS/gambar, profiling |
| Animasi scroll menyulitkan aksesibilitas | Konten sulit dipakai | Reduced-motion path, keyboard navigation, alternatif non-pinning |
| Fakta terlalu disederhanakan | Miskonsepsi | Editorial checklist dan sumber primer per fakta |
| Visual dianggap berskala presisi | Pengunjung salah memahami jarak/ukuran | Label “skala konseptual/logaritmik” dan metodologi jelas |
| Biaya atau limit hosting naik | Gangguan rilis | Pantau penggunaan, minimalkan fungsi/API calls, tinjau kuota provider hosting |
| Cakupan fitur melebar | MVP terlambat | Prioritas P0/P1/P2 dan definisi release gate |

### 11.1 Asumsi

- MVP berupa website publik dengan bahasa Indonesia.
- Deployment awal menggunakan layanan yang mendukung Next.js dan berada dalam anggaran minimum; biaya/limit aktual perlu diverifikasi sebelum launch.
- Belum ada kebutuhan login atau penyimpanan preferensi cloud.
- Konten awal dikurasi secara manual dan data eksternal hanya digunakan bila menambah nilai nyata.
- Sumber data eksternal adalah layanan best-effort; Apeiron bukan pengganti sumber operasional atau ilmiah primer.

---

## 12. Kriteria Penerimaan MVP

MVP dapat dinyatakan siap dirilis jika seluruh butir berikut lolos:

### Produk
- [ ] Pengunjung dapat menyelesaikan tujuh tahap perjalanan kosmik.
- [ ] Progress indicator dapat digunakan untuk menuju tahap yang dipilih.
- [ ] Fakta utama menampilkan satuan dan sumber yang jelas.
- [ ] Grid topik utama tersedia dengan minimal konten awal yang dikurasi.
- [ ] Cosmos Today menampilkan konten APOD dari integrasi yang mengikuti dokumentasi terbaru, atau fallback yang jelas ketika provider gagal.
- [ ] Halaman tentang/sumber menjelaskan metode visualisasi dan hak gambar.

### Data dan kepercayaan
- [ ] Semua angka kuantitatif yang diluncurkan memiliki sumber terverifikasi.
- [ ] Setiap gambar yang digunakan memiliki alt text dan kredit/hak penggunaan yang telah ditinjau.
- [ ] Tidak ada data yang diberi label “live” jika bukan live.
- [ ] Cache, timestamp, provider error, dan fallback diuji.
- [ ] Tidak ada API key privat dalam kode klien atau repository.

### Aksesibilitas dan performa
- [ ] Pengalaman inti bisa diakses saat reduced motion aktif.
- [ ] Navigasi dan tombol utama dapat digunakan dengan keyboard.
- [ ] Konten tetap terbaca ketika WebGL dimatikan/gagal.
- [ ] Layout diuji pada mobile sempit, tablet, laptop, dan desktop.
- [ ] Core Web Vitals diukur; isu kritis yang terdeteksi selama pengujian ditangani sebelum rilis.

### Kualitas teknis
- [ ] Test unit untuk formatter satuan, data fakta, dan kalkulator yang disertakan.
- [ ] Test integrasi untuk provider yang sudah diaktifkan, termasuk respons tidak valid dan timeout.
- [ ] Test end-to-end untuk perjalanan utama dan fallback reduced-motion.
- [ ] Build production berhasil dan dokumentasi environment tersedia.

---

## 13. Rujukan Teknis Resmi

Tanggal pemeriksaan rujukan: 14 Oktober 2026. Endpoint, aturan akses, dan hak penggunaan dapat berubah; tinjau kembali sebelum implementasi dan sebelum rilis.

- NASA Open APIs / autentikasi dan rate limits: <https://api.nasa.gov/> dan <https://api.nasa.gov/assets/html/authentication.html>
- NASA APOD API portal (catatan migrasi APOD): <https://api.nasa.gov/?search=APOD>
- Endpoint APOD baru: <https://science.nasa.gov/wp-json/wp/v2/apod-basic>
- Panduan APOD API terbaru: <https://schlotterer.notion.site/APOD-Feed-And-API-User-Guide-39697d8747c38015a53edfdde76d4f5e>
- NASA Image and Video Library API docs: <https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf>
- JPL Horizons API: <https://ssd-api.jpl.nasa.gov/doc/horizons.html>
- JPL SSD/CNEOS API documentation dan fair-use policy: <https://ssd-api.jpl.nasa.gov/doc/>
- JPL Close-Approach Data API: <https://ssd-api.jpl.nasa.gov/doc/cad.html>
- NASA Exoplanet Archive TAP: <https://exoplanetarchive.ipac.caltech.edu/docs/TAP/usingTAP.html>
- ESA/Hubble copyright and image usage: <https://esahubble.org/copyright/>
- Web Vitals: <https://web.dev/articles/vitals>
- WAI-ARIA Authoring Practices: <https://www.w3.org/WAI/ARIA/apg/>

---

## 14. Keputusan yang Perlu Dikonfirmasi Sebelum Rilis

Ini bukan blocker untuk mulai membuat MVP, tetapi perlu diputuskan sebelum fitur terkait diaktifkan:

1. Nama domain dan target hosting akhir.
2. Apakah toggle suara benar-benar dibutuhkan; rekomendasi awal: tunda suara pada MVP.
3. Apakah newsletter diperlukan; rekomendasi awal: tampilkan ajakan menjelajah tanpa mengumpulkan email sampai mekanisme consent ditentukan.
4. Apakah fitur data posisi dinamis diluncurkan pada MVP; rekomendasi awal: integrasikan setelah perjalanan visual dan APOD stabil.
5. Kebijakan analytics dan tool observabilitas yang dipakai.

**Arah yang direkomendasikan:** selesaikan perjalanan kosmik, sumber fakta, galeri topik dasar, APOD, responsivitas, dan aksesibilitas terlebih dahulu. Perluasan data real-time dan kalkulator lanjutan dilakukan setelah dasar pengalaman serta pipeline data teruji.
