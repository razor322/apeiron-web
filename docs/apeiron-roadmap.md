# Roadmap Produk & Implementasi

# Apeiron — Cosmic Exploration Website

**Versi dokumen:** 1.0  
**Tanggal:** 14 Oktober 2026  
**Terkait:** `apeiron-prd.md` versi 1.0  
**Horizon perencanaan:** milestone berbasis hasil, dengan estimasi awal 8–10 minggu untuk MVP oleh tim kecil. Estimasi ini perlu disesuaikan dengan kapasitas tim, kompleksitas animasi, dan hasil uji perangkat.

---

## 1. Strategi Roadmap

Roadmap diurutkan berdasarkan risiko dan ketergantungan, bukan hanya daftar fitur. Perjalanan kosmik adalah nilai utama produk, tetapi harus dibangun bersama sistem konten dan fallback agar visual yang berat tidak menjadi titik kegagalan. Integrasi data dimulai dengan sumber visual yang paling sederhana, lalu berlanjut ke data astronomi terstruktur.

### Aturan eksekusi

1. **Validasi pengalaman sebelum memperluas fitur.** Buat prototype visual dan uji scroll, keterbacaan, serta perilaku mobile lebih dahulu.
2. **Data source lebih dulu diverifikasi.** Jangan membangun UI di atas asumsi struktur API yang belum diuji.
3. **Provider terisolasi.** Setiap integrasi punya adapter, schema validation, cache, attribution, dan fallback.
4. **MVP tidak menunggu semua fitur.** Kalkulator kompleks, newsletter, live tracking, dan visualisasi ilmiah tingkat lanjut tidak menjadi blocker rilis awal.
5. **Setiap milestone punya release gate.** Pindah ke milestone berikutnya setelah hasil tes dan kriteria penerimaan terpenuhi.

---

## 2. Peta Milestone

| Milestone | Estimasi | Hasil utama | Release gate |
|---|---|---|---|
| M0 — Product & Science Baseline | Minggu 1 | PRD tervalidasi, daftar fakta dan aset, risk log | Scope dan fakta awal disetujui |
| M1 — Foundation & Design System | Minggu 1–2 | Kerangka Next.js, token desain, layout responsif, quality baseline | Build dan shell UI stabil |
| M2 — Cosmic Journey Prototype | Minggu 2–4 | Tujuh tahap, scroll story, progress/navigation | Alur dapat dipakai di desktop dan mobile |
| M3 — Astronomy Data Layer | Minggu 3–5 | Model data, provider APOD dan NASA images, cache/fallback | Provider dan fallback lulus test |
| M4 — MVP Content & Explorer | Minggu 5–6 | Grid topik, facts, Cosmos Today, halaman sumber | Semua fakta dan media punya provenance |
| M5 — Accessibility & Performance Hardening | Minggu 6–8 | Reduced motion, keyboard flow, fallback 3D, performa | Tidak ada blocker aksesibilitas/performa |
| M6 — Release Candidate & Launch | Minggu 8–9 | QA menyeluruh, metadata SEO, observability, deploy | Acceptance checklist MVP lulus |
| M7 — Post-launch Iteration | Minggu 9–10+ | Analisis penggunaan, perbaikan UX, prioritas P1 | Backlog berikut ditetapkan dari temuan |

Periode dapat berjalan paralel ketika tidak ada ketergantungan teknis, tetapi integrasi provider dan perbaikan animasi tetap harus melewati pengujian yang ditentukan.

---

## 3. Milestone M0 — Product & Science Baseline

**Tujuan:** mengunci fondasi produk agar implementasi tidak bergantung pada fakta yang belum terverifikasi atau scope yang terus berubah.

### Pekerjaan

- [ ] Review PRD bersama pemilik produk.
- [ ] Membagi fitur menjadi P0, P1, dan P2.
- [ ] Membuat daftar seluruh fakta pada tujuh tahap perjalanan.
- [ ] Untuk setiap fakta, catat sumber primer, angka, satuan, status nilai, tanggal verifikasi, dan aturan pembulatan.
- [ ] Membuat asset register untuk gambar: URL asli, caption, kredit, alt text, dan catatan hak penggunaan.
- [ ] Membuat storyboard perjalanan dan sketsa tiap tahap.
- [ ] Memutuskan target browser/perangkat yang didukung.
- [ ] Menentukan environment dev, preview, dan production.

### Deliverable

- `docs/content/fact-registry.md`
- `docs/content/asset-register.md`
- `docs/decisions/ADR-001-product-stack.md`
- `docs/decisions/ADR-002-motion-and-3d-strategy.md`

### Kriteria selesai

- Semua fakta yang diperlukan untuk prototipe memiliki sumber.
- Semua aset demo memiliki sumber dan ketentuan penggunaan yang jelas.
- Scope MVP dan non-scope disepakati.
- Risiko API APOD, JPL, hak gambar, dan performa perangkat tercatat.

---

## 4. Milestone M1 — Foundation & Design System

**Tujuan:** menyiapkan struktur aplikasi yang dapat berkembang tanpa mencampur UI, animasi, dan pengambilan data.

### Pekerjaan

- [ ] Bootstrap Next.js App Router dan TypeScript strict mode.
- [ ] Menetapkan linting, formatting, type-check, dan skrip test.
- [ ] Menerapkan token warna `#05060A`, `#E8E4DC`, `#8A8D98`, dan `#E8A15B`.
- [ ] Menyiapkan font heading, body, dan mono serta font loading yang menjaga stabilitas layout.
- [ ] Membuat komponen dasar: Navbar, Button/Link, Container, Typography, DataLabel, SourceLink, LoadingState, ErrorState, dan ImageCredit.
- [ ] Membuat layout website, metadata default, page 404, dan error boundary yang diperlukan.
- [ ] Menyusun struktur feature-driven dan adapter/provider layer.
- [ ] Menyiapkan CI minimum: install, lint, typecheck, test, build.

### Deliverable

- Aplikasi Next.js dasar.
- Design tokens dan komponen reusable.
- Struktur folder final awal.
- Pipeline pemeriksaan kualitas otomatis.

### Kriteria selesai

- Build production berhasil.
- Semua token warna dan tipografi utama sudah digunakan pada shell UI.
- Tidak ada secret di repository.
- Halaman dasar tetap terbaca pada mobile dan desktop.

---

## 5. Milestone M2 — Cosmic Journey Prototype

**Tujuan:** membuat nilai utama produk berfungsi sebelum pekerjaan data diperluas.

### Pekerjaan

- [ ] Bangun hero dengan satu titik cahaya, tagline, dan instruksi menjelajah.
- [ ] Implementasikan tujuh tahap: Hero, Bumi, Tata Surya, Bintang, Bimasakti, Alam Semesta Teramati, Penutup.
- [ ] Implementasikan satu visual stage berkelanjutan bila memungkinkan.
- [ ] Hubungkan progres scroll dan transisi dengan GSAP ScrollTrigger.
- [ ] Implementasikan progress journey yang dapat diklik.
- [ ] Implementasikan indikator skala yang berubah sesuai tahap.
- [ ] Sediakan label untuk skala logaritmik/visual konseptual.
- [ ] Gunakan model/visual placeholder ringan sebelum semua aset final masuk.
- [ ] Implementasikan mode reduced-motion tanpa pinning yang agresif.
- [ ] Uji interaksi scroll di mouse, trackpad, sentuhan, keyboard, dan layar kecil.

### Deliverable

Prototype journey end-to-end dengan fakta placeholder yang diberi tanda internal sampai daftar fakta lolos review.

### Kriteria selesai

- Pengunjung dapat mencapai semua tahap tanpa scroll trap.
- Progress navigation menuju tahap yang benar.
- Teks tidak tertutup visual pada viewport kecil.
- Tidak ada konten inti yang hanya tersaji di canvas.
- Reduced-motion path dapat menyelesaikan perjalanan.

---

## 6. Milestone M3 — Astronomy Data Layer

**Tujuan:** membangun pipeline data yang dapat ditest dan tahan terhadap kegagalan sumber eksternal.

### Urutan integrasi

#### M3.1 — NASA APOD

- [ ] Pelajari dokumentasi API APOD terbaru sebelum implementasi.
- [ ] Bangun `apod` provider adapter dan schema respons internal.
- [ ] Jangan membangun dependency baru pada endpoint APOD legacy; portal NASA menyatakan endpoint legacy akan diarsipkan 1 Desember 2026.
- [ ] Simpan tanggal, title, explanation, media type, URL, alt text, credit/copyright, dan permalink jika tersedia.
- [ ] Tambahkan cache berdasarkan frekuensi pembaruan harian.
- [ ] Tangani media non-image dan error state.

#### M3.2 — NASA Image and Video Library

- [ ] Buat adapter pencarian gambar berdasarkan query yang diizinkan.
- [ ] Validasi struktur koleksi dan metadata aset.
- [ ] Normalisasikan URL media, title, description, creator/credit, dan page URL jika tersedia.
- [ ] Batasi parameter yang boleh diteruskan dari pengguna.
- [ ] Buat mekanisme asset selection/curation untuk menghindari hasil yang tak sesuai.

#### M3.3 — Pola umum provider

- [ ] Terapkan timeout dan penanganan status non-2xx.
- [ ] Validasi response dengan schema.
- [ ] Terapkan cache dan fallback.
- [ ] Tambahkan logging provider, response time, cache hit/miss, dan error class.
- [ ] Uji response invalid, timeout, rate limit, serta layanan tidak tersedia.
- [ ] Jangan mengembalikan detail provider yang sensitif ke klien.

### Deliverable

- `lib/astronomy/providers/nasa-apod.ts`
- `lib/astronomy/providers/nasa-images.ts`
- Schema dan model data internal.
- Route Handlers server-side, misalnya `/api/astronomy/apod` dan `/api/astronomy/images`.
- Tes adapter, cache, dan fallback.

### Kriteria selesai

- UI tidak membaca format mentah provider secara langsung.
- Kegagalan API tidak membuat halaman beranda gagal.
- Metadata atribusi ditampilkan dengan benar.
- Tidak ada API key private pada browser bundle.
- Endpoint JPL yang kelak ditambahkan mengikuti fair-use policy, memakai cache, `User-Agent` spesifik, dan tidak dipanggil langsung oleh browser.

---

## 7. Milestone M4 — MVP Content & Explorer

**Tujuan:** mengubah prototype menjadi website edukasi yang utuh dan dapat diluncurkan.

### Pekerjaan

- [ ] Finalisasi angka dan naskah untuk tujuh tahap.
- [ ] Hubungkan data fakta ke model bertipe beserta sumber, unit, status estimasi, dan tanggal verifikasi.
- [ ] Implementasikan grid delapan kategori kosmik.
- [ ] Buat halaman topik template yang dapat dipakai ulang.
- [ ] Implementasikan Cosmos Today memakai APOD provider.
- [ ] Tambahkan halaman About / Sources / Methodology.
- [ ] Tambahkan kredit dan alt text ke semua aset yang diluncurkan.
- [ ] Tambahkan fallback cached data dan timestamp ketika provider gagal.
- [ ] Tambahkan SEO metadata per route dan Open Graph default.

### Deliverable

MVP yang sudah memuat journey, galeri topik, Cosmos Today, data statis bersumber, dan halaman sumber/metodologi.

### Kriteria selesai

- Tidak ada fakta kuantitatif yang dipublikasikan tanpa sumber.
- Grid dan template detail dapat digunakan pada mobile.
- Pengunjung bisa membuka sumber data dari UI.
- UI membedakan data katalog, editorial harian, estimasi, dan data yang dihitung.

---

## 8. Milestone M5 — Accessibility & Performance Hardening

**Tujuan:** memastikan pengalaman tidak hanya berjalan pada workstation developer.

### Pekerjaan

- [ ] Profiling bundle dan dynamic imports.
- [ ] Lazy-load scene, geometri, tekstur, dan modul 3D.
- [ ] Terapkan adaptive quality atau pengurangan efek pada perangkat terbatas.
- [ ] Buat fallback CSS/canvas/gambar yang tetap mengkomunikasikan ide visual.
- [ ] Audit layout shift dari font, gambar, navbar, dan indikator sticky.
- [ ] Audit keyboard navigation, focus order, focus visible, dan semantik heading.
- [ ] Audit reduced-motion dengan pengaturan sistem dan toggle aplikasi.
- [ ] Uji pembaca layar pada navigasi tahap dan status data penting.
- [ ] Uji viewport 320 px, 375 px, tablet, laptop, dan desktop lebar.
- [ ] Uji jaringan lambat, API timeout, cache stale, dan WebGL unavailable.
- [ ] Ukur Web Vitals dan catat baseline.

### Deliverable

- Laporan QA performa.
- Checklist aksesibilitas.
- Fallback mode yang diuji.
- Daftar isu prioritas dan hasil perbaikannya.

### Kriteria selesai

- Journey bisa diselesaikan dengan reduced motion aktif.
- Konten tidak hilang jika WebGL gagal.
- Tidak ada masalah keyboard blocker pada alur utama.
- Core Web Vitals diukur pada build production/preview dengan metodologi yang konsisten.
- Masalah performa utama pada perangkat target sudah diperbaiki atau terdokumentasi sebagai batasan.

---

## 9. Milestone M6 — Release Candidate & Launch

**Tujuan:** merilis MVP dengan pengujian, konten, dan observabilitas minimum yang memadai.

### Pekerjaan

- [ ] Jalankan regresi fungsional terhadap seluruh kriteria penerimaan PRD.
- [ ] Jalankan test end-to-end: hero → semua tahap → topik → sumber → Cosmos Today.
- [ ] Jalankan test fallback provider dan reduced-motion.
- [ ] Review semua sumber, caption, alt text, serta hak gambar.
- [ ] Verifikasi title, description, canonical, Open Graph, dan favicon.
- [ ] Verifikasi environment variables pada production.
- [ ] Verifikasi HTTP caching dan invalidation pada hosting yang dipilih.
- [ ] Tambahkan monitoring error client/server tanpa mengumpulkan data yang tidak diperlukan.
- [ ] Siapkan dokumen operasi: cara update fakta, mengubah TTL, memperbaiki provider, dan rollback release.
- [ ] Uji deploy preview dan production.
- [ ] Buat checklist rollback.

### Deliverable

- Production release candidate.
- Dokumen runbook.
- Laporan pengujian.
- Checklist go/no-go.

### Kriteria selesai

- Semua acceptance criteria P0 berstatus lulus atau memiliki pengecualian yang disetujui.
- Tidak ada API key atau secret yang bocor.
- Atribusi media diperiksa.
- Aplikasi tetap punya konten berguna saat provider eksternal gagal.
- Proses rollback dipahami.

---

## 10. Milestone M7 — Post-launch Iteration

**Tujuan:** menggunakan data penggunaan nyata untuk menentukan pekerjaan selanjutnya, bukan memperluas fitur berdasarkan asumsi saja.

### Pekerjaan

- [ ] Amati completion rate perjalanan dan titik pengguna berhenti.
- [ ] Tinjau error rate, cache hit ratio, latensi provider, dan performa perangkat.
- [ ] Kumpulkan umpan balik singkat secara sukarela tanpa mengganggu pengalaman.
- [ ] Perbaiki bab yang membingungkan, teks yang terlalu panjang, atau indikator yang tidak terbaca.
- [ ] Prioritaskan fitur P1 berdasarkan nilai edukasi dan penggunaan.

### Deliverable

- Ringkasan hasil 2–4 minggu setelah peluncuran.
- Backlog pasca-MVP dengan prioritas yang diperbarui.

---

## 11. Backlog Produk Terurut

| ID | Prioritas | Pekerjaan | Dependensi | Definisi selesai |
|---|---|---|---|---|
| AP-001 | P0 | Setup Next.js, TypeScript, lint, test, build | — | Pipeline dasar berhasil |
| AP-002 | P0 | Design tokens dan komponen inti | AP-001 | Token diterapkan dan responsif |
| AP-003 | P0 | Asset register dan fact registry | M0 | Semua konten awal punya sumber |
| AP-004 | P0 | Cosmic Journey tujuh tahap | AP-002, AP-003 | Semua tahap dan progress bekerja |
| AP-005 | P0 | Reduced-motion journey | AP-004 | Tanpa pinning/aggressive scrub |
| AP-006 | P0 | Data model, schema, provider interface | AP-001 | Provider disatukan pada model internal |
| AP-007 | P0 | APOD current API integration | AP-006 | Data, attribution, cache, fallback lulus tes |
| AP-008 | P0 | NASA Image Library integration | AP-006 | Search/metadata terpetakan dan diuji |
| AP-009 | P0 | API error state, cache, provider logging | AP-007, AP-008 | Timeout/rate-limit/fallback terbukti |
| AP-010 | P0 | Grid Jelajahi Kosmos | AP-002, AP-003 | Delapan kategori tampak dengan konten awal |
| AP-011 | P0 | Cosmos Today | AP-007 | Data APOD atau fallback tampil |
| AP-012 | P0 | About, Sources, Methodology | AP-003, AP-008 | Metode dan kredit jelas |
| AP-013 | P0 | SEO dan metadata sharing | Rute inti | Metadata tervalidasi |
| AP-014 | P0 | Responsive/performance QA | AP-004, AP-010, AP-011 | Tidak ada blocker pada perangkat target |
| AP-015 | P0 | Keyboard and accessibility QA | AP-004, AP-010, AP-011 | Alur inti dapat digunakan tanpa mouse |
| AP-016 | P1 | Template halaman detail topik | AP-010, AP-012 | Halaman reusable untuk kategori |
| AP-017 | P1 | Angka yang Bikin Diam | AP-003 | Strip fakta bersumber |
| AP-018 | P1 | Kalender Kosmik | AP-003 | Timeline analogi dengan sumber dan catatan |
| AP-019 | P1 | Kamu Terbuat dari Bintang | AP-003 | Konten ditinjau secara ilmiah |
| AP-020 | P1 | Kalkulator usia di planet lain | AP-003 | Rumus dan periode orbit ditampilkan |
| AP-021 | P1 | Kalkulator waktu perjalanan | AP-003 | Asumsi dan keterbatasan ditampilkan |
| AP-022 | P1 | Detail provider JPL Horizons | AP-006, AP-009 | Timestamp, unit, parameter, cache, User-Agent, tes |
| AP-023 | P1 | Katalog eksoplanet TAP | AP-006, AP-009 | Schema, kueri terbatas, cache |
| AP-024 | P1 | Data asteroid/close approach | AP-006, AP-009 | Query filter, metadata waktu, fallback |
| AP-025 | P2 | Posisi ISS atau data dinamis tambahan | Evaluasi provider dan kontrak data | Provider terverifikasi dan label update jujur |
| AP-026 | P2 | Newsletter | Provider email, consent, privacy policy | Consent, validasi, unsubscribe, dan pengelolaan data |
| AP-027 | P2 | Suara atmosfer opsional | Audit UX dan aksesibilitas | Default off, tidak autoplay, kontrol tersedia |
| AP-028 | P2 | CMS/admin editorial | Kebutuhan tim konten | Workflow editor dan model akses ditentukan |

---

## 12. Strategi Pengujian

### Unit test

- Konversi dan pemformatan unit.
- Format angka besar, tahun cahaya, jarak, waktu, dan skala logaritmik.
- Rumus kalkulator yang diluncurkan.
- Validasi data fakta dan metadata atribusi.

### Integration test

- APOD adapter dengan sample response yang tersimpan.
- NASA Images adapter.
- Cache hit, cache expired, timeout, status 429, status 5xx, dan schema yang berubah.
- Mapping metadata credit, alt text, dan source URL.

### End-to-end test

- Mengakses beranda dan bergerak melalui tujuh tahap.
- Melompat tahap melalui progress indicator.
- Membuka grid topik dan satu detail.
- Membuka sumber dari fakta.
- Memakai reduced-motion mode.
- Memastikan konten masih tersedia saat WebGL dinonaktifkan atau API gagal.

### Manual visual review

- Smoothness animasi dan rasa skala.
- Tidak terjadi konflik antara scroll pinning dengan browser mobile.
- Kontras dan panjang baris teks.
- Kredibilitas visual serta kecocokan gambar terhadap narasi.

---

## 13. Risiko Roadmap dan Rencana Mitigasi

| Risiko | Gejala | Tindakan |
|---|---|---|
| Eksperimen 3D menyerap semua waktu | Journey tidak selesai saat API/fitur lain mulai | Batasi satu visual stage dan bekukan fitur P0 setelah prototype |
| APOD legacy berubah/dihentikan | Response tidak cocok | Integrasikan endpoint APOD terbaru berdasarkan dokumentasi terkini; test adapter |
| JPL membatasi traffic | 429, throttling, atau tidak tersedia | Cache, satu request pada satu waktu jika dipersyaratkan, backoff, User-Agent, gunakan fallback |
| Visual 3D berat | LCP buruk, drop frame, panas pada ponsel | Dynamic import, adaptive quality, fallback gambar/CSS |
| Fakta tidak memiliki sumber konsisten | UI dan naskah berbeda | Fact registry sebagai single source of truth |
| Scope melebar ke fitur live | MVP tertunda | Tunda ISS, katalog kompleks, newsletter, CMS sampai pasca-MVP |
| Aset gambar hak pakainya tidak jelas | Tidak bisa dipublikasikan | Gunakan aset yang telah ditinjau dan simpan asset register |

---

## 14. Definition of Done

Pekerjaan dianggap selesai hanya jika:

- [ ] Acceptance criteria pada issue terpenuhi.
- [ ] Tidak ada error TypeScript/lint atau build terkait.
- [ ] Test yang relevan diperbarui dan lulus.
- [ ] Loading, empty, error, dan fallback state ditangani sesuai jenis fitur.
- [ ] Layout sudah ditinjau pada mobile dan desktop.
- [ ] Interaksi keyboard dan reduced motion ditinjau untuk fitur yang relevan.
- [ ] Data ilmiah memiliki sumber, satuan, timestamp/verifikasi, dan status nilai bila sesuai.
- [ ] Kredit gambar dan hak penggunaan sudah diperiksa.
- [ ] Dokumentasi/configuration diperbarui jika ada perubahan perilaku.
- [ ] Perubahan dapat dideploy dan memiliki cara rollback yang wajar.

---

## 15. Sumber Referensi Roadmap

- PRD Apeiron: `apeiron-prd.md`
- NASA Open APIs dan catatan APOD: <https://api.nasa.gov/?search=APOD>
- Endpoint APOD terbaru: <https://science.nasa.gov/wp-json/wp/v2/apod-basic>
- Panduan APOD: <https://schlotterer.notion.site/APOD-Feed-And-API-User-Guide-39697d8747c38015a53edfdde76d4f5e>
- NASA Images API: <https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf>
- JPL Horizons API: <https://ssd-api.jpl.nasa.gov/doc/horizons.html>
- JPL SSD/CNEOS API policies: <https://ssd-api.jpl.nasa.gov/doc/>
- NASA Exoplanet Archive TAP: <https://exoplanetarchive.ipac.caltech.edu/docs/TAP/usingTAP.html>
- ESA/Hubble usage rules: <https://esahubble.org/copyright/>
- Web Vitals: <https://web.dev/articles/vitals>

---

## 16. Rekomendasi Langkah Pertama

Mulai dari **M0 dan M1 secara berurutan**, tetapi jangan menunggu seluruh konten diproduksi untuk membuat prototype M2. Susun fact registry untuk tujuh tahap, pilih aset sementara yang haknya jelas, siapkan shell aplikasi dan token desain, kemudian bangun perjalanan scroll dengan data kurasi internal. Setelah narasi dan interaksi terasa tepat pada perangkat sungguhan, integrasikan APOD dan NASA Images melalui adapter server-side. Tambahkan Horizons, Exoplanet Archive, kalkulator, dan data dinamis hanya setelah fondasi stabil.
