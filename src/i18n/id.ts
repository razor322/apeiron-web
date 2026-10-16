import type { Dictionary } from "@/i18n/en";

export const id: Dictionary = {
  nav: {
    home: "Beranda",
    explore: "Jelajah",
    cosmosToday: "Cosmos Hari Ini",
    about: "Tentang",
    label: "Navigasi utama",
    brand: "Apeiron",
  },
  meta: {
    siteName: "Apeiron",
    home: {
      title: "Apeiron: skala alam semesta",
      description:
        "Perjalanan bergulir dari setitik cahaya sampai alam semesta teramati, satu orde besaran setiap langkahnya.",
    },
    explore: {
      title: "Jelajahi objek kosmis",
      description:
        "Delapan jenis objek, dari planet di bawah kakimu sampai materi gelap yang menyatukan galaksi.",
    },
    cosmosToday: {
      title: "Cosmos Hari Ini",
      description:
        "Gambar astronomi hari ini beserta penjelasannya, diambil dari NASA APOD dan ditampilkan dengan sumbernya.",
    },
    about: {
      title: "Tentang Apeiron",
      description:
        "Apa situs ini, dari mana datanya berasal, dan bagaimana setiap angka bersumber dan ditandai.",
    },
  },
  motion: {
    toggle: "Gerak",
    full: "Gerak penuh",
    calm: "Gerak tenang",
    hint: "Gerak tenang mematikan animasi gulir. Pilihanmu hanya tersimpan di perangkat ini.",
  },
  about: {
    heading: "Tentang Apeiron",
    purposeHeading: "Apa ini",
    purpose:
      "Apeiron adalah halaman scrollytelling tentang skala alam semesta, dari setitik cahaya sampai alam semesta teramati. Dibuat untuk pembaca yang penasaran, bukan astronom.",
    sourcesHeading: "Sumber data",
    sourcesIntro:
      "Setiap gambar dan penjelasan di situs ini berasal dari sumber resmi, yang didaftar di sini beserta pemakaian dan kreditnya.",
    methodologyHeading: "Metodologi",
    methodology:
      "Visualisasi di sini dapat menggunakan skala logaritmik, elemen artistik, atau komposisi citra. Tidak selalu representasi proporsional, jadi jarak dan ukuran ditampilkan untuk menyampaikan skala, bukan perbandingan yang tepat.",
    rightsHeading: "Penggunaan dan hak citra",
    rights:
      "Gambar digunakan sesuai ketentuan sumbernya. Materi NASA umumnya tidak berhak cipta, tetapi tiap aset bisa punya kredit dan ketentuan sendiri, sehingga setiap aset diperiksa sebelum dipublikasikan.",
    limitationsHeading: "Keterbatasan",
    limitations:
      "Angka dibulatkan sesuai presisi sumbernya dan ditandai terukur, perkiraan, kira-kira, atau terhitung. Data langsung bisa tidak tersedia, dan nilai tersimpan akan ditampilkan beserta tanggalnya.",
    sourceTable: {
      source: "Sumber",
      usedFor: "Pemakaian",
      licence: "Kredit dan hak",
      apodUse: "Gambar hari ini",
      apodLicence: "NASA APOD, domain publik kecuali entri mencantumkan penulis",
      apodUrl: "https://apod.nasa.gov",
      nasaImagesUse: "Citra objek dan topik",
      nasaImagesLicence: "NASA Image and Video Library, kredit per aset",
      nasaImagesUrl: "https://images.nasa.gov",
    },
    backHome: "Kembali ke perjalanan",
  },
  common: {
    loading: "Memuat",
    error: "Terjadi kesalahan.",
    empty: "Belum ada apa pun di sini.",
    source: "Sumber",
    sourcesToggle: "Sumber dan angka",
    staleNotice: "Menampilkan data tersimpan dari",
    retry: "Coba lagi",
    confidence: {
      measured: "Terukur",
      estimated: "Perkiraan",
      approximate: "Kira-kira",
      calculated: "Terhitung",
    },
  },
  calculators: {
    heading: "Kalkulator",
    intro:
      "Perkiraan edukatif. Setiap hasil menampilkan rumus dan asumsi di baliknya.",
    planetAge: {
      heading: "Usiamu di planet lain",
      ageLabel: "Usiamu dalam tahun Bumi",
      planetLabel: "Planet",
      resultLabel: "Usiamu di sana",
      errorPositive: "Masukkan usia positif dalam tahun Bumi.",
      errorNonNumeric: "Masukkan angka untuk usiamu.",
      errorUnknownPlanet: "Pilih planet dari daftar.",
    },
    travelTime: {
      heading: "Waktu tempuh",
      distanceLabel: "Jarak dalam kilometer",
      speedLabel: "Kecepatan dalam kilometer per detik",
      resultLabel: "Waktu tempuh",
      errorDistance: "Masukkan jarak yang tidak negatif.",
      errorSpeed: "Masukkan kecepatan positif.",
      errorNonNumeric: "Masukkan angka.",
    },
  },
  cosmosToday: {
    heading: "Cosmos Hari Ini",
    retrievedOn: "Diambil pada",
    openMedia: "Buka media di sumber resmi",
    loadError: "Konten hari ini tidak dapat dimuat.",
    apodLabel: "NASA APOD",
    apodUrl: "https://apod.nasa.gov",
  },
  explore: {
    heading: "Jelajah",
    intro:
      "Delapan jenis objek, dari planet di bawah kakimu sampai materi gelap yang menyatukan galaksi.",
    detail: {
      definition: "Definisi",
      facts: "Angka penting",
      terms: "Istilah",
      related: "Topik terkait",
      backToExplore: "Kembali ke Jelajah",
    },
    categories: {
      planet: {
        name: "Planet",
        summary:
          "Dunia yang terikat pada bintang: berbatu, ber-es, atau berselimut gas, masing-masing dibulatkan oleh gravitasinya sendiri.",
      },
      star: {
        name: "Bintang",
        summary:
          "Bola plasma yang memancarkan cahaya sendiri, memadukan hidrogen menjadi cahaya dan menahan seluruh sistem planet.",
      },
      "black-hole": {
        name: "Lubang Hitam",
        summary:
          "Wilayah tempat gravitasi meruntuhkan ruang-waktu, sehingga tak ada apa pun, bahkan cahaya, bisa keluar lagi.",
      },
      nebula: {
        name: "Nebula",
        summary:
          "Awan gas dan debu yang luas, tempat lahirnya bintang dan kafan saat mereka mati.",
      },
      galaxy: {
        name: "Galaksi",
        summary:
          "Kota bintang, gas, dan materi gelap yang terikat gravitasi, berputar pelan selama jutaan tahun.",
      },
      exoplanet: {
        name: "Eksoplanet",
        summary:
          "Planet yang mengorbit bintang selain Matahari, umumnya terdeteksi dari bayangan atau tarikannya.",
      },
      "comet-asteroid": {
        name: "Komet dan Asteroid",
        summary:
          "Sisa puing dari pembentukan Tata Surya, ber-es atau berbatu, menempuh orbit yang panjang.",
      },
      "dark-matter": {
        name: "Materi Gelap",
        summary:
          "Massa tak terlihat yang membentuk galaksi lewat gravitasi, disimpulkan dari geraknya, belum pernah terlihat langsung.",
      },
    },
    terms: {
      planet: [
        "Orbit: jalur yang ditempuh suatu benda mengelilingi bintang.",
        "Terestrial: planet kecil berbatu seperti Bumi atau Mars.",
      ],
      star: [
        "Fusi: penggabungan inti atom, mesin setiap bintang.",
        "Tahun cahaya: jarak yang ditempuh cahaya dalam satu tahun.",
      ],
      "black-hole": [
        "Horizon peristiwa: batas yang tak bisa dilewati apa pun.",
        "Singularitas: pusat tempat fisika kita berhenti menjelaskan ruang.",
      ],
      nebula: [
        "Medium antarbintang: gas dan debu di antara bintang-bintang.",
        "Nebula emisi: gas yang bersinar karena cahaya bintang di dekatnya.",
      ],
      galaxy: [
        "Bima Sakti: galaksi yang memuat Matahari dan Bumi.",
        "Lengan spiral: gelombang padat bintang yang melingkar dari pusat galaksi.",
      ],
      exoplanet: [
        "Transit: planet melintas di depan bintangnya dan meredupkannya sejenak.",
        "Zona layak huni: jalur orbit tempat air cair mungkin ada.",
      ],
      "comet-asteroid": [
        "Komet: benda ber-es yang menumbuhkan ekor bercahaya dekat Matahari.",
        "Sabuk asteroid: cincin berbatu di antara Mars dan Jupiter.",
      ],
      "dark-matter": [
        "Materi gelap: massa yang tidak bersinar tetapi membelokkan cahaya dan gravitasi.",
        "Kurva rotasi: kecepatan galaksi terhadap jarak, petunjuk yang dijelaskan materi gelap.",
      ],
    },
  },
  journey: {
    navLabel: "Tahapan perjalanan",
    rulerTitle: "Skala konseptual",
    rulerNote:
      "Skala logaritmik: setiap langkah sepuluh kali lipat dari yang di bawahnya, sehingga seluruh rentang skala kosmis muat pada satu sumbu.",
    widthLabel: "Lebar layar",
    lightCrossing: "Cahaya menyeberanginya dalam",
    landmarks: {
      moonOrbit: "orbit Bulan",
      earthOrbit: "orbit Bumi",
      neptuneOrbit: "orbit Neptunus",
    },
    stages: {
      hero: {
        label: "Pembuka",
        aria: "Awal perjalanan: kamu ada di sini",
        headline: "Kamu ada di sini.",
        body: "Gulir pelan-pelan. Kita akan mulai menjauh, satu orde besaran setiap langkahnya.",
      },
      mid: {
        label: "Transisi",
        aria: "Transisi: sekarang kita naik",
        headline: "Sekarang, kita naik.",
        body: "",
      },
      earth: {
        label: "Bumi",
        aria: "Bumi",
        figure: "12.756 km",
        headline: "Lebar Bumi. Seluruh dunia yang kamu kenal ada di permukaannya.",
        body: "Setiap kota, setiap lautan, setiap orang yang pernah hidup berada di permukaannya.",
      },
      "solar-system": {
        label: "Tata Surya",
        aria: "Tata Surya",
        figure: "8:20",
        headline: "Menit dan detik yang dibutuhkan cahaya Matahari untuk sampai ke sini.",
        body: "Sekitar 149,6 juta km, dan hampir seluruhnya hampa. Delapan planet, satu bintang, dan ruang kosong yang jauh lebih luas dari semuanya. Salah satu noktah itu adalah rumahmu.",
      },
      star: {
        label: "Bintang terdekat",
        aria: "Bintang terdekat",
        figure: "4,24 thn",
        headline: "Cahaya ke bintang terdekat, Proxima Centauri.",
        body: "Sekitar 4.400 kali lebar orbit Neptunus. Perjalanan ini baru dimulai.",
      },
      galaxy: {
        label: "Galaksi",
        aria: "Galaksi",
        headline: "Seratus miliar matahari, berputar dalam satu spiral.",
        body: "Matahari kita hanyalah satu bintang di antara miliaran di Bima Sakti, yang sendiri satu galaksi di antara miliaran.",
      },
      universe: {
        label: "Alam Semesta Teramati",
        aria: "Jelajahi alam semesta teramati",
        headline: "Segala sesuatu yang cahayanya pernah sampai kepada kita.",
        body: "Alam semesta teramati adalah batas dari apa yang bisa kita lihat, sekitar 93 miliar tahun cahaya lebarnya.",
      },
      outro: {
        label: "Perjalanan",
        aria: "Akhir perjalanan: kamu adalah bagian dari alam semesta",
        headline: "Kamu adalah bagian dari alam semesta.",
        body: "Setiap atom dalam dirimu ditempa di dalam bintang. Skala ini tidak pernah hanya soal jarak.",
      },
    },
  },
};
