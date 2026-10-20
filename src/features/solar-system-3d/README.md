# Tata Surya 3D (Three.js)

Halaman `/{locale}/solar-system-3d` menggambar Tata Surya interaktif: Matahari,
delapan planet, Pluto, sabuk asteroid (ribuan batuan), Ceres, dan petunjuk Sabuk
Kuiper. Setiap benda mengorbit Matahari, berputar pada porosnya dengan
kemiringan asli, dan menyala dari satu sumber cahaya (Matahari).

## Cara mount

- `src/features/solar-system-3d/SolarSystem.ts` adalah kelas Three.js murni
  (renderer, scene, kamera, loop, disposal). Tidak ada React di dalamnya.
- `src/features/solar-system-3d/SolarSystem3D.tsx` adalah pembungkus klien
  tipis: ia meng-import kelas secara dinamis di dalam effect, memasangnya ke
  sebuah `<canvas>`, dan menangani rail planet, kartu info, serta kontrol.
- Rute `src/app/[locale]/solar-system-3d/page.tsx` merender pembungkus itu.

Backend: `WebGLRenderer` (bukan WebGPU). Jika WebGL tidak tersedia, halaman
menampilkan pesan gagal (Bahasa Indonesia) dan daftar planet tetap terbaca.

## Versi

- `three` dipin ke **`0.186.1`** di `package.json` (addon di `three/addons/...`).
- `gsap` `^3.15.0` untuk tween kamera saat fokus.

## Cara menambah benda

1. Tambahkan entri di `src/features/solar-system-3d/solar-system.data.ts`
   (`BODIES`): `id`, `nameKey`, `displayRadius`, `orbitRadius`, `orbitPeriod`,
   `spinPeriod`, `spinRetrograde`, `axialTiltDeg`, `inclinationDeg`,
   `startAngleDeg`, `color`, opsional `ringInner`/`ringOuter`, dan `copy`
   (Bahasa Indonesia).
2. Jalankan `tests/unit/orbit-spacing.test.ts`: ia menjaga agar orbit bertetangga
   tetap lebih lebar daripada jumlah "extent" (radius atau ring + orbit bulan
   terjauh). Sesuaikan `orbitRadius` bila gagal.
3. Bulan baru: tambahkan di `src/features/solar-system-3d/moons.ts`.
4. Tekstur: taruh berkas di `public/textures/`, catat sumber + lisensi di
   `public/textures/LICENSES.md`, lalu tautkan di pembuat benda terkait.

## Tekstur dan lisensi

Semua tekstur di `public/textures/` bersumber NASA public domain atau bawaan
contoh three.js (MIT). Hanya Bumi dan Bulan yang bertekstur globe; benda lain
memakai permukaan prosedural (`bodies/procedural.ts`) dengan warna akurat.
Rincian per berkas: `public/textures/LICENSES.md`.

## Kontrol dan kualitas

- Kontrol: main/jeda, slider kecepatan (`setTimeScale`), tampilkan orbit, tampilkan
  bulan, tampilkan label, setel ulang tampilan.
- Tiga tingkat kualitas (`low`/`medium`/`high`) mengatur bloom, jumlah batu sabuk,
  jumlah Kuiper, dan batas pixel ratio. Sebuah probe FPS menurunkan tingkat saat
  rata-rata di bawah ~45 fps selama 2 detik; tidak menaikkan lebih dari sekali
  per 10 detik.
- Render berhenti saat kanvas di luar layar (IntersectionObserver) atau tab tidak
  aktif (Page Visibility).
- `prefers-reduced-motion: reduce` memulai halaman dalam keadaan jeda.

## Deployment (Vercel)

- Semua tekstur ada di `public/textures/` (aset statis), disajikan dari CDN tepi
  Vercel. Tidak ada fungsi serverless dan tidak ada variabel lingkungan baru.
- Tekstur dimuat dari origin yang sama, jadi tidak perlu `remotePatterns` di
  `next.config.ts` dan tidak ada masalah CORS pihak ketiga.
- Total `public/textures/` kecil (beberapa MB), jauh di bawah batas source per
  deployment Vercel.
- Halaman adalah island klien: server render tetap ringan, scene dimuat di
  browser.

## Batasan yang diketahui

- Ukuran dan jarak dimampatkan agar seluruh sistem muat dalam satu tampilan;
  halaman menyatakannya.
- Venus, Merkurius, Mars, Yupiter, Saturnus, Uranus, Neptunus, dan Pluto memakai
  permukaan prosedural (tidak ada peta ekuirectangular NASA yang terverifikasi
  dari jaringan saat dibangun). Bumi dan Bulan bertekstur.
- Orbit planet diletakkan lebih renggang daripada tabel awal spec agar bulan dan
  cincin tidak pernah bertumpang-tindih (dijaga oleh `tests/unit/orbit-spacing.test.ts`).
